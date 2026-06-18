import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// DELETE /api/paginas/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.pagina.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH /api/paginas/[id] — atualiza textos de tradução
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

  const { textoOriginal, idiomaOriginal, textoTraduzido } = body as Record<string, string>;
  const pagina = await prisma.pagina.update({
    where: { id },
    data: { textoOriginal, idiomaOriginal, textoTraduzido },
  });
  return NextResponse.json(pagina);
}
