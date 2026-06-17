import { prisma } from "@/lib/prisma";
import ObraCard from "@/components/ObraCard";
import { StatusObra } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Catálogo de Obras" };

const GENEROS = ["BL", "Drama", "Fantasia", "Comédia", "Action", "Romance", "Slice of Life", "Supernatural"];

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: Promise<{ genero?: string; q?: string }>;
}) {
  const { genero, q } = await searchParams;

  const obras = await prisma.obra.findMany({
    where: {
      status: StatusObra.PUBLICADO,
      ...(genero ? { generos: { contains: genero } } : {}),
      ...(q ? { titulo: { contains: q } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black zaika-gradient-text mb-2">Catálogo</h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        {obras.length} {obras.length === 1 ? "obra encontrada" : "obras encontradas"}
      </p>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/obras"
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${!genero ? "text-white" : "hover:bg-pink-50"}`}
          style={!genero ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } : { borderColor: "var(--color-border)", color: "var(--color-muted)" }}
        >
          Todas
        </a>
        {GENEROS.map((g) => (
          <a
            key={g}
            href={`/obras?genero=${encodeURIComponent(g)}`}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${genero === g ? "text-white" : "hover:bg-pink-50"}`}
            style={genero === g ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } : { borderColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            {g}
          </a>
        ))}
      </div>

      {obras.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--color-muted)" }}>
          <p className="text-4xl mb-4">🌸</p>
          <p className="text-lg font-semibold">Nenhuma obra encontrada</p>
          <p className="text-sm mt-1">Tente outro filtro ou volte em breve!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {obras.map((obra) => (
            <ObraCard key={obra.id} {...obra} />
          ))}
        </div>
      )}
    </div>
  );
}
