import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PoE2 Market — Bolsa de Itens",
  description: "Acompanhe os preços e tendências do mercado de Path of Exile 2 em tempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080b10] text-gray-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-4 text-center text-xs text-gray-600">
          Dados fornecidos por{" "}
          <a href="https://poe.ninja" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-400">
            poe.ninja
          </a>{" "}
          · Path of Exile 2 é marca da Grinding Gear Games
        </footer>
      </body>
    </html>
  );
}
