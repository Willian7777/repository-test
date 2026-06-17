import {
  CurrencyResponse,
  ItemResponse,
  MarketItem,
  ItemCategory,
  CurrencyLine,
  ItemLine,
} from "@/types/market";

const BASE_URL = "https://poe.ninja/api/data";

export const CATEGORY_CONFIG: Record<
  ItemCategory,
  { label: string; icon: string; apiType: string; isCurrency: boolean }
> = {
  Currency: { label: "Moedas", icon: "💰", apiType: "Currency", isCurrency: true },
  Fragment: { label: "Fragmentos", icon: "🧩", apiType: "Fragment", isCurrency: true },
  Rune: { label: "Runas", icon: "🔮", apiType: "Rune", isCurrency: true },
  Omen: { label: "Omens", icon: "⚡", apiType: "Omen", isCurrency: true },
  Divination: { label: "Cartas Div.", icon: "🃏", apiType: "DivinationCard", isCurrency: false },
  UniqueWeapon: { label: "Armas Únicas", icon: "⚔️", apiType: "UniqueWeapon", isCurrency: false },
  UniqueArmour: { label: "Armaduras Únicas", icon: "🛡️", apiType: "UniqueArmour", isCurrency: false },
  UniqueAccessory: { label: "Acessórios Únicos", icon: "💍", apiType: "UniqueAccessory", isCurrency: false },
  UniqueFlask: { label: "Frascos Únicos", icon: "🧪", apiType: "UniqueFlask", isCurrency: false },
  UniqueJewel: { label: "Joias Únicas", icon: "💎", apiType: "UniqueJewel", isCurrency: false },
  SkillGem: { label: "Gemas", icon: "🔵", apiType: "SkillGem", isCurrency: false },
  UniqueMap: { label: "Mapas Únicos", icon: "🗺️", apiType: "UniqueMap", isCurrency: false },
  Map: { label: "Mapas", icon: "📍", apiType: "Map", isCurrency: false },
};

// ─── Fetch helpers ────────────────────────────────────────────────────────────

const NINJA_HEADERS = {
  "User-Agent": "Mozilla/5.0 poe2-market/1.0 (hobby project)",
  "Accept": "application/json",
};

/**
 * Fetch com múltiplos fallbacks para contornar CORS/proxy corporativo.
 * Ordem: direto → corsproxy.io → allorigins.win (via raw) → thingproxy
 */
async function fetchWithFallback(url: string): Promise<Response> {
  const proxies = [
    // Tenta direto primeiro
    () => fetch(url, { headers: NINJA_HEADERS, signal: AbortSignal.timeout(10000) }),
    // corsproxy.io — funciona de localhost
    () => fetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(12000) }),
    // allorigins.win com endpoint GET alternativo
    () => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(12000) })
      .then(async r => {
        if (!r.ok) throw new Error(`allorigins ${r.status}`);
        const json = await r.json();
        // allorigins /get retorna { contents: "...", status: {...} }
        return new Response(json.contents, { status: 200, headers: { "Content-Type": "application/json" } });
      }),
  ];

  let lastError: unknown;
  for (const proxy of proxies) {
    try {
      const res = await proxy();
      if (res.ok) return res;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error("All proxies failed");
}

async function fetchCurrency(league: string, type: string): Promise<CurrencyResponse> {
  const url = `${BASE_URL}/currencyoverview?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}&language=en&game=poe2`;
  const res = await fetchWithFallback(url);
  return res.json();
}

async function fetchItems(league: string, type: string): Promise<ItemResponse> {
  const url = `${BASE_URL}/itemoverview?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}&language=en&game=poe2`;
  const res = await fetchWithFallback(url);
  return res.json();
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeCurrencyLine(
  line: CurrencyLine,
  detail: { icon: string } | undefined,
  category: ItemCategory
): MarketItem {
  const sparkline = line.receiveSparkLine?.data ?? [];
  const change = line.receiveSparkLine?.totalChange ?? 0;

  return {
    id: line.detailsId,
    name: line.currencyTypeName,
    icon: detail?.icon ?? "",
    chaosValue: line.chaosEquivalent,
    change24h: change,
    sparkline,
    category,
    count: line.receive?.count ?? line.pay?.count ?? 0,
  };
}

function normalizeItemLine(line: ItemLine, category: ItemCategory): MarketItem {
  return {
    id: line.detailsId,
    name: line.name,
    icon: line.icon,
    chaosValue: line.chaosValue,
    divineValue: line.divineValue,
    change24h: line.sparkline?.totalChange ?? 0,
    sparkline: line.sparkline?.data ?? [],
    category,
    count: line.count,
    listingCount: line.listingCount,
    corrupted: line.corrupted,
    gemLevel: line.gemLevel,
    gemQuality: line.gemQuality,
    baseType: line.baseType,
    variant: line.variant,
    links: line.links,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getMarketItems(
  league: string,
  category: ItemCategory
): Promise<MarketItem[]> {
  const config = CATEGORY_CONFIG[category];

  if (config.isCurrency) {
    const data = await fetchCurrency(league, config.apiType);
    const detailMap = new Map(data.currencyDetails.map((d) => [d.name, d]));
    return data.lines.map((line) =>
      normalizeCurrencyLine(line, detailMap.get(line.currencyTypeName), category)
    );
  } else {
    const data = await fetchItems(league, config.apiType);
    return data.lines.map((line) => normalizeItemLine(line, category));
  }
}

export async function getTopMovers(
  league: string,
  limit = 20
): Promise<MarketItem[]> {
  const categories: ItemCategory[] = [
    "Currency",
    "UniqueWeapon",
    "UniqueArmour",
    "UniqueAccessory",
    "SkillGem",
    "Divination",
  ];

  const results = await Promise.allSettled(
    categories.map((c) => getMarketItems(league, c))
  );

  const all: MarketItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  return all
    .filter((i) => Math.abs(i.change24h) > 0 && i.count > 5)
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, limit);
}

export function formatChaos(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
