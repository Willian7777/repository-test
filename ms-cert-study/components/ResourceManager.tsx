"use client";

import { useState, useEffect, useRef } from "react";
import type { UserResource, ResourceType } from "@/types/resource";
import {
  getResources,
  addResource,
  deleteResource,
  extractYouTubeId,
  formatFileSize,
} from "@/lib/resources";

interface Props {
  certId: string;
  domainId: string;
}

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

export default function ResourceManager({ certId, domainId }: Props) {
  const [resources, setResources] = useState<UserResource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<ResourceType>("youtube");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResources(getResources(certId, domainId));
  }, [certId, domainId]);

  function refresh() {
    setResources(getResources(certId, domainId));
  }

  function handleAddUrl(type: "youtube" | "link") {
    setError("");
    const trimUrl = url.trim();
    const trimTitle = title.trim();
    if (!trimUrl) { setError("Informe a URL."); return; }

    if (type === "youtube") {
      const id = extractYouTubeId(trimUrl);
      if (!id) { setError("URL do YouTube inválida. Use youtube.com/watch?v=... ou youtu.be/..."); return; }
      addResource({
        id: crypto.randomUUID(),
        certId, domainId, type: "youtube",
        title: trimTitle || "Vídeo do YouTube",
        url: `https://www.youtube.com/watch?v=${id}`,
        addedAt: new Date().toISOString(),
      });
    } else {
      try { new URL(trimUrl); } catch { setError("URL inválida. Inclua https://"); return; }
      addResource({
        id: crypto.randomUUID(),
        certId, domainId, type: "link",
        title: trimTitle || new URL(trimUrl).hostname,
        url: trimUrl,
        addedAt: new Date().toISOString(),
      });
    }
    setUrl(""); setTitle(""); refresh();
  }

  function processFile(file: File) {
    setError("");
    if (file.size > FILE_SIZE_LIMIT) {
      setError(`Arquivo muito grande (${formatFileSize(file.size)}). Máximo: 10 MB. Para vídeos maiores, use a aba YouTube.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      addResource({
        id: crypto.randomUUID(),
        certId, domainId, type: "file",
        title: title.trim() || file.name,
        fileData: ev.target?.result as string,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        addedAt: new Date().toISOString(),
      });
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      refresh();
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleDelete(id: string) {
    deleteResource(certId, domainId, id);
    refresh();
  }

  const tabs: { id: ResourceType; label: string; icon: string }[] = [
    { id: "youtube", label: "YouTube", icon: "🎬" },
    { id: "link", label: "Link externo", icon: "🔗" },
    { id: "file", label: "Arquivo / Vídeo", icon: "📁" },
  ];

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Meu Material de Estudo</h2>
          <p className="text-sm text-gray-500">
            Adicione vídeos, links e arquivos para este domínio.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Fechar" : "+ Adicionar conteúdo"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
          {/* Tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(""); setUrl(""); setTitle(""); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* YouTube */}
          {tab === "youtube" && (
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Título (opcional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAddUrl("youtube")}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Adicionar vídeo
              </button>
            </div>
          )}

          {/* Link externo */}
          {tab === "link" && (
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAddUrl("link")}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Adicionar link
              </button>
            </div>
          )}

          {/* Arquivo / Vídeo */}
          {tab === "file" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título (opcional — usa o nome do arquivo por padrão)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                  dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-4xl mb-3">📁</div>
                <p className="text-sm font-medium text-gray-700">
                  Arraste e solte ou <span className="text-blue-600">clique para selecionar</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, Word, PowerPoint, imagens, MP4, WebM — máx. 10 MB
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
                />
              </div>

              <p className="text-xs text-gray-400">
                ⚠️ Arquivos ficam salvos no navegador (localStorage). Para vídeos grandes, use YouTube.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lista de recursos */}
      {resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((r) => (
            <ResourceItem key={r.id} resource={r} onDelete={() => handleDelete(r.id)} />
          ))}
        </div>
      ) : !showForm && (
        <div
          className="border-2 border-dashed border-gray-100 rounded-2xl py-10 text-center cursor-pointer hover:border-blue-200 transition-colors"
          onClick={() => setShowForm(true)}
        >
          <div className="text-3xl mb-2">📚</div>
          <p className="text-sm text-gray-400">Nenhum material adicionado.</p>
          <p className="text-sm text-blue-500 mt-1 hover:underline">+ Adicionar conteúdo</p>
        </div>
      )}
    </div>
  );
}

function ResourceItem({ resource, onDelete }: { resource: UserResource; onDelete: () => void }) {
  if (resource.type === "youtube") {
    const videoId = extractYouTubeId(resource.url ?? "");
    return (
      <div className="flex gap-3 bg-white rounded-xl border border-gray-200 p-3 group hover:shadow-sm transition-shadow">
        {videoId && (
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt={resource.title}
              className="w-28 h-16 object-cover rounded-lg"
            />
          </a>
        )}
        <div className="flex-1 min-w-0">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors"
          >
            {resource.title}
          </a>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">YouTube</span>
            <span className="text-xs text-gray-400">{new Date(resource.addedAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
        <button
          onClick={onDelete}
          title="Remover"
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all flex-shrink-0 self-start"
        >
          ✕
        </button>
      </div>
    );
  }

  if (resource.type === "link") {
    return (
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 group hover:shadow-sm transition-shadow">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-xl">
          🔗
        </div>
        <div className="flex-1 min-w-0">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors block truncate"
          >
            {resource.title}
          </a>
          <p className="text-xs text-gray-400 truncate">{resource.url}</p>
        </div>
        <button
          onClick={onDelete}
          title="Remover"
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
        >
          ✕
        </button>
      </div>
    );
  }

  // file
  const isVideo = resource.fileType?.startsWith("video/");
  const isPdf = resource.fileType === "application/pdf";
  const isImage = resource.fileType?.startsWith("image/");
  const icon = isVideo ? "🎬" : isPdf ? "📄" : isImage ? "🖼️" : "📁";

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 group hover:shadow-sm transition-shadow">
      {isImage && resource.fileData ? (
        <img
          src={resource.fileData}
          alt={resource.title}
          className="w-12 h-10 object-cover rounded-lg flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <a
          href={resource.fileData ?? "#"}
          download={resource.fileName}
          className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors block truncate"
        >
          {resource.title || resource.fileName}
        </a>
        <p className="text-xs text-gray-400">
          {resource.fileName} · {formatFileSize(resource.fileSize)}
        </p>
      </div>
      <button
        onClick={onDelete}
        title="Remover"
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
      >
        ✕
      </button>
    </div>
  );
}
