import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Resolve Pra Mim — Entenda qualquer documento",
  description: "Envie multas, contratos, boletos, editais ou notificações e receba uma explicação simples, sem juridiquês, em segundos.",
  keywords: ["documento", "multa", "contrato", "boleto", "explicação", "juridiquês", "Brasil"],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Resolve Pra Mim" },
  openGraph: {
    title: "Resolve Pra Mim",
    description: "Entenda qualquer documento sem juridiquês.",
    siteName: "Resolve Pra Mim",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={font.variable}>
      <body className="font-[family-name:var(--font-jakarta)]">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
