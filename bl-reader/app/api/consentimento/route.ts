import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  aceitouTermos: z.boolean(),
  aceitouPrivacidade: z.boolean(),
  aceitouCookiesAnaliticos: z.boolean(),
  userId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const { aceitouTermos, aceitouPrivacidade, aceitouCookiesAnaliticos, userId } = parsed.data;

  // IP é armazenado como hash irreversível — LGPD
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

  // Apenas salvar no banco se há userId (usuário logado)
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.consentimentoLGPD.create({
        data: { userId, aceitouTermos, aceitouPrivacidade, aceitouCookiesAnaliticos, ipHash, userAgent },
      });
    }
  }

  await registrarAuditoria({
    userId: userId ?? undefined,
    acao: AcaoAudit.LOGIN,
    ip,
    metadata: { evento: "consentimento_lgpd", aceitouCookiesAnaliticos },
  });

  return NextResponse.json({ ok: true });
}
