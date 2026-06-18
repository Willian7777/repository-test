/**
 * Helpers para Azure Computer Vision (OCR) e Azure Translator.
 * As chaves NUNCA são expostas ao cliente — apenas server-side.
 */

const PLACEHOLDER = ["PREENCHA", "SEU_RECURSO", ""];

function credenciaisValidas(key?: string, endpoint?: string) {
  if (!key || !endpoint) return false;
  return !PLACEHOLDER.some((p) => key.includes(p) || endpoint.includes(p));
}

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
  const key      = process.env.AZURE_VISION_KEY;

  if (!credenciaisValidas(key, endpoint)) {
    throw new Error("Credenciais Azure Vision não configuradas. Preencha AZURE_VISION_KEY e AZURE_VISION_ENDPOINT no arquivo .env.local");
  }

  const url = `${endpoint}/computervision/imageanalysis:analyze?api-version=2023-02-01-preview&features=read`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": key!,
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

/**
 * Extrai texto de uma imagem enviada como binário (upload direto, sem armazenar).
 * Aceita Buffer com dados da imagem (JPEG, PNG, WebP).
 */
export async function extrairTextoOcrBinario(imageBuffer: Buffer, mimeType: string): Promise<OcrResultado> {
  const endpoint = process.env.AZURE_VISION_ENDPOINT;
  const key      = process.env.AZURE_VISION_KEY;

  if (!credenciaisValidas(key, endpoint)) {
    throw new Error("Credenciais Azure Vision não configuradas. Preencha AZURE_VISION_KEY e AZURE_VISION_ENDPOINT no arquivo .env.local");
  }

  const url = `${endpoint}/computervision/imageanalysis:analyze?api-version=2023-02-01-preview&features=read`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": mimeType,
      "Ocp-Apim-Subscription-Key": key!,
    },
    body: new Uint8Array(imageBuffer),
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

// ─── OCR Gratuito: OCR.space ──────────────────────────────────────────────────
// Plano gratuito: 500 req/dia — obtenha sua chave em https://ocr.space/OCRAPI

// Mapa de idiomas BCP-47 → códigos OCR.space
const OCR_SPACE_LANG: Record<string, string> = {
  "ja": "jpn", "ko": "kor", "zh-Hans": "chs", "zh-Hant": "cht",
  "ru": "rus", "en": "eng", "es": "spa", "fr": "fre", "de": "ger",
};

export async function extrairTextoOcrSpace(
  imageBuffer: Buffer,
  idioma = "en"
): Promise<OcrResultado> {
  const key = process.env.OCR_SPACE_API_KEY;
  if (!key || PLACEHOLDER.some((p) => key.includes(p))) {
    throw new Error(
      "OCR.space não configurado. Obtenha uma chave gratuita em https://ocr.space/OCRAPI e adicione OCR_SPACE_API_KEY no .env.local"
    );
  }

  const lang = OCR_SPACE_LANG[idioma] ?? "eng";
  const base64 = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

  const fd = new FormData();
  fd.append("apikey",      key);
  fd.append("language",    lang);
  fd.append("base64Image", base64);
  fd.append("isOverlayRequired", "false");
  fd.append("detectOrientation",  "true");
  fd.append("scale",       "true");
  fd.append("OCREngine",   "2"); // Engine 2 é melhor para textos em idiomas asiáticos

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error(`OCR.space erro HTTP ${res.status}`);

  const data = await res.json() as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string | string[];
    ParsedResults?: Array<{ ParsedText?: string }>;
  };

  if (data.IsErroredOnProcessing) {
    const msg = Array.isArray(data.ErrorMessage) ? data.ErrorMessage[0] : data.ErrorMessage;
    throw new Error(`OCR.space: ${msg ?? "Erro desconhecido"}`);
  }

  const textoCompleto = data.ParsedResults?.[0]?.ParsedText?.trim() ?? "";
  return { textoCompleto, linhas: textoCompleto.split("\n").filter(Boolean) };
}

// ─── Tradução Gratuita: MyMemory ─────────────────────────────────────────────
// Sem chave: 1.000 palavras/dia — Com conta gratuita: 5.000 palavras/dia
// Cadastro grátis em https://mymemory.translated.net

// Mapa de idiomas BCP-47 → códigos MyMemory
const MYMEMORY_LANG: Record<string, string> = {
  "ja": "ja", "ko": "ko", "zh-Hans": "zh-CN", "zh-Hant": "zh-TW",
  "ru": "ru", "en": "en", "es": "es", "fr": "fr", "de": "de",
};

export async function traduzirMyMemory(
  texto: string,
  idiomaOrigem: string
): Promise<string> {
  if (!texto.trim()) return "";

  const from = MYMEMORY_LANG[idiomaOrigem] ?? idiomaOrigem;
  const email = process.env.MYMEMORY_EMAIL ?? ""; // opcional: aumenta o limite para 5k palavras/dia

  // MyMemory tem limite de 500 chars por requisição — quebrar em partes se necessário
  const LIMITE = 450;
  const partes = [];
  for (let i = 0; i < texto.length; i += LIMITE) {
    partes.push(texto.slice(i, i + LIMITE));
  }

  const traduzidas: string[] = [];
  for (const parte of partes) {
    const params = new URLSearchParams({
      q: parte,
      langpair: `${from}|pt-BR`,
      ...(email ? { de: email } : {}),
    });
    const res  = await fetch(`https://api.mymemory.translated.net/get?${params}`);
    const data = await res.json() as {
      responseStatus: number;
      responseDetails?: string;
      responseData?: { translatedText?: string };
    };
    if (data.responseStatus !== 200) {
      throw new Error(`MyMemory: ${data.responseDetails ?? "Limite diário atingido"}`);
    }
    traduzidas.push(data.responseData?.translatedText ?? parte);
  }

  return traduzidas.join(" ");
}

// ─── Helpers de detecção de provedor ─────────────────────────────────────────

export function azureVisionConfigurado() {
  return credenciaisValidas(
    process.env.AZURE_VISION_KEY,
    process.env.AZURE_VISION_ENDPOINT
  );
}

export function ocrSpaceConfigurado() {
  const k = process.env.OCR_SPACE_API_KEY;
  return !!k && !PLACEHOLDER.some((p) => k.includes(p));
}

export function azureTranslatorConfigurado() {
  const k = process.env.AZURE_TRANSLATOR_KEY;
  return !!k && !PLACEHOLDER.some((p) => k.includes(p));
}

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
