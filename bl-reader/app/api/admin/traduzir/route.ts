import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { traduzirTexto, IDIOMAS_SUPORTADOS } from "@/lib/azure";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria, getIp } from "@/lib/auditlog";
import { AcaoAudit } from "@/lib/constants";
import { z } from "zod";

const schema = z.object({
  texto: z.string().min(1).max(10_000),
  idiomaOrigem: z.string().refine((v) => v in IDIOMAS_SUPORTADOS, {
    message: "Idioma não suportado",
  }),
  paginaId: z.string().cuid().optional(), // se informado, salva no banco
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { texto, idiomaOrigem, paginaId } = parsed.data;

  try {
    const traducao = await traduzirTexto(texto, idiomaOrigem);

    // Salvar no banco se paginaId foi informado
    if (paginaId) {
      await prisma.pagina.update({
        where: { id: paginaId },
        data: { textoOriginal: texto, idiomaOriginal: idiomaOrigem, textoTraduzido: traducao },
      });
    }

    await registrarAuditoria({
      userId: session.user.id,
      acao: AcaoAudit.ADMIN_TRADUCAO,
      ip: getIp(req),
      metadata: { idiomaOrigem, chars: texto.length, paginaId },
    });

    return NextResponse.json({ traducao });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
