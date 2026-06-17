"use client";

import Link from "next/link";
import type { CertMetadata } from "@/types/certification";

interface CertCardProps {
  cert: CertMetadata;
  isAdded?: boolean;
  isPassed?: boolean;
  score?: number | null;
  onAdd?: (certId: string) => void;
}

export default function CertCard({ cert, isAdded, isPassed, score, onAdd }: CertCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getLevelStyle(cert.level)}`}>
              {cert.level === "Beginner" ? "Fundamental" : cert.level === "Intermediate" ? "Associado" : "Expert"}
            </span>
            <span className="text-xs font-mono text-gray-500 font-semibold">{cert.examCode}</span>
            {isPassed && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                ✓ Aprovado
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 leading-snug text-sm">{cert.name}</h3>
        </div>

        {/* Score */}
        {score !== null && score !== undefined && (
          <div className={`text-right flex-shrink-0 ${score >= 700 ? "text-green-600" : "text-red-500"}`}>
            <div className="text-lg font-bold">{score}</div>
            <div className="text-xs">/ 1000</div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap">
        <span className="px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600">{cert.product}</span>
        <span className="px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600">{cert.role}</span>
      </div>

      {/* Ações */}
      <div className="flex gap-2 mt-auto pt-1">
        {isAdded ? (
          <Link
            href={`/cert/${cert.id}`}
            className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Estudar
          </Link>
        ) : (
          <button
            onClick={() => onAdd?.(cert.id)}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            + Adicionar
          </button>
        )}
        <a
          href={cert.learnUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors border border-gray-200"
          title="Ver no Microsoft Learn"
        >
          Learn ↗
        </a>
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
