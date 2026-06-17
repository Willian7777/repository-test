"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import LabCard from "@/components/LabCard";
import ResourceManager from "@/components/ResourceManager";
import VideoSuggestions from "@/components/VideoSuggestions";
import type { LearningPath, LearningModule } from "@/types/certification";

export default function DomainPage({
  params,
}: {
  params: Promise<{ certId: string; domainId: string }>;
}) {
  const { certId, domainId } = use(params);
  const examCode = certId.toUpperCase();

  const [domain, setDomain] = useState<LearningPath | null>(null);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca todas as learning paths e localiza a correta pelo uid
    fetch(`/api/cert-domains?certCode=${encodeURIComponent(examCode)}`)
      .then((r) => r.json())
      .then((paths: LearningPath[]) => {
        const found = paths.find(
          (p) => p.uid.replace(/\./g, "-") === domainId || p.uid === domainId
        );
        setDomain(found ?? null);
        if (found?.modules) {
          setObjectives(found.modules.map((m) => m.title));
        }
      })
      .catch(() => setDomain(null))
      .finally(() => setLoading(false));
  }, [certId, domainId, examCode]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400 animate-pulse">Carregando conteúdo...</div>;
  }

  if (!domain) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Domínio não encontrado.</p>
        <Link href={`/cert/${certId}`} className="mt-4 inline-block text-blue-600 underline">
          Voltar para {examCode}
        </Link>
      </div>
    );
  }

  const modules: LearningModule[] = domain.modules ?? [];

  // Separa módulos com vídeo (duração ≤ 30min) dos labs (duração > 30min ou contém "exercise")
  const videoModules = modules.filter((m) => !m.title.toLowerCase().includes("exercise") && (m.durationInMinutes ?? 30) <= 30);
  const labModules = modules.filter((m) => m.title.toLowerCase().includes("exercise") || (m.durationInMinutes ?? 0) > 30);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href={`/cert/${certId}`} className="hover:text-blue-600 transition-colors">{examCode}</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{domain.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{domain.title}</h1>
        {domain.description && (
          <p className="text-gray-500">{domain.description}</p>
        )}
        <div className="mt-4">
          <Link
            href={`/cert/${certId}/domain/${domainId}/quiz`}
            className="inline-block px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors mr-3"
          >
            Praticar questões →
          </Link>
          <a
            href={domain.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Ver no Microsoft Learn ↗
          </a>
        </div>
      </div>

      {/* Módulos / Vídeos */}
      {(videoModules.length > 0 || modules.length > 0) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {modules.length > 0 ? "Módulos de aprendizado" : "Trilha no Microsoft Learn"}
          </h2>
          <div className="space-y-3">
            {(videoModules.length > 0 ? videoModules : modules).map((m) => (
              <VideoCard
                key={m.uid}
                title={m.title}
                description={m.description}
                url={m.url.startsWith("http") ? m.url : `https://learn.microsoft.com${m.url}`}
                durationMin={m.durationInMinutes}
              />
            ))}
            {modules.length === 0 && (
              <VideoCard
                title={domain.title}
                description="Conteúdo completo desta trilha no Microsoft Learn"
                url={domain.url}
              />
            )}
          </div>
        </div>
      )}

      {/* Labs */}
      {labModules.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Laboratórios Práticos</h2>
          <div className="space-y-3">
            {labModules.map((m) => (
              <LabCard
                key={m.uid}
                title={m.title}
                description={m.description}
                url={m.url.startsWith("http") ? m.url : `https://learn.microsoft.com${m.url}`}
                durationMin={m.durationInMinutes}
                isFree
              />
            ))}
          </div>
        </div>
      )}

      {/* Fallback sandbox link */}
      {modules.length === 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Laboratório Prático</h2>
          <LabCard
            title={`Sandbox Gratuito — ${domain.title}`}
            description="Acesse o ambiente de prática gratuito no Microsoft Learn (Azure sandbox por 2h)."
            url={domain.url}
            isFree
          />
        </div>
      )}

      {/* Separador */}
      <hr className="my-8 border-gray-100" />

      {/* Vídeos sugeridos automaticamente pelo YouTube */}
      <VideoSuggestions
        certId={certId}
        domainId={domainId}
        examCode={examCode}
        domainTitle={domain.title}
        objectives={objectives}
      />

      {/* Separador */}
      <hr className="my-8 border-gray-100" />

      {/* Meu Material de Estudo */}
      <ResourceManager certId={certId} domainId={domainId} />
    </div>
  );
}
