import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <p>© {new Date().getFullYear()} Resolve Pra Mim</p>
        <div className="flex gap-4">
          <Link href="/precos" className="hover:text-slate-600 transition-colors">Planos</Link>
          <Link href="/privacidade" className="hover:text-slate-600 transition-colors">Privacidade</Link>
          <Link href="/termos" className="hover:text-slate-600 transition-colors">Termos</Link>
        </div>
      </div>
    </footer>
  );
}
