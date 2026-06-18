import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nova Obra | Admin ZAIKA" };

const GENEROS_DISPONIVEIS = ["BL", "Drama", "Fantasia", "Comédia", "Romance", "Action", "Slice of Life", "Supernatural", "Histórico", "Ficção Científica"];

export default function NovaObraPage() {
  async function criarObra(formData: FormData) {
    "use server";
    const generosSelecionados = formData.getAll("generos") as string[];
    const obra = await prisma.obra.create({
      data: {
        titulo:        String(formData.get("titulo")        ?? ""),
        autorOriginal: String(formData.get("autorOriginal") ?? ""),
        tradutora:     String(formData.get("tradutora")     ?? "") || null,
        sinopse:       String(formData.get("sinopse")       ?? ""),
        capaUrl:       String(formData.get("capaUrl")       ?? ""),
        preco:         parseFloat(String(formData.get("preco") ?? "0")),
        generos:       JSON.stringify(generosSelecionados),
        status:        "RASCUNHO",
      },
    });
    redirect(`/admin/obras/${obra.id}`);
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/obras" className="text-sm hover:underline" style={{ color: "var(--color-muted)" }}>
          ← Obras
        </Link>
        <span style={{ color: "var(--color-muted)" }}>/</span>
        <h1 className="text-xl font-black zaika-gradient-text">Nova Obra</h1>
      </div>

      <form action={criarObra} className="card-zaika p-6 space-y-5">
        <FormField label="Título da obra" name="titulo" placeholder="Ex: My Only Sunshine" required />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Autor original" name="autorOriginal" placeholder="Nome do autor" required />
          <FormField label="Tradutora (opcional)" name="tradutora" placeholder="Seu nome ou apelido" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
            Sinopse <span style={{ color: "var(--color-primary)" }}>*</span>
          </label>
          <textarea name="sinopse" required rows={4} placeholder="Descreva a história..."
            className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-y"
            style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--foreground)" }}
          />
        </div>
        <FormField label="URL da capa" name="capaUrl" placeholder="https://... (link da imagem de capa)" required type="url" />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Preço (R$)" name="preco" type="number" placeholder="9.90" required />
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
              Status inicial
            </label>
            <select name="status" defaultValue="RASCUNHO"
              className="w-full px-3 py-2.5 rounded-lg border text-sm"
              style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}>
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADO">Publicado</option>
            </select>
          </div>
        </div>

        {/* Gêneros */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--color-muted)" }}>
            Gêneros <span style={{ color: "var(--color-primary)" }}>*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GENEROS_DISPONIVEIS.map((g) => (
              <label key={g} className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: "var(--color-border)", color: "var(--foreground)" }}>
                <input type="checkbox" name="generos" value={g} className="accent-pink-500" />
                {g}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">Criar Obra</button>
          <Link href="/admin/obras" className="btn-outline">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, name, placeholder, required, type = "text" }: {
  label: string; name: string; placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
        {label} {required && <span style={{ color: "var(--color-primary)" }}>*</span>}
      </label>
      <input name={name} type={type} required={required} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
        style={{ borderColor: "var(--color-border)", background: "var(--color-card)", color: "var(--foreground)" }}
      />
    </div>
  );
}
