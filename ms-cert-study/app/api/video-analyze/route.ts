import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export interface VideoAnalysis {
  videoId: string;
  relevant: boolean;
  score: number;          // 0–100
  summary: string;        // resumo do conteúdo do vídeo
  reason: string;         // por que é (ou não) relevante
  keyTopics: string[];    // tópicos identificados na transcrição
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    videoId: string;
    examCode: string;
    domainTitle: string;
    objectives: string[];
  };

  const { videoId, examCode, domainTitle, objectives } = body;

  if (!videoId || !examCode || !domainTitle) {
    return NextResponse.json({ error: "videoId, examCode e domainTitle são obrigatórios" }, { status: 400 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  if (!groqKey || groqKey === "SUA_CHAVE_GROQ_AQUI") {
    return NextResponse.json({ error: "GROQ_API_KEY não configurada" }, { status: 503 });
  }

  // 1. Busca transcrição do YouTube
  let transcriptText = "";
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "pt" })
      .catch(() => YoutubeTranscript.fetchTranscript(videoId, { lang: "en" }));

    // Pega no máximo ~3000 chars para não estourar o contexto
    transcriptText = segments
      .map((s) => s.text)
      .join(" ")
      .slice(0, 3000);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível obter a transcrição. O vídeo pode não ter legendas automáticas." },
      { status: 422 }
    );
  }

  // 2. Envia para o Groq avaliar relevância
  const objectivesList = objectives.slice(0, 6).join("; ");

  const prompt = `Você é um especialista em certificações Microsoft. Analise a transcrição abaixo de um vídeo e avalie se ele é relevante para estudar o domínio "${domainTitle}" da certificação ${examCode}.

Objetivos do domínio: ${objectivesList}

Transcrição do vídeo (trecho):
"""
${transcriptText}
"""

Responda SOMENTE com JSON válido (sem markdown):
{
  "relevant": true/false,
  "score": 0-100,
  "summary": "resumo em 1-2 frases do que o vídeo aborda",
  "reason": "por que é ou não é relevante para ${examCode} - ${domainTitle}",
  "keyTopics": ["tópico1", "tópico2", "tópico3"]
}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Groq API error ${res.status}` }, { status: 500 });
  }

  const data = await res.json() as { choices: { message: { content: string } }[] };
  const content = data.choices[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const analysis = JSON.parse(cleaned) as Omit<VideoAnalysis, "videoId">;
    return NextResponse.json({ videoId, ...analysis } satisfies VideoAnalysis);
  } catch {
    return NextResponse.json({ error: "Erro ao interpretar resposta da IA" }, { status: 500 });
  }
}
