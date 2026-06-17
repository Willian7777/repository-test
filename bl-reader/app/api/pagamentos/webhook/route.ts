import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validarAssinaturaWebhook, mpPayment } from "@/lib/mercadopago";
import { registrarAuditoria } from "@/lib/auditlog";
import { AcaoAudit, StatusCompra } from "@/lib/constants";

// Mercado Pago envia eventos via POST nesta rota
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id") ?? "";

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Somente processar notificações de pagamento
  if (body.type !== "payment") {
    return new NextResponse("OK", { status: 200 });
  }

  const dataId = String((body.data as Record<string, unknown>)?.id ?? "");
  if (!dataId) return new NextResponse("Bad Request", { status: 400 });

  // ── Validar assinatura HMAC-SHA256 ──────────────────────────────────────
  if (!validarAssinaturaWebhook(dataId, requestId, signature)) {
    // Registrar tentativa inválida
    await registrarAuditoria({
      acao: AcaoAudit.COMPRA_CANCELADA,
      entidade: "Webhook",
      entidadeId: dataId,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
      metadata: { erro: "assinatura_invalida" },
    });
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // ── Buscar detalhes do pagamento no MP ──────────────────────────────────
  let pagamento;
  try {
    pagamento = await mpPayment.get({ id: dataId });
  } catch {
    return new NextResponse("Failed to fetch payment", { status: 502 });
  }

  const { status, external_reference, id: mpPaymentId, order } = pagamento;
  const compraId = external_reference;
  if (!compraId) return new NextResponse("OK", { status: 200 });

  const compra = await prisma.compra.findUnique({ where: { id: compraId } });
  if (!compra) return new NextResponse("OK", { status: 200 });

  if (status === "approved" && compra.status !== StatusCompra.APROVADO) {
    await prisma.compra.update({
      where: { id: compraId },
      data: {
        status: StatusCompra.APROVADO,
        mpPaymentId: String(mpPaymentId ?? ""),
        mpOrderId: String((order as { id?: unknown })?.id ?? ""),
      },
    });

    await registrarAuditoria({
      userId: compra.userId ?? undefined,
      acao: AcaoAudit.COMPRA_APROVADA,
      entidade: "Compra",
      entidadeId: compraId,
      metadata: { mpPaymentId, obraId: compra.obraId, valor: compra.valorPago },
    });
  } else if (status === "cancelled" || status === "rejected") {
    await prisma.compra.update({
      where: { id: compraId },
      data: { status: StatusCompra.CANCELADO },
    });

    await registrarAuditoria({
      userId: compra.userId ?? undefined,
      acao: AcaoAudit.COMPRA_CANCELADA,
      entidade: "Compra",
      entidadeId: compraId,
      metadata: { mpPaymentId, statusMp: status },
    });
  }

  return new NextResponse("OK", { status: 200 });
}
