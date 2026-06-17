import { NextRequest, NextResponse } from "next/server";
import { getMarketItems } from "@/lib/poeNinja";
import { ItemCategory } from "@/types/market";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const league = searchParams.get("league") ?? "Standard";
  const category = searchParams.get("category") as ItemCategory | null;

  if (!category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  try {
    const items = await getMarketItems(league, category);
    return NextResponse.json(items, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate" },
    });
  } catch (err) {
    console.error("[/api/items]", err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 502 });
  }
}
