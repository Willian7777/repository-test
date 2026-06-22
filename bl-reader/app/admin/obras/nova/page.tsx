import Link from "next/link";
import NovaObraForm from "@/components/admin/NovaObraForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nova Obra | Admin ZAIKA" };

export default function NovaObraPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/obras" className="text-sm hover:underline" style={{ color: "var(--color-muted)" }}>
          ← Obras
        </Link>
        <span style={{ color: "var(--color-muted)" }}>/</span>
        <h1 className="text-xl font-black zaika-gradient-text">Nova Obra</h1>
      </div>

      <NovaObraForm />
    </div>
  );
}
