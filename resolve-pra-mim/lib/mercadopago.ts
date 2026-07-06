import MercadoPagoConfig, { PreApprovalPlan, PreApproval } from "mercadopago";
import crypto from "node:crypto";

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

/** Cria link de assinatura PRO via Mercado Pago Subscriptions */
export async function criarAssinaturaPro(userId: string, email: string) {
  const preApprovalPlan = new PreApprovalPlan(client);
  const preApproval     = new PreApproval(client);

  // Garante que o plano existe (cria na primeira vez)
  const planoId = process.env.MERCADO_PAGO_PLANO_ID;

  if (planoId) {
    // Usa plano existente
    const assinatura = await preApproval.create({
      body: {
        preapproval_plan_id: planoId,
        payer_email: email,
        back_url: `${process.env.NEXTAUTH_URL}/conta?status=assinatura`,
        external_reference: userId,
      },
    });
    return assinatura.init_point;
  }

  // Cria plano se não existir
  const plano = await preApprovalPlan.create({
    body: {
      reason: "Resolve Pra Mim — Plano PRO",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 9.90,
        currency_id: "BRL",
      },
      back_url: `${process.env.NEXTAUTH_URL}/conta?status=assinatura`,
      payment_methods_allowed: {
        payment_types: [{ id: "credit_card" }, { id: "debit_card" }],
      },
    },
  });

  const assinatura = await preApproval.create({
    body: {
      preapproval_plan_id: plano.id!,
      payer_email: email,
      back_url: `${process.env.NEXTAUTH_URL}/conta?status=assinatura`,
      external_reference: userId,
    },
  });

  return assinatura.init_point;
}

/** Valida assinatura HMAC-SHA256 do webhook */
export function validarWebhook(payload: string, assinatura: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return false;
  const esperado = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(esperado, "hex"), Buffer.from(assinatura, "hex"));
}
