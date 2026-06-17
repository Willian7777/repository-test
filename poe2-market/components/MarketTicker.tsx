"use client";

import { MarketItem } from "@/types/market";
import { formatChaos, formatChange } from "@/lib/poeNinja";
import Image from "next/image";

interface Props {
  items: MarketItem[];
}

export default function MarketTicker({ items }: Props) {
  if (items.length === 0) return null;

  const doubled = [...items, ...items]; // loop infinito

  return (
    <div className="w-full overflow-hidden bg-[#0d1117] border-b border-white/5 py-2 relative">
      {/* fade edges */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0d1117] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0d1117] to-transparent z-10 pointer-events-none" />

      <div className="flex gap-6 animate-ticker" style={{ width: "max-content" }}>
        {doubled.map((item, idx) => {
          const isUp = item.change24h >= 0;
          return (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-2 px-2 select-none">
              <div className="relative w-5 h-5 flex-shrink-0">
                {item.icon && (
                  <Image src={item.icon} alt={item.name} fill className="object-contain" unoptimized />
                )}
              </div>
              <span className="text-xs text-gray-300 font-medium whitespace-nowrap">
                {item.name}
              </span>
              <span className="text-xs text-amber-400 font-bold">
                {formatChaos(item.chaosValue)}c
              </span>
              <span className={`text-xs font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>
                {formatChange(item.change24h)}
              </span>
              <span className="text-gray-700 text-xs">│</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
