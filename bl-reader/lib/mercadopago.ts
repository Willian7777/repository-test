import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import crypto from "crypto";

// Instância singleton do SDK — ACCESS_TOKEN nunca exposto ao cliente
export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);

/**
 * Valida a assinatura do webhook do Mercado Pago (HMAC-SHA256).
 * Rejeitar requisições sem assinatura válida previne fraudes.
 *
 * Formato do header X-Signature: "ts={timestamp},v1={hash}"
 * Manifesto assinado: "id:{data_id};request-id:{x_request_id};ts:{ts};"
 */
export function validarAssinaturaWebhook(
  dataId: string,
  requestId: string,
  signature: string | null
): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((p) => p.split("=", 2) as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  // timingSafeEqual previne timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(v1, "hex")
    );
  } catch {
    return false;
  }
}
