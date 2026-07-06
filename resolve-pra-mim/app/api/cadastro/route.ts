import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";

const schema = z.object({
  nome:  z.string().min(2).max(80),
  email: z.string().email(),
  senha: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ erro: "Dados inválidos. Verifique os campos." }, { status: 400 });
  }

  const { nome, email, senha } = parsed.data;

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    return Response.json({ erro: "E-mail já cadastrado." }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const user = await prisma.user.create({
    data: {
      name:      nome,
      email,
      role:      "USER",
      plano:     "FREE",
      contaLocal: { create: { senhaHash } },
    },
    select: { id: true },
  });

  await registrarAuditoria({
    userId: user.id,
    acao:   AcaoAudit.USUARIO_CADASTRO,
    ip:     getIp(request),
  });

  return Response.json({ ok: true }, { status: 201 });
}
