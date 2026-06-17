"use client";

import Link from "next/link";
import { CategorySummary } from "@/types/market";
import { formatChaos, formatChange } from "@/lib/poeNinja";
import Image from "next/image";

interface Props {
  categories: CategorySummary[];
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((cat) => {
        const avgUp = cat.avgChange >= 0;
        return (
          <Link
            key={cat.type}
            href={`/category/${cat.type}`}
            className="bg-[#0d1117] border border-white/10 rounded-xl p-4 hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-900/10 group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-gray-500">{cat.itemCount} itens</p>
                </div>
              </div>
              <div className={`text-sm font-bold ${avgUp ? "text-green-400" : "text-red-400"}`}>
                {formatChange(cat.avgChange)}
              </div>
            </div>

            {/* Top mover */}
            {cat.topMover && (
              <div className="bg-white/5 rounded-lg p-2 mb-3">
                <p className="text-xs text-gray-500 mb-1">Maior variação</p>
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 flex-shrink-0">
                    {cat.topMover.icon && (
                      <Image
                        src={cat.topMover.icon}
                        alt={cat.topMover.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    )}
                  </div>
                  <span className="text-xs text-white truncate flex-1">{cat.topMover.name}</span>
                  <span className={`text-xs font-bold ${cat.topMover.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatChange(cat.topMover.change24h)}
                  </span>
                </div>
              </div>
            )}

            {/* Top 3 prices */}
            <div className="space-y-1">
              {cat.topItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 truncate max-w-[60%]">{item.name}</span>
                  <span className="text-xs text-amber-400 font-medium">{formatChaos(item.chaosValue)}c</span>
                </div>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
