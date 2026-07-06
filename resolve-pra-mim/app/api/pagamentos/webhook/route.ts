import { prisma } from "@/lib/prisma";
import { validarWebhook } from "@/lib/mercadopago";
import { registrarAuditoria } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";

export async function POST(request: Request) {
  const payload   = await request.text();
  const assinatura = request.headers.get("x-signature") ?? "";

  if (!validarWebhook(payload, assinatura)) {
    return Response.json({ erro: "Assinatura inválida." }, { status: 401 });
  }

  const evento = JSON.parse(payload) as {
    type: string;
    data?: { id?: string };
    action?: string;
    external_reference?: string;
  };

  // Assinatura aprovada → ativa PRO
  if (
    (evento.type === "subscription_preapproval" || evento.type === "payment") &&
    (evento.action === "updated" || evento.action === "payment.updated")
  ) {
    const userId = evento.external_reference;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data:  { plano: "PRO" },
      });
      await registrarAuditoria({
        userId,
        acao: AcaoAudit.ASSINATURA_APROVADA,
        metadata: { evento: evento.type },
      });
    }
  }

  // Assinatura cancelada → revoga PRO
  if (
    evento.type === "subscription_preapproval" &&
    evento.action === "subscription_preapproval.deauthorized"
  ) {
    const userId = evento.external_reference;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data:  { plano: "FREE" },
      });
      await registrarAuditoria({
        userId,
        acao: AcaoAudit.ASSINATURA_CANCELADA,
      });
    }
  }

  return Response.json({ ok: true });
}
