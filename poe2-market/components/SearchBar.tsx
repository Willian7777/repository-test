"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  icon: string;
  category: string;
  chaosValue: number;
}

export default function SearchBar({ league }: { league: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const search = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&league=${encodeURIComponent(league)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.slice(0, 8));
        }
      } finally {
        setLoading(false);
      }
    },
    [league]
  );

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 350);
  }

  function handleSelect(item: SearchResult) {
    router.push(`/item/${item.id}?category=${item.category}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-amber-500/50 transition-all">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Buscar item..."
          className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48"
        />
        {loading && (
          <svg className="w-4 h-4 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
          {results.map((item) => (
            <button
              key={item.id}
              onMouseDown={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-left transition-colors"
            >
              {item.icon && (
                <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain" />
              )}
              <span className="text-sm text-white flex-1 truncate">{item.name}</span>
              <span className="text-xs text-amber-400">{item.chaosValue.toFixed(1)}c</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
