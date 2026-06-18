import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Obras | Admin ZAIKA" };

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  PUBLICADO: { label: "Publicado",  bg: "#dcfce7", color: "#16a34a" },
  RASCUNHO:  { label: "Rascunho",   bg: "#fef3c7", color: "#d97706" },
  ARQUIVADO: { label: "Arquivado",  bg: "#f1f5f9", color: "#64748b" },
};

export default async function ObrasAdminPage() {
  const obras = await prisma.obra.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { capitulos: true, compras: { where: { status: "APROVADO" } } } },
    },
  });

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black zaika-gradient-text mb-1">Obras</h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>{obras.length} obras cadastradas</p>
        </div>
        <Link href="/admin/obras/nova" className="btn-primary text-sm">
          ➕ Nova Obra
        </Link>
      </div>

      {obras.length === 0 ? (
        <div className="card-zaika p-16 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>Nenhuma obra ainda</p>
          <Link href="/admin/obras/nova" className="btn-primary text-sm">Criar primeira obra</Link>
        </div>
      ) : (
        <div className="card-zaika overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "#fdf5f9" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>TÍTULO</th>
                <th className="text-center px-3 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "var(--color-muted)" }}>CAPS</th>
                <th className="text-center px-3 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "var(--color-muted)" }}>VENDAS</th>
                <th className="text-center px-3 py-3 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>STATUS</th>
                <th className="text-center px-3 py-3 text-xs font-semibold" style={{ color: "var(--color-muted)" }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => {
                const badge = STATUS_BADGE[obra.status] ?? STATUS_BADGE.RASCUNHO;
                return (
                  <tr key={obra.id} style={{ borderBottom: "1px solid var(--color-border)" }}
                    className="hover:bg-pink-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: "var(--foreground)" }}>{obra.titulo}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>{obra.autorOriginal} · R$ {obra.preco.toFixed(2)}</p>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span className="font-bold" style={{ color: "var(--color-primary)" }}>{obra._count.capitulos}</span>
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <span className="font-bold" style={{ color: "#16a34a" }}>{obra._count.compras}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Link href={`/admin/obras/${obra.id}`}
                        className="text-xs font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                        Editar →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
