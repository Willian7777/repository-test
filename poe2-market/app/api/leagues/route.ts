import { NextResponse } from "next/server";

// Leagues disponíveis no PoE2 - atualizar conforme novas ligas são adicionadas
const POE2_LEAGUES = [
  { id: "Runes of Aldur", label: "Runes of Aldur", active: true },
  { id: "Hardcore Runes of Aldur", label: "HC Runes of Aldur", active: true },
  { id: "Standard", label: "Standard", active: true },
  { id: "Hardcore", label: "Hardcore", active: true },
];

export async function GET() {
  // Tenta buscar leagues dinâmicas da API oficial do PoE
  try {
    const res = await fetch("https://api.pathofexile.com/leagues?realm=poe2&type=main&limit=20", {
      headers: { "User-Agent": "poe2-market/1.0 (contact: dev@example.com)" },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data: { id: string; realm: string; category?: { id: string } }[] = await res.json();
      const leagues = data
        .filter((l) => l.realm === "poe2")
        .map((l) => ({ id: l.id, label: l.id, active: true }));

      if (leagues.length > 0) {
        return NextResponse.json(leagues);
      }
    }
  } catch {
    // Fallback para lista estática
  }

  return NextResponse.json(POE2_LEAGUES);
}
