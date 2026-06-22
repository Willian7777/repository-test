"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function ContaClient({ userId }: { userId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo]     = useState(false);
  const [msg, setMsg]                 = useState("");

  async function excluirConta() {
    setExcluindo(true);
    const res = await fetch("/api/usuario/excluir-conta", { method: "DELETE" });
    if (res.ok) {
      setMsg("Conta excluída. Redirecionando…");
      setTimeout(() => signOut({ callbackUrl: "/" }), 2000);
    } else {
      setMsg("Erro ao excluir conta. Tente novamente.");
      setExcluindo(false);
    }
  }

  if (msg) return <p className="text-sm py-2" style={{ color: "#16a34a" }}>{msg}</p>;

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium" style={{ color: "#dc2626" }}>Excluir minha conta</p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          Seus dados pessoais serão anonimizados. Compras mantidas por obrigação fiscal (art. 18, VI)
        </p>
      </div>
      {!confirmando ? (
        <button onClick={() => setConfirmando(true)} className="text-xs px-3 py-1.5 rounded-lg border font-semibold"
          style={{ borderColor: "#dc2626", color: "#dc2626" }}>
          Excluir
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={excluirConta} disabled={excluindo}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
            style={{ background: "#dc2626" }}>
            {excluindo ? "Excluindo…" : "Confirmar"}
          </button>
          <button onClick={() => setConfirmando(false)} className="btn-outline text-xs px-3 py-1.5">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
