"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Mascote from "@/components/Mascote";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <nav className="bg-white/85 backdrop-blur-xl border-b border-slate-200/70 sticky top-0 z-50 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 shrink-0">
            <Mascote tamanho="sm" />
          </div>
          <span className="font-extrabold text-slate-900 text-lg leading-tight hidden sm:block">
            Resolve<span className="text-blue-600">Pra</span>Mim
          </span>
        </Link>

        {/* Ações */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              {session.user.plano !== "PRO" && (
                <Link
                  href="/precos"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  ✨ Seja PRO
                </Link>
              )}
              {session.user.plano === "PRO" && (
                <span className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                  ✨ PRO
                </span>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuAberto(!menuAberto)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-7 h-7 rounded-full ring-2 ring-blue-200" />
                  ) : (
                    <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-28 truncate">
                    {session.user.name?.split(" ")[0] ?? session.user.email}
                  </span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuAberto && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden">
                      <Link href="/historico" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setMenuAberto(false)}>
                        <span>📋</span> Meu histórico
                      </Link>
                      <Link href="/conta" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setMenuAberto(false)}>
                        <span>👤</span> Minha conta
                      </Link>
                      <Link href="/precos" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setMenuAberto(false)}>
                        <span>💎</span> Planos
                      </Link>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={() => { setMenuAberto(false); signOut({ callbackUrl: "/" }); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span>↩️</span> Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/precos" className="hidden sm:block px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                💎 Planos
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
