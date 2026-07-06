import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssinarBotao from "@/components/AssinarBotao";

export default function PrecosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Simples. Sem surpresas.</h1>
          <p className="text-slate-500 mt-2">Comece grátis. Evolua quando precisar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* FREE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">FREE</p>
            <p className="text-4xl font-bold text-slate-900">R$ 0</p>
            <p className="text-slate-400 text-sm mb-6">Para sempre</p>
            <ul className="space-y-3 mb-8">
              {[
                { ok: true,  text: "5 análises por dia" },
                { ok: true,  text: "Upload de PDF e imagem" },
                { ok: true,  text: "Câmera ao vivo" },
                { ok: true,  text: "Linguagem Simples e Normal" },
                { ok: true,  text: "Detector de golpe" },
                { ok: true,  text: "Leitura em voz alta" },
                { ok: true,  text: "Adicionar prazo ao calendário" },
                { ok: false, text: "Histórico completo" },
                { ok: false, text: "Linguagem Técnica" },
                { ok: false, text: "Chat com assistente" },
                { ok: false, text: "Alertas de prazo por e-mail" },
                { ok: false, text: "Gerador de contestação" },
              ].map((item) => (
                <li key={item.text} className={`flex items-center gap-2 text-sm ${item.ok ? "text-slate-700" : "text-slate-400 line-through"}`}>
                  <span>{item.ok ? "✅" : "✗"}</span>
                  {item.text}
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block text-center py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Usar grátis
            </Link>
          </div>

          {/* PRO */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
              ✨ PRO
            </div>
            <p className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-1">PRO</p>
            <p className="text-4xl font-bold">R$ 9,90</p>
            <p className="text-blue-300 text-sm mb-6">por mês · cancela quando quiser</p>
            <ul className="space-y-3 mb-8">
              {[
                "Análises ilimitadas",
                "Upload de PDF e imagem",
                "Câmera ao vivo",
                "Linguagem Simples, Normal e Técnica",
                "Detector de golpe",
                "Leitura em voz alta",
                "Adicionar prazo ao calendário",
                "Histórico completo",
                "Chat com assistente",
                "Alertas de prazo por e-mail",
                "Gerador de contestação",
                "Comparação de contratos",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white">
                  <span>✅</span>
                  {item}
                </li>
              ))}
            </ul>
            <AssinarBotao />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          🔒 Pagamento via Mercado Pago · Sem fidelidade · Cancela quando quiser
        </p>
      </main>
      <Footer />
    </div>
  );
}

