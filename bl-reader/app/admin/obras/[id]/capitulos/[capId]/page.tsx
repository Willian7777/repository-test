import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CapituloEditorClient from "@/components/admin/CapituloEditorClient";
import { IDIOMAS_SUPORTADOS } from "@/lib/azure";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editor de Capítulo | Admin ZAIKA" };

export default async function CapituloEditorPage({
  params,
}: {
  params: Promise<{ id: string; capId: string }>;
}) {
  const { id: obraId, capId } = await params;

  const capitulo = await prisma.capitulo.findFirst({
    where: { id: capId, obraId },
    include: {
      paginas: { orderBy: { numero: "asc" } },
      obra: { select: { id: true, titulo: true } },
    },
  });
  if (!capitulo) notFound();

  return (
    <div className="p-6 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: "var(--color-muted)" }}>
        <Link href="/admin/obras" className="hover:underline">Obras</Link>
        <span>/</span>
        <Link href={`/admin/obras/${obraId}`} className="hover:underline truncate max-w-[150px]">
          {capitulo.obra.titulo}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--foreground)" }} className="font-semibold">
          Cap. {capitulo.numero}{capitulo.titulo ? ` — ${capitulo.titulo}` : ""}
        </span>
      </div>

      <CapituloEditorClient
        capitulo={{
          id: capitulo.id,
          obraId,
          numero: capitulo.numero,
          titulo: capitulo.titulo,
          publicado: capitulo.publicado,
          paginas: capitulo.paginas,
        }}
        idiomasSuportados={IDIOMAS_SUPORTADOS}
      />
    </div>
  );
}
