"use client";

import Image from "next/image";
import Link from "next/link";
import { InventoryValuation, ValuedItem, SLOT_LABELS, FRAME_LABELS } from "@/types/inventory";
import { formatChaos } from "@/lib/poeNinja";

interface Props {
  data: InventoryValuation;
  league: string;
}

const FRAME_COLORS: Record<number, string> = {
  0: "text-gray-400",
  1: "text-blue-400",
  2: "text-yellow-400",
  3: "text-amber-400 font-semibold",
  4: "text-teal-400",
  5: "text-gray-300",
  6: "text-cyan-400",
  9: "text-purple-400",
};

const FRAME_BORDER: Record<number, string> = {
  0: "border-white/10",
  1: "border-blue-500/30",
  2: "border-yellow-500/30",
  3: "border-amber-500/40",
  4: "border-teal-500/30",
  5: "border-gray-500/30",
  6: "border-cyan-500/30",
  9: "border-purple-500/30",
};

function ItemRow({ item, league }: { item: ValuedItem; league: string }) {
  const colorClass = FRAME_COLORS[item.frameType] ?? "text-gray-400";
  const borderClass = FRAME_BORDER[item.frameType] ?? "border-white/10";
  const hasValue = item.estimatedChaos > 0;
  const slot = item.inventoryId ? SLOT_LABELS[item.inventoryId] ?? item.inventoryId : "—";

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${borderClass} bg-[#0d1117] hover:bg-white/[0.03] transition-colors`}>
      {/* Icon */}
      <div className="relative w-10 h-10 flex-shrink-0 bg-[#1a1a2e] rounded-lg border border-white/10 overflow-hidden">
        {item.icon ? (
          <Image src={item.icon} alt={item.name || item.typeLine} fill className="object-contain p-0.5" unoptimized />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-gray-600 text-lg">?</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`text-sm truncate max-w-[200px] ${colorClass}`}>
            {item.name || item.typeLine}
          </span>
          {item.name && item.typeLine && item.name !== item.typeLine && (
            <span className="text-xs text-gray-500 truncate">{item.typeLine}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-600">{slot}</span>
          <span className="text-gray-700 text-xs">·</span>
          <span className="text-xs text-gray-600">{FRAME_LABELS[item.frameType] ?? "Item"}</span>
          {item.stackSize && item.stackSize > 1 && (
            <>
              <span className="text-gray-700 text-xs">·</span>
              <span className="text-xs text-gray-500">×{item.stackSize}</span>
            </>
          )}
          {item.corrupted && (
            <span className="text-xs bg-red-900/40 text-red-400 px-1.5 rounded">Corrompido</span>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="text-right flex-shrink-0">
        {hasValue ? (
          <>
            <div className="text-sm font-bold text-amber-400">{formatChaos(item.estimatedChaos)}c</div>
            {item.matchedAs && (
              <div className="text-xs text-gray-600 max-w-[120px] truncate text-right">via {item.matchedAs}</div>
            )}
          </>
        ) : (
          <div className="text-xs text-gray-600 italic">sem preço</div>
        )}
      </div>
    </div>
  );
}

export default function InventoryView({ data, league }: Props) {
  const { character, items, totalChaos, unknownCount } = data;

  const valued = items.filter((i) => i.estimatedChaos > 0);
  const unvalued = items.filter((i) => i.estimatedChaos === 0);

  // Grupo por categoria
  const uniques = valued.filter((i) => i.frameType === 3);
  const gems = valued.filter((i) => i.frameType === 4);
  const currency = valued.filter((i) => i.frameType === 5 || i.frameType === 9);
  const other = valued.filter((i) => ![3, 4, 5, 9].includes(i.frameType));

  const divineChaosRate = 300; // estimativa — substituir pelo preço real via poe.ninja
  const totalDivine = totalChaos / divineChaosRate;

  return (
    <div className="space-y-6">
      {/* Character Card */}
      <div className="bg-[#0d1117] border border-amber-500/20 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧙</span>
              <div>
                <h2 className="text-xl font-bold text-white">{character.name}</h2>
                <p className="text-sm text-gray-400">
                  {character.class} · Nv.{character.level} · {character.league}
                </p>
              </div>
            </div>
          </div>

          {/* Net worth */}
          <div className="bg-[#080b10] border border-amber-500/20 rounded-xl p-4 text-right">
            <p className="text-xs text-gray-500 mb-1">Valor estimado total</p>
            <p className="text-3xl font-bold text-amber-400">{formatChaos(totalChaos)}c</p>
            <p className="text-sm text-gray-500">≈ {totalDivine.toFixed(1)} div</p>
            <p className="text-xs text-gray-600 mt-1">
              {items.length} itens · {unknownCount} sem preço
            </p>
          </div>
        </div>

        {/* Progress bars por categoria */}
        {valued.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Únicos", items: uniques, color: "bg-amber-500" },
              { label: "Gemas", items: gems, color: "bg-teal-500" },
              { label: "Moedas", items: currency, color: "bg-gray-400" },
              { label: "Outros", items: other, color: "bg-blue-500" },
            ].map((cat) => {
              const catTotal = cat.items.reduce((s, i) => s + i.estimatedChaos, 0);
              const pct = totalChaos > 0 ? (catTotal / totalChaos) * 100 : 0;
              return (
                <div key={cat.label} className="bg-white/5 rounded-xl p-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">{cat.label}</span>
                    <span className="text-white font-medium">{formatChaos(catTotal)}c</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all`}
                      style={{ width: `${Math.min(pct, 100).toFixed(1)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Itens com valor */}
      {valued.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span className="text-green-400">●</span> Itens com preço ({valued.length})
          </h3>
          <div className="space-y-2">
            {valued.map((item) => (
              <ItemRow key={`${item.id}-${item.inventoryId}`} item={item} league={league} />
            ))}
          </div>
        </div>
      )}

      {/* Itens sem preço */}
      {unvalued.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-2 mb-3">
            <span className="text-gray-600 group-open:hidden">▶</span>
            <span className="text-gray-600 hidden group-open:inline">▼</span>
            Itens sem preço de mercado ({unvalued.length})
          </summary>
          <div className="space-y-2">
            {unvalued.map((item) => (
              <ItemRow key={`${item.id}-${item.inventoryId}`} item={item} league={league} />
            ))}
          </div>
        </details>
      )}

      {/* Link debug */}
      <p className="text-xs text-gray-700 text-center">
        Preços via{" "}
        <a href="https://poe.ninja" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500">
          poe.ninja
        </a>{" "}
        · Itens raros e mágicos não têm preço estimado automaticamente.
      </p>
    </div>
  );
}
