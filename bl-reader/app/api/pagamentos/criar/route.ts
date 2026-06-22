import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { mpPreference } from "@/lib/mercadopago";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit, StatusObra } from "@/lib/constants";
import { z } from "zod";

const schema = z.object({ obraId: z.string().cuid() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Login necessário" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "obraId inválido" }, { status: 422 });

  const { obraId } = parsed.data;

  // Busca obra no banco — NUNCA aceitar preço do cliente
  const obra = await prisma.obra.findFirst({
    where: { id: obraId, status: StatusObra.PUBLICADO },
    select: { id: true, titulo: true, preco: true },
  });
  if (!obra) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

  // Idempotência: verifica compra pendente/aprovada
  const jaComprou = await prisma.compra.findFirst({
    where: { userId: session.user.id, obraId, status: { in: ["APROVADO", "PENDENTE"] } },
  });
  if (jaComprou?.status === "APROVADO") {
    return NextResponse.json({ error: "Obra já adquirida" }, { status: 409 });
  }

  // Cria ou reutiliza compra pendente
  const compra = jaComprou ?? (await prisma.compra.create({
    data: {
      userId: session.user.id,
      obraId,
      valorPago: obra.preco,
      status: "PENDENTE",
    },
  }));

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://repository-test-zika2.vercel.app";

  // Cria preferência no Mercado Pago
  const preference = await mpPreference.create({
    body: {
      items: [{
        id: obra.id,
        title: `ZAIKA — ${obra.titulo}`,
        quantity: 1,
        unit_price: obra.preco,
        currency_id: "BRL",
      }],
      payer: { email: session.user.email! },
      external_reference: compra.id,
      back_urls: {
        success: `${baseUrl}/obras/${obraId}/sucesso?compraId=${compra.id}`,
        failure: `${baseUrl}/obras/${obraId}?erro=pagamento`,
        pending: `${baseUrl}/obras/${obraId}?pendente=1`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/pagamentos/webhook`,
    },
  });

  await registrarAuditoria({
    userId: session.user.id,
    acao: AcaoAudit.COMPRA_INICIADA,
    entidade: "Compra",
    entidadeId: compra.id,
    ip: getIp(req),
    metadata: { obraId, valor: obra.preco },
  });

  return NextResponse.json({ checkoutUrl: preference.init_point });
}
