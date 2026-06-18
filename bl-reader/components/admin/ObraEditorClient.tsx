"use client";

import { useState } from "react";
import Link from "next/link";

interface Capitulo { id: string; numero: number; titulo: string | null; publicado: boolean; _count: { paginas: number } }
interface Obra { id: string; titulo: string; autorOriginal: string; tradutora: string | null; sinopse: string; capaUrl: string; preco: number; status: string; generosArray: string[] }

export default function ObraEditorClient({
  obra, generosDisponiveis, salvarAction, novoCapituloAction, proximoNumero,
}: {
  obra: Obra & { capitulos: Capitulo[] };
  generosDisponiveis: string[];
  salvarAction: (fd: FormData) => Promise<void>;
  novoCapituloAction: (fd: FormData) => Promise<void>;
  proximoNumero: number;
}) {
  const [aba, setAba] = useState<"info" | "capitulos">("info");

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black zaika-gradient-text">{obra.titulo}</h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {obra.capitulos.length} capítulos · {obra.status === "PUBLICADO" ? "✅ Publicada" : "📝 Rascunho"}
          </p>
        </div>
        {obra.status === "PUBLICADO" && (
          <Link href={`/obras/${obra.id}`} target="_blank"
            className="btn-outline text-xs">👁 Ver no site</Link>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "var(--color-primary-light)" }}>
        {([["info", "📋 Informações"], ["capitulos", "📚 Capítulos"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={aba === id
              ? { background: "var(--color-primary)", color: "#fff" }
              : { color: "var(--color-primary)", background: "transparent" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ABA: Informações */}
      {aba === "info" && (
        <form action={salvarAction} className="card-zaika p-6 space-y-5 max-w-2xl">
          <FField label="Título" name="titulo" defaultValue={obra.titulo} required />
          <div className="grid grid-cols-2 gap-4">
            <FField label="Autor original" name="autorOriginal" defaultValue={obra.autorOriginal} required />
            <FField label="Tradutora" name="tradutora" defaultValue={obra.tradutora ?? ""} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>Sinopse *</label>
            <textarea name="sinopse" required rows={4} defaultValue={obra.sinopse}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-y"
              style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--foreground)" }} />
          </div>
          <FField label="URL da capa" name="capaUrl" defaultValue={obra.capaUrl} type="url" required />
          <div className="grid grid-cols-2 gap-4">
            <FField label="Preço (R$)" name="preco" defaultValue={String(obra.preco)} type="number" required />
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>Status</label>
              <select name="status" defaultValue={obra.status}
                className="w-full px-3 py-2.5 rounded-lg border text-sm"
                style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}>
                <option value="RASCUNHO">📝 Rascunho</option>
                <option value="PUBLICADO">✅ Publicado</option>
                <option value="ARQUIVADO">📦 Arquivado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-muted)" }}>Gêneros</label>
            <div className="flex flex-wrap gap-2">
              {generosDisponiveis.map((g) => (
                <label key={g} className="flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border"
                  style={{ borderColor: "var(--color-border)" }}>
                  <input type="checkbox" name="generos" value={g} defaultChecked={obra.generosArray.includes(g)} className="accent-pink-500" />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary">💾 Salvar Alterações</button>
        </form>
      )}

      {/* ABA: Capítulos */}
      {aba === "capitulos" && (
        <div className="max-w-3xl space-y-6">
          {/* Lista de capítulos */}
          {obra.capitulos.length > 0 ? (
            <div className="card-zaika overflow-hidden">
              <div className="px-4 py-3 border-b font-semibold text-sm" style={{ borderColor: "var(--color-border)", color: "var(--foreground)" }}>
                Capítulos ({obra.capitulos.length})
              </div>
              {obra.capitulos.map((cap, i) => (
                <div key={cap.id} className="flex items-center justify-between px-4 py-3 hover:bg-pink-50"
                  style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Cap. {cap.numero}{cap.titulo ? ` — ${cap.titulo}` : ""}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {cap._count.paginas} páginas ·{" "}
                      <span style={{ color: cap.publicado ? "#16a34a" : "#d97706" }}>
                        {cap.publicado ? "✅ Publicado" : "📝 Rascunho"}
                      </span>
                    </p>
                  </div>
                  <Link href={`/admin/obras/${obra.id}/capitulos/${cap.id}`}
                    className="text-xs font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
                    Editar / Upload →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-zaika p-8 text-center">
              <p className="text-3xl mb-2">📄</p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>Nenhum capítulo ainda. Crie o primeiro!</p>
            </div>
          )}

          {/* Novo capítulo */}
          <div className="card-zaika p-5">
            <p className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>➕ Adicionar Capítulo</p>
            <form action={novoCapituloAction} className="flex items-end gap-3">
              <div className="w-24">
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>Número</label>
                <input name="numero" type="number" defaultValue={proximoNumero} min={1} required
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>Título (opcional)</label>
                <input name="titulo" type="text" placeholder="Ex: O Encontro"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }} />
              </div>
              <button type="submit" className="btn-primary text-sm py-2">Criar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FField({ label, name, defaultValue, type = "text", required }: {
  label: string; name: string; defaultValue?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
        {label} {required && <span style={{ color: "var(--color-primary)" }}>*</span>}
      </label>
      <input name={name} type={type} defaultValue={defaultValue} required={required}
        className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
        style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--foreground)" }} />
    </div>
  );
}
