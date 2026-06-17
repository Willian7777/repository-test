"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function BotaoComprar({
  obraId,
  preco,
  titulo,
}: {
  obraId: string;
  preco: number;
  titulo: string;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  if (!session?.user) {
    return (
      <button onClick={() => signIn("google")} className="btn-primary">
        Entrar para Comprar
      </button>
    );
  }

  async function handleComprar() {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/pagamentos/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obraId }),
      });
      const data = await res.json() as { checkoutUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar pagamento");
      window.location.href = data.checkoutUrl!;
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleComprar} disabled={loading} className="btn-primary">
        {loading ? "Processando…" : `Comprar por R$ ${preco.toFixed(2)}`}
      </button>
      {erro && <p className="text-xs mt-2" style={{ color: "#dc2626" }}>{erro}</p>}
      <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
        Pagamento seguro via Mercado Pago (PIX ou Cartão)
      </p>
    </div>
  );
}
