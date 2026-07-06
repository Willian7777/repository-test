import pdfParse from "pdf-parse";
import { extrairTextoOcrBinario, extrairTextoOcrSpace } from "@/lib/azure";

const TAMANHO_MAX = 10 * 1024 * 1024; // 10 MB

export async function extrairTexto(arquivo: File): Promise<string> {
  if (arquivo.size > TAMANHO_MAX) {
    throw new Error("Arquivo muito grande. Limite: 10 MB.");
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const mime   = arquivo.type;

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (mime === "application/pdf") {
    const data = await pdfParse(buffer);
    const texto = data.text.trim();
    if (!texto) throw new Error("Não foi possível extrair texto deste PDF. Tente enviar como imagem.");
    return texto;
  }

  // ── Imagem (JPEG, PNG, WebP) ──────────────────────────────────────────────
  if (mime.startsWith("image/")) {
    // Tenta Azure Vision; se não configurado ou falhar, usa OCR.space
    try {
      const resultado = await extrairTextoOcrBinario(buffer, mime);
      if (resultado.textoCompleto.trim()) return resultado.textoCompleto;
    } catch {
      // Azure não disponível, continua para OCR.space
    }

    const fallback = await extrairTextoOcrSpace(buffer, "por");
    if (!fallback.textoCompleto.trim()) {
      throw new Error("Não foi possível extrair texto da imagem. Verifique se o documento está legível.");
    }
    return fallback.textoCompleto;
  }

  throw new Error("Tipo de arquivo não suportado. Envie PDF, JPG, PNG ou WebP.");
}
