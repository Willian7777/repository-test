import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { extrairTextoOcr } from "@/lib/azure";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";
import { z } from "zod";

const schema = z.object({
  imagemUrl: z.string().url().startsWith("/uploads/", {
    message: "Apenas imagens hospedadas na plataforma são permitidas",
  }).or(z.string().url().regex(/^https?:\/\//)),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Converter URL relativa para absoluta se necessário
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const imagemUrl = parsed.data.imagemUrl.startsWith("/")
    ? `${baseUrl}${parsed.data.imagemUrl}`
    : parsed.data.imagemUrl;

  try {
    const resultado = await extrairTextoOcr(imagemUrl);

    await registrarAuditoria({
      userId: session.user.id,
      acao: AcaoAudit.ADMIN_OCR,
      ip: getIp(req),
      metadata: { imagemUrl, charsExtraidos: resultado.textoCompleto.length },
    });

    return NextResponse.json(resultado);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
