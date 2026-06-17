import type { CertMetadata, CatalogFilters, LearningPath } from "@/types/certification";

const LEARN_API_BASE = "https://learn.microsoft.com/api/catalog";

interface LearnCatalogItem {
  uid: string;
  title: string;
  url: string;
  locale: string;
  last_modified: string;
  type: string;
  levels?: string[];
  roles?: string[];
  products?: string[];
  subjects?: string[];
  certification_uid?: string;
  exam_url?: string;
  summary?: string;
}

interface LearnCatalogResponse {
  certifications?: LearnCatalogItem[];
  learningPaths?: LearnCatalogItem[];
  modules?: LearnCatalogItem[];
}

// Mapeia nível do Learn para nível local
function mapLevel(levels: string[] = []): CertMetadata["level"] {
  if (levels.includes("advanced")) return "Advanced";
  if (levels.includes("intermediate")) return "Intermediate";
  return "Beginner";
}

// Mapeia produto do Learn para produto legível
function mapProduct(products: string[] = []): string {
  const priority = ["azure", "m365", "github", "power-platform", "dynamics-365", "windows-server"];
  const productMap: Record<string, string> = {
    azure: "Azure",
    m365: "Microsoft 365",
    github: "GitHub",
    "power-platform": "Power Platform",
    "dynamics-365": "Dynamics 365",
    "windows-server": "Windows Server",
    windows: "Windows",
    office: "Office 365",
    sql: "SQL Server",
  };
  for (const p of priority) {
    if (products.some((prod) => prod.includes(p))) {
      return productMap[p] ?? products[0] ?? "Microsoft";
    }
  }
  return products[0] ?? "Microsoft";
}

export async function fetchCatalog(filters: CatalogFilters = {}): Promise<CertMetadata[]> {
  try {
    const params = new URLSearchParams({ locale: "pt-br", resource_type: "certification" });
    if (filters.product) params.set("products", filters.product.toLowerCase());
    if (filters.level) params.set("levels", filters.level.toLowerCase());
    if (filters.role) params.set("roles", filters.role.toLowerCase().replace(/\s+/g, "-"));

    const url = `${LEARN_API_BASE}?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`Learn API error: ${res.status}`);

    const data: LearnCatalogResponse = await res.json();
    const certifications = data.certifications ?? [];

    // Deduplica por uid antes de mapear (a Learn API pode retornar duplicatas)
    const seenUid = new Set<string>();
    const unique = certifications.filter((item) => {
      if (seenUid.has(item.uid)) return false;
      seenUid.add(item.uid);
      return true;
    });

    const mapped: CertMetadata[] = unique.map((item) => {
      const examCode = extractExamCode(item.title, item.uid);
      return {
        id: examCode.toLowerCase().replace(/\s+/g, "-"),
        examCode,
        name: cleanCertName(item.title),
        fullName: item.title,
        product: mapProduct(item.products),
        role: item.roles?.[0] ?? "General",
        level: mapLevel(item.levels),
        subject: item.subjects?.[0] ?? "Cloud",
        learnUrl: item.url.startsWith("http")
          ? item.url
          : `https://learn.microsoft.com${item.url}`,
      };
    });

    // Segunda deduplicação por id — múltiplas certs legadas (ex: MCSA) podem gerar o mesmo slug
    const seenId = new Set<string>();
    let certs: CertMetadata[] = mapped.filter((c) => {
      if (seenId.has(c.id)) return false;
      seenId.add(c.id);
      return true;
    });

    // Filtro de busca por texto feito client-side, mas pode ser feito aqui também
    if (filters.search) {
      const q = filters.search.toLowerCase();
      certs = certs.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.examCode.toLowerCase().includes(q) ||
          c.product.toLowerCase().includes(q)
      );
    }

    if (filters.subject) {
      const sub = filters.subject.toLowerCase();
      certs = certs.filter((c) => c.subject.toLowerCase().includes(sub));
    }

    return certs;
  } catch {
    // Retorna catálogo vazio em caso de erro — a UI trata isso
    return [];
  }
}

