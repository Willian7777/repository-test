import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MS Cert Study",
  description: "Plataforma de estudo para certificações Microsoft — trilhas de carreira, simulados e labs práticos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        {/* Nav */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 hover:text-blue-600 transition-colors">
              <span className="text-xl">🎓</span>
              <span>MS Cert Study</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/trails" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Trilhas
              </Link>
              <Link href="/catalog" className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Catálogo
              </Link>
              <Link href="/my-certs" className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Meus estudos
              </Link>
            </div>
          </div>
        </nav>

        {/* Conteúdo */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-auto py-4 text-center text-xs text-gray-400">
          MS Cert Study · Conteúdo baseado no{" "}
          <a href="https://learn.microsoft.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
            Microsoft Learn
          </a>
        </footer>
      </body>
    </html>
  );
}
