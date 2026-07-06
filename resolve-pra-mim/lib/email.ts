import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarAlertaPrazo({
  email,
  nome,
  tipoDocumento,
  prazoData,
  diasRestantes,
  analiseId,
}: {
  email: string;
  nome: string;
  tipoDocumento: string;
  prazoData: string;
  diasRestantes: number;
  analiseId: string;
}) {
  const urgencia = diasRestantes <= 1 ? "⚠️ ÚLTIMO DIA" : `${diasRestantes} dias`;
  const url = `${process.env.NEXTAUTH_URL}/resultado/${analiseId}`;

  await resend.emails.send({
    from: "Resolve Pra Mim <alertas@resolvepramin.com.br>",
    to: email,
    subject: `${urgencia}: Prazo do seu ${tipoDocumento} vence em ${prazoData}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: auto; padding: 24px;">
        <h2 style="color: #1e293b;">Olá, ${nome || "usuário"}!</h2>
        <p style="color: #475569;">
          Você tem um <strong>${tipoDocumento}</strong> com prazo se aproximando.
        </p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #dc2626; font-weight: bold; margin: 0;">
            ⏰ Vence em: ${prazoData} (${urgencia})
          </p>
        </div>
        <a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Ver análise completa
        </a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          Resolve Pra Mim · <a href="${process.env.NEXTAUTH_URL}/conta" style="color: #94a3b8;">Gerenciar alertas</a>
        </p>
      </div>
    `,
  });
}
