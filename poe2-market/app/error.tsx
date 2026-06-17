"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
      <p className="text-5xl">⚠️</p>
      <h2 className="text-xl font-bold text-white">Algo deu errado</h2>
      <p className="text-sm text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-all"
      >
        Tentar novamente
      </button>
    </div>
  );
}
