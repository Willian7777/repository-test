import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { usuarioComprou } from "@/lib/compras";
import LeitorManga from "@/components/LeitorManga";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leitura" };

export default async function LeituraPage({
  params,
}: {
  params: Promise<{ id: string; capituloId: string }>;
}) {
  const { id: obraId, capituloId } = await params;
  const session = await auth();

  if (!session?.user) redirect(`/login?callbackUrl=/obras/${obraId}/ler/${capituloId}`);

  const comprado = await usuarioComprou(session.user.id, obraId);
  if (!comprado) redirect(`/obras/${obraId}`);

  const capitulo = await prisma.capitulo.findFirst({
    where: { id: capituloId, obraId, publicado: true },
    include: {
      paginas: { orderBy: { numero: "asc" } },
      obra: {
        select: {
          id: true,
          titulo: true,
          capitulos: {
            where: { publicado: true },
            orderBy: { numero: "asc" },
            select: { id: true, numero: true, titulo: true },
          },
        },
      },
    },
  });

  if (!capitulo) notFound();

  return (
    <LeitorManga
      capitulo={{
        id: capitulo.id,
        numero: capitulo.numero,
        titulo: capitulo.titulo ?? undefined,
        paginas: capitulo.paginas,
      }}
      obra={capitulo.obra}
    />
  );
}
