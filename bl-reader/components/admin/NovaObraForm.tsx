"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

const GENEROS = ["BL", "Drama", "Fantasia", "Comédia", "Romance", "Action", "Slice of Life", "Supernatural", "Histórico", "Ficção Científica"];

export default function NovaObraForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [extracting, setExtracting]  = useState(false);
  const [msg, setMsg]                = useState("");
  const [pdfNome, setPdfNome]        = useState("");
  const fileRef  = useRef<HTMLInputElement>(null);

  // Campos do formulário
  const [titulo,    setTitulo]    = useState("");
  const [autorOrig, setAutorOrig] = useState("");
  const [tradutora, setTradutora] = useState("");
  const [sinopse,   setSinopse]   = useState("");
  const [capaUrl,   setCapaUrl]   = useState("");
  const [preco,     setPreco]     = useState("9.90");
  const [status,    setStatus]    = useState("RASCUNHO");
  const [generos,   setGeneros]   = useState<string[]>([]);

  // ── Extração de PDF ────────────────────────────────────────────────────────
  async function handlePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfNome(file.name);
    setExtracting(true);
    setMsg("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res  = await fetch("/api/admin/extrair-pdf", { method: "POST", body: fd });
      const data = await res.json() as {
        titulo?: string; autor?: string; tradutora?: string;
        paginas?: number; preview?: string; error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar PDF");

      if (data.titulo)    setTitulo(data.titulo);
      if (data.autor)     setAutorOrig(data.autor);
      if (data.tradutora) setTradutora(data.tradutora);

      const encontrados = [data.titulo, data.autor, data.tradutora].filter(Boolean).length;
      setMsg(encontrados > 0
        ? `✓ ${encontrados} campo(s) preenchido(s) automaticamente a partir do PDF`
        : "PDF processado — nenhum metadado encontrado. Preencha os campos manualmente.");
    } catch (err) {
      setMsg(`Erro: ${err instanceof Error ? err.message : "Falha ao processar PDF"}`);
    } finally {
      setExtracting(false);
    }
  }

  // ── Submissão do formulário ────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (generos.length === 0) { setMsg("Selecione pelo menos um gênero."); return; }
    setMsg("");

    startTransition(async () => {
      const res = await fetch("/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, autorOriginal: autorOrig, tradutora, sinopse, capaUrl, preco: parseFloat(preco), generos }),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (res.ok && data.id) {
        router.push(`/admin/obras/${data.id}`);
      } else {
        setMsg(`Erro: ${data.error ?? "Falha ao criar obra"}`);
      }
    });
  }

  function toggleGenero(g: string) {
    setGeneros(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  return (
    <form onSubmit={handleSubmit} className="card-zaika p-6 space-y-5 max-w-2xl">

      {/* ── Extrator de PDF ─────────────────────────────────────────────── */}
      <div className="rounded-xl p-4 border-2 border-dashed" style={{ borderColor: "var(--color-primary)", background: "var(--color-primary-light)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
            📄 Extrair dados do PDF automaticamente
          </p>
          {pdfNome && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>{pdfNome}</span>
          )}
        </div>
        <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>
          Faça upload do PDF da obra e os campos Título, Autor e Tradutora serão preenchidos automaticamente.
        </p>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdf} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={extracting}
            className="btn-primary text-sm px-4 py-2"
          >
            {extracting ? "⏳ Extraindo…" : "📁 Selecionar PDF"}
          </button>
          {pdfNome && (
            <button type="button" onClick={() => { setPdfNome(""); setMsg(""); if (fileRef.current) fileRef.current.value = ""; }}
              className="btn-outline text-sm px-3 py-2">
              Remover
            </button>
          )}
        </div>
        {msg && (
          <p className="text-xs mt-2 font-medium" style={{ color: msg.startsWith("✓") ? "#16a34a" : "#dc2626" }}>
            {msg}
          </p>
        )}
      </div>

      {/* ── Campos do formulário ────────────────────────────────────────── */}
      <FField label="Título da obra" value={titulo} onChange={setTitulo} placeholder="Ex: My Only Sunshine" required />

      <div className="grid grid-cols-2 gap-4">
        <FField label="Autor original" value={autorOrig} onChange={setAutorOrig} placeholder="Nome do autor" required />
        <FField label="Tradutora (opcional)" value={tradutora} onChange={setTradutora} placeholder="Seu nome ou apelido" />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
          Sinopse <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <textarea value={sinopse} onChange={e => setSinopse(e.target.value)} required rows={4}
          placeholder="Descreva a história..."
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-y"
          style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--foreground)" }} />
      </div>

      <FField label="URL da capa" value={capaUrl} onChange={setCapaUrl} placeholder="https://... (link da imagem de capa)" required type="url" />

      <div className="grid grid-cols-2 gap-4">
        <FField label="Preço (R$)" value={preco} onChange={setPreco} type="number" placeholder="9.90" required />
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>Status inicial</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border text-sm"
            style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}>
            <option value="RASCUNHO">📝 Rascunho</option>
            <option value="PUBLICADO">✅ Publicado</option>
          </select>
        </div>
      </div>

      {/* Gêneros */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-muted)" }}>
          Gêneros <span style={{ color: "var(--color-primary)" }}>*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {GENEROS.map(g => (
            <button key={g} type="button" onClick={() => toggleGenero(g)}
              className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
              style={generos.includes(g)
                ? { background: "var(--color-primary)", borderColor: "var(--color-primary)", color: "#fff" }
                : { borderColor: "var(--color-border)", color: "var(--foreground)" }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Criando…" : "Criar Obra"}
        </button>
        <a href="/admin/obras" className="btn-outline">Cancelar</a>
      </div>
    </form>
  );
}

function FField({ label, value, onChange, placeholder, required, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
        {label} {required && <span style={{ color: "var(--color-primary)" }}>*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
        style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--foreground)" }} />
    </div>
  );
}
