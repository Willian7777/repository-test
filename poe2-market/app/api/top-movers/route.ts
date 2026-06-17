import { NextRequest, NextResponse } from "next/server";
import { getTopMovers } from "@/lib/poeNinja";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const league = searchParams.get("league") ?? "Standard";
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  try {
    const items = await getTopMovers(league, limit);
    return NextResponse.json(items, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate" },
    });
  } catch (err) {
    console.error("[/api/top-movers]", err);
    return NextResponse.json({ error: "Failed to fetch top movers" }, { status: 502 });
  }
}
