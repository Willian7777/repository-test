import { NextRequest, NextResponse } from "next/server";
import { getMarketItems } from "@/lib/poeNinja";
import { ItemCategory } from "@/types/market";

const SEARCH_CATEGORIES: ItemCategory[] = [
  "Currency",
  "UniqueWeapon",
  "UniqueArmour",
  "UniqueAccessory",
  "SkillGem",
  "Divination",
  "UniqueJewel",
  "UniqueFlask",
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const league = searchParams.get("league") ?? "Standard";

  if (q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await Promise.allSettled(
      SEARCH_CATEGORIES.map((cat) => getMarketItems(league, cat))
    );

    const all = results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((item) => item.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return NextResponse.json(all);
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
