import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";

// GET /api/usuario/meus-dados — portabilidade de dados (LGPD art. 18, III)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, createdAt: true, role: true,
      compras: {
        select: {
          id: true, obraId: true, valorPago: true, status: true, createdAt: true,
          obra: { select: { titulo: true } },
        },
      },
      consentimentos: {
        select: {
          aceitouTermos: true, aceitouPrivacidade: true,
          aceitouCookiesAnaliticos: true, createdAt: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  await registrarAuditoria({
    userId: session.user.id,
    acao: AcaoAudit.USUARIO_DOWNLOAD_DADOS,
    ip: getIp(req),
  });

  return NextResponse.json(user, {
    headers: {
      "Content-Disposition": `attachment; filename="zaika-meus-dados-${Date.now()}.json"`,
      "Content-Type": "application/json",
    },
  });
}
