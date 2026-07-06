"use client";
import { useCallback, useState } from "react";

interface Props {
  onArquivo: (file: File | null) => void;
  arquivo: File | null;
}

const TIPOS_ACEITOS = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export default function UploadArea({ onArquivo, arquivo }: Props) {
  const [dragging, setDragging] = useState(false);
  const [erroTipo, setErroTipo] = useState(false);

  const validarESetar = useCallback(
    (file: File) => {
      if (!TIPOS_ACEITOS.includes(file.type)) {
        setErroTipo(true);
        return;
      }
      setErroTipo(false);
      onArquivo(file);
    },
    [onArquivo]
  );

  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) validarESetar(file);
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => document.getElementById("rpm-file-input")?.click()}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all select-none ${
        dragging
          ? "border-blue-400 bg-blue-50"
          : erroTipo
          ? "border-red-300 bg-red-50"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
      }`}
    >
      <input
        id="rpm-file-input"
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) validarESetar(file);
          e.target.value = "";
        }}
      />

      {arquivo ? (
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">{arquivo.type === "application/pdf" ? "📄" : "🖼️"}</span>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{arquivo.name}</p>
            <p className="text-xs text-slate-400">{(arquivo.size / 1024).toFixed(0)} KB</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onArquivo(null); setErroTipo(false); }}
            className="ml-auto text-slate-400 hover:text-red-500 transition-colors p-1"
            aria-label="Remover arquivo"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <p className="text-3xl mb-2">📎</p>
          {erroTipo ? (
            <p className="text-sm font-medium text-red-600">Tipo não suportado. Use PDF, JPG, PNG ou WebP.</p>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700">Arraste o arquivo aqui</p>
              <p className="text-xs text-slate-400 mt-1">ou clique para selecionar</p>
              <p className="text-xs text-slate-300 mt-2">PDF · JPG · PNG · WebP — máx. 10 MB</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
