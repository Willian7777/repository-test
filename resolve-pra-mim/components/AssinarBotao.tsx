"use client";
import { useRouter } from "next/navigation";

export default function AssinarBotao() {
  const router = useRouter();

  async function assinar() {
    const res = await fetch("/api/pagamentos/criar", { method: "POST" });
    const data = await res.json() as { url?: string; erro?: string };
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.erro ?? "Erro ao iniciar assinatura. Tente novamente.");
    }
  }

  return (
    <button
      type="button"
      onClick={assinar}
      className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all"
    >
      Assinar agora
    </button>
  );
}
