"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UploadArea from "@/components/UploadArea";
import CameraCapture from "@/components/CameraCapture";
import Mascote from "@/components/Mascote";

const TIPOS = [
  { id: "multa",       label: "Multa",       emoji: "🚗" },
  { id: "contrato",    label: "Contrato",    emoji: "📝" },
  { id: "boleto",      label: "Boleto",      emoji: "💳" },
  { id: "edital",      label: "Edital",      emoji: "📋" },
  { id: "notificacao", label: "Notificação", emoji: "🔔" },
  { id: "outro",       label: "Outro",       emoji: "📄" },
];

type Entrada = "upload" | "camera" | "texto";

export default function Home() {
  const router = useRouter();
  const [tipo, setTipo]             = useState("");
  const [entrada, setEntrada]       = useState<Entrada>("upload");
  const [arquivo, setArquivo]       = useState<File | null>(null);
  const [texto, setTexto]           = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro]             = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const temConteudo = !!arquivo || texto.trim().length > 0;

  async function analisar() {
    if (!temConteudo) { setErro("Envie um arquivo ou cole o texto do documento."); return; }
    setErro(""); setCarregando(true);
    try {
      const fd = new FormData();
      if (arquivo)      fd.append("arquivo", arquivo);
      if (texto.trim()) fd.append("texto", texto.trim());
      fd.append("tipo_sugerido", tipo || "outro");

      const res  = await fetch("/api/analisar", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({})) as { id?: string; erro?: string };
      if (!res.ok) throw new Error(json.erro ?? "Erro ao analisar documento.");
      router.push(`/resultado/${json.id}`);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro inesperado. Tente novamente.");
    } finally { setCarregando(false); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-gradient pt-10 pb-24 px-4">
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="mascote-float inline-block mb-4">
            <Mascote tamanho="lg" expressao="feliz" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text leading-tight">
            Entenda qualquer<br />documento
          </h1>
          <p className="text-blue-200 mt-3 text-lg font-medium">
            Sem juridiquês. Em segundos. Para todos.
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="flex -space-x-2">
              {["🇧🇷", "🇧🇷", "🇧🇷"].map((e, i) => (
                <span key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm">{e}</span>
              ))}
            </div>
            <p className="text-blue-200 text-sm font-medium">
              +1.200 documentos explicados
            </p>
          </div>
        </div>
      </section>

      {/* ── Card de upload (flutua sobre o hero) ─────────────────── */}
      <div className="-mt-14 relative z-20 max-w-2xl mx-auto w-full px-4 pb-12">
        <div className="upload-card rounded-3xl p-6 sm:p-8">

          {/* Tipo de documento */}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Que tipo de documento?
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {TIPOS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(tipo === t.id ? "" : t.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  tipo === t.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Seletor de método */}
          <div className="flex gap-2 mb-4 bg-slate-100 rounded-2xl p-1">
            {([
              { id: "upload" as Entrada, label: "📎 Arquivo" },
              { id: "camera" as Entrada, label: "📷 Câmera"  },
              { id: "texto"  as Entrada, label: "✏️ Digitar" },
            ] as const).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setEntrada(m.id); setArquivo(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  entrada === m.id
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Área de entrada */}
          <div className="mb-5">
            {entrada === "upload" && <UploadArea onArquivo={setArquivo} arquivo={arquivo} />}
            {entrada === "camera" && (
              <CameraCapture
                onCaptura={(f) => { setArquivo(f); setEntrada("upload"); }}
                onCancelar={() => setEntrada("upload")}
              />
            )}
            {entrada === "texto" && (
              <textarea
                ref={textareaRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cole ou digite o texto do documento aqui..."
                className="w-full h-48 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              />
            )}
          </div>

          {/* Erro */}
          {erro && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span> {erro}
            </div>
          )}

          {/* Botão */}
          <button
            type="button"
            onClick={analisar}
            disabled={carregando || !temConteudo}
            className="btn-primary w-full text-base"
          >
            {carregando ? (
              <span className="flex items-center justify-center gap-3">
                <span className="spinner" /> Analisando com IA...
              </span>
            ) : (
              "🔍 Analisar documento"
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Grátis · 1 análise/dia sem login · 5/dia com conta gratuita
          </p>
        </div>

        {/* Como funciona */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { emoji: "📤", titulo: "Envie",   desc: "PDF, foto ou texto" },
            { emoji: "🤖", titulo: "A IA age", desc: "Em segundos" },
            { emoji: "✅", titulo: "Entenda", desc: "O que fazer e os riscos" },
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
              <p className="text-2xl mb-1.5">{step.emoji}</p>
              <p className="font-bold text-slate-800 text-sm">{step.titulo}</p>
              <p className="text-slate-400 text-xs mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}