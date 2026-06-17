/**
 * Helpers para Azure Computer Vision (OCR) e Azure Translator.
 * As chaves NUNCA são expostas ao cliente — apenas server-side.
 */

// ─── OCR: Azure Computer Vision ──────────────────────────────────────────────

export interface OcrResultado {
  textoCompleto: string;
  linhas: string[];
}

/**
 * Extrai texto de uma imagem via Azure Computer Vision Image Analysis v4.
 * Suporta: japonês (vertical/horizontal), coreano, chinês simplificado/tradicional, russo, inglês.
 */
export async function extrairTextoOcr(imagemUrl: string): Promise<OcrResultado> {
  const endpoint = process.env.AZURE_VISION_ENDPOINT;
  const key = process.env.AZURE_VISION_KEY;

  if (!endpoint || !key) {
    throw new Error("Credenciais Azure Vision não configuradas.");
  }

  const url = `${endpoint}/computervision/imageanalysis:analyze?api-version=2023-02-01-preview&features=read`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": key,
    },
    body: JSON.stringify({ url: imagemUrl }),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Azure Vision erro ${response.status}: ${erro}`);
  }

  const data = await response.json() as {
    readResult?: {
      content?: string;
      pages?: Array<{ lines?: Array<{ content?: string }> }>;
    };
  };

  const textoCompleto = data.readResult?.content ?? "";
  const linhas =
    data.readResult?.pages
      ?.flatMap((p) => p.lines ?? [])
      .map((l) => l.content ?? "")
      .filter(Boolean) ?? [];

  return { textoCompleto, linhas };
}

// ─── Tradução: Azure Translator ───────────────────────────────────────────────

// Idiomas suportados (BCP-47) com nomes legíveis para o seletor do admin
export const IDIOMAS_SUPORTADOS: Record<string, string> = {
  "ja": "🇯🇵 Japonês",
  "ko": "🇰🇷 Coreano",
  "zh-Hans": "🇨🇳 Chinês Simplificado",
  "zh-Hant": "🇹🇼 Chinês Tradicional",
  "ru": "🇷🇺 Russo",
  "en": "🇬🇧 Inglês",
  "es": "🇪🇸 Espanhol",
  "fr": "🇫🇷 Francês",
  "de": "🇩🇪 Alemão",
};

/**
 * Traduz texto para pt-BR usando Azure Translator.
 */
export async function traduzirTexto(
  texto: string,
  idiomaOrigem: string
): Promise<string> {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION ?? "brazilsouth";

  if (!key) {
    throw new Error("Credenciais Azure Translator não configuradas.");
  }

  if (!texto.trim()) return "";

  // Limitar tamanho para evitar abuso (50.000 chars por chamada é o limite da Azure)
  const textoLimitado = texto.slice(0, 10_000);

  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${idiomaOrigem}&to=pt`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": key,
      "Ocp-Apim-Subscription-Region": region,
    },
    body: JSON.stringify([{ text: textoLimitado }]),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Azure Translator erro ${response.status}: ${erro}`);
  }

  const data = await response.json() as Array<{
    translations: Array<{ text: string; to: string }>;
  }>;

  return data[0]?.translations[0]?.text ?? "";
}
