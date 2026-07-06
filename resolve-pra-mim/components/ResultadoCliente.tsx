"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, BadgeRisco, BadgeTipo } from "@/components/ResultCard";
import ZeBurocracia from "@/components/ZeBurocracia";
import ChatAcompanhamento from "@/components/ChatAcompanhamento";
import type { ResultadoAnalise, NivelLinguagem, AnaliseComId } from "@/types/analise";
import Link from "next/link";

interface Props {
  analise: AnaliseComId;
}

export default function ResultadoCliente({ analise }: Props) {
  const { data: session } = useSession();
  const resultado = analise.resultado as ResultadoAnalise;
  const [nivel, setNivel]   = useState<NivelLinguagem>("normal");
  const [lendo, setLendo]   = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [salvoAlerta, setSalvoAlerta] = useState(false);
  const [chatAberto, setChatAberto]   = useState(false);
  const isPRO = session?.user?.plano === "PRO";

  const analiseAtual = resultado[nivel];

  // ── Leitura em voz alta ────────────────────────────────────────────────────
  const lerEmVozAlta = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      alert("Seu navegador não suporta leitura em voz alta.");
      return;
    }
    if (lendo) {
      window.speechSynthesis.cancel();
      setLendo(false);
      return;
    }
    const textos = [
      `O que é: ${analiseAtual.o_que_e}`,
      `Prazo: ${analiseAtual.prazo}`,
      `O que fazer: ${analiseAtual.o_que_fazer.join(". ")}`,
      `Riscos: ${analiseAtual.riscos.join(". ")}`,
    ];
    const utterance = new SpeechSynthesisUtterance(textos.join(". "));
    utterance.lang  = "pt-BR";
    utterance.rate  = 0.9;
    utterance.onend = () => setLendo(false);
    setLendo(true);
    window.speechSynthesis.speak(utterance);
  }, [lendo, analiseAtual]);

  // ── Copiar ─────────────────────────────────────────────────────────────────
  const copiar = useCallback(async () => {
    const texto = [
      `📄 O QUE É\n${analiseAtual.o_que_e}`,
      `⏰ PRAZO\n${analiseAtual.prazo}`,
      `✅ O QUE FAZER\n${analiseAtual.o_que_fazer.map((a, i) => `${i + 1}. ${a}`).join("\n")}`,
      `⚠️ RISCOS\n${analiseAtual.riscos.join("\n")}`,
    ].join("\n\n");
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }, [analiseAtual]);

  // ── Compartilhar ───────────────────────────────────────────────────────────
  const compartilhar = useCallback(async () => {
    const url = `${window.location.origin}/resultado/${analise.id}`;

    // Tenta Share nativo do Capacitor (iOS/Android)
    try {
      const [{ Share }, { Capacitor }] = await Promise.all([
        import("@capacitor/share"),
        import("@capacitor/core"),
      ]);
      if (Capacitor.isNativePlatform()) {
        await Share.share({ title: "Resolve Pra Mim", text: "Veja a análise desse documento:", url });
        return;
      }
    } catch { /* ignora, usa fallback */ }

    // Web Share API (PWA / browsers modernos)
    if (navigator.share) {
      await navigator.share({ title: "Resolve Pra Mim", text: "Análise do documento:", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }, [analise.id]);

  // ── Adicionar ao calendário ────────────────────────────────────────────────
  const adicionarCalendario = useCallback(() => {
    if (!resultado.prazo_data) return;
    const [dd, mm, aaaa] = resultado.prazo_data.split("/");
    const dataFormatada = `${aaaa}${mm}${dd}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Prazo+Resolve+Pra+Mim:+${encodeURIComponent(resultado.tipo)}&dates=${dataFormatada}/${dataFormatada}&details=${encodeURIComponent(`Ver análise: ${window.location.href}`)}`;
    window.open(url, "_blank", "noopener");
  }, [resultado]);

  // ── Salvar alerta de prazo ─────────────────────────────────────────────────
  const salvarAlerta = useCallback(async () => {
    if (!session?.user) return;
    await fetch("/api/alertas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analiseId: analise.id }),
    });
    setSalvoAlerta(true);
  }, [session, analise.id]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <BadgeTipo tipo={resultado.tipo} />
        <BadgeRisco nivel={resultado.nivel_risco} />
      </div>

      {/* Zé Burocracia contextual */}
      <ZeBurocracia risco={resultado.nivel_risco as "BAIXO" | "MÉDIO" | "ALTO" | "URGENTE"} tamanho="sm" />

      {/* Alerta de golpe */}
      {resultado.alerta_golpe.suspeito && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-semibold text-amber-800 text-sm mb-2">⚠️ Possível golpe detectado</p>
          <ul className="space-y-1">
            {resultado.alerta_golpe.motivos.map((m, i) => (
              <li key={i} className="text-amber-700 text-sm flex items-start gap-2">
                <span className="shrink-0">•</span> {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toggle de nível de linguagem */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {(["simples", "normal", "tecnico"] as NivelLinguagem[]).map((n) => {
          const label = { simples: "Simples", normal: "Normal", tecnico: "Técnico" }[n];
          const isTecnico = n === "tecnico";
          const bloqueado = isTecnico && !isPRO;
          return (
            <button
              key={n}
              type="button"
              onClick={() => { if (!bloqueado) setNivel(n); }}
              title={bloqueado ? "Disponível no plano PRO" : undefined}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all relative ${
                nivel === n
                  ? "bg-white text-slate-900 shadow-sm"
                  : bloqueado
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
              {bloqueado && <span className="ml-1 text-amber-500">✨</span>}
            </button>
          );
        })}
      </div>

      {/* Prazo destaque */}
      {resultado.prazo_data && (
        <div className={`rounded-xl p-4 border flex items-center justify-between gap-3 ${
          resultado.nivel_risco === "URGENTE"
            ? "bg-red-50 border-red-200"
            : resultado.nivel_risco === "ALTO"
            ? "bg-orange-50 border-orange-200"
            : "bg-yellow-50 border-yellow-200"
        }`}>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Prazo</p>
            <p className="text-lg font-bold text-slate-900">{resultado.prazo_data}</p>
            {resultado.prazo_dias_restantes !== null && (
              <p className="text-sm text-slate-600">
                {resultado.prazo_dias_restantes <= 0
                  ? "⚠️ Prazo vencido"
                  : `${resultado.prazo_dias_restantes} dia(s) restante(s)`}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={adicionarCalendario}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 whitespace-nowrap"
            >
              📅 Calendário
            </button>
            {session?.user && !salvoAlerta && (
              <button
                type="button"
                onClick={salvarAlerta}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                🔔 Me alertar
              </button>
            )}
            {salvoAlerta && (
              <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg text-center">
                ✅ Alerta salvo
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cards de análise */}
      <Card
        titulo="O que é"
        icone="📄"
        bgCor="bg-blue-50"
        bordaCor="border-blue-200"
        tituloCor="text-blue-700"
        conteudo={analiseAtual.o_que_e}
      />
      <Card
        titulo="O que fazer"
        icone="✅"
        bgCor="bg-green-50"
        bordaCor="border-green-200"
        tituloCor="text-green-700"
        conteudo={analiseAtual.o_que_fazer}
      />
      <Card
        titulo="Riscos se ignorar"
        icone="⚠️"
        bgCor="bg-red-50"
        bordaCor="border-red-200"
        tituloCor="text-red-700"
        conteudo={analiseAtual.riscos}
      />

      {/* Botões de ação */}
      <div className="flex gap-2 flex-wrap pt-2">
        <button
          type="button"
          onClick={lerEmVozAlta}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            lendo
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          {lendo ? "⏹️ Parar" : "🔊 Ouvir"}
        </button>
        <button
          type="button"
          onClick={copiar}
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium border bg-white text-slate-700 border-slate-200 hover:border-slate-300 transition-all"
        >
          {copiado ? "✅ Copiado!" : "📋 Copiar"}
        </button>
        <button
          type="button"
          onClick={compartilhar}
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium border bg-white text-slate-700 border-slate-200 hover:border-slate-300 transition-all"
        >
          🔗 Compartilhar
        </button>
      </div>

      {/* Chat de acompanhamento (PRO) */}
      {isPRO ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setChatAberto(!chatAberto)}
            className="w-full py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-all"
          >
            💬 {chatAberto ? "Fechar chat" : "Perguntar sobre esse documento"}
          </button>
          {chatAberto && <ChatAcompanhamento analiseId={analise.id} resumo={analiseAtual.o_que_e} />}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600 mb-2">
            💬 Tem dúvidas sobre o documento? <strong>Pergunte ao assistente</strong>
          </p>
          <Link
            href="/precos"
            className="inline-block px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-900 text-sm font-bold rounded-lg transition-colors"
          >
            ✨ Ver plano PRO
          </Link>
        </div>
      )}

      {/* Nova análise */}
      <Link
        href="/"
        className="block w-full py-3 text-center rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition-all mt-2"
      >
        ← Analisar outro documento
      </Link>
    </div>
  );
}
