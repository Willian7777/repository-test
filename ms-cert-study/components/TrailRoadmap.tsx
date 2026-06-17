"use client";

import Link from "next/link";
import type { Trail, TrailStep, TrailStepStatus } from "@/types/trail";

interface TrailRoadmapProps {
  trail: Trail;
  stepStatuses: Record<string, TrailStepStatus>; // certId → status
  onFollowTrail?: () => void;
}

export default function TrailRoadmap({ trail, stepStatuses, onFollowTrail }: TrailRoadmapProps) {
  const allDone = trail.steps.every((s) => stepStatuses[s.certId] === "done");
  const anyStarted = trail.steps.some((s) => stepStatuses[s.certId] !== "locked");

  return (
    <div className="space-y-0">
      {/* Header da trilha */}
      <div className={`rounded-2xl ${trail.color} text-white p-6 mb-8`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{trail.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{trail.name}</h1>
            <p className="text-white/80 mt-1">{trail.description}</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-4 flex gap-6 text-sm text-white/90">
          <span>{trail.steps.length} certificações</span>
          <span>
            {trail.steps.filter((s) => stepStatuses[s.certId] === "done").length} concluídas
          </span>
          <span>
            {trail.steps.filter((s) => stepStatuses[s.certId] === "current").length} em andamento
          </span>
        </div>
      </div>

      {/* Botão Seguir Trilha */}
      {!allDone && (
        <div className="mb-6">
          <button
            onClick={onFollowTrail}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white transition-all ${trail.color} hover:opacity-90 shadow`}
          >
            {anyStarted ? "Continuar trilha" : "Seguir esta trilha"}
          </button>
          {!anyStarted && (
            <p className="text-sm text-gray-500 mt-2">
              Adiciona todas as certificações ao seu plano de estudos.
            </p>
          )}
        </div>
      )}

      {/* Roadmap de steps */}
      <div className="space-y-4">
        {trail.steps.map((step, idx) => {
          const status = stepStatuses[step.certId] ?? "locked";
          return (
            <div key={step.certId} className="flex gap-4">
              {/* Linha vertical */}
              <div className="flex flex-col items-center">
                <StepIndicator status={status} color={trail.color} />
                {idx < trail.steps.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 mt-2 ${
                      status === "done" ? trail.color.replace("bg-", "bg-") : "bg-gray-200"
                    }`}
                    style={{ minHeight: 32 }}
                  />
                )}
              </div>

              {/* Conteúdo do step */}
              <StepCard step={step} status={status} trail={trail} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepIndicator({ status, color }: { status: TrailStepStatus; color: string }) {
  if (status === "done") {
    return (
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === "current") {
    return (
      <div className={`w-10 h-10 rounded-full border-2 ${color.replace("bg-", "border-")} flex items-center justify-center flex-shrink-0 bg-white`}>
        <div className={`w-4 h-4 rounded-full ${color}`} />
      </div>
    );
  }
  // locked
  return (
    <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50">
      <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
  );
}

function StepCard({
  step,
  status,
  trail,
}: {
  step: TrailStep;
  status: TrailStepStatus;
  trail: Trail;
}) {
  const isLocked = status === "locked";

  return (
    <div
      className={`flex-1 rounded-xl border p-4 mb-4 transition-all ${
        isLocked
          ? "border-gray-100 bg-gray-50"
          : status === "done"
          ? "border-green-200 bg-green-50"
          : `border-2 ${trail.borderColor} bg-white shadow-sm`
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Badge de nível + código */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getLevelStyle(step.level)}`}
            >
              {step.level}
            </span>
            <span className={`text-xs font-mono font-semibold ${isLocked ? "text-gray-400" : "text-gray-600"}`}>
              {step.examCode}
            </span>
            {step.isRecommended && status === "locked" && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Comece aqui
              </span>
            )}
            {status === "done" && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                ✓ Concluído
              </span>
            )}
            {status === "current" && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${trail.color} text-white`}>
                Em andamento
              </span>
            )}
          </div>

          {/* Nome + descrição */}
          <h3 className={`font-semibold text-base ${isLocked ? "text-gray-400" : "text-gray-900"}`}>
            {step.certName}
          </h3>
          <p className={`text-sm mt-1 ${isLocked ? "text-gray-400" : "text-gray-600"}`}>
            {step.description}
          </p>
        </div>

        {/* Botão de ação */}
        {!isLocked && (
          <Link
            href={`/cert/${step.certId}`}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0 transition-opacity hover:opacity-90 ${trail.color}`}
          >
            {status === "done" ? "Ver detalhes" : "Estudar"}
          </Link>
        )}
      </div>
    </div>
  );
}

function getLevelStyle(level: string): string {
  switch (level) {
    case "Beginner":
      return "bg-green-50 text-green-700 border-green-200";
    case "Intermediate":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Advanced":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}
