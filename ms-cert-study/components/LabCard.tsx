interface LabCardProps {
  title: string;
  description?: string;
  url: string;
  durationMin?: number;
  isFree?: boolean;
}

export default function LabCard({ title, description, url, durationMin, isFree = true }: LabCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 hover:shadow-md hover:border-emerald-400 transition-all"
    >
      {/* Ícone lab */}
      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex-shrink-0 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {title}
          </h4>
          {isFree && (
            <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 flex-shrink-0">
              Grátis
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-emerald-600 font-medium">Laboratório Prático</span>
          {durationMin && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">{durationMin} min</span>
            </>
          )}
          <span className="text-xs text-emerald-600 ml-auto">Abrir lab ↗</span>
        </div>
      </div>
    </a>
  );
}
