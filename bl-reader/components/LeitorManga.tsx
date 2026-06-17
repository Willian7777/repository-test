"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Pagina {
  id: string;
  numero: number;
  imagemUrl: string;
  textoTraduzido?: string | null;
}

interface Props {
  capitulo: { id: string; numero: number; titulo?: string; paginas: Pagina[] };
  obra: {
    id: string;
    titulo: string;
    capitulos: { id: string; numero: number; titulo?: string | null }[];
  };
}

export default function LeitorManga({ capitulo, obra }: Props) {
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [modoScroll, setModoScroll] = useState(false);

  const pagina = capitulo.paginas[paginaAtual];
  const total = capitulo.paginas.length;
  const capIdx = obra.capitulos.findIndex((c) => c.id === capitulo.id);
  const capAnterior = obra.capitulos[capIdx - 1];
  const proximoCap = obra.capitulos[capIdx + 1];

  const avancar = useCallback(() => { if (paginaAtual < total - 1) setPaginaAtual((p) => p + 1); }, [paginaAtual, total]);
  const voltar = useCallback(() => { if (paginaAtual > 0) setPaginaAtual((p) => p - 1); }, [paginaAtual]);

  // Navegação por teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") avancar();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") voltar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [avancar, voltar]);

  return (
    <div className="reader-mode min-h-screen flex flex-col">
      {/* Barra superior */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(16,8,24,0.95)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Link href={`/obras/${obra.id}`} className="text-xs text-pink-300 hover:text-pink-200">
          ← {obra.titulo}
        </Link>

        <div className="flex items-center gap-3">
          {/* Seletor de capítulo */}
          <select
            value={capitulo.id}
            onChange={(e) => { window.location.href = `/obras/${obra.id}/ler/${e.target.value}`; }}
            className="text-xs rounded-lg px-2 py-1 border"
            style={{ background: "#1e0d2e", borderColor: "#4a1a5e", color: "#f0d6f5" }}
          >
            {obra.capitulos.map((c) => (
              <option key={c.id} value={c.id}>
                Cap. {c.numero}{c.titulo ? ` — ${c.titulo}` : ""}
              </option>
            ))}
          </select>

          <button
            onClick={() => setModoScroll(!modoScroll)}
            className="text-xs px-2 py-1 rounded-lg border"
            style={{ borderColor: "#4a1a5e", color: "#f0d6f5", background: modoScroll ? "#5a1a7e" : "transparent" }}
          >
            {modoScroll ? "📜 Scroll" : "📄 Página"}
          </button>
        </div>

        {!modoScroll && (
          <span className="text-xs" style={{ color: "#9d7ab8" }}>
            {paginaAtual + 1} / {total}
          </span>
        )}
      </header>

      {modoScroll ? (
        /* Modo scroll — todas as páginas */
        <div className="flex flex-col items-center gap-2 py-4">
          {capitulo.paginas.map((p) => (
            <div key={p.id} className="w-full max-w-2xl px-2">
              <div className="relative w-full" style={{ minHeight: 400 }}>
                <Image
                  src={p.imagemUrl}
                  alt={`Página ${p.numero}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto rounded"
                />
              </div>
              {p.textoTraduzido && (
                <div className="mt-2 mb-4 p-3 rounded-xl text-sm leading-relaxed"
                  style={{ background: "rgba(224,80,138,0.1)", color: "#f0d6f5", border: "1px solid rgba(224,80,138,0.2)" }}>
                  {p.textoTraduzido}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Modo página única */
        <div className="flex flex-col flex-1 items-center justify-center px-2 py-4 select-none">
          {pagina && (
            <>
              <div className="relative w-full max-w-2xl cursor-pointer" onClick={avancar}>
                <Image
                  src={pagina.imagemUrl}
                  alt={`Página ${pagina.numero}`}
                  width={800}
                  height={1200}
                  priority
                  className="w-full h-auto rounded-lg"
                />
              </div>
              {pagina.textoTraduzido && (
                <div className="w-full max-w-2xl mt-3 p-4 rounded-xl text-sm leading-relaxed"
                  style={{ background: "rgba(224,80,138,0.1)", color: "#f0d6f5", border: "1px solid rgba(224,80,138,0.2)" }}>
                  {pagina.textoTraduzido}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Navegação inferior */}
      {!modoScroll && (
        <footer className="sticky bottom-0 flex items-center justify-between px-4 py-3 gap-2"
          style={{ background: "rgba(16,8,24,0.95)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={voltar} disabled={paginaAtual === 0}
            className="text-sm px-4 py-2 rounded-lg font-semibold disabled:opacity-30"
            style={{ background: "#2d1048", color: "#f0d6f5" }}>
            ← Anterior
          </button>

          <div className="flex items-center gap-1">
            {capitulo.paginas.map((_, i) => (
              <button key={i} onClick={() => setPaginaAtual(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === paginaAtual ? "#e0508a" : "#4a1a5e" }} />
            ))}
          </div>

          {paginaAtual < total - 1 ? (
            <button onClick={avancar}
              className="text-sm px-4 py-2 rounded-lg font-semibold"
              style={{ background: "#e0508a", color: "#fff" }}>
              Próxima →
            </button>
          ) : proximoCap ? (
            <Link href={`/obras/${obra.id}/ler/${proximoCap.id}`}
              className="text-sm px-4 py-2 rounded-lg font-semibold"
              style={{ background: "#8b5cf6", color: "#fff" }}>
              Próximo Cap. →
            </Link>
          ) : (
            <Link href={`/obras/${obra.id}`}
              className="text-sm px-4 py-2 rounded-lg font-semibold"
              style={{ background: "#2d1048", color: "#f0d6f5" }}>
              Fim 🌸
            </Link>
          )}
        </footer>
      )}
    </div>
  );
}
