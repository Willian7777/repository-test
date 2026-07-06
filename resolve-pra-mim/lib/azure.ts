/**
 * Integração com Azure Computer Vision (OCR) e OCR.space (fallback gratuito).
 * Adaptado de bl-reader — somente server-side, chaves nunca expostas ao cliente.
 */

const PLACEHOLDER = ["PREENCHA", "SEU_RECURSO", ""];

function credenciaisValidas(key?: string, endpoint?: string) {
  if (!key || !endpoint) return false;
  return !PLACEHOLDER.some((p) => key.includes(p) || endpoint.includes(p));
}

export interface OcrResultado {
  textoCompleto: string;
  linhas: string[];
}

/** OCR via Azure Computer Vision v4 — envia Buffer binário (sem armazenar) */
export async function extrairTextoOcrBinario(
  imageBuffer: Buffer,
  mimeType: string
): Promise<OcrResultado> {
  const endpoint = process.env.AZURE_VISION_ENDPOINT;
  const key      = process.env.AZURE_VISION_KEY;

  if (!credenciaisValidas(key, endpoint)) {
    throw new Error("Azure Vision não configurado. Configure AZURE_VISION_KEY e AZURE_VISION_ENDPOINT.");
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

/** OCR via OCR.space — fallback gratuito (500 req/dia) */
export async function extrairTextoOcrSpace(
  imageBuffer: Buffer,
  idioma = "por"
): Promise<OcrResultado> {
  const key = process.env.OCR_SPACE_API_KEY ?? "helloworld"; // chave pública de teste

  const base64 = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

  const fd = new FormData();
  fd.append("apikey", key);
  fd.append("language", idioma);
  fd.append("base64Image", base64);
  fd.append("isOverlayRequired", "false");
  fd.append("detectOrientation", "true");
  fd.append("scale", "true");
  fd.append("OCREngine", "2");

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error(`OCR.space erro HTTP ${res.status}`);

  const data = await res.json() as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string[];
    ParsedResults?: Array<{ ParsedText?: string }>;
  };

  if (data.IsErroredOnProcessing) {
    throw new Error(`OCR.space: ${data.ErrorMessage?.join(", ")}`);
  }

  const textoCompleto = data.ParsedResults?.map((r) => r.ParsedText ?? "").join("\n") ?? "";
  return { textoCompleto, linhas: textoCompleto.split("\n").filter(Boolean) };
}
