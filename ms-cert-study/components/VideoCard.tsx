interface VideoCardProps {
  title: string;
  description?: string;
  url: string;
  durationMin?: number;
  source?: string; // "Microsoft Learn" | "YouTube"
}

export default function VideoCard({ title, description, url, durationMin, source = "Microsoft Learn" }: VideoCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md hover:border-blue-200 transition-all"
    >
      {/* Thumbnail placeholder */}
      <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex-shrink-0 flex items-center justify-center">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400">{source}</span>
          {durationMin && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">{durationMin} min</span>
            </>
          )}
          <span className="text-xs text-blue-500 ml-auto">Assistir ↗</span>
        </div>
      </div>
    </a>
  );
}
