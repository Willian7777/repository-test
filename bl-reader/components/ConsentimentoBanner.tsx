"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_NAME = "zaika-lgpd-consent-v1";

export default function ConsentimentoBanner({ userId }: { userId?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((c) => c.startsWith(COOKIE_NAME));
    if (!cookie) setVisible(true);
  }, []);

  async function handleAceitar(cookiesAnaliticos: boolean) {
    // Salva consentimento no banco (LGPD art. 7)
    await fetch("/api/consentimento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aceitouTermos: true,
        aceitouPrivacidade: true,
        aceitouCookiesAnaliticos: cookiesAnaliticos,
        userId: userId ?? null,
      }),
    }).catch(() => {}); // silencia erros de rede — o botão ainda fecha o banner

    // Define cookie (1 ano)
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=1; expires=${expires}; path=/; SameSite=Strict`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies e privacidade"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl shadow-2xl p-5 border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-primary)",
          boxShadow: "0 -4px 40px rgba(224,80,138,0.15)",
        }}
      >
        <p className="text-sm mb-1 font-semibold" style={{ color: "var(--foreground)" }}>
          🍪 Cookies e Privacidade — LGPD
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
          Usamos cookies essenciais para o funcionamento do site (sessão, pagamento) e, com sua
          autorização, cookies analíticos para melhorar a experiência. Seus dados são tratados
          conforme nossa{" "}
          <Link href="/privacidade" className="underline hover:text-pink-600">
            Política de Privacidade
          </Link>{" "}
          e{" "}
          <Link href="/termos" className="underline hover:text-pink-600">
            Termos de Uso
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn-primary text-sm flex-1" onClick={() => handleAceitar(true)}>
            Aceitar todos os cookies
          </button>
          <button className="btn-outline text-sm flex-1" onClick={() => handleAceitar(false)}>
            Apenas essenciais
          </button>
        </div>
      </div>
    </div>
  );
}
