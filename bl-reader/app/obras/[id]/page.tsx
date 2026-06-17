import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { usuarioComprou } from "@/lib/compras";
import { StatusObra } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import BotaoComprar from "@/components/BotaoComprar";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const obra = await prisma.obra.findFirst({ where: { id, status: StatusObra.PUBLICADO }, select: { titulo: true, sinopse: true } });
  return { title: obra?.titulo ?? "Obra", description: obra?.sinopse?.slice(0, 160) };
}

export default async function ObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const obra = await prisma.obra.findFirst({
    where: { id, status: StatusObra.PUBLICADO },
    include: {
      capitulos: {
        where: { publicado: true },
        orderBy: { numero: "asc" },
        select: { id: true, numero: true, titulo: true },
      },
    },
  });

  if (!obra) notFound();

  const comprado = session?.user ? await usuarioComprou(session.user.id, obra.id) : false;
  let generosArray: string[] = [];
  try { generosArray = JSON.parse(obra.generos); } catch { generosArray = []; }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Capa */}
        <div className="flex-shrink-0">
          <div className="relative w-48 h-72 rounded-2xl overflow-hidden shadow-xl mx-auto md:mx-0">
            <Image src={obra.capaUrl || "/placeholder-capa.jpg"} alt={obra.titulo} fill className="object-cover" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            {generosArray.map((g) => (
              <span key={g} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                {g}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--foreground)" }}>{obra.titulo}</h1>
          <p className="text-sm mb-1" style={{ color: "var(--color-muted)" }}>
            Autor original: <strong>{obra.autorOriginal}</strong>
            {obra.tradutora && <> · Tradução: <strong>{obra.tradutora}</strong></>}
          </p>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--foreground)" }}>{obra.sinopse}</p>

          {/* Compra / Acesso */}
          {comprado ? (
            <div className="rounded-xl p-4 mb-6 border" style={{ background: "var(--color-primary-light)", borderColor: "var(--color-primary)" }}>
              <p className="font-semibold mb-2" style={{ color: "var(--color-primary)" }}>✓ Você tem acesso a esta obra!</p>
              {obra.capitulos[0] && (
                <Link href={`/obras/${obra.id}/ler/${obra.capitulos[0].id}`} className="btn-primary text-sm">
                  Ler Capítulo 1
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-xl p-4 mb-6 border" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-2xl font-black mb-1" style={{ color: "var(--color-primary)" }}>
                {obra.preco === 0 ? "Grátis" : `R$ ${obra.preco.toFixed(2)}`}
              </p>
              <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>
                Pagamento único — acesso a todos os {obra.capitulos.length} capítulos
              </p>
              <BotaoComprar obraId={obra.id} preco={obra.preco} titulo={obra.titulo} />
            </div>
          )}
        </div>
      </div>

      {/* Lista de capítulos */}
      {obra.capitulos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
            Capítulos ({obra.capitulos.length})
          </h2>
          <div className="divide-y rounded-xl overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
            {obra.capitulos.map((cap) => (
              <div key={cap.id} className="flex items-center justify-between px-4 py-3" style={{ background: "var(--color-card)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Cap. {cap.numero}{cap.titulo ? ` — ${cap.titulo}` : ""}
                </span>
                {comprado ? (
                  <Link href={`/obras/${obra.id}/ler/${cap.id}`} className="text-xs font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                    Ler →
                  </Link>
                ) : (
                  <span className="text-xs" style={{ color: "var(--color-muted)" }}>🔒 Bloqueado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
