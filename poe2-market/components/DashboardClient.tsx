"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MarketItem, ItemCategory, CategorySummary } from "@/types/market";
import { CATEGORY_CONFIG, getMarketItems, getTopMovers } from "@/lib/poeNinja";
import ItemCard from "./ItemCard";
import CategoryGrid from "./CategoryGrid";
import MarketTicker from "./MarketTicker";
import LeagueSelector from "./LeagueSelector";
import SearchBar from "./SearchBar";

const LEAGUE_LIST = [
  { id: "Runes of Aldur", label: "Runes of Aldur" },
  { id: "Hardcore Runes of Aldur", label: "HC Runes of Aldur" },
  { id: "Standard", label: "Standard" },
  { id: "Hardcore", label: "Hardcore" },
];

const OVERVIEW_CATEGORIES: ItemCategory[] = [
  "Currency",
  "Fragment",
  "UniqueWeapon",
  "UniqueArmour",
  "UniqueAccessory",
  "SkillGem",
  "Divination",
  "UniqueJewel",
];

function buildCategorySummary(items: MarketItem[], category: ItemCategory): CategorySummary {
  const config = CATEGORY_CONFIG[category];
  const active = items.filter((i) => i.count > 0);
  const avgChange = active.length > 0
    ? active.reduce((s, i) => s + i.change24h, 0) / active.length
    : 0;
  const topMover = [...active].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))[0] ?? null;
  const topItems = [...active].sort((a, b) => b.chaosValue - a.chaosValue).slice(0, 5);
  return { type: category, label: config.label, icon: config.icon, topMover, avgChange, itemCount: active.length, topItems };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded-xl ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-36" />)}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ league, onRetry }: { league: string; onRetry: () => void }) {
  const [detecting, setDetecting] = useState(false);
  const [detectResult, setDetectResult] = useState<string | null>(null);

  async function autoDetect() {
    setDetecting(true);
    setDetectResult(null);
    const candidates = [
      "Runes of Aldur", "Dawn of the Hunt", "Mercenaries",
      "Settlers of Kalguur", "Standard", "Hardcore",
      "Hardcore Runes of Aldur", "Hardcore Dawn of the Hunt",
    ];
    const results: string[] = [];
    for (const name of candidates) {
      try {
        const url = `https://poe.ninja/api/data/currencyoverview?league=${encodeURIComponent(name)}&type=Currency&language=en&game=poe2`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const data = await res.json();
          const count = data.lines?.length ?? 0;
          results.push(`${count > 0 ? "✅" : "🔶"} "${name}" → ${count} moedas (HTTP 200)`);
        } else {
          results.push(`❌ "${name}" → HTTP ${res.status}`);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message.split(":")[0] : "erro";
        results.push(`⚠️ "${name}" → ${msg}`);
      }
    }
    setDetectResult(results.join("\n"));
    setDetecting(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <p className="text-5xl">⚗️</p>
      <h2 className="text-xl font-bold text-white">Sem dados para esta liga</h2>
      <p className="text-sm text-gray-500">
        O poe.ninja pode não ter dados para{" "}
        <span className="text-amber-400 font-semibold">{league}</span> ainda,
        ou o nome da liga pode estar diferente.
      </p>

      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-all"
        >
          Tentar novamente
        </button>
        <button
          onClick={autoDetect}
          disabled={detecting}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {detecting && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {detecting ? "Detectando..." : "🔍 Auto-detectar liga"}
        </button>
      </div>

      {detectResult && (
        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 text-left text-xs font-mono text-gray-300 space-y-1 whitespace-pre-wrap">
          <p className="text-gray-500 font-sans text-xs mb-2 font-medium">
            Resultados — clique no botão ✏️ na navbar para digitar o nome correto:
          </p>
          {detectResult}
        </div>
      )}

      <p className="text-xs text-gray-600">
        Use o botão <span className="text-amber-500">✏️</span> na seleção de liga (navbar) para digitar o nome exato.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") ?? "Runes of Aldur";

  const [topMovers, setTopMovers] = useState<MarketItem[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    // Fetches direto do browser → poe.ninja (com fallback via proxy CORS)
    const [movers, ...itemResults] = await Promise.all([
      getTopMovers(league, 30).catch(() => [] as MarketItem[]),
      ...OVERVIEW_CATEGORIES.map((cat) =>
        getMarketItems(league, cat).catch(() => [] as MarketItem[])
      ),
    ]);

    setTopMovers(movers);
    const summaries = (itemResults as MarketItem[][]).map((items, idx) =>
      buildCategorySummary(items, OVERVIEW_CATEGORIES[idx])
    );
    setCategories(summaries);
    const totalItems = summaries.reduce((s, c) => s + c.itemCount, 0);
    setHasData(movers.length > 0 || totalItems > 0);
    setLoading(false);
  }, [league]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <DashboardSkeleton />;
  if (!hasData) return <EmptyState league={league} onRetry={load} />;

  const gainers = topMovers.filter((i) => i.change24h > 0).slice(0, 4);
  const losers = topMovers.filter((i) => i.change24h < 0).slice(0, 4);
  const totalItems = categories.reduce((s, c) => s + c.itemCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Ticker */}
      {topMovers.length > 0 && (
        <div className="-mx-4">
          <MarketTicker items={topMovers} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Mercado <span className="text-amber-400">Path of Exile 2</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalItems} itens monitorados · atualizado a cada 5 min
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <LeagueSelector leagues={LEAGUE_LIST} currentLeague={league} />
          <SearchBar league={league} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Categorias", value: OVERVIEW_CATEGORIES.length.toString(), icon: "📊" },
          { label: "Itens ativos", value: totalItems > 1000 ? `${(totalItems / 1000).toFixed(1)}k` : totalItems.toString(), icon: "🏷️" },
          { label: "Liga atual", value: league, icon: "🌐" },
          { label: "Fonte", value: "poe.ninja", icon: "📡" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0d1117] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span>{stat.icon}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="text-sm font-bold text-white truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Gainers & Losers */}
      {(gainers.length > 0 || losers.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <span>▲</span> Maiores Altas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {gainers.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <span>▼</span> Maiores Baixas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {losers.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>
        </div>
      )}

      {/* Category grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Visão por Categoria</h2>
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}
