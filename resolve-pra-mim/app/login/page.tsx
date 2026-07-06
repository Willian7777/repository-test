"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [aba, setAba]         = useState<"entrar" | "criar">("entrar");
  const [email, setEmail]     = useState("");
  const [senha, setSenha]     = useState("");
  const [nome, setNome]       = useState("");
  const [erro, setErro]       = useState("");
  const [ok, setOk]           = useState(false);
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setLoading(true);
    const res = await signIn("credentials", { email, password: senha, redirect: false });
    setLoading(false);
    if (res?.error) { setErro("E-mail ou senha incorretos."); return; }
    router.push("/");
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setLoading(true);
    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json() as { erro?: string };
      if (!res.ok) throw new Error(data.erro ?? "Erro ao criar conta.");
      setOk(true);
      // Faz login automaticamente
      await signIn("credentials", { email, password: senha, redirect: false });
      router.push("/");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <span className="text-4xl">🧑‍💼</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-3">Resolve Pra Mim</h1>
            <p className="text-slate-500 mt-1 text-sm">Entre para salvar seu histórico de análises</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Abas */}
            <div className="flex border-b border-slate-200">
              {(["entrar", "criar"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => { setAba(a); setErro(""); }}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    aba === a
                      ? "text-blue-700 border-b-2 border-blue-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {a === "entrar" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Google OAuth */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <hr className="flex-1 border-slate-200" />
                <span className="text-xs text-slate-400">ou</span>
                <hr className="flex-1 border-slate-200" />
              </div>

              {aba === "entrar" ? (
                <form onSubmit={entrar} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Senha"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {erro && <p className="text-red-600 text-xs">{erro}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-semibold rounded-xl text-sm transition-all"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                </form>
              ) : (
                <form onSubmit={criar} className="space-y-3">
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Senha (mín. 8 caracteres)"
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {erro && <p className="text-red-600 text-xs">{erro}</p>}
                  {ok  && <p className="text-green-600 text-xs">Conta criada! Redirecionando...</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-semibold rounded-xl text-sm transition-all"
                  >
                    {loading ? "Criando..." : "Criar conta grátis"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Ao continuar, você concorda com nossos{" "}
            <Link href="/termos" className="underline">Termos</Link> e{" "}
            <Link href="/privacidade" className="underline">Política de Privacidade</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
