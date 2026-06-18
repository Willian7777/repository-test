import type { Metadata } from "next";
import TraductorStandalone from "@/components/admin/TraductorStandalone";
import { IDIOMAS_SUPORTADOS } from "@/lib/azure";

export const metadata: Metadata = { title: "Tradutor | Admin ZAIKA" };

export default function TraductorPage() {
  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-black zaika-gradient-text mb-1">Tradutor</h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
        Extraia texto de imagens via OCR e traduza automaticamente para português
      </p>
      <TraductorStandalone idiomas={IDIOMAS_SUPORTADOS} />
    </div>
  );
}
