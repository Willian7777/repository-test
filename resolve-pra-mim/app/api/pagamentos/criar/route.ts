import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";
import { criarAssinaturaPro } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ erro: "Login necessário." }, { status: 401 });
  }

  if (session.user.plano === "PRO") {
    return Response.json({ erro: "Você já é PRO!" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });
  if (!user?.email) {
    return Response.json({ erro: "E-mail não encontrado." }, { status: 400 });
  }

  try {
    const initPoint = await criarAssinaturaPro(session.user.id, user.email);

    await registrarAuditoria({
      userId: session.user.id,
      acao:   AcaoAudit.ASSINATURA_INICIADA,
      ip:     getIp(request),
    });

    return Response.json({ url: initPoint });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao criar assinatura.";
    return Response.json({ erro: msg }, { status: 502 });
  }
}
