"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        background: "rgba(255,245,249,0.92)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <span className="text-2xl font-black tracking-tight zaika-gradient-text">
            ZAIKA
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
            BL
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/obras" className="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors hover:text-pink-600" style={{ color: "var(--foreground)" }}>
            Obras
          </Link>
          {session?.user && (
            <Link href="/biblioteca" className="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors hover:text-pink-600" style={{ color: "var(--foreground)" }}>
              Minha Biblioteca
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="px-3 py-1.5 text-sm rounded-lg font-medium transition-colors" style={{ color: "var(--color-secondary)" }}>
              ⚙ Admin
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full p-1 transition-all hover:ring-2"
                style={{ "--tw-ring-color": "var(--color-primary)" } as React.CSSProperties}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "var(--color-primary)" }}>
                    {session.user.name?.[0] ?? "U"}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                  {session.user.name}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border py-1 z-50" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
                  <Link href="/conta" className="block px-4 py-2 text-sm hover:bg-pink-50" onClick={() => setMenuOpen(false)}>
                    Minha Conta
                  </Link>
                  <Link href="/biblioteca" className="block px-4 py-2 text-sm hover:bg-pink-50" onClick={() => setMenuOpen(false)}>
                    Biblioteca
                  </Link>
                  <hr style={{ borderColor: "var(--color-border)" }} className="my-1" />
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => signIn("google")} className="btn-primary text-sm">
              Entrar com Google
            </button>
          )}

          {/* Menu mobile */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMenuOpen(!menuOpen)} style={{ color: "var(--foreground)" }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
          <Link href="/obras" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Obras</Link>
          {session?.user && (
            <Link href="/biblioteca" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Minha Biblioteca</Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="block py-2 text-sm font-medium" style={{ color: "var(--color-secondary)" }} onClick={() => setMenuOpen(false)}>
              ⚙ Admin
            </Link>
          )}
          {!session?.user && (
            <button onClick={() => signIn("google")} className="w-full btn-primary text-sm mt-2">
              Entrar com Google
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