export async function fetchLearningPaths(certCode: string): Promise<LearningPath[]> {
  try {
    // Passo 1: busca o UID da certificação pelo código do exame
    const certUid = await resolveCertificationUid(certCode);

    // Passo 2: busca learning paths filtrados pelo certification_uid oficial
    if (certUid) {
      const params = new URLSearchParams({
        locale: "pt-br",
        resource_type: "learningPath",
        certification_uid: certUid,
      });
      const url = `${LEARN_API_BASE}?${params.toString()}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });

      if (res.ok) {
        const data: LearnCatalogResponse = await res.json();
        const paths = data.learningPaths ?? [];
        if (paths.length > 0) {
          return paths.slice(0, 10).map((lp) => ({
            uid: lp.uid,
            title: lp.title,
            description: "",
            url: lp.url.startsWith("http")
              ? lp.url
              : `https://learn.microsoft.com${lp.url}`,
          }));
        }
      }
    }

    // Passo 3: fallback — busca por código do exame como texto (menos preciso)
    const fallbackParams = new URLSearchParams({
      locale: "pt-br",
      resource_type: "learningPath",
      terms: certCode,
    });
    const fallbackUrl = `${LEARN_API_BASE}?${fallbackParams.toString()}`;
    const fallbackRes = await fetch(fallbackUrl, { next: { revalidate: 3600 } });

    if (!fallbackRes.ok) return [];

    const fallbackData: LearnCatalogResponse = await fallbackRes.json();
    const fallbackPaths = fallbackData.learningPaths ?? [];

    // Filtra apenas paths cujo título ou uid realmente contenha o código da cert
    const code = certCode.toUpperCase();
    const filtered = fallbackPaths.filter((lp) =>
      lp.title?.toUpperCase().includes(code) ||
      lp.uid?.toUpperCase().includes(code.replace("-", ""))
    );

    const final = (filtered.length > 0 ? filtered : fallbackPaths).slice(0, 8);

    return final.map((lp) => ({
      uid: lp.uid,
      title: lp.title,
      description: "",
      url: lp.url.startsWith("http")
        ? lp.url
        : `https://learn.microsoft.com${lp.url}`,
    }));
  } catch {
    return [];
  }
}

/**
 * Resolve o certification_uid da Microsoft Learn a partir do código do exame.
 * Ex: "AZ-900" → "certification.azure-fundamentals"
 */
async function resolveCertificationUid(certCode: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      locale: "pt-br",
      resource_type: "certification",
      terms: certCode,
    });
    const url = `${LEARN_API_BASE}?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h

    if (!res.ok) return null;

    const data: LearnCatalogResponse = await res.json();
    const certs = data.certifications ?? [];

    // Encontra a cert cujo título contém o código exato do exame
    const code = certCode.toUpperCase();
    const match = certs.find((c) => {
      const titleUpper = c.title?.toUpperCase() ?? "";
      return (
        titleUpper.includes(`(${code})`) ||
        titleUpper.includes(`${code},`) ||
        titleUpper.startsWith(code) ||
        c.uid?.toUpperCase().includes(code.replace("-", ""))
      );
    });

    return match?.uid ?? (certs[0]?.uid ?? null);
  } catch {
    return null;
  }
}

function extractExamCode(title: string, uid: string): string {
  // Tenta extrair do título: "Microsoft Certified: Azure AI Fundamentals (AI-900)"
  const match = title.match(/\(([A-Z]{1,3}-\d{3}[a-zA-Z]*)\)/);
  if (match) return match[1];

  // Tenta extrair do uid: "certification.azure-ai-fundamentals" → não tem
  // Fallback: retira prefixos comuns e usa o título limpo
  const codeFromTitle = title
    .replace(/Microsoft Certified:|Microsoft \d{3} Certified:|Exam /gi, "")
    .trim()
    .split(":")[0]
    .trim();

  return codeFromTitle || uid;
}

function cleanCertName(title: string): string {
  return title
    .replace(/^Microsoft Certified:\s*/i, "")
    .replace(/^Microsoft \d{3} Certified:\s*/i, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}
