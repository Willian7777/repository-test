import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMarketItems, CATEGORY_CONFIG, formatChange, formatChaos } from "@/lib/poeNinja";
import { ItemCategory } from "@/types/market";
import ItemCard from "@/components/ItemCard";

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ league?: string; sort?: string; q?: string }>;
}

const VALID_CATEGORIES = Object.keys(CATEGORY_CONFIG) as ItemCategory[];

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { league = "Standard", sort = "value", q = "" } = await searchParams;

  if (!VALID_CATEGORIES.includes(type as ItemCategory)) {
    notFound();
  }

  const category = type as ItemCategory;
  const config = CATEGORY_CONFIG[category];

  const allItems = await getMarketItems(league, category).catch(() => []);

  let items = allItems.filter((i) => i.count > 0);

  // Filter by search
  if (q) {
    items = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  }

  // Sort
  if (sort === "change-desc") {
    items = [...items].sort((a, b) => b.change24h - a.change24h);
  } else if (sort === "change-asc") {
    items = [...items].sort((a, b) => a.change24h - b.change24h);
  } else if (sort === "volume") {
    items = [...items].sort((a, b) => b.count - a.count);
  } else {
    // default: by value desc
    items = [...items].sort((a, b) => b.chaosValue - a.chaosValue);
  }

  const avgChange =
    items.length > 0
      ? items.reduce((s, i) => s + i.change24h, 0) / items.length
      : 0;
  const gainers = items.filter((i) => i.change24h > 0).length;
  const losers = items.filter((i) => i.change24h < 0).length;

  const sortOptions = [
    { value: "value", label: "Maior valor" },
    { value: "change-desc", label: "Maior alta" },
    { value: "change-asc", label: "Maior queda" },
    { value: "volume", label: "Maior volume" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-white">{config.label}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{config.label}</h1>
            <p className="text-sm text-gray-500">
              {items.length} itens · Liga: <span className="text-amber-400">{league}</span>
            </p>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex gap-3">
          <div className="bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-gray-500">Var. média</p>
            <p className={`text-sm font-bold ${avgChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatChange(avgChange)}
            </p>
          </div>
          <div className="bg-[#0d1117] border border-green-500/20 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-gray-500">Em alta</p>
            <p className="text-sm font-bold text-green-400">▲ {gainers}</p>
          </div>
          <div className="bg-[#0d1117] border border-red-500/20 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-gray-500">Em baixa</p>
            <p className="text-sm font-bold text-red-400">▼ {losers}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form method="GET" className="flex-1">
          <input type="hidden" name="league" value={league} />
          <input type="hidden" name="sort" value={sort} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={`Buscar em ${config.label}...`}
            className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 transition-all"
          />
        </form>

        {/* Sort */}
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map((opt) => {
            const params = new URLSearchParams({ league, sort: opt.value, q });
            return (
              <Link
                key={opt.value}
                href={`/category/${type}?${params}`}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  sort === opt.value
                    ? "bg-amber-500 text-black"
                    : "bg-[#0d1117] border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-4">🔍</p>
          <p>Nenhum item encontrado</p>
        </div>
      )}
    </div>
  );
}
