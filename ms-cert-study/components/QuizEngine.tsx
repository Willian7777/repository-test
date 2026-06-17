"use client";

import { useState } from "react";
import type { Question } from "@/types/certification";

interface QuizEngineProps {
  questions: Question[];
  certId: string;
  domainTitle: string;
  onComplete?: (correct: number, total: number) => void;
}

export default function QuizEngine({ questions, certId: _certId, domainTitle, onComplete }: QuizEngineProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  const question = questions[current];
  const isCorrect = selected === question?.correctIndex;

  function handleSelect(idx: number) {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    setResults((prev) => [...prev, idx === question.correctIndex]);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setDone(true);
      const totalCorrect = results.filter(Boolean).length + (isCorrect ? 0 : 0);
      // results já inclui a resposta atual
      onComplete?.(results.filter(Boolean).length, questions.length);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setShowFeedback(false);
    setResults([]);
    setDone(false);
  }

  if (done) {
    const totalCorrect = results.filter(Boolean).length;
    const pct = Math.round((totalCorrect / questions.length) * 100);
    const passed = pct >= 70;

    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className={`text-6xl mb-4`}>{passed ? "🎉" : "📚"}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {passed ? "Ótimo resultado!" : "Continue praticando!"}
        </h2>
        <p className="text-gray-500 mb-6">{domainTitle}</p>

        <div className={`inline-block rounded-2xl px-8 py-6 mb-8 ${passed ? "bg-green-50" : "bg-blue-50"}`}>
          <div className={`text-5xl font-bold mb-1 ${passed ? "text-green-600" : "text-blue-600"}`}>
            {pct}%
          </div>
          <div className="text-gray-600 text-sm">
            {totalCorrect} de {questions.length} questões corretas
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRestart}
            className="px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Praticar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progresso */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-500 font-medium">
          {current + 1} / {questions.length}
        </span>
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-500">{domainTitle}</span>
      </div>

      {/* Questão */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-4">
        <p className="text-gray-900 font-medium text-base leading-relaxed">{question.text}</p>
      </div>

      {/* Opções */}
      <div className="space-y-3 mb-4">
        {question.options.map((option, idx) => {
          let style = "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
          if (showFeedback) {
            if (idx === question.correctIndex) {
              style = "border-green-400 bg-green-50 cursor-default";
            } else if (idx === selected && !isCorrect) {
              style = "border-red-400 bg-red-50 cursor-default";
            } else {
              style = "border-gray-100 bg-gray-50 opacity-60 cursor-default";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${style}`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                  showFeedback && idx === question.correctIndex
                    ? "border-green-400 bg-green-400 text-white"
                    : showFeedback && idx === selected && !isCorrect
                    ? "border-red-400 bg-red-400 text-white"
                    : "border-gray-300 text-gray-500"
                }`}>
                  {["A", "B", "C", "D"][idx]}
                </span>
                <span className="text-sm text-gray-800 leading-relaxed pt-0.5">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`rounded-xl p-4 mb-4 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
          <div className={`font-semibold mb-1 ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
            {isCorrect ? "✓ Correto!" : "✗ Resposta incorreta"}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Botão próxima */}
      {showFeedback && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {current + 1 >= questions.length ? "Ver resultado" : "Próxima questão →"}
        </button>
      )}
    </div>
  );
}
