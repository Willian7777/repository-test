import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatAcompanhamento } from "@/lib/groq";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ erro: "Login necessário." }, { status: 401 });
  }
  if (session.user.plano !== "PRO") {
    return Response.json({ erro: "Recurso disponível apenas no plano PRO." }, { status: 403 });
  }

  const body = await request.json() as {
    analiseId: string;
    pergunta: string;
    historico: Array<{ autor: string; conteudo: string }>;
  };

  const { analiseId, pergunta, historico } = body;

  if (!analiseId || !pergunta?.trim()) {
    return Response.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  // Verifica que a análise existe (sem verificar dono — links compartilhados são permitidos)
  const analise = await prisma.analise.findUnique({
    where: { id: analiseId },
    select: { resultado: true },
  });
  if (!analise) return Response.json({ erro: "Análise não encontrada." }, { status: 404 });

  const resumo = JSON.parse(analise.resultado as string)?.normal?.o_que_e ?? "";

  const resposta = await chatAcompanhamento(resumo, historico, pergunta.trim());

  // Salva mensagens no banco
  await prisma.chatMensagem.createMany({
    data: [
      { analiseId, autor: "usuario",     conteudo: pergunta.trim() },
      { analiseId, autor: "assistente",  conteudo: resposta },
    ],
  });

  return Response.json({ resposta });
}
