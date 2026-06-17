import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

  const [totalObras, totalCompras, totalUsuarios] = await Promise.all([
    prisma.obra.count(),
    prisma.compra.count({ where: { status: "APROVADO" } }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);

  const ultimasCompras = await prisma.compra.findMany({
    where: { status: "APROVADO" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { obra: { select: { titulo: true } }, user: { select: { name: true, email: true } } },
  });

  const receitaTotal = await prisma.compra.aggregate({
    where: { status: "APROVADO" },
    _sum: { valorPago: true },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black zaika-gradient-text mb-8">Painel Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Obras", valor: totalObras, icon: "📚" },
          { label: "Vendas Aprovadas", valor: totalCompras, icon: "✅" },
          { label: "Usuárias", valor: totalUsuarios, icon: "👩" },
          { label: "Receita Total", valor: `R$ ${(receitaTotal._sum.valorPago ?? 0).toFixed(2)}`, icon: "💰" },
        ].map(({ label, valor, icon }) => (
          <div key={label} className="card-zaika p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-2xl font-black" style={{ color: "var(--color-primary)" }}>{valor}</p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link href="/admin/obras/nova" className="card-zaika p-5 flex items-center gap-4 hover:border-pink-400">
          <span className="text-3xl">➕</span>
          <div>
            <p className="font-bold" style={{ color: "var(--foreground)" }}>Nova Obra</p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>Adicionar nova HQ ao catálogo</p>
          </div>
        </Link>
        <Link href="/admin/obras" className="card-zaika p-5 flex items-center gap-4 hover:border-pink-400">
          <span className="text-3xl">📖</span>
          <div>
            <p className="font-bold" style={{ color: "var(--foreground)" }}>Gerenciar Obras</p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>Editar capítulos e páginas</p>
          </div>
        </Link>
      </div>

      {/* Últimas vendas */}
      {ultimasCompras.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Últimas Vendas</h2>
          <div className="card-zaika overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                  <th className="text-left p-3 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Obra</th>
                  <th className="text-left p-3 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Usuária</th>
                  <th className="text-right p-3 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {ultimasCompras.map((c: { id: string; valorPago: number; obra: { titulo: string }; user: { name: string | null; email: string | null } | null }) => (
                  <tr key={c.id} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                    <td className="p-3" style={{ color: "var(--foreground)" }}>{c.obra.titulo}</td>
                    <td className="p-3 text-xs" style={{ color: "var(--color-muted)" }}>{c.user?.name ?? "—"}</td>
                    <td className="p-3 text-right font-semibold" style={{ color: "var(--color-primary)" }}>R$ {c.valorPago.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
