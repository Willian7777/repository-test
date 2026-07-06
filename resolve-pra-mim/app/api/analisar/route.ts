import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extrairTexto } from "@/lib/extrator";
import { analisarDocumento } from "@/lib/groq";
import { registrarAuditoria, getIp, hashIp } from "@/lib/auditlog";
import { LIMITE_ANALISES, AcaoAudit } from "@/lib/constants";

export async function POST(request: Request) {
  const session = await auth();
  const ip      = getIp(request);
  const ipHash  = hashIp(ip);

  // ── Rate limiting ────────────────────────────────────────────────────────
  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);

  if (session?.user?.id) {
    if (session.user.plano !== "PRO") {
      const count = await prisma.analise.count({
        where: { userId: session.user.id, createdAt: { gte: inicioDia } },
      });
      if (count >= LIMITE_ANALISES.FREE) {
        return Response.json(
          { erro: `Limite de ${LIMITE_ANALISES.FREE} análises/dia atingido. Atualize para PRO para análises ilimitadas.` },
          { status: 429 }
        );
      }
    }
  } else {
    const count = await prisma.analise.count({
      where: { ipHash, userId: null, createdAt: { gte: inicioDia } },
    });
    if (count >= LIMITE_ANALISES.ANONIMO) {
      return Response.json(
        { erro: "Limite de 1 análise/dia sem login atingido. Crie uma conta gratuita para 5 análises/dia." },
        { status: 429 }
      );
    }
  }

  // ── Parse FormData ───────────────────────────────────────────────────────
  let textoExtraido: string;
  let tipoSugerido = "outro";

  try {
    const form = await request.formData();
    tipoSugerido = String(form.get("tipo_sugerido") ?? "outro");

    const arquivo = form.get("arquivo") as File | null;
    const texto   = form.get("texto") as string | null;

    if (arquivo && arquivo.size > 0) {
      textoExtraido = await extrairTexto(arquivo);
    } else if (texto?.trim()) {
      textoExtraido = texto.trim();
    } else {
      return Response.json({ erro: "Envie um arquivo ou texto do documento." }, { status: 400 });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao processar arquivo.";
    return Response.json({ erro: msg }, { status: 422 });
  }

  if (textoExtraido.length < 20) {
    return Response.json({ erro: "Texto muito curto. Verifique se o documento está legível." }, { status: 422 });
  }

  // ── Análise LLM ─────────────────────────────────────────────────────────
  let resultado;
  try {
    const dataHoje = new Date().toLocaleDateString("pt-BR");
    resultado = await analisarDocumento(textoExtraido, tipoSugerido, dataHoje);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro na análise com IA.";
    return Response.json({ erro: msg }, { status: 502 });
  }

  // ── Salvar no banco ──────────────────────────────────────────────────────
  const analise = await prisma.analise.create({
    data: {
      userId:       session?.user?.id ?? null,
      ipHash:       session?.user?.id ? null : ipHash,
      tipoSugerido: resultado.tipo ?? tipoSugerido,
      textoInput:   textoExtraido.slice(0, 5000), // limita armazenamento
      resultado:    JSON.stringify(resultado),
      nivelRisco:   resultado.nivel_risco ?? "BAIXO",
      golpeSuspeito: resultado.alerta_golpe?.suspeito ?? false,
    },
    select: { id: true },
  });

  await registrarAuditoria({
    userId:    session?.user?.id,
    acao:      AcaoAudit.ANALISE_CRIADA,
    entidade:  "Analise",
    entidadeId: analise.id,
    ip,
    metadata:  { tipo: resultado.tipo, nivelRisco: resultado.nivel_risco },
  });

  return Response.json({ id: analise.id });
}
