"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const NAV = [
  { href: "/admin",           icon: "📊", label: "Dashboard"     },
  { href: "/admin/obras",     icon: "📚", label: "Obras"         },
  { href: "/admin/tradutor",  icon: "🌐", label: "Tradutor"      },
];

export default function AdminSidebar() {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col border-r shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? 64 : 220,
        background: "#fff",
        borderColor: "var(--color-border)",
        minHeight: "100vh",
      }}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        {!collapsed && (
          <Link href="/admin" className="font-black text-lg zaika-gradient-text">
            ZAIKA
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-pink-50 ml-auto"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Badge admin */}
      {!collapsed && (
        <div className="px-4 py-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
            ⚙ Administrador
          </span>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV.map(({ href, icon, label }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={active
                ? { background: "var(--color-primary)", color: "#fff" }
                : { color: "var(--foreground)" }}
            >
              <span className="text-base shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--color-border)" }}>
        <Link
          href="/"
          title={collapsed ? "Ver site" : undefined}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all hover:bg-pink-50"
          style={{ color: "var(--color-muted)" }}
        >
          <span className="shrink-0">🌸</span>
          {!collapsed && <span>Ver site</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Sair" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all hover:bg-red-50"
          style={{ color: "#dc2626" }}
        >
          <span className="shrink-0">🚪</span>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
