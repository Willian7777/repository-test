"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BadgeRisco, BadgeTipo } from "@/components/ResultCard";
import Link from "next/link";
import type { ResultadoAnalise } from "@/types/analise";

interface AnaliseResumo {
  id: string;
  tipoSugerido: string;
  nivelRisco: string;
  golpeSuspeito: boolean;
  createdAt: string;
  resultado: ResultadoAnalise;
}

export default function HistoricoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analises, setAnalises] = useState<AnaliseResumo[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/historico")
        .then((r) => r.json())
        .then((d: { analises?: AnaliseResumo[] }) => { setAnalises(d.analises ?? []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-900">Minhas análises</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Nova análise
          </Link>
        </div>

        {analises.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-slate-600 font-medium">Nenhuma análise ainda</p>
            <p className="text-slate-400 text-sm mt-1">Analise um documento para aparecer aqui.</p>
            <Link href="/" className="inline-block mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              Analisar agora
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {analises.map((a) => {
              const resumo = (typeof a.resultado === "string"
                ? JSON.parse(a.resultado)
                : a.resultado)?.normal?.o_que_e ?? "";
              const data = new Date(a.createdAt).toLocaleDateString("pt-BR");
              return (
                <Link
                  key={a.id}
                  href={`/resultado/${a.id}`}
                  className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BadgeTipo tipo={(typeof a.resultado === "string" ? JSON.parse(a.resultado) : a.resultado)?.tipo ?? a.tipoSugerido} />
                      <BadgeRisco nivel={a.nivelRisco} />
                      {a.golpeSuspeito && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                          ⚠️ Golpe?
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{data}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{resumo}</p>
                </Link>
              );
            })}
          </div>
        )}

        {session?.user?.plano !== "PRO" && analises.length >= 10 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <p className="text-sm text-blue-700 mb-2">
              Exibindo as últimas 10 análises. Veja todo o histórico com o plano PRO.
            </p>
            <Link href="/precos" className="inline-block px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-900 text-sm font-bold rounded-lg">
              ✨ Ver plano PRO
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
