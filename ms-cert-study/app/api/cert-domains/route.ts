import { NextRequest, NextResponse } from "next/server";
import { fetchLearningPaths } from "@/lib/learnApi";
import { getCertDomains } from "@/data/certDomains";
import type { LearningPath } from "@/types/certification";

export async function GET(req: NextRequest) {
  const certCode = req.nextUrl.searchParams.get("certCode");

  if (!certCode) {
    return NextResponse.json({ error: "certCode é obrigatório" }, { status: 400 });
  }

  // 1. Usa dados curados do study guide (mais confiável)
  const curated = getCertDomains(certCode);
  if (curated) {
    const paths: LearningPath[] = curated.domains.map((d) => ({
      uid: d.id,
      title: d.title,
      description: `${d.weight} do exame ${curated.examCode} — ${d.objectives.slice(0, 2).join("; ")}`,
      url: d.learnUrl,
      modules: d.objectives.map((obj, i) => ({
        uid: `${d.id}-obj-${i}`,
        title: obj,
        description: obj,
        url: d.learnUrl,
      })),
    }));
    return NextResponse.json(paths);
  }

  // 2. Fallback: Learn API para certs não mapeadas
  const paths = await fetchLearningPaths(certCode);
  return NextResponse.json(paths);
}
