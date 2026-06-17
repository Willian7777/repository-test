import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { obrasCompradas } from "@/lib/compras";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Minha Biblioteca" };

export default async function BibliotecaPage() {
  const session = await auth();
  if (!session?.user) return null; // middleware redireciona

  const compras = await obrasCompradas(session.user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black zaika-gradient-text mb-2">Minha Biblioteca</h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        {compras.length} {compras.length === 1 ? "obra adquirida" : "obras adquiridas"}
      </p>

      {compras.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--color-muted)" }}>
          <p className="text-4xl mb-4">📚</p>
          <p className="text-lg font-semibold">Sua biblioteca está vazia</p>
          <p className="text-sm mt-1 mb-6">Explore o catálogo e adquira sua primeira obra!</p>
          <Link href="/obras" className="btn-primary">Ver Catálogo</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {compras.map((compra) => {
            const { obra } = compra;
            const primeiroCap = obra.capitulos[0];
            return (
              <div key={compra.id} className="card-zaika flex gap-4 p-4">
                <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                  <Image src={obra.capaUrl || "/placeholder-capa.jpg"} alt={obra.titulo} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-sm leading-tight mb-1 truncate" style={{ color: "var(--foreground)" }}>
                    {obra.titulo}
                  </h2>
                  <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>
                    {obra.capitulos.length} capítulos disponíveis
                  </p>
                  <div className="flex gap-2">
                    {primeiroCap && (
                      <Link
                        href={`/obras/${obra.id}/ler/${primeiroCap.id}`}
                        className="btn-primary text-xs py-1 px-3"
                      >
                        Continuar Leitura
                      </Link>
                    )}
                    <Link
                      href={`/obras/${obra.id}`}
                      className="btn-outline text-xs py-1 px-3"
                    >
                      Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
