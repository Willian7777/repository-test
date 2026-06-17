import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";

// DELETE /api/usuario/excluir-conta — direito ao esquecimento (LGPD art. 18, VI)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const userId = session.user.id;

  // Anonimizar dados pessoais (não hard-delete — preserva compras para obrigação fiscal)
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: "Usuário Removido",
      email: null,
      image: null,
      emailVerified: null,
      deletedAt: new Date(),
    },
  });

  // Remover sessões ativas
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });

  await registrarAuditoria({
    userId,
    acao: AcaoAudit.USUARIO_EXCLUIR_CONTA,
    ip: getIp(req),
    metadata: { nota: "dados_anonimizados_conforme_lgpd" },
  });

  return NextResponse.json({ ok: true, mensagem: "Conta excluída. Seus dados pessoais foram anonimizados." });
}
