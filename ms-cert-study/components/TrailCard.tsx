"use client";

import Link from "next/link";
import type { Trail } from "@/types/trail";

interface TrailCardProps {
  trail: Trail;
  completedCount?: number;
  inProgressCount?: number;
}

export default function TrailCard({ trail, completedCount = 0, inProgressCount = 0 }: TrailCardProps) {
  const total = trail.steps.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <Link href={`/trails/${trail.id}`} className="group block">
      <div className={`rounded-2xl border-2 ${trail.borderColor} bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}>
        {/* Ícone + nome */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${trail.color} text-white flex-shrink-0`}>
            {trail.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-gray-700">
              {trail.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} certificação{total !== 1 ? "ões" : ""}
            </p>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{trail.description}</p>

        {/* Progressão rápida */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {trail.steps.map((step, idx) => (
            <div key={step.certId} className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  getLevelStyle(step.level)
                }`}
              >
                {step.examCode}
              </span>
              {idx < trail.steps.length - 1 && (
                <span className="text-gray-300 text-xs">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Barra de progresso */}
        {(completedCount > 0 || inProgressCount > 0) ? (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{completedCount}/{total} concluídas</span>
              <span className={`font-semibold ${trail.textColor}`}>{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${trail.color}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : (
          <div className={`text-xs font-medium ${trail.textColor} flex items-center gap-1`}>
            <span>Começar trilha</span>
            <span>→</span>
          </div>
        )}
      </div>
    </Link>
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
