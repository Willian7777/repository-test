import { NextRequest, NextResponse } from "next/server";

export interface VideoSuggestion {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
  publishedAt: string;
  duration?: string;
}

interface YTSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
}

interface YTSearchResponse {
  items?: YTSearchItem[];
  error?: { message: string };
}

export async function GET(req: NextRequest) {
  const examCode = req.nextUrl.searchParams.get("examCode") ?? "";
  const domainTitle = req.nextUrl.searchParams.get("domainTitle") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") ?? "pt";

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "SUA_CHAVE_YOUTUBE_AQUI") {
    return NextResponse.json({ error: "YOUTUBE_API_KEY não configurada" }, { status: 503 });
  }

  // Monta query priorizando canais oficiais da Microsoft e conteúdo relevante
  const query = buildQuery(examCode, domainTitle, lang);

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "6",
    relevanceLanguage: lang,
    videoEmbeddable: "true",
    key: apiKey,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
  );

  if (!res.ok) {
    const err = await res.json() as YTSearchResponse;
    return NextResponse.json(
      { error: err.error?.message ?? `YouTube API error ${res.status}` },
      { status: res.status }
    );
  }

  const data: YTSearchResponse = await res.json();
  const items = data.items ?? [];

  const videos: VideoSuggestion[] = items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnailUrl:
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    publishedAt: item.snippet.publishedAt,
  }));

  return NextResponse.json(videos);
}

function buildQuery(examCode: string, domainTitle: string, lang: string): string {
  // Remove peso do domínio ex: "(30–35%)" do título
  const cleanTitle = domainTitle.replace(/\s*\([\d–%]+\)\s*$/, "").trim();

  const base =
    lang === "pt"
      ? `${examCode} ${cleanTitle} Microsoft certificação`
      : `${examCode} ${cleanTitle} Microsoft certification tutorial`;

  return base;
}
