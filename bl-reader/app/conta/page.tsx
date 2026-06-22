import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ContaClient from "@/components/ContaClient";

export const metadata: Metadata = { title: "Minha Conta | ZAIKA" };

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true,
      role: true, createdAt: true,
      _count: { select: { compras: { where: { status: "APROVADO" } } } },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black zaika-gradient-text mb-8">Minha Conta</h1>

      {/* Perfil */}
      <div className="card-zaika p-6 mb-6">
        <h2 className="font-bold text-sm mb-4" style={{ color: "var(--color-muted)" }}>PERFIL</h2>
        <div className="flex items-center gap-4 mb-4">
          {user.image ? (
            <img src={user.image} alt={user.name ?? ""} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white"
              style={{ background: "var(--color-primary)" }}>
              {user.name?.[0] ?? "U"}
            </div>
          )}
          <div>
            <p className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{user.name}</p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>{user.email}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
              Membro desde {new Date(user.createdAt).toLocaleDateString("pt-BR")} · {user._count.compras} obra(s) adquirida(s)
            </p>
          </div>
        </div>
        <Link href="/biblioteca" className="btn-outline text-sm">
          📚 Ver Minha Biblioteca
        </Link>
      </div>

      {/* Ações LGPD */}
      <div className="card-zaika p-6 mb-6">
        <h2 className="font-bold text-sm mb-4" style={{ color: "var(--color-muted)" }}>
          PRIVACIDADE & DADOS (LGPD)
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Baixar meus dados</p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>Exportar todos os dados da sua conta (art. 18, III)</p>
            </div>
            <a href="/api/usuario/meus-dados" download className="btn-outline text-xs px-3 py-1.5">
              Baixar JSON
            </a>
          </div>

          <hr style={{ borderColor: "var(--color-border)" }} />

          <ContaClient userId={user.id} />
        </div>
      </div>

      {/* Links úteis */}
      <div className="flex gap-3 text-xs" style={{ color: "var(--color-muted)" }}>
        <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>
        <span>·</span>
        <Link href="/termos" className="hover:underline">Termos de Uso</Link>
      </div>
    </div>
  );
}
