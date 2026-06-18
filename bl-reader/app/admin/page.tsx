import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Admin | ZAIKA" };

export default async function AdminDashboard() {
  const [totalObras, totalPublicadas, totalCompras, totalUsuarias] = await Promise.all([
    prisma.obra.count(),
    prisma.obra.count({ where: { status: "PUBLICADO" } }),
    prisma.compra.count({ where: { status: "APROVADO" } }),
    prisma.user.count({ where: { deletedAt: null, role: "LEITORA" } }),
  ]);

  const receita = await prisma.compra.aggregate({
    where: { status: "APROVADO" },
    _sum: { valorPago: true },
  });

  const ultimasCompras = await prisma.compra.findMany({
    where: { status: "APROVADO" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      obra: { select: { titulo: true } },
      user: { select: { name: true } },
    },
  });

  const obrasRascunho = await prisma.obra.findMany({
    where: { status: "RASCUNHO" },
    orderBy: { updatedAt: "desc" },
    take: 4,
    select: { id: true, titulo: true, updatedAt: true },
  });

  type CompraItem = typeof ultimasCompras[number];

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-black zaika-gradient-text mb-1">Dashboard</h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        Visão geral da plataforma ZAIKA
      </p>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: "📚", valor: totalObras,      sub: `${totalPublicadas} publicadas`,  cor: "#e0508a" },
          { icon: "✅", valor: totalCompras,    sub: "vendas aprovadas",               cor: "#16a34a" },
          { icon: "👩", valor: totalUsuarias,   sub: "leitoras cadastradas",           cor: "#8b5cf6" },
          { icon: "💰", valor: `R$ ${(receita._sum.valorPago ?? 0).toFixed(2)}`, sub: "receita total", cor: "#f59e0b" },
        ].map(({ icon, valor, sub, cor }) => (
          <div key={sub} className="card-zaika p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="text-2xl font-black" style={{ color: cor }}>{valor}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <h2 className="font-bold text-xs tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
        AÇÕES RÁPIDAS
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { href: "/admin/obras/nova",  icon: "➕", label: "Nova Obra"       },
          { href: "/admin/obras",       icon: "📖", label: "Gerenciar Obras" },
          { href: "/admin/tradutor",    icon: "🌐", label: "Traduzir Texto"  },
          { href: "/obras",             icon: "👁",  label: "Ver Catálogo"   },
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href}
            className="card-zaika p-4 flex flex-col items-center gap-2 text-center hover:border-pink-300">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {obrasRascunho.length > 0 && (
          <div>
            <h2 className="font-bold text-xs tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
              RASCUNHOS PENDENTES
            </h2>
            <div className="card-zaika overflow-hidden">
              {obrasRascunho.map((o, i) => (
                <Link key={o.id} href={`/admin/obras/${o.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-pink-50"
                  style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{o.titulo}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {new Date(o.updatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "#fef3c7", color: "#d97706" }}>Rascunho</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {ultimasCompras.length > 0 && (
          <div>
            <h2 className="font-bold text-xs tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
              ÚLTIMAS VENDAS
            </h2>
            <div className="card-zaika overflow-hidden">
              {ultimasCompras.map((c: CompraItem, i: number) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.obra.titulo}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>{c.user?.name ?? "—"}</p>
                  </div>
                  <span className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>
                    R$ {c.valorPago.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

