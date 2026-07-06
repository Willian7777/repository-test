import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ erro: "Login necessário." }, { status: 401 });
  }

  const analises = await prisma.analise.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: session.user.plano === "PRO" ? 100 : 10,
    select: {
      id: true,
      tipoSugerido: true,
      nivelRisco: true,
      golpeSuspeito: true,
      createdAt: true,
      resultado: true,  // String — cliente faz JSON.parse
    },
  });

  return Response.json({ analises });
}
