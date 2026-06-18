"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function TraductorStandalone({ idiomas }: { idiomas: Record<string, string> }) {
  const [idiomaOrigem, setIdiomaOrigem] = useState("ja");
  const [imagemUrl, setImagemUrl]       = useState("");
  const [previewUrl, setPreviewUrl]     = useState(""); // preview local do arquivo
  const [modoInput, setModoInput]       = useState<"url" | "upload">("url");
  const [textoOriginal, setTextoOrig]   = useState("");
  const [textoTraduzido, setTextoTrad]  = useState("");
  const [loadingOcr, setLoadOcr]        = useState(false);
  const [loadingTrad, setLoadTrad]      = useState(false);
  const [msg, setMsg]                   = useState("");
  const [arquivoSelecionado, setArquivo] = useState<File | null>(null);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  // ── OCR via URL ───────────────────────────────────────────────────────────
  async function ocrUrl() {
    if (!imagemUrl.trim()) { setMsg("Informe a URL da imagem."); return; }
    setLoadOcr(true); setMsg("");
    const res  = await fetch("/api/admin/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagemUrl }),
    });
    const data = await res.json() as { textoCompleto?: string; provedor?: string; error?: string };
    if (res.ok) {
      setTextoOrig(data.textoCompleto ?? "");
      setMsg(`✓ Texto extraído! (via ${data.provedor ?? "OCR"})`);
    } else setMsg(`Erro OCR: ${data.error}`);
    setLoadOcr(false);
  }

  // ── OCR via arquivo ──────────────────────────────────────────────────
  async function ocrArquivo() {
    if (!arquivoSelecionado) { setMsg("Selecione uma imagem primeiro."); return; }
    setLoadOcr(true); setMsg("");
    const fd = new FormData();
    fd.append("file",   arquivoSelecionado);
    fd.append("idioma", idiomaOrigem); // envia idioma para OCR.space usar corretamente
    const res  = await fetch("/api/admin/ocr", { method: "POST", body: fd });
    const data = await res.json() as { textoCompleto?: string; provedor?: string; error?: string };
    if (res.ok) {
      setTextoOrig(data.textoCompleto ?? "");
      setMsg(`✓ Texto extraído! (via ${data.provedor ?? "OCR"})`);
    } else setMsg(`Erro OCR: ${data.error}`);
    setLoadOcr(false);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setArquivo(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMsg("");
  }

  async function traduzir() {
    if (!textoOriginal.trim()) { setMsg("Digite ou extraia o texto primeiro."); return; }
    setLoadTrad(true); setMsg("");
    const res  = await fetch("/api/admin/traduzir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: textoOriginal, idiomaOrigem }),
    });
    const data = await res.json() as { traducao?: string; provedor?: string; error?: string };
    if (res.ok) {
      setTextoTrad(data.traducao ?? "");
      setMsg(`✓ Tradução concluída! (via ${data.provedor ?? "tradutor"})`);
    } else setMsg(`Erro: ${data.error}`);
    setLoadTrad(false);
  }

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto).then(() => setMsg("✓ Copiado!"));
  }

  function limpar() {
    setTextoOrig(""); setTextoTrad(""); setImagemUrl(""); setMsg("");
    setArquivo(null); setPreviewUrl(""); if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna esquerda: OCR + texto original */}
      <div className="space-y-4">
        <div className="card-zaika p-5">
          <p className="font-bold text-sm mb-3" style={{ color: "var(--foreground)" }}>📷 Extrair Texto via OCR</p>

          {/* Seletor de idioma */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
              Idioma do texto na imagem
            </label>
            <select value={idiomaOrigem} onChange={(e) => setIdiomaOrigem(e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2"
              style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}>
              {Object.entries(idiomas).map(([code, nome]) => (
                <option key={code} value={code}>{nome}</option>
              ))}
            </select>
          </div>

          {/* Abas URL / Upload */}
          <div className="flex rounded-lg overflow-hidden border mb-3" style={{ borderColor: "var(--color-border)" }}>
            {(["url", "upload"] as const).map((m) => (
              <button key={m} onClick={() => { setModoInput(m); setMsg(""); }}
                className="flex-1 py-2 text-xs font-semibold transition-all"
                style={modoInput === m
                  ? { background: "var(--color-primary)", color: "#fff" }
                  : { background: "var(--color-card)", color: "var(--color-muted)" }}>
                {m === "url" ? "🔗 Inserir URL" : "📁 Fazer Upload"}
              </button>
            ))}
          </div>

          {/* Modo URL */}
          {modoInput === "url" && (
            <div className="flex gap-2">
              <input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)}
                placeholder="https://... (URL da imagem)"
                className="flex-1 text-sm border rounded-lg px-3 py-2 outline-none"
                style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
              <button onClick={ocrUrl} disabled={loadingOcr}
                className="btn-primary text-sm px-4 py-2 shrink-0">
                {loadingOcr ? "…" : "Extrair"}
              </button>
            </div>
          )}

          {/* Modo Upload */}
          {modoInput === "upload" && (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all hover:border-pink-400"
                style={{ borderColor: arquivoSelecionado ? "var(--color-primary)" : "var(--color-border)", background: "var(--color-card)" }}
              >
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={onFileChange} />
                {previewUrl ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                      <Image src={previewUrl} alt="Preview" fill className="object-contain" sizes="400px" />
                    </div>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {arquivoSelecionado?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl mb-1">📤</p>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Clique para selecionar
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                      JPG, PNG, WebP · Máx. 5MB
                    </p>
                  </>
                )}
              </div>
              <button onClick={ocrArquivo} disabled={loadingOcr || !arquivoSelecionado}
                className="btn-primary w-full text-sm mt-3">
                {loadingOcr ? "Extraindo texto…" : "🔍 Extrair Texto da Imagem"}
              </button>
            </div>
          )}
        </div>

        {/* Texto original */}
        <div className="card-zaika p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Texto Original</label>
            <button onClick={() => copiar(textoOriginal)} className="text-xs hover:underline" style={{ color: "var(--color-primary)" }}>
              Copiar
            </button>
          </div>
          <textarea value={textoOriginal} onChange={(e) => setTextoOrig(e.target.value)}
            rows={10} placeholder="Texto extraído aparecerá aqui, ou cole diretamente…"
            className="w-full text-sm border rounded-xl p-3 outline-none resize-y"
            style={{ borderColor: "var(--color-border)", background: "#fdf0f7" }} />
        </div>
      </div>

      {/* Coluna direita: tradução */}
      <div className="space-y-4">
        <div className="card-zaika p-5">
          <p className="font-bold text-sm mb-3" style={{ color: "var(--foreground)" }}>🇧🇷 Tradução para Português</p>

          <button onClick={traduzir} disabled={loadingTrad || !textoOriginal.trim()} className="btn-primary w-full text-sm mb-4">
            {loadingTrad ? "Traduzindo…" : "🌐 Traduzir Agora"}
          </button>

          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold" style={{ color: "var(--color-muted)" }}>Tradução (pt-BR)</label>
            <button onClick={() => copiar(textoTraduzido)} className="text-xs hover:underline" style={{ color: "var(--color-primary)" }}>
              Copiar
            </button>
          </div>
          <textarea value={textoTraduzido} onChange={(e) => setTextoTrad(e.target.value)}
            rows={14} placeholder="A tradução aparecerá aqui. Você pode editar antes de usar."
            className="w-full text-sm border rounded-xl p-3 outline-none resize-y"
            style={{ borderColor: "var(--color-border)", background: "#f0f9ff" }} />
        </div>

        <div className="flex gap-3">
          <button onClick={limpar} className="btn-outline text-sm flex-1">🗑 Limpar Tudo</button>
        </div>
      </div>

      {/* Feedback */}
      {msg && (
        <div className="lg:col-span-2 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: msg.startsWith("✓") ? "#dcfce7" : "#fee2e2",
                   color: msg.startsWith("✓") ? "#16a34a" : "#dc2626" }}>
          {msg}
        </div>
      )}

      {/* Dica */}
      <div className="lg:col-span-2 card-zaika p-4 text-xs" style={{ color: "var(--color-muted)" }}>
        <p className="font-semibold mb-1" style={{ color: "var(--foreground)" }}>💡 Dica</p>
        <p>Para traduzir dentro de um capítulo e salvar automaticamente na página, acesse <strong>Obras → [Obra] → Capítulo → clique em uma página</strong>.</p>
      </div>
    </div>
  );
}
