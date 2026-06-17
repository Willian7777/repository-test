import type { Question } from "@/types/certification";

interface GenerateQuestionsOptions {
  certName: string;
  examCode: string;
  domainTitle: string;
  objectives: string[];
  count?: number;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

export async function generateQuestions({
  certName,
  examCode,
  domainTitle,
  objectives,
  count = 5,
}: GenerateQuestionsOptions): Promise<Question[]> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  if (!apiKey || apiKey === "SUA_CHAVE_GROQ_AQUI") {
    throw new Error(
      "Groq não configurado. Adicione GROQ_API_KEY no .env.local (obtenha grátis em console.groq.com)."
    );
  }

  const objectivesList = objectives.slice(0, 8).map((o, i) => `${i + 1}. ${o}`).join("\n");

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Você é um especialista em certificações Microsoft. Gere questões de múltipla escolha no estilo das provas Microsoft (4 opções, A/B/C/D). As questões devem ser práticas, baseadas em cenários reais, e testam compreensão, não memorização. Retorne SOMENTE um array JSON válido.`,
    },
    {
      role: "user",
      content: `Gere ${count} questões de múltipla escolha para a certificação ${examCode} - ${certName}.
Domínio: "${domainTitle}"
Objetivos cobertos:
${objectivesList}

Retorne SOMENTE este JSON (sem markdown, sem explicações extras):
[
  {
    "text": "Texto da questão",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctIndex": 0,
    "explanation": "Por que esta é a resposta correta e por que as outras estão erradas."
  }
]`,
    },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Groq API error ${res.status}: ${error}`);
  }

  const data: ChatCompletionResponse = await res.json();
  const content = data.choices[0]?.message?.content ?? "[]";

  // Remove possível markdown code block do response
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const raw = JSON.parse(cleaned) as {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];

  return raw.map((q, i) => ({
    id: `${examCode}-${domainTitle}-${i}`.toLowerCase().replace(/\s+/g, "-"),
    certId: examCode.toLowerCase(),
    domainId: domainTitle.toLowerCase().replace(/\s+/g, "-"),
    text: q.text,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }));
}
