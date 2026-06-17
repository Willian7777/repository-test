import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { StatusObra, AcaoAudit } from "@/lib/constants";
import { z } from "zod";
import { registrarAuditoria, getIp } from "@/lib/auditlog";

// GET /api/obras — lista obras públicas (publicadas)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const genero = searchParams.get("genero");

  const obras = await prisma.obra.findMany({
    where: {
      status: StatusObra.PUBLICADO,
      ...(genero ? { generos: { contains: genero } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, titulo: true, autorOriginal: true, tradutora: true,
      sinopse: true, capaUrl: true, preco: true, generos: true,
      status: true, createdAt: true,
      _count: { select: { capitulos: { where: { publicado: true } } } },
    },
  });

  return NextResponse.json(obras);
}

// POST /api/obras — cria obra (somente ADMIN)
const criarObraSchema = z.object({
  titulo: z.string().min(1).max(200),
  autorOriginal: z.string().min(1).max(200),
  tradutora: z.string().max(200).optional(),
  sinopse: z.string().min(1).max(2000),
  capaUrl: z.string().url(),
  preco: z.number().min(0).max(9999),
  generos: z.array(z.string().max(50)).min(1).max(10),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = criarObraSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { generos, ...rest } = parsed.data;
  const obra = await prisma.obra.create({
    data: { ...rest, generos: JSON.stringify(generos) },
  });

  await registrarAuditoria({
    userId: session.user.id,
    acao: AcaoAudit.ADMIN_CRIAR_OBRA,
    entidade: "Obra",
    entidadeId: obra.id,
    ip: getIp(req),
  });

  return NextResponse.json(obra, { status: 201 });
}
