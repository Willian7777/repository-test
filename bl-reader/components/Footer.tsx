import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t mt-16 py-10 text-sm"
      style={{ borderColor: "var(--color-border)", background: "var(--color-primary-light)", color: "var(--color-muted)" }}
    >
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black zaika-gradient-text">ZAIKA</span>
          <span className="text-xs">— Histórias BL traduzidas com carinho 🌸</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/obras" className="hover:text-pink-600 transition-colors">Obras</Link>
          <Link href="/privacidade" className="hover:text-pink-600 transition-colors">Política de Privacidade</Link>
          <Link href="/termos" className="hover:text-pink-600 transition-colors">Termos de Uso</Link>
          <Link href="/conta" className="hover:text-pink-600 transition-colors">Minha Conta</Link>
        </nav>

        <p className="text-xs text-center" style={{ color: "var(--color-muted)" }}>
          © {new Date().getFullYear()} ZAIKA · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
