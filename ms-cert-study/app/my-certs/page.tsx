"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyCerts, getCertProgress, getCertOverallScore, isCertPassed } from "@/lib/progress";

interface MyCertSummary {
  certId: string;
  addedAt: string;
  score: number | null;
  passed: boolean;
  domainsDone: number;
  domainsTotal: number;
}

export default function MyCertsPage() {
  const [summaries, setSummaries] = useState<MyCertSummary[]>([]);

  useEffect(() => {
    const ids = getMyCerts();
    const result: MyCertSummary[] = ids.map((certId) => {
      const prog = getCertProgress(certId);
      return {
        certId,
        addedAt: prog?.addedAt ?? new Date().toISOString(),
        score: getCertOverallScore(certId),
        passed: isCertPassed(certId),
        domainsDone: prog?.domainScores.filter((d) => d.totalQuestions > 0).length ?? 0,
        domainsTotal: prog?.domainScores.length ?? 0,
      };
    });
    setSummaries(result);
  }, []);

  if (summaries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma certificação ainda</h1>
        <p className="text-gray-500 mb-6">Adicione certificações do catálogo ou siga uma trilha de carreira.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/trails" className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Ver trilhas
          </Link>
          <Link href="/catalog" className="px-5 py-2.5 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  const passed = summaries.filter((s) => s.passed);
  const inProgress = summaries.filter((s) => !s.passed);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Estudos</h1>
        <div className="flex gap-6 text-sm text-gray-500">
          <span>{summaries.length} certificaç{summaries.length === 1 ? "ão" : "ões"}</span>
          <span className="text-green-600 font-medium">{passed.length} aprovado{passed.length !== 1 ? "s" : ""}</span>
          <span>{inProgress.length} em andamento</span>
        </div>
      </div>

      {/* Em andamento */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Em andamento</h2>
          <div className="space-y-3">
            {inProgress.map((s) => (
              <CertStudyCard key={s.certId} summary={s} />
            ))}
          </div>
        </div>
      )}

      {/* Concluídos */}
      {passed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Aprovados ✓</h2>
          <div className="space-y-3">
            {passed.map((s) => (
              <CertStudyCard key={s.certId} summary={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CertStudyCard({ summary }: { summary: MyCertSummary }) {
  const examCode = summary.certId.toUpperCase().replace(/-([a-z])/g, (_, c: string) => `-${c.toUpperCase()}`);

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm flex items-center gap-4 ${summary.passed ? "border-green-200" : "border-gray-200"}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${summary.passed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
        {summary.passed ? "✓" : examCode.slice(0, 3)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900">{examCode}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          Adicionado em {new Date(summary.addedAt).toLocaleDateString("pt-BR")}
        </div>
        {summary.score !== null && (
          <div className={`text-sm font-semibold mt-1 ${summary.passed ? "text-green-600" : "text-blue-600"}`}>
            Melhor score: {summary.score} / 1000
          </div>
        )}
      </div>

      <Link
        href={`/cert/${summary.certId}`}
        className={`px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0 transition-colors ${
          summary.passed
            ? "border border-green-200 text-green-700 hover:bg-green-50"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {summary.passed ? "Revisar" : "Estudar →"}
      </Link>
    </div>
  );
}
