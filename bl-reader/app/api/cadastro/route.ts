import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  nome:  z.string().min(2, "Nome muito curto").max(100),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msgs = parsed.error.issues.map((i) => i.message).join(", ");
    return NextResponse.json({ error: msgs }, { status: 422 });
  }

  const { nome, email, senha } = parsed.data;

  // Verifica se email já existe
  const emailExiste = await prisma.user.findUnique({ where: { email } });
  if (emailExiste) {
    return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const user = await prisma.user.create({
    data: {
      name: nome,
      email,
      role: "LEITORA",
      contaLocal: { create: { senhaHash } },
    },
  });

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
