import { NextRequest, NextResponse } from "next/server";
import { getMarketItems } from "@/lib/poeNinja";
import { ItemCategory, MarketItem } from "@/types/market";
import {
  PoEItem,
  ValuedItem,
  CharacterItemsResponse,
  InventoryValuation,
} from "@/types/inventory";

const POE_BASE = "https://www.pathofexile.com";

const VALUE_CATEGORIES: ItemCategory[] = [
  "Currency",
  "Fragment",
  "Rune",
  "Omen",
  "Divination",
  "UniqueWeapon",
  "UniqueArmour",
  "UniqueAccessory",
  "UniqueFlask",
  "UniqueJewel",
  "SkillGem",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGemLevel(item: PoEItem): number | null {
  const prop = item.properties?.find((p) => p.name === "Level");
  if (!prop) return null;
  const raw = prop.values[0]?.[0];
  if (!raw) return null;
  return parseInt(raw.replace(/[^0-9]/g, ""), 10) || null;
}

/** Returns lookup key(s) for poe.ninja matching */
function getLookupKeys(item: PoEItem): string[] {
  const keys: string[] = [];

  if (item.frameType === 3) {
    // Unique: match by name (e.g. "The Squire")
    if (item.name) keys.push(item.name.toLowerCase());
  } else if (item.frameType === 4) {
    // Gem: match by typeLine (gem name)
    const lvl = getGemLevel(item);
    keys.push(item.typeLine.toLowerCase());
    if (lvl) keys.push(`${item.typeLine.toLowerCase()} (level ${lvl})`);
  } else if (item.frameType === 5 || item.frameType === 9) {
    // Currency / Rune: match by typeLine
    keys.push(item.typeLine.toLowerCase());
  } else if (item.frameType === 6) {
    // Divination card: match by typeLine
    keys.push(item.typeLine.toLowerCase());
  }

  return keys;
}

function valueItem(item: PoEItem, priceMap: Map<string, MarketItem>): ValuedItem {
  const keys = getLookupKeys(item);
  let match: MarketItem | undefined;
  let matchedAs: string | undefined;

  for (const key of keys) {
    match = priceMap.get(key);
    if (match) { matchedAs = key; break; }
  }

  const stackSize = item.stackSize ?? 1;
  const estimatedChaos = match ? match.chaosValue * stackSize : 0;

  return { ...item, estimatedChaos, matchedAs, isStack: stackSize > 1 };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: { account?: string; character?: string; league?: string; sessid?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { account, character, league = "Runes of Aldur", sessid } = body;

  if (!account || !character) {
    return NextResponse.json(
      { error: "account e character são obrigatórios" },
      { status: 400 }
    );
  }

  // ── 1. Buscar itens do personagem na API oficial do PoE ──────────────────
  const poeHeaders: HeadersInit = {
    "User-Agent": "Mozilla/5.0 poe2-market/1.0 (hobby project)",
    "Accept": "application/json",
  };
  if (sessid) {
    // POESESSID usado apenas server-side, nunca exposto ao cliente
    poeHeaders["Cookie"] = `POESESSID=${sessid}`;
  }

  let charData: CharacterItemsResponse;
  try {
    const url = `${POE_BASE}/character-window/get-items?accountName=${encodeURIComponent(account)}&character=${encodeURIComponent(character)}&realm=poe2`;
    const poeRes = await fetch(url, { headers: poeHeaders, cache: "no-store" });

    if (poeRes.status === 403) {
      return NextResponse.json(
        { error: "Perfil privado. Forneça o POESESSID para acessar." },
        { status: 403 }
      );
    }
    if (poeRes.status === 404) {
      return NextResponse.json(
        { error: "Personagem não encontrado. Verifique o nome da conta e do personagem." },
        { status: 404 }
      );
    }
    if (!poeRes.ok) {
      return NextResponse.json(
        { error: `API do PoE retornou ${poeRes.status}` },
        { status: 502 }
      );
    }

    charData = await poeRes.json();
  } catch (err) {
    console.error("[inventory] PoE API error:", err);
    return NextResponse.json({ error: "Falha ao conectar com a API do PoE" }, { status: 502 });
  }

  // ── 2. Buscar preços do poe.ninja ────────────────────────────────────────
  const priceResults = await Promise.allSettled(
    VALUE_CATEGORIES.map((c) => getMarketItems(league, c))
  );

  const priceMap = new Map<string, MarketItem>();
  for (const r of priceResults) {
    if (r.status === "fulfilled") {
      for (const item of r.value) {
        priceMap.set(item.name.toLowerCase(), item);
      }
    }
  }

  // ── 3. Valorar cada item ─────────────────────────────────────────────────
  const valuedItems: ValuedItem[] = charData.items.map((item: PoEItem) =>
    valueItem(item, priceMap)
  );

  const totalChaos = valuedItems.reduce((sum, i) => sum + i.estimatedChaos, 0);
  const unknownCount = valuedItems.filter((i) => i.estimatedChaos === 0).length;

  const result: InventoryValuation = {
    character: charData.character,
    items: valuedItems.sort((a, b) => b.estimatedChaos - a.estimatedChaos),
    totalChaos,
    unknownCount,
  };

  return NextResponse.json(result);
}
