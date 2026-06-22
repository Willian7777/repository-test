import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Padrões para extração de metadados em vários idiomas
function extrairTitulo(info: Record<string, string>, texto: string): string {
  if (info?.Title?.trim()) return info.Title.trim();
  const patterns = [
    /título[:\s]+([^\n\r]+)/i,
    /title[:\s]+([^\n\r]+)/i,
    /제목[:\s]+([^\n\r]+)/,   // Coreano
    /タイトル[:\s]+([^\n\r]+)/, // Japonês
  ];
  for (const p of patterns) {
    const m = texto.match(p);
    if (m?.[1]?.trim()) return m[1].trim().slice(0, 200);
  }
  // Primeira linha não vazia com pelo menos 3 chars
  const linhas = texto.split(/\n|\r/).map(l => l.trim()).filter(l => l.length >= 3);
  return linhas[0]?.slice(0, 200) ?? "";
}

function extrairAutor(info: Record<string, string>, texto: string): string {
  if (info?.Author?.trim()) return info.Author.trim();
  const patterns = [
    /autor[a]?[:\s]+([^\n\r]+)/i,
    /author[:\s]+([^\n\r]+)/i,
    /작가[:\s]+([^\n\r]+)/,    // Coreano
    /作者[:\s]+([^\n\r]+)/,    // Chinês/Japonês
    /저자[:\s]+([^\n\r]+)/,    // Coreano alternativo
  ];
  for (const p of patterns) {
    const m = texto.match(p);
    if (m?.[1]?.trim()) return m[1].trim().slice(0, 200);
  }
  return "";
}

function extrairTradutora(texto: string): string {
  const patterns = [
    /tradut[oa]r?a?[:\s]+([^\n\r]+)/i,
    /tradu[çc][ãa]o[:\s]+([^\n\r]+)/i,
    /translated by[:\s]+([^\n\r]+)/i,
    /translator[:\s]+([^\n\r]+)/i,
    /revisão[:\s]+([^\n\r]+)/i,
  ];
  for (const p of patterns) {
    const m = texto.match(p);
    if (m?.[1]?.trim()) return m[1].trim().slice(0, 200);
  }
  return "";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "FormData inválido" }, { status: 400 });

  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Apenas arquivos PDF são aceitos" }, { status: 415 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "PDF muito grande. Máx. 4 MB (limite do servidor Vercel)" }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Importação dinâmica para evitar problemas com Next.js build
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = (await import("pdf-parse" as any)).default ?? (await import("pdf-parse" as any));
    const data = await pdfParse(buffer, { max: 3 }); // Lê apenas as 3 primeiras páginas

    const info = (data.info ?? {}) as Record<string, string>;
    const texto = data.text ?? "";

    const titulo    = extrairTitulo(info, texto);
    const autor     = extrairAutor(info, texto);
    const tradutora = extrairTradutora(texto);

    return NextResponse.json({
      titulo,
      autor,
      tradutora,
      paginas: data.numpages,
      preview: texto.slice(0, 500), // primeiras 500 chars para visualização
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao processar PDF";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
