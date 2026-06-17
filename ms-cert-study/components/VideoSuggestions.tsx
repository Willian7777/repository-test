"use client";

import { useState } from "react";
import { addResource } from "@/lib/resources";
import VideoModal from "@/components/VideoModal";
import type { VideoSuggestion } from "@/app/api/videos/route";
import type { VideoAnalysis } from "@/app/api/video-analyze/route";

interface Props {
  certId: string;
  domainId: string;
  examCode: string;
  domainTitle: string;
  objectives?: string[];
  onAdded?: () => void;
}

type Lang = "pt" | "en";

export default function VideoSuggestions({ certId, domainId, examCode, domainTitle, objectives = [], onAdded }: Props) {
  const [videos, setVideos] = useState<VideoSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [lang, setLang] = useState<Lang>("pt");
  const [fetched, setFetched] = useState(false);

  // Modal de player
  const [activeVideo, setActiveVideo] = useState<VideoSuggestion | null>(null);

  // Análise de transcrição por vídeo
  const [analyses, setAnalyses] = useState<Record<string, VideoAnalysis>>({});
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());

  async function fetchVideos(l: Lang = lang) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ examCode, domainTitle, lang: l });
      const res = await fetch(`/api/videos?${params.toString()}`);
      const data = await res.json() as VideoSuggestion[] | { error: string };

      if (!res.ok || "error" in data) {
        const msg = "error" in data ? data.error : `Erro ${res.status}`;
        if (msg.includes("YOUTUBE_API_KEY")) {
          setError("Configure YOUTUBE_API_KEY no .env.local para sugestões automáticas de vídeos.");
        } else {
          setError(msg);
        }
        return;
      }
      setVideos(data as VideoSuggestion[]);
      setFetched(true);
    } catch {
      setError("Erro ao buscar vídeos. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(video: VideoSuggestion) {
    addResource({
      id: crypto.randomUUID(),
      certId,
      domainId,
      type: "youtube",
      title: video.title,
      url: video.url,
      addedAt: new Date().toISOString(),
    });
    setAdded((prev) => new Set(prev).add(video.id));
    onAdded?.();
  }

  async function handleAnalyze(video: VideoSuggestion) {
    if (analyzing.has(video.id) || analyses[video.id]) return;
    setAnalyzing((prev) => new Set(prev).add(video.id));
    try {
      const res = await fetch("/api/video-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          examCode,
          domainTitle,
          objectives,
        }),
      });
      const data = await res.json() as VideoAnalysis | { error: string };
      if ("error" in data) throw new Error(data.error);
      setAnalyses((prev) => ({ ...prev, [video.id]: data as VideoAnalysis }));
    } catch (err) {
      setAnalyses((prev) => ({
        ...prev,
        [video.id]: {
          videoId: video.id,
          relevant: false,
          score: 0,
          summary: "",
          reason: err instanceof Error ? err.message : "Erro ao analisar",
          keyTopics: [],
        },
      }));
    } finally {
      setAnalyzing((prev) => { const s = new Set(prev); s.delete(video.id); return s; });
    }
  }

  function handleLangChange(l: Lang) {
    setLang(l);
    if (fetched) fetchVideos(l);
  }

  return (
    <div className="mt-8">
      {/* Modal player */}
      {activeVideo && (
        <VideoModal
          videoId={activeVideo.id}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Vídeos recomendados
            <span className="ml-2 text-xs font-normal text-gray-400 align-middle">via YouTube</span>
          </h2>
          <p className="text-sm text-gray-500">
            Sugestões automáticas de vídeos para <strong>{examCode}</strong> — {domainTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
            <button onClick={() => handleLangChange("pt")} className={`px-3 py-1.5 font-medium transition-colors ${lang === "pt" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>PT</button>
            <button onClick={() => handleLangChange("en")} className={`px-3 py-1.5 font-medium transition-colors ${lang === "en" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>EN</button>
          </div>
          {!fetched ? (
            <button onClick={() => fetchVideos(lang)} disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {loading ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : "▶"}
              {loading ? "Buscando..." : "Buscar vídeos"}
            </button>
          ) : (
            <button onClick={() => fetchVideos(lang)} disabled={loading}
              className="px-3 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {loading ? "..." : "↻ Atualizar"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 mb-4">
          {error}
          {error.includes("YOUTUBE_API_KEY") && (
            <div className="mt-2 text-xs text-amber-700">
              Obtenha gratuitamente em{" "}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a>
              {" "}→ Criar credenciais → Chave de API → ative a API "YouTube Data API v3".
            </div>
          )}
        </div>
      )}

      {!fetched && !loading && !error && (
        <div className="border-2 border-dashed border-gray-100 rounded-2xl py-10 text-center cursor-pointer hover:border-red-200 transition-colors" onClick={() => fetchVideos(lang)}>
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-sm text-gray-400">Clique em "Buscar vídeos" para sugestões automáticas</p>
          <p className="text-xs text-gray-300 mt-1">Busca no YouTube por vídeos de {examCode}</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
              <div className="w-28 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && fetched && videos.length === 0 && !error && (
        <p className="text-sm text-gray-400 text-center py-8">Nenhum vídeo encontrado. Tente mudar o idioma.</p>
      )}

      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((v) => {
            const isAdded = added.has(v.id);
            const analysis = analyses[v.id];
            const isAnalyzing = analyzing.has(v.id);
            return (
              <div key={v.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Thumbnail clicável — abre player */}
                <button
                  onClick={() => setActiveVideo(v)}
                  className="relative w-full block group"
                >
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg ml-0.5">▶</span>
                    </div>
                  </div>
                </button>

                <div className="p-3">
                  {/* Título */}
                  <button
                    onClick={() => setActiveVideo(v)}
                    className="font-medium text-xs text-gray-900 hover:text-blue-600 line-clamp-2 transition-colors leading-snug text-left w-full mb-1"
                  >
                    {v.title}
                  </button>
                  <p className="text-xs text-gray-400 mb-2">{v.channelTitle}</p>

                  {/* Badge de relevância */}
                  {analysis && (
                    <div className={`rounded-lg p-2 mb-2 text-xs ${analysis.relevant ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${analysis.relevant ? "text-green-700" : "text-red-600"}`}>
                          {analysis.relevant ? "✓ Relevante" : "✗ Pouco relevante"}
                        </span>
                        <span className={`ml-auto font-bold ${analysis.score >= 70 ? "text-green-700" : analysis.score >= 40 ? "text-amber-600" : "text-red-600"}`}>
                          {analysis.score}/100
                        </span>
                      </div>
                      {analysis.summary && <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>}
                      {analysis.keyTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {analysis.keyTopics.slice(0, 3).map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setActiveVideo(v)}
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                    >
                      ▶ Assistir
                    </button>
                    <button
                      onClick={() => handleAnalyze(v)}
                      disabled={isAnalyzing || !!analysis}
                      title={analysis ? "Análise concluída" : "Analisar transcrição com IA"}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        analysis
                          ? "bg-gray-100 text-gray-400 cursor-default"
                          : isAnalyzing
                          ? "bg-violet-100 text-violet-600 cursor-wait"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                      }`}
                    >
                      {isAnalyzing ? <span className="animate-spin inline-block w-3 h-3 border-2 border-violet-600 border-t-transparent rounded-full" /> : analysis ? "✓ Analisado" : "🔍 IA"}
                    </button>
                    <button
                      onClick={() => handleAdd(v)}
                      disabled={isAdded}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isAdded ? "bg-green-100 text-green-700 cursor-default" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      {isAdded ? "✓" : "+ Salvar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
