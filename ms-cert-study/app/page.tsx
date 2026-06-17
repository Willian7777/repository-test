import Link from "next/link";
import { trails } from "@/data/trails";
import TrailCard from "@/components/TrailCard";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Prepare-se para certificações<br />
          <span className="text-blue-600">Microsoft com prática</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          Escolha uma trilha de carreira, pratique com questões no estilo da prova e acesse labs gratuitos. Sem leitura longa — aprenda fazendo.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/trails"
            className="px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
          >
            Ver todas as trilhas
          </Link>
          <Link
            href="/catalog"
            className="px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Explorar 90+ certificações
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-12 max-w-lg mx-auto">
        {[
          { value: "90+", label: "Certificações" },
          { value: "8", label: "Trilhas de carreira" },
          { value: "∞", label: "Questões por IA" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Trilhas em destaque */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Trilhas de carreira</h2>
        <Link href="/trails" className="text-sm font-medium text-blue-600 hover:underline">
          Ver todas →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {trails.map((trail) => (
          <TrailCard key={trail.id} trail={trail} />
        ))}
      </div>

      {/* CTA Catálogo */}
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Quer estudar uma cert específica?</h2>
        <p className="text-white/80 mb-6">
          Explore o catálogo completo com mais de 90 certificações Microsoft — Azure, GitHub, M365, Power Platform e mais.
        </p>
        <Link
          href="/catalog"
          className="inline-block px-6 py-3 rounded-xl font-semibold bg-white text-blue-700 hover:bg-blue-50 transition-colors shadow"
        >
          Abrir catálogo →
        </Link>
      </div>
    </div>
  );
}

