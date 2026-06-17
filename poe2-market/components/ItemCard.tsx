"use client";

import Link from "next/link";
import Image from "next/image";
import { MarketItem } from "@/types/market";
import { formatChaos, formatChange } from "@/lib/poeNinja";
import PriceSparkline from "./PriceSparkline";

interface Props {
  item: MarketItem;
}

export default function ItemCard({ item }: Props) {
  const isUp = item.change24h >= 0;
  const changeColor = isUp ? "text-green-400" : "text-red-400";
  const changeBg = isUp ? "bg-green-400/10" : "bg-red-400/10";
  const borderColor = isUp ? "border-green-500/20 hover:border-green-500/50" : "border-red-500/20 hover:border-red-500/50";

  return (
    <Link
      href={`/item/${item.id}?category=${item.category}`}
      className={`block bg-[#0d1117] border ${borderColor} rounded-xl p-4 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-black/50`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative w-10 h-10 flex-shrink-0 bg-[#1a1a2e] rounded-lg overflow-hidden border border-white/10">
          {item.icon ? (
            <Image
              src={item.icon}
              alt={item.name}
              fill
              className="object-contain p-0.5"
              unoptimized
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-lg">?</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{item.name}</p>
          {item.baseType && (
            <p className="text-xs text-gray-500 truncate">{item.baseType}</p>
          )}
          {item.variant && (
            <p className="text-xs text-amber-400/80 truncate">{item.variant}</p>
          )}
        </div>
        <div className={`${changeBg} ${changeColor} text-xs font-bold px-2 py-1 rounded-md flex-shrink-0`}>
          {formatChange(item.change24h)}
        </div>
      </div>

      {/* Sparkline */}
      <div className="mb-3">
        <PriceSparkline data={item.sparkline} positive={isUp} height={36} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1">
            <img src="/chaos.png" alt="chaos" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span className="text-base font-bold text-amber-400">
              {formatChaos(item.chaosValue)}c
            </span>
          </div>
          {item.divineValue !== undefined && item.divineValue > 0 && (
            <p className="text-xs text-gray-500">{item.divineValue.toFixed(2)} div</p>
          )}
        </div>
        <div className="text-right">
          {item.listingCount !== undefined && (
            <p className="text-xs text-gray-500">{item.listingCount} anúncios</p>
          )}
          <p className="text-xs text-gray-600">{item.count} trades</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-1 mt-2 flex-wrap">
        {item.corrupted && (
          <span className="text-xs bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded">Corrompido</span>
        )}
        {item.links !== undefined && item.links !== null && item.links > 0 && (
          <span className="text-xs bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded">{item.links}L</span>
        )}
        {item.gemLevel !== undefined && item.gemLevel !== null && item.gemLevel > 0 && (
          <span className="text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded">Nv.{item.gemLevel}</span>
        )}
      </div>
    </Link>
  );
}
