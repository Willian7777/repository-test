import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatusObra, AcaoAudit } from "@/lib/constants";
import { z } from "zod";
import { registrarAuditoria, getIp } from "@/lib/auditlog";

// GET /api/obras/[id] — detalhes públicos da obra
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const obra = await prisma.obra.findFirst({
    where: { id, status: StatusObra.PUBLICADO },
    include: {
      capitulos: {
        where: { publicado: true },
        orderBy: { numero: "asc" },
        select: { id: true, numero: true, titulo: true },
      },
    },
  });

  if (!obra) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });
  return NextResponse.json(obra);
}

// PATCH /api/obras/[id] — edita obra (somente ADMIN)
const editarObraSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  sinopse: z.string().min(1).max(2000).optional(),
  capaUrl: z.string().url().optional(),
  preco: z.number().min(0).max(9999).optional(),
  generos: z.array(z.string().max(50)).min(1).max(10).optional(),
  status: z.enum(["RASCUNHO", "PUBLICADO", "ARQUIVADO"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = editarObraSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { generos, ...rest } = parsed.data;
  const obra = await prisma.obra.update({
    where: { id },
    data: {
      ...rest,
      ...(generos ? { generos: JSON.stringify(generos) } : {}),
    },
  });

  await registrarAuditoria({
    userId: session.user.id,
    acao: AcaoAudit.ADMIN_EDITAR_OBRA,
    entidade: "Obra",
    entidadeId: id,
    ip: getIp(req),
    metadata: rest,
  });

  return NextResponse.json(obra);
}
