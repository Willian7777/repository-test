import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  extrairTextoOcr, extrairTextoOcrBinario, extrairTextoOcrSpace,
  azureVisionConfigurado, ocrSpaceConfigurado,
} from "@/lib/azure";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";
import { z } from "zod";

const MIME_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const schema = z.object({
  imagemUrl: z.string().url().startsWith("/uploads/", {
    message: "Apenas imagens hospedadas na plataforma são permitidas",
  }).or(z.string().url().regex(/^https?:\/\//)),
  idioma: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  // ── Modo upload de arquivo (multipart/form-data) ─────────────────────────
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "FormData inválido" }, { status: 400 });

    const file   = form.get("file") as File | null;
    const idioma = String(form.get("idioma") ?? "en");
    if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

    if (!MIME_PERMITIDOS.has(file.type)) {
      return NextResponse.json({ error: "Tipo não permitido. Use JPG, PNG ou WebP." }, { status: 415 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máx. 5 MB." }, { status: 413 });
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Fallback automático: Azure Vision → OCR.space
      let resultado;
      let provedor: string;
      if (azureVisionConfigurado()) {
        resultado = await extrairTextoOcrBinario(buffer, file.type);
        provedor  = "azure";
      } else if (ocrSpaceConfigurado()) {
        resultado = await extrairTextoOcrSpace(buffer, idioma);
        provedor  = "ocr.space";
      } else {
        return NextResponse.json({
          error: "Nenhum provedor de OCR configurado. Configure AZURE_VISION_KEY ou OCR_SPACE_API_KEY no .env.local",
        }, { status: 503 });
      }

      await registrarAuditoria({
        userId: session.user.id,
        acao: AcaoAudit.ADMIN_OCR,
        ip: getIp(req),
        metadata: { provedor, modo: "upload", tamanho: file.size, charsExtraidos: resultado.textoCompleto.length },
      });

      return NextResponse.json({ ...resultado, provedor });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  // ── Modo URL (application/json) ────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const baseUrl   = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const imagemUrl = parsed.data.imagemUrl.startsWith("/")
    ? `${baseUrl}${parsed.data.imagemUrl}`
    : parsed.data.imagemUrl;

  try {
    let resultado;
    let provedor: string;

    if (azureVisionConfigurado()) {
      resultado = await extrairTextoOcr(imagemUrl);
      provedor  = "azure";
    } else if (ocrSpaceConfigurado()) {
      // Para URL, fazer download e passar como buffer para OCR.space
      const imgRes    = await fetch(imagemUrl);
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
      resultado = await extrairTextoOcrSpace(imgBuffer, parsed.data.idioma ?? "en");
      provedor  = "ocr.space";
    } else {
      return NextResponse.json({
        error: "Nenhum provedor de OCR configurado. Configure AZURE_VISION_KEY ou OCR_SPACE_API_KEY no .env.local",
      }, { status: 503 });
    }

    await registrarAuditoria({
      userId: session.user.id,
      acao: AcaoAudit.ADMIN_OCR,
      ip: getIp(req),
      metadata: { provedor, modo: "url", charsExtraidos: resultado.textoCompleto.length },
    });

    return NextResponse.json({ ...resultado, provedor });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
