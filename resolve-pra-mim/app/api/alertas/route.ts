import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ erro: "Login necessário." }, { status: 401 });
  }

  const body = await request.json() as { analiseId?: string };
  const { analiseId } = body;
  if (!analiseId) return Response.json({ erro: "analiseId obrigatório." }, { status: 400 });

  const analise = await prisma.analise.findUnique({
    where: { id: analiseId },
    select: { resultado: true },
  });
  if (!analise) return Response.json({ erro: "Análise não encontrada." }, { status: 404 });

  const prazoData = (JSON.parse(analise.resultado as string) as { prazo_data?: string })?.prazo_data;
  if (!prazoData) {
    return Response.json({ erro: "Esse documento não tem prazo identificado." }, { status: 400 });
  }

  const [dd, mm, aaaa] = prazoData.split("/");
  const prazoDate = new Date(Number(aaaa), Number(mm) - 1, Number(dd));

  if (isNaN(prazoDate.getTime()) || prazoDate < new Date()) {
    return Response.json({ erro: "Prazo já vencido ou inválido." }, { status: 400 });
  }

  const existente = await prisma.alertaPrazo.findFirst({
    where: { userId: session.user.id, analiseId },
  });

  if (!existente) {
    await prisma.alertaPrazo.create({
      data: {
        userId:    session.user.id,
        analiseId,
        prazoData: prazoDate,
      },
    });
  }

  return Response.json({ ok: true });
}
