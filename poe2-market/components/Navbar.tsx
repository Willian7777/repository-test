"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/category/Currency", label: "Moedas" },
  { href: "/category/UniqueWeapon", label: "Armas" },
  { href: "/category/SkillGem", label: "Gemas" },
  { href: "/inventory", label: "💰 Meu Inventário" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-[#080b10]/95 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">⚗️</span>
          <span className="text-base font-bold text-white">
            PoE2 <span className="text-amber-400">Market</span>
          </span>
        </Link>

        {/* Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="https://poe.ninja"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            dados: poe.ninja
          </a>
        </div>
      </div>
    </nav>
  );
}
