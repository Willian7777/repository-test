import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acesso Negado" };

export default function AcessoNegadoPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-2xl font-black mb-2" style={{ color: "var(--foreground)" }}>Acesso Negado</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
          Você não tem permissão para acessar esta página.
        </p>
        <Link href="/" className="btn-primary">Voltar ao Início</Link>
      </div>
    </div>
  );
}
