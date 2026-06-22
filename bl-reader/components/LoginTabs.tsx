"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

interface Props {
  abaInicial: "entrar" | "cadastro";
  destino: string;
  googleAtivo: boolean;
  erro?: string;
}

export default function LoginTabs({ abaInicial, destino, googleAtivo, erro }: Props) {
  const [aba, setAba]           = useState<"entrar" | "cadastro">(abaInicial);
  const [mensagem, setMensagem] = useState(
    erro === "CredentialsSignin" ? "Email ou senha incorretos." : (erro ? "Erro ao entrar." : "")
  );
  const [sucesso, setSucesso]   = useState("");
  const [isPending, startTransition] = useTransition();

  // ── ENTRAR ────────────────────────────────────────────────────────────────
  async function handleEntrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    const fd    = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const senha = fd.get("senha") as string;

    startTransition(async () => {
      // Tenta primeiro como leitora, depois como admin
      let res = await signIn("leitora", { email, password: senha, redirect: false });
      if (res?.error) {
        res = await signIn("admin", { email, password: senha, redirect: false });
      }
      if (res?.error) {
        setMensagem("Email ou senha incorretos.");
      } else {
        window.location.href = destino;
      }
    });
  }

  // ── CADASTRAR ─────────────────────────────────────────────────────────────
  async function handleCadastro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    const fd           = new FormData(e.currentTarget);
    const nome         = fd.get("nome") as string;
    const email        = fd.get("email") as string;
    const senha        = fd.get("senha") as string;
    const confirmaSenha = fd.get("confirmaSenha") as string;

    if (senha !== confirmaSenha) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok) {
        setMensagem(data.error ?? "Erro ao criar conta.");
      } else {
        setSucesso("Conta criada! Fazendo login…");
        const login = await signIn("leitora", { email, password: senha, redirect: false });
        if (!login?.error) {
          window.location.href = destino;
        } else {
          setSucesso("");
          setMensagem("Conta criada! Faça login para continuar.");
          setAba("entrar");
        }
      }
    });
  }

  // ── Google ────────────────────────────────────────────────────────────────
  function handleGoogle() {
    signIn("google", { callbackUrl: destino });
  }

  return (
    <div className="px-8 pb-8">
      {/* Abas */}
      <div className="flex rounded-xl p-1 mb-6" style={{ background: "var(--color-primary-light)" }}>
        {(["entrar", "cadastro"] as const).map((a) => (
          <button
            key={a}
            onClick={() => { setAba(a); setMensagem(""); setSucesso(""); }}
            className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            style={
              aba === a
                ? { background: "var(--color-primary)", color: "#fff" }
                : { background: "transparent", color: "var(--color-primary)" }
            }
          >
            {a === "entrar" ? "Entrar" : "Criar Conta"}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {mensagem && (
        <div className="mb-4 p-3 rounded-lg text-sm text-center"
          style={{ background: "#fee2e2", color: "#dc2626" }}>
          {mensagem}
        </div>
      )}
      {sucesso && (
        <div className="mb-4 p-3 rounded-lg text-sm text-center"
          style={{ background: "#dcfce7", color: "#16a34a" }}>
          {sucesso}
        </div>
      )}

      {/* ── ABA ENTRAR ──────────────────────────────────────────────────── */}
      {aba === "entrar" && (
        <form onSubmit={handleEntrar} className="space-y-4">
          <Field label="Email" name="email" type="email" placeholder="seu@email.com" />
          <Field label="Senha" name="senha" type="password" placeholder="••••••••" />
          <button type="submit" disabled={isPending} className="btn-primary w-full py-3 text-sm">
            {isPending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      )}

      {/* ── ABA CRIAR CONTA ──────────────────────────────────────────────── */}
      {aba === "cadastro" && (
        <form onSubmit={handleCadastro} className="space-y-4">
          <Field label="Seu nome" name="nome" type="text" placeholder="Como quer ser chamada?" />
          <Field label="Email" name="email" type="email" placeholder="seu@email.com" />
          <Field label="Senha" name="senha" type="password" placeholder="Mínimo 6 caracteres" />
          <Field label="Confirmar senha" name="confirmaSenha" type="password" placeholder="Repita a senha" />
          <button type="submit" disabled={isPending} className="btn-primary w-full py-3 text-sm">
            {isPending ? "Criando conta…" : "Criar Conta Grátis"}
          </button>
        </form>
      )}

      {/* ── Redes Sociais ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
          ou entre com
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <SocialBtn
          onClick={googleAtivo ? handleGoogle : undefined}
          disabled={!googleAtivo}
          label={googleAtivo ? "Login" : "Login*"}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          }
        />

        {/* Facebook — em breve */}
        <SocialBtn
          disabled
          label="Facebook*"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          }
        />
      </div>

      {!googleAtivo && (
        <p className="text-xs mt-3 text-center" style={{ color: "var(--color-muted)" }}>
          * Configure as credenciais no <code>.env.local</code> para ativar
        </p>
      )}

      <p className="text-xs mt-5 text-center" style={{ color: "var(--color-muted)" }}>
        Ao entrar, você concorda com os{" "}
        <Link href="/termos" className="underline hover:text-pink-600">Termos</Link> e a{" "}
        <Link href="/privacidade" className="underline hover:text-pink-600">Privacidade</Link>.
      </p>
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function Field({ label, name, type, placeholder }: {
  label: string; name: string; type: string; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-muted)" }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={type === "password" ? "current-password" : name}
        className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card)",
          color: "var(--foreground)",
        }}
      />
    </div>
  );
}

function SocialBtn({ onClick, disabled, label, icon }: {
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Em breve — requer configuração" : undefined}
      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all"
      style={{
        background: disabled ? "#f9f9f9" : "var(--color-card)",
        borderColor: "var(--color-border)",
        color: disabled ? "var(--color-muted)" : "var(--foreground)",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
