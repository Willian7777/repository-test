import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/azureOpenAI";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      certName: string;
      examCode: string;
      domainTitle: string;
      objectives: string[];
      count?: number;
    };

    const { certName, examCode, domainTitle, objectives, count = 5 } = body;

    if (!certName || !examCode || !domainTitle || !objectives?.length) {
      return NextResponse.json(
        { error: "certName, examCode, domainTitle e objectives são obrigatórios" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions({
      certName,
      examCode,
      domainTitle,
      objectives,
      count: Math.min(count, 15), // limite de 15 por chamada
    });

    return NextResponse.json(questions);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao gerar questões";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
