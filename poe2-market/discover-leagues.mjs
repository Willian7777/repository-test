// Descobre ligas disponíveis no poe.ninja para PoE2
// Executar com: NODE_TLS_REJECT_UNAUTHORIZED=0 node discover-leagues.mjs

const BASE = "https://poe.ninja/api/data";

const candidates = [
  "Runes of Aldur",
  "Hardcore Runes of Aldur",
  "Dawn of the Hunt",
  "Hardcore Dawn of the Hunt",
  "Mercenaries",
  "Hardcore Mercenaries",
  "Standard",
  "Hardcore",
  "Settlers",
  "Runes",
  "Aldur",
];

async function check(league) {
  const url = `${BASE}/currencyoverview?league=${encodeURIComponent(league)}&type=Currency&language=en&game=poe2`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 poe2-market/test", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { league, status: res.status };
    const data = await res.json();
    return { league, status: res.status, items: data.lines?.length ?? 0 };
  } catch (e) {
    return { league, error: String(e).split("\n")[0] };
  }
}

const results = await Promise.all(candidates.map(check));
for (const r of results) {
  const ok = r.items > 0;
  const mark = ok ? "✅" : (r.status === 200 ? "🔶" : "❌");
  console.log(`${mark} "${r.league}" → ${r.items ?? r.error ?? r.status}`);
}

const found = results.filter(r => r.items > 0);
if (found.length > 0) {
  console.log("\nLigas com dados:");
  found.forEach(r => console.log(`  "${r.league}" → ${r.items} moedas`));
} else {
  console.log("\nNenhuma liga retornou dados. Verifique se poe.ninja tem dados de PoE2.");
}
