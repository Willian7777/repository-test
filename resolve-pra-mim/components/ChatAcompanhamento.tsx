"use client";
import { useState, useRef, useEffect } from "react";

interface Mensagem {
  autor: "usuario" | "assistente";
  conteudo: string;
}

interface Props {
  analiseId: string;
  resumo: string;
}

export default function ChatAcompanhamento({ analiseId, resumo }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { autor: "assistente", conteudo: `Entendi o documento! Pode me perguntar qualquer coisa sobre ele. 😊` },
  ]);
  const [input, setInput]         = useState("");
  const [enviando, setEnviando]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar() {
    const pergunta = input.trim();
    if (!pergunta || enviando) return;

    setInput("");
    setMensagens((prev) => [...prev, { autor: "usuario", conteudo: pergunta }]);
    setEnviando(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analiseId,
          pergunta,
          historico: mensagens,
        }),
      });
      const data = await res.json() as { resposta?: string; erro?: string };
      setMensagens((prev) => [
        ...prev,
        { autor: "assistente", conteudo: data.resposta ?? data.erro ?? "Não consegui responder." },
      ]);
    } catch {
      setMensagens((prev) => [
        ...prev,
        { autor: "assistente", conteudo: "Erro de conexão. Tente novamente." },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-blue-200 bg-white overflow-hidden">
      <div className="h-56 overflow-y-auto p-4 space-y-3">
        {mensagens.map((m, i) => (
          <div key={i} className={`flex ${m.autor === "usuario" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                m.autor === "usuario"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-700 rounded-bl-none"
              }`}
            >
              {m.conteudo}
            </div>
          </div>
        ))}
        {enviando && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-4 py-2 rounded-2xl rounded-bl-none">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-slate-200 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder="Pode me perguntar qualquer coisa..."
          className="flex-1 text-sm px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={enviando}
        />
        <button
          type="button"
          onClick={enviar}
          disabled={!input.trim() || enviando}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white text-sm font-medium rounded-xl transition-all"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
