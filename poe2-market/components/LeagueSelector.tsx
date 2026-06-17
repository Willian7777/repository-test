"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  leagues: { id: string; label: string }[];
  currentLeague: string;
}

export default function LeagueSelector({ leagues, currentLeague }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentLeague);
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  function handleChange(id: string) {
    setSelected(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("league", id);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (custom.trim()) handleChange(custom.trim());
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-medium">Liga:</span>
      <div className="flex gap-1 flex-wrap">
        {leagues.map((l) => (
          <button
            key={l.id}
            onClick={() => handleChange(l.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selected === l.id && !showCustom
                ? "bg-amber-500 text-black"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          title="Digitar nome de liga personalizado"
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            showCustom
              ? "bg-amber-500 text-black"
              : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
          }`}
        >
          ✏️
        </button>
      </div>

      {showCustom && (
        <form onSubmit={handleCustomSubmit} className="flex gap-1">
          <input
            autoFocus
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Nome exato da liga (ex: Dawn of the Hunt)"
            className="bg-[#0d1117] border border-amber-500/40 rounded-lg px-3 py-1 text-xs text-white placeholder-gray-600 outline-none focus:border-amber-500 w-64"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all"
          >
            OK
          </button>
        </form>
      )}
    </div>
  );
}
