"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import TraductorPanel from "./TraductorPanel";

interface Pagina {
  id: string; numero: number; imagemUrl: string;
  textoOriginal?: string | null; idiomaOriginal?: string | null; textoTraduzido?: string | null;
}

interface Props {
  capitulo: { id: string; obraId: string; numero: number; titulo: string | null; publicado: boolean; paginas: Pagina[] };
  idiomasSuportados: Record<string, string>;
}

export default function CapituloEditorClient({ capitulo, idiomasSuportados }: Props) {
  const [paginas, setPaginas]         = useState<Pagina[]>(capitulo.paginas);
  const [publicado, setPublicado]     = useState(capitulo.publicado);
  const [paginaSelecionada, setPaginaSel] = useState<Pagina | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [progresso, setProgresso]     = useState(0);
  const [isDragging, setIsDragging]   = useState(false);
  const [mensagem, setMensagem]       = useState("");
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  // ── Upload de páginas ────────────────────────────────────────────────────
  async function uploadArquivos(files: FileList) {
    const lista = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!lista.length) { setMensagem("Selecione apenas imagens (JPG, PNG, WebP)."); return; }

    setUploading(true);
    setProgresso(0);
    setMensagem("");

    const proximoNum = paginas.length > 0 ? Math.max(...paginas.map((p) => p.numero)) + 1 : 1;
    const novasPaginas: Pagina[] = [];

    for (let i = 0; i < lista.length; i++) {
      const file = lista[i];
      const fd   = new FormData();
      fd.append("file",       file);
      fd.append("obraId",     capitulo.obraId);
      fd.append("capituloId", capitulo.id);
      fd.append("numero",     String(proximoNum + i));

      try {
        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json() as { imagemUrl?: string; paginaId?: string; error?: string };
        if (res.ok && data.imagemUrl) {
          novasPaginas.push({ id: data.paginaId!, numero: proximoNum + i, imagemUrl: data.imagemUrl });
        } else {
          setMensagem(`Erro na página ${i + 1}: ${data.error ?? "falha"}`);
        }
      } catch { setMensagem(`Erro de rede na página ${i + 1}`); }

      setProgresso(Math.round(((i + 1) / lista.length) * 100));
    }

    setPaginas((prev) => [...prev, ...novasPaginas].sort((a, b) => a.numero - b.numero));
    setUploading(false);
    setMensagem(`✓ ${novasPaginas.length} página(s) enviada(s) com sucesso!`);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) uploadArquivos(e.dataTransfer.files);
  }, [paginas]);

  // ── Toggle publicado ─────────────────────────────────────────────────────
  async function togglePublicado() {
    const novo = !publicado;
    const res  = await fetch(`/api/capitulos/${capitulo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicado: novo }),
    });
    if (res.ok) { setPublicado(novo); setMensagem(novo ? "✓ Capítulo publicado!" : "Capítulo voltou para rascunho."); }
  }

  // ── Excluir página ───────────────────────────────────────────────────────
  async function excluirPagina(paginaId: string) {
    if (!confirm("Excluir esta página?")) return;
    const res = await fetch(`/api/paginas/${paginaId}`, { method: "DELETE" });
    if (res.ok) setPaginas((prev) => prev.filter((p) => p.id !== paginaId));
  }

  // ── Atualizar tradução na lista local ────────────────────────────────────
  function onTraduzido(paginaId: string, traducao: string) {
    setPaginas((prev) => prev.map((p) => p.id === paginaId ? { ...p, textoTraduzido: traducao } : p));
    setPaginaSel((prev) => prev?.id === paginaId ? { ...prev, textoTraduzido: traducao } : prev);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* ── Painel esquerdo: páginas ───────────────────────────────────────── */}
      <div className="xl:col-span-2 space-y-5">
        {/* Cabeçalho do capítulo */}
        <div className="card-zaika p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black zaika-gradient-text">
              Capítulo {capitulo.numero}{capitulo.titulo ? ` — ${capitulo.titulo}` : ""}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {paginas.length} página{paginas.length !== 1 ? "s" : ""} · {" "}
              <span style={{ color: publicado ? "#16a34a" : "#d97706" }}>
                {publicado ? "✅ Publicado" : "📝 Rascunho"}
              </span>
            </p>
          </div>
          <button
            onClick={togglePublicado}
            className={publicado ? "btn-outline text-sm" : "btn-primary text-sm"}
          >
            {publicado ? "↩ Voltar para Rascunho" : "🚀 Publicar Capítulo"}
          </button>
        </div>

        {/* Mensagem de feedback */}
        {mensagem && (
          <div className="px-4 py-2 rounded-lg text-sm"
            style={{ background: mensagem.startsWith("✓") ? "#dcfce7" : "#fee2e2",
                     color: mensagem.startsWith("✓") ? "#16a34a" : "#dc2626" }}>
            {mensagem}
          </div>
        )}

        {/* Área de upload drag & drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
          style={{
            borderColor: isDragging ? "var(--color-primary)" : "var(--color-border)",
            background: isDragging ? "var(--color-primary-light)" : "var(--color-card)",
          }}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => e.target.files && uploadArquivos(e.target.files)} />
          <p className="text-3xl mb-2">📤</p>
          <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
            {uploading ? `Enviando… ${progresso}%` : "Arraste imagens aqui ou clique para selecionar"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
            JPG, PNG, WebP · Máx. 5MB por página · Múltiplas imagens ao mesmo tempo
          </p>
          {uploading && (
            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progresso}%`, background: "var(--color-primary)" }} />
            </div>
          )}
        </div>

        {/* Grade de páginas */}
        {paginas.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {paginas.map((p) => (
              <div
                key={p.id}
                onClick={() => setPaginaSel(paginaSelecionada?.id === p.id ? null : p)}
                className="relative rounded-xl overflow-hidden cursor-pointer group transition-all"
                style={{
                  border: `2px solid ${paginaSelecionada?.id === p.id ? "var(--color-primary)" : "var(--color-border)"}`,
                  boxShadow: paginaSelecionada?.id === p.id ? "0 0 0 3px rgba(224,80,138,0.2)" : "none",
                }}
              >
                <div className="aspect-[2/3] relative bg-gray-100">
                  <Image src={p.imagemUrl} alt={`Página ${p.numero}`} fill className="object-cover" sizes="200px" />
                  {/* Número da página */}
                  <span className="absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md text-white"
                    style={{ background: "rgba(0,0,0,0.55)" }}>
                    #{p.numero}
                  </span>
                  {/* Indicador de tradução */}
                  {p.textoTraduzido && (
                    <span className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 rounded-md"
                      style={{ background: "rgba(139,92,246,0.85)", color: "#fff" }}>🌐</span>
                  )}
                  {/* Botão excluir (hover) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); excluirPagina(p.id); }}
                    className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "#dc2626", color: "#fff", fontSize: 12 }}
                  >✕</button>
                </div>
                <p className="text-xs text-center py-1 font-medium" style={{ color: "var(--color-muted)" }}>
                  {p.textoTraduzido ? "✓ Traduzida" : "Sem tradução"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Painel direito: tradutor ───────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="card-zaika p-4">
          <p className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>
            {paginaSelecionada ? `📄 Traduzindo Página #${paginaSelecionada.numero}` : "🌐 Tradutor"}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            {paginaSelecionada ? "Clique em outra página para trocar" : "Selecione uma página à esquerda para traduzir"}
          </p>
        </div>

        {paginaSelecionada ? (
          <TraductorPanel
            key={paginaSelecionada.id}
            paginaId={paginaSelecionada.id}
            imagemUrl={paginaSelecionada.imagemUrl}
            textoOriginalInicial={paginaSelecionada.textoOriginal ?? ""}
            idiomaInicialInicial={paginaSelecionada.idiomaOriginal ?? "ja"}
            textoTraduzidoInicial={paginaSelecionada.textoTraduzido ?? ""}
            onSalvo={(t) => onTraduzido(paginaSelecionada.id, t)}
          />
        ) : (
          <div className="card-zaika p-6 text-center">
            <p className="text-3xl mb-2">👆</p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Clique em uma página para abrir o tradutor aqui
            </p>
          </div>
        )}

        {/* Legenda */}
        <div className="card-zaika p-4 text-xs space-y-2" style={{ color: "var(--color-muted)" }}>
          <p className="font-semibold" style={{ color: "var(--foreground)" }}>Como usar:</p>
          <p>1️⃣ Faça upload das imagens arrastando para a área acima</p>
          <p>2️⃣ Clique em uma página para selecionar</p>
          <p>3️⃣ Use <strong>Extrair via OCR</strong> para pegar o texto da imagem</p>
          <p>4️⃣ Clique em <strong>Traduzir</strong> para traduzir automaticamente</p>
          <p>5️⃣ Revise e salve a tradução</p>
          <p>6️⃣ Quando todas as páginas estiverem prontas, <strong>Publique o capítulo</strong></p>
        </div>
      </div>
    </div>
  );
}
