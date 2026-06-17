"use client";

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { saveExamResult } from "@/lib/progress";
import type { Question, LearningPath } from "@/types/certification";

const EXAM_DURATION_MINUTES = 60;

export default function ExamPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = use(params);
  const examCode = certId.toUpperCase();

  const [domains, setDomains] = useState<LearningPath[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_MINUTES * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`/api/cert-domains?certCode=${encodeURIComponent(examCode)}`)
      .then((r) => r.json())
      .then((data: LearningPath[]) => setDomains(data))
      .catch(() => setDomains([]));
  }, [certId, examCode]);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleFinish();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished]);

  async function handleStartExam() {
    setLoading(true);
    setError("");

    try {
      // Uma única chamada batch para o exame completo — mais confiável do que por domínio
      const objectives = domains.length > 0
        ? domains.slice(0, 6).map((d) => d.title)
        : [`Core concepts of ${examCode}`, `Services and features in ${examCode}`, `Best practices for ${examCode}`];

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certName: examCode,
          examCode,
          domainTitle: `${examCode} — Simulado Completo`,
          objectives,
          count: 15,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? `Erro ${res.status} ao chamar a API de questões`);
      }

      const qs: Question[] = await res.json();
      if (!Array.isArray(qs) || qs.length === 0) {
        throw new Error("Nenhuma questão foi gerada. Tente novamente.");
      }

      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      setStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao gerar simulado.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(idx: number) {
    if (answers[current] !== null) return;
    setAnswers((prev) => {
      const updated = [...prev];
      updated[current] = idx;
      return updated;
    });
  }

  function handleFinish() {
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
    const score = Math.round((correct / questions.length) * 1000);
    const breakdown = [{ domainId: "full-exam", correct, total: questions.length }];
    saveExamResult(certId, { score, totalQuestions: questions.length, correctAnswers: correct, breakdown });
    setFinished(true);
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Tela de resultado
  if (finished) {
    const correct = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
    const score = Math.round((correct / questions.length) * 1000);
    const passed = score >= 700;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">{passed ? "🎉" : "📚"}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{passed ? "Aprovado!" : "Continue estudando!"}</h1>
        <p className="text-gray-500 mb-8">Simulado {examCode} concluído</p>

        <div className={`inline-block rounded-2xl px-10 py-8 mb-8 ${passed ? "bg-green-50" : "bg-blue-50"}`}>
          <div className={`text-6xl font-bold mb-2 ${passed ? "text-green-600" : "text-blue-600"}`}>{score}</div>
          <div className="text-gray-500">de 1000 pontos · mínimo 700 para aprovação</div>
          <div className="text-sm text-gray-600 mt-2">{correct}/{questions.length} questões corretas</div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/cert/${certId}`} className="px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Ver domínios
          </Link>
          <button
            onClick={() => { setStarted(false); setFinished(false); setQuestions([]); setAnswers([]); setCurrent(0); setTimeLeft(EXAM_DURATION_MINUTES * 60); }}
            className="px-6 py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Refazer simulado
          </button>
        </div>
      </div>
    );
  }

  // Tela de início
  if (!started) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Simulado {examCode}</h1>
        <p className="text-gray-500 mb-8">
          Questões geradas por IA para todos os domínios · Timer de {EXAM_DURATION_MINUTES} minutos · Mínimo 700/1000 para aprovação
        </p>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-left">
            <p className="font-semibold mb-1">Falha ao gerar questões</p>
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleStartExam}
          disabled={loading}
          className="w-full py-4 rounded-xl text-lg font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Gerando questões com IA..." : "Iniciar Simulado →"}
        </button>
        <Link href={`/cert/${certId}`} className="block mt-4 text-sm text-gray-400 hover:underline">
          Voltar
        </Link>
      </div>
    );
  }

  // Prova em andamento
  const question = questions[current];
  const answered = answers[current] !== null;
  const isCorrect = answers[current] === question.correctIndex;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Barra de status */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-500">{current + 1} / {questions.length}</span>
        <span className={`font-mono font-bold text-lg px-3 py-1 rounded-lg ${timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"}`}>
          ⏱ {formatTime(timeLeft)}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Questão */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-4">
        <p className="font-medium text-gray-900 leading-relaxed">{question.text}</p>
      </div>

      {/* Opções */}
      <div className="space-y-3 mb-6">
        {question.options.map((opt, idx) => {
          let style = "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
          if (answered) {
            if (idx === question.correctIndex) style = "border-green-400 bg-green-50";
            else if (idx === answers[current] && !isCorrect) style = "border-red-400 bg-red-50";
            else style = "border-gray-100 bg-gray-50 opacity-50";
          }
          return (
            <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${style}`}>
              <div className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                  answered && idx === question.correctIndex ? "border-green-400 bg-green-400 text-white"
                  : answered && idx === answers[current] && !isCorrect ? "border-red-400 bg-red-400 text-white"
                  : "border-gray-300 text-gray-500"}`}>
                  {["A","B","C","D"][idx]}
                </span>
                <span className="text-sm text-gray-800 pt-0.5 leading-relaxed">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback + navegação */}
      {answered && (
        <>
          <div className={`rounded-xl p-4 mb-4 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
            <p className={`font-semibold mb-1 text-sm ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
              {isCorrect ? "✓ Correto!" : "✗ Incorreto"}
            </p>
            <p className="text-sm text-gray-700">{question.explanation}</p>
          </div>
          {current + 1 < questions.length ? (
            <button onClick={() => setCurrent((c) => c + 1)}
              className="w-full py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Próxima →
            </button>
          ) : (
            <button onClick={handleFinish}
              className="w-full py-3 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors">
              Ver resultado 🎯
            </button>
          )}
        </>
      )}
    </div>
  );
}
