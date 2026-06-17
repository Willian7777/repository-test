"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MarketItem, ItemCategory } from "@/types/market";
import { formatChaos, formatChange, CATEGORY_CONFIG } from "@/lib/poeNinja";
import PriceChart from "@/components/PriceChart";

interface Props {
  params: Promise<{ id: string }>;
}

function ItemDetailContent({ itemId }: { itemId: string }) {
  const searchParams = useSearchParams();
  const league = searchParams.get("league") ?? "Standard";
  const category = searchParams.get("category") as ItemCategory | null;

  const [item, setItem] = useState<MarketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!category) return;

    setLoading(true);
    fetch(`/api/items?category=${category}&league=${encodeURIComponent(league)}`)
      .then((r) => r.json())
      .then((items: MarketItem[]) => {
        const found = items.find((i) => i.id === itemId);
        setItem(found ?? null);
        if (!found) setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [itemId, category, league]);

  const config = category ? CATEGORY_CONFIG[category] : null;
  const isUp = (item?.change24h ?? 0) >= 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Carregando dados de mercado...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😵</p>
        <h2 className="text-xl font-bold text-white mb-2">Item não encontrado</h2>
        <p className="text-gray-500 mb-6">Este item pode não estar disponível na liga {league}.</p>
        <Link href="/" className="px-4 py-2 bg-amber-500 text-black rounded-xl font-semibold text-sm hover:bg-amber-400">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const hasChart = item.sparkline.some((v) => v !== null);
  const poeNinjaUrl = `https://poe.ninja/economy/poe2/${config?.apiType.toLowerCase() ?? "currency"}?name=${encodeURIComponent(item.name)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        {config && (
          <>
            <Link href={`/category/${category}?league=${league}`} className="hover:text-white transition-colors">
              {config.label}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-white truncate max-w-[200px]">{item.name}</span>
      </nav>

      {/* Item Header */}
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 flex-shrink-0 bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
            {item.icon && (
              <Image src={item.icon} alt={item.name} fill className="object-contain p-1" unoptimized />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-white">{item.name}</h1>
                {item.baseType && <p className="text-sm text-gray-400 mt-0.5">{item.baseType}</p>}
                {item.variant && (
                  <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded mt-1 inline-block">
                    {item.variant}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-400">{formatChaos(item.chaosValue)}c</div>
                {item.divineValue !== undefined && item.divineValue > 0 && (
                  <p className="text-sm text-gray-400">{item.divineValue.toFixed(2)} divinos</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                <span>{isUp ? "▲" : "▼"}</span>
                <span className="font-bold">{formatChange(item.change24h)}</span>
                <span className="text-xs opacity-70">7 dias</span>
              </div>
              {item.count > 0 && (
                <div className="text-sm text-gray-500">
                  <span className="text-white font-medium">{item.count}</span> transações
                </div>
              )}
              {item.listingCount !== undefined && item.listingCount > 0 && (
                <div className="text-sm text-gray-500">
                  <span className="text-white font-medium">{item.listingCount}</span> anúncios
                </div>
              )}
              {item.corrupted && (
                <span className="text-xs bg-red-900/40 text-red-400 px-2 py-1 rounded">Corrompido</span>
              )}
              {item.links != null && item.links > 0 && (
                <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">{item.links} links</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      {hasChart && (
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">Histórico de preço (últimos 7 dias)</h2>
          <PriceChart data={item.sparkline} positive={isUp} />
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Preço atual", value: `${formatChaos(item.chaosValue)}c`, sub: item.divineValue ? `${item.divineValue.toFixed(2)} div` : undefined, color: "text-amber-400" },
          { label: "Variação 7d", value: formatChange(item.change24h), sub: isUp ? "Em alta" : "Em baixa", color: isUp ? "text-green-400" : "text-red-400" },
          { label: "Volume", value: item.count.toString(), sub: "transações registradas", color: "text-white" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#0d1117] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            {stat.sub && <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="text-center">
        <a
          href={poeNinjaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
        >
          Ver no poe.ninja ↗
        </a>
      </div>
    </div>
  );
}

export default function ItemDetailPage({ params }: Props) {
  const [itemId, setItemId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setItemId(p.id));
  }, [params]);

  if (!itemId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ItemDetailContent itemId={itemId} />
    </Suspense>
  );
}

