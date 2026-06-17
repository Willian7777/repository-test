export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-white/5 rounded-xl w-72" />
          <div className="h-4 bg-white/5 rounded-xl w-48" />
        </div>
        <div className="h-9 bg-white/5 rounded-xl w-48" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="h-5 bg-white/5 rounded w-32" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-5 bg-white/5 rounded w-32" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 bg-white/5 rounded w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
