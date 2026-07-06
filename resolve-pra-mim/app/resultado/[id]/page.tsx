import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResultadoCliente from "@/components/ResultadoCliente";
import type { AnaliseComId } from "@/types/analise";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultadoPage({ params }: Props) {
  const { id } = await params;

  const analise = await prisma.analise.findUnique({
    where: { id },
    select: {
      id: true,
      tipoSugerido: true,
      resultado: true,
      nivelRisco: true,
      golpeSuspeito: true,
      createdAt: true,
    },
  });

  if (!analise) notFound();

  const analiseComId: AnaliseComId = {
    id: analise.id,
    tipoSugerido: analise.tipoSugerido,
    resultado: JSON.parse(analise.resultado as string) as AnaliseComId["resultado"],
    nivelRisco: analise.nivelRisco,
    golpeSuspeito: analise.golpeSuspeito,
    createdAt: analise.createdAt.toISOString(),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-12">
        <ResultadoCliente analise={analiseComId} />
      </main>
      <Footer />
    </div>
  );
}
