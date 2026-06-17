"use client";

import Link from "next/link";
import type { LearningPath } from "@/types/certification";

interface DomainCardProps {
  domain: LearningPath;
  certId: string;
  totalQuestions?: number;
  correctAnswers?: number;
  lastPracticed?: string;
}

export default function DomainCard({
  domain,
  certId,
  totalQuestions = 0,
  correctAnswers = 0,
  lastPracticed,
}: DomainCardProps) {
  const domainId = domain.uid.replace(/\./g, "-");
  const progressPct = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const hasPracticed = totalQuestions > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Título */}
      <h3 className="font-semibold text-gray-900 mb-1 leading-snug">{domain.title}</h3>
      {domain.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{domain.description}</p>
      )}

      {/* Progresso */}
      {hasPracticed ? (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{correctAnswers}/{totalQuestions} corretas</span>
            <span className={`font-bold ${progressPct >= 70 ? "text-green-600" : "text-blue-600"}`}>
              {progressPct}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${progressPct >= 70 ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {lastPracticed && (
            <p className="text-xs text-gray-400 mt-1">
              Praticado em {new Date(lastPracticed).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="w-full bg-gray-100 rounded-full h-2" />
          <p className="text-xs text-gray-400 mt-1">Ainda não praticado</p>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2">
        <Link
          href={`/cert/${certId}/domain/${domainId}/quiz`}
          className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Praticar
        </Link>
        <Link
          href={`/cert/${certId}/domain/${domainId}`}
          className="px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Ver conteúdo
        </Link>
      </div>
    </div>
  );
}
