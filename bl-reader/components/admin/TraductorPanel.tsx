"use client";

import { useState, useRef } from "react";
import { IDIOMAS_SUPORTADOS } from "@/lib/azure";

interface Props {
  paginaId?: string;
  imagemUrl?: string;
  textoOriginalInicial?: string;
  idiomaInicialInicial?: string;
  textoTraduzidoInicial?: string;
  onSalvo?: (traducao: string) => void;
}

export default function TraductorPanel({
  paginaId,
  imagemUrl,
  textoOriginalInicial = "",
  idiomaInicialInicial = "ja",
  textoTraduzidoInicial = "",
  onSalvo,
}: Props) {
  const [idiomaOrigem, setIdiomaOrigem]   = useState(idiomaInicialInicial);
  const [textoOriginal, setTextoOriginal] = useState(textoOriginalInicial);
  const [textoTraduzido, setTextoTraduzido] = useState(textoTraduzidoInicial);
  const [loadingOcr, setLoadingOcr]       = useState(false);
  const [loadingTrad, setLoadingTrad]     = useState(false);
  const [mensagem, setMensagem]           = useState("");
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  // OCR via URL da página atual
  async function handleOcr() {
    if (!imagemUrl) return;
    setLoadingOcr(true); setMensagem("");
    try {
      const res  = await fetch("/api/admin/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagemUrl }),
      });
      const data = await res.json() as { textoCompleto?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erro no OCR");
      setTextoOriginal(data.textoCompleto ?? "");
      setMensagem("✓ Texto extraído com sucesso");
    } catch (err) {
      setMensagem(`Erro OCR: ${err instanceof Error ? err.message : "Desconhecido"}`);
    } finally { setLoadingOcr(false); }
  }

  // OCR via upload de arquivo externo
  async function handleOcrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingOcr(true); setMensagem("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/admin/ocr", { method: "POST", body: fd });
      const data = await res.json() as { textoCompleto?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erro no OCR");
      setTextoOriginal(data.textoCompleto ?? "");
      setMensagem("✓ Texto extraído do arquivo");
    } catch (err) {
      setMensagem(`Erro OCR: ${err instanceof Error ? err.message : "Desconhecido"}`);
    } finally {
      setLoadingOcr(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleTraduzir() {
    if (!textoOriginal.trim()) return;
    setLoadingTrad(true); setMensagem("");
    try {
      const res  = await fetch("/api/admin/traduzir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoOriginal, idiomaOrigem, paginaId }),
      });
      const data = await res.json() as { traducao?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erro na tradução");
      setTextoTraduzido(data.traducao ?? "");
      setMensagem("✓ Tradução concluída e salva");
      onSalvo?.(data.traducao ?? "");
    } catch (err) {
      setMensagem(`Erro: ${err instanceof Error ? err.message : "Desconhecido"}`);
    } finally { setLoadingTrad(false); }
  }

  return (
    <div className="card-zaika p-4 space-y-4">
      {/* Cabeçalho + seletor de idioma */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
          🌐 Tradutor Automático
        </h3>
        <select value={idiomaOrigem} onChange={(e) => setIdiomaOrigem(e.target.value)}
          className="text-xs border rounded-lg px-2 py-1"
          style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}>
          {Object.entries(IDIOMAS_SUPORTADOS).map(([code, nome]) => (
            <option key={code} value={code}>{nome}</option>
          ))}
        </select>
      </div>

      {/* Texto Original */}
      <div>
        <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
          <label className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>
            Texto Original
          </label>
          {/* Botões OCR */}
          <div className="flex gap-1">
            {imagemUrl && (
              <button onClick={handleOcr} disabled={loadingOcr}
                className="text-xs px-2 py-1 rounded-lg font-medium"
                style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                {loadingOcr ? "Extraindo…" : "OCR desta página"}
              </button>
            )}
            {/* Upload de imagem externa */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingOcr}
              title="Fazer upload de outra imagem para OCR"
              className="text-xs px-2 py-1 rounded-lg font-medium border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", background: "var(--color-card)" }}>
              📁 Upload
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleOcrUpload} />
          </div>
        </div>
        <textarea value={textoOriginal} onChange={(e) => setTextoOriginal(e.target.value)}
          rows={5} placeholder="Cole ou extraia o texto original aqui…"
          className="w-full text-sm rounded-lg p-2 border resize-y"
          style={{ borderColor: "var(--color-border)", background: "#fdf0f7" }} />
      </div>

      <button onClick={handleTraduzir} disabled={loadingTrad || !textoOriginal.trim()}
        className="btn-primary w-full text-sm"
      >
        {loadingTrad ? "Traduzindo…" : "Traduzir para Português"}
      </button>

      {/* Tradução */}
      <div>
        <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-muted)" }}>
          Tradução (pt-BR)
        </label>
        <textarea
          value={textoTraduzido}
          onChange={(e) => setTextoTraduzido(e.target.value)}
          rows={5}
          placeholder="Tradução aparecerá aqui…"
          className="w-full text-sm rounded-lg p-2 border resize-y"
          style={{ borderColor: "var(--color-border)", background: "#f0f9ff" }}
        />
      </div>

      {mensagem && (
        <p className={`text-xs ${mensagem.startsWith("✓") ? "" : "text-red-600"}`}
          style={mensagem.startsWith("✓") ? { color: "var(--color-primary)" } : {}}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
