import type { ResultadoAnalise } from "@/types/analise";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const PROMPT_SISTEMA = `Você é o assistente do app "Resolve Pra Mim" — especialista em documentos brasileiros que explica tudo de forma clara, sem juridiquês.

Dado o texto de um documento, responda SOMENTE com um objeto JSON válido (sem markdown, sem código, sem texto fora do JSON) com exatamente esta estrutura:

{
  "tipo": "multa" | "contrato" | "boleto" | "edital" | "notificacao" | "outro",
  "nivel_risco": "BAIXO" | "MÉDIO" | "ALTO" | "URGENTE",
  "prazo_data": "DD/MM/AAAA" | null,
  "prazo_dias_restantes": number | null,
  "alerta_golpe": {
    "suspeito": boolean,
    "motivos": string[]
  },
  "simples": {
    "o_que_e": string,
    "prazo": string,
    "o_que_fazer": string[],
    "riscos": string[]
  },
  "normal": {
    "o_que_e": string,
    "prazo": string,
    "o_que_fazer": string[],
    "riscos": string[]
  },
  "tecnico": {
    "o_que_e": string,
    "prazo": string,
    "o_que_fazer": string[],
    "riscos": string[]
  }
}

Regras obrigatórias:
- "simples": frases de até 10 palavras, vocabulário do ensino fundamental, zero termos técnicos
- "normal": linguagem do dia a dia, clara e direta para o brasileiro médio
- "tecnico": terminologia jurídica completa, cite artigos de lei quando aplicável
- nivel_risco URGENTE: prazo < 3 dias ou ação imediata necessária
- nivel_risco ALTO: prazo 3-15 dias ou multa/perda financeira séria
- nivel_risco MÉDIO: prazo 15-60 dias ou consequências moderadas
- nivel_risco BAIXO: informativo, sem urgência
- alerta_golpe.suspeito = true se houver: links encurtados/suspeitos, ameaças exageradas, valores inconsistentes, gramática muito incorreta para órgão oficial, remetente suspeito imitando entidade pública
- o_que_fazer: máximo 5 itens, ações concretas e práticas
- riscos: máximo 4 itens, consequências reais de não agir`;

export async function analisarDocumento(
  texto: string,
  tipoSugerido: string,
  dataHoje: string
): Promise<ResultadoAnalise> {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === "PREENCHA") {
    throw new Error("GROQ_API_KEY não configurada. Configure no arquivo .env.local");
  }

  const prompt = `Tipo sugerido pelo usuário: ${tipoSugerido}
Data de hoje: ${dataHoje}

Texto do documento:
---
${texto.slice(0, 8000)}
---`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: PROMPT_SISTEMA },
        { role: "user",   content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const erro = await response.text();
    if (response.status === 429) {
      throw new Error("Limite da API atingido. Tente novamente em alguns segundos.");
    }
    throw new Error(`Groq API erro ${response.status}: ${erro}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const conteudo = data.choices[0]?.message?.content;
  if (!conteudo) throw new Error("Resposta vazia da IA.");

  try {
    return JSON.parse(conteudo) as ResultadoAnalise;
  } catch {
    throw new Error("Erro ao interpretar resposta da IA. Tente novamente.");
  }
}

/** Gera resposta de chat de acompanhamento (PRO) */
export async function chatAcompanhamento(
  analiseResumo: string,
  historico: Array<{ autor: string; conteudo: string }>,
  pergunta: string
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === "PREENCHA") throw new Error("GROQ_API_KEY não configurada.");

  const systemMsg = `Você é o assistente do "Resolve Pra Mim". O usuário já recebeu a análise do documento abaixo e tem perguntas de acompanhamento. Responda de forma clara, sem juridiquês, em português brasileiro.

Análise do documento:
${analiseResumo}`;

  const messages = [
    { role: "system" as const, content: systemMsg },
    ...historico.map((m) => ({
      role: m.autor === "usuario" ? "user" as const : "assistant" as const,
      content: m.conteudo,
    })),
    { role: "user" as const, content: pergunta },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.3, max_tokens: 512 }),
  });

  if (!response.ok) throw new Error(`Groq API erro ${response.status}`);

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? "Não consegui gerar uma resposta. Tente novamente.";
}
