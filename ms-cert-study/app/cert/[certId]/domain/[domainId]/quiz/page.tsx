"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import QuizEngine from "@/components/QuizEngine";
import { saveDomainScore } from "@/lib/progress";
import type { Question, LearningPath } from "@/types/certification";

export default function QuizPage({
  params,
}: {
  params: Promise<{ certId: string; domainId: string }>;
}) {
  const { certId, domainId } = use(params);
  const examCode = certId.toUpperCase();

  const [domain, setDomain] = useState<LearningPath | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(5);

  // Busca o domínio para pegar título e objetivos
  useEffect(() => {
    fetch(`/api/cert-domains?certCode=${encodeURIComponent(examCode)}`)
      .then((r) => r.json())
      .then((paths: LearningPath[]) => {
        const found = paths.find(
          (p) => p.uid.replace(/\./g, "-") === domainId || p.uid === domainId
        );
        setDomain(found ?? null);
      })
      .catch(() => setDomain(null));
  }, [certId, domainId, examCode]);

  async function handleStart() {
    if (!domain) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certName: examCode,
          examCode,
          domainTitle: domain.title,
          objectives: domain.modules?.map((m) => m.title) ?? [domain.title],
          count,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? `Erro ${res.status} ao chamar a API de questões`);
      }

      const data: Question[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Nenhuma questão foi gerada. Tente novamente.");
      }
      setQuestions(data);
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar questões. Verifique o GROQ_API_KEY no .env.local.");
    } finally {
      setLoading(false);
    }
  }

  function handleComplete(correct: number, total: number) {
    saveDomainScore(certId, {
      domainId,
      certId,
      totalQuestions: total,
      correctAnswers: correct,
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href={`/cert/${certId}`} className="hover:text-blue-600">{examCode}</Link>
        <span>/</span>
        <span className="text-gray-700 truncate">{domain?.title ?? domainId}</span>
        <span>/</span>
        <span className="text-gray-700">Praticar</span>
      </div>

      {!ready ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Praticar questões</h1>
          <p className="text-gray-500 mb-6">
            {domain ? domain.title : "Carregando domínio..."}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantas questões?
            </label>
            <div className="flex gap-2 justify-center">
              {[5, 10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-5 py-2 rounded-xl font-semibold border-2 transition-colors ${
                    count === n
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !domain}
            className="w-full py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Gerando questões com IA..." : "Começar →"}
          </button>

          <p className="text-xs text-gray-400 mt-3">
            Questões geradas via Groq (Llama 3) baseadas nos objetivos oficiais da {examCode}.
          </p>
        </div>
      ) : (
        <QuizEngine
          questions={questions}
          certId={certId}
          domainTitle={domain?.title ?? domainId}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
