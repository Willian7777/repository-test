"use client";

interface CertFiltersProps {
  search: string;
  product: string;
  level: string;
  onSearchChange: (v: string) => void;
  onProductChange: (v: string) => void;
  onLevelChange: (v: string) => void;
  onClear: () => void;
}

const PRODUCTS = ["Azure", "Microsoft 365", "GitHub", "Power Platform", "Dynamics 365", "Windows Server"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function CertFilters({
  search,
  product,
  level,
  onSearchChange,
  onProductChange,
  onLevelChange,
  onClear,
}: CertFiltersProps) {
  const hasFilters = search || product || level;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou código (ex: AZ-104)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Produto */}
        <select
          value={product}
          onChange={(e) => onProductChange(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Todos os produtos</option>
          {PRODUCTS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Nível */}
        <select
          value={level}
          onChange={(e) => onLevelChange(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Todos os níveis</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l === "Beginner" ? "Fundamental" : l === "Intermediate" ? "Associado" : "Expert"}</option>
          ))}
        </select>

        {/* Limpar */}
        {hasFilters && (
          <button
            onClick={onClear}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Limpar ✕
          </button>
        )}
      </div>
    </div>
  );
}
