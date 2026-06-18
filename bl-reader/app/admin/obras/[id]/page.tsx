import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ObraEditorClient from "@/components/admin/ObraEditorClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar Obra | Admin ZAIKA" };

const GENEROS_DISPONIVEIS = ["BL", "Drama", "Fantasia", "Comédia", "Romance", "Action", "Slice of Life", "Supernatural", "Histórico", "Ficção Científica"];

export default async function EditarObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obra = await prisma.obra.findUnique({
    where: { id },
    include: {
      capitulos: { orderBy: { numero: "asc" }, include: { _count: { select: { paginas: true } } } },
      _count: { select: { compras: { where: { status: "APROVADO" } } } },
    },
  });
  if (!obra) notFound();

  async function salvarObra(formData: FormData) {
    "use server";
    const generos = formData.getAll("generos") as string[];
    await prisma.obra.update({
      where: { id },
      data: {
        titulo:        String(formData.get("titulo")        ?? ""),
        autorOriginal: String(formData.get("autorOriginal") ?? ""),
        tradutora:     String(formData.get("tradutora")     ?? "") || null,
        sinopse:       String(formData.get("sinopse")       ?? ""),
        capaUrl:       String(formData.get("capaUrl")       ?? ""),
        preco:         parseFloat(String(formData.get("preco") ?? "0")),
        status:        String(formData.get("status") ?? "RASCUNHO"),
        generos:       JSON.stringify(generos),
      },
    });
    redirect(`/admin/obras/${id}?salvo=1`);
  }

  async function novoCapitulo(formData: FormData) {
    "use server";
    const numero = parseInt(String(formData.get("numero") ?? "1"), 10);
    const titulo = String(formData.get("titulo") ?? "") || null;
    const cap = await prisma.capitulo.create({ data: { obraId: id, numero, titulo } });
    redirect(`/admin/obras/${id}/capitulos/${cap.id}`);
  }

  let generosArray: string[] = [];
  try { generosArray = JSON.parse(obra.generos); } catch { generosArray = []; }

  const proximoNumero = obra.capitulos.length > 0
    ? Math.max(...obra.capitulos.map((c) => c.numero)) + 1 : 1;

  return (
    <div className="p-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--color-muted)" }}>
        <Link href="/admin/obras" className="hover:underline">Obras</Link>
        <span>/</span>
        <span style={{ color: "var(--foreground)" }} className="font-semibold truncate max-w-xs">{obra.titulo}</span>
      </div>

      <ObraEditorClient
        obra={{ ...obra, generosArray }}
        generosDisponiveis={GENEROS_DISPONIVEIS}
        salvarAction={salvarObra}
        novoCapituloAction={novoCapitulo}
        proximoNumero={proximoNumero}
      />
    </div>
  );
}
