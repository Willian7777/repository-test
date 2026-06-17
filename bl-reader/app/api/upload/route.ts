import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const MIME_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT_MAPA: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
const TAMANHO_MAX = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "FormData inválido" }, { status: 400 });

  const file = form.get("file") as File | null;
  const obraId = String(form.get("obraId") ?? "");
  const capituloId = String(form.get("capituloId") ?? "");
  const numeroPagina = parseInt(String(form.get("numero") ?? "0"), 10);

  if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

  // ── Validações de segurança ──────────────────────────────────────────────
  if (!MIME_PERMITIDOS.has(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido. Use: JPG, PNG, WebP ou GIF" }, { status: 415 });
  }
  if (file.size > TAMANHO_MAX) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo: 5 MB" }, { status: 413 });
  }

  // Validar que capituloId pertence à obra informada (previne path traversal e acesso indevido)
  const capituloValido = await prisma.capitulo.findFirst({
    where: { id: capituloId, obraId },
    select: { id: true },
  });
  if (!capituloValido) return NextResponse.json({ error: "Capítulo não encontrado" }, { status: 404 });

  // Gerar nome de arquivo seguro (UUID) — sem path traversal
  const ext = EXT_MAPA[file.type];
  const nomeSeguro = `${crypto.randomUUID()}.${ext}`;

  // Diretório de destino
  const uploadDir = path.join(process.cwd(), "public", "uploads", "obras", obraId, capituloId);
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, nomeSeguro);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // URL pública da imagem
  const imagemUrl = `/uploads/obras/${obraId}/${capituloId}/${nomeSeguro}`;

  // Upsert na Pagina
  const pagina = await prisma.pagina.upsert({
    where: { capituloId_numero: { capituloId, numero: numeroPagina } },
    create: { capituloId, numero: numeroPagina, imagemUrl },
    update: { imagemUrl },
  });

  await registrarAuditoria({
    userId: session.user.id,
    acao: AcaoAudit.ADMIN_UPLOAD,
    entidade: "Pagina",
    entidadeId: pagina.id,
    ip: getIp(req),
    metadata: { obraId, capituloId, numeroPagina, imagemUrl },
  });

  return NextResponse.json({ imagemUrl, paginaId: pagina.id }, { status: 201 });
}
