import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const league = searchParams.get("league") ?? "Runes of Aldur";
  const type = searchParams.get("type") ?? "Currency";
  const endpoint = searchParams.get("endpoint") ?? "currencyoverview";

  const url = `https://poe.ninja/api/data/${endpoint}?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}&language=en&game=poe2`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 poe2-market/1.0 (hobby project)",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }

    return NextResponse.json({
      url,
      status: res.status,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries()),
      itemCount: Array.isArray((body as { lines?: unknown[] })?.lines) ? (body as { lines: unknown[] }).lines.length : null,
      sample: Array.isArray((body as { lines?: unknown[] })?.lines)
        ? (body as { lines: unknown[] }).lines.slice(0, 3)
        : body,
    });
  } catch (err) {
    return NextResponse.json({ url, error: String(err) }, { status: 500 });
  }
}
