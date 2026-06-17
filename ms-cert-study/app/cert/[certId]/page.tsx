"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import DomainCard from "@/components/DomainCard";
import { addCert, getCertProgress, getCertOverallScore, hasCert } from "@/lib/progress";
import type { LearningPath } from "@/types/certification";

export default function CertDashboardPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = use(params);
  const examCode = certId.toUpperCase();

  const [domains, setDomains] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setIsAdded(hasCert(certId));

    fetch(`/api/cert-domains?certCode=${encodeURIComponent(examCode)}`)
      .then((r) => r.json())
      .then((data: LearningPath[]) => setDomains(data))
      .catch(() => setDomains([]))
      .finally(() => setLoading(false));
  }, [certId, examCode]);

  function handleAdd() {
    addCert(certId);
    setIsAdded(true);
  }

  const prog = getCertProgress(certId);
  const lastScore = getCertOverallScore(certId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">{examCode}</span>
              {lastScore !== null && (
                <span className={`text-sm font-semibold ${lastScore >= 700 ? "text-green-600" : "text-blue-600"}`}>
                  Score: {lastScore}/1000
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Certificação {examCode}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {domains.length > 0 ? `${domains.length} trilhas de aprendizado` : "Carregando conteúdo..."}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {!isAdded ? (
              <button
                onClick={handleAdd}
                className="px-5 py-2.5 rounded-xl font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                + Adicionar ao plano
              </button>
            ) : (
              <span className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                ✓ No plano de estudos
              </span>
            )}
            {domains.length > 0 && (
              <Link
                href={`/cert/${certId}/exam`}
                className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Simular prova
              </Link>
            )}
          </div>
        </div>

        {/* Progresso geral */}
        {prog && prog.domainScores.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {prog.domainScores.length} domínio{prog.domainScores.length !== 1 ? "s" : ""} praticados ·{" "}
              {prog.examScores.length} simulado{prog.examScores.length !== 1 ? "s" : ""} realizados
            </div>
          </div>
        )}
      </div>

      {/* Domínios / Trilhas de aprendizado */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Trilhas de aprendizado</h2>
        <p className="text-sm text-gray-500">Clique em "Praticar" para gerar questões via IA baseadas nos objetivos de cada trilha.</p>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400 animate-pulse">Carregando trilhas...</div>
      )}

      {!loading && domains.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900">
          <p className="font-semibold mb-1">Certificação não encontrada no catálogo</p>
          <p className="text-sm text-amber-700 mb-4">
            O código <strong>{examCode}</strong> pode não existir ou não estar disponível na API do Microsoft Learn.
            Verifique o código correto em{" "}
            <a
              href="https://learn.microsoft.com/en-us/credentials/browse/?credential_types=certification"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              learn.microsoft.com/credentials
            </a>
            .
          </p>
          <p className="text-sm text-amber-700">
            <strong>Certificações disponíveis com conteúdo curado:</strong>{" "}
            AB-900, AZ-900, AZ-104, AZ-204, AZ-305, AZ-400, AI-900, AI-102, SC-900, SC-200, SC-300, SC-100,
            DP-900, DP-203, DP-300, DP-600, MS-900, MD-102, MS-102, PL-900, PL-200, PL-400, GitHub Foundations, GitHub Actions.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain) => {
          const domainId = domain.uid.replace(/\./g, "-");
          const score = prog?.domainScores.find((d) => d.domainId === domainId);
          return (
            <DomainCard
              key={domain.uid}
              domain={domain}
              certId={certId}
              totalQuestions={score?.totalQuestions}
              correctAnswers={score?.correctAnswers}
              lastPracticed={score?.lastPracticed}
            />
          );
        })}
      </div>
    </div>
  );
}
