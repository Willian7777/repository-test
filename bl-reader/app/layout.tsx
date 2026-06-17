import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsentimentoBanner from "@/components/ConsentimentoBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "ZAIKA", template: "%s | ZAIKA" },
  description:
    "Leia histórias BL traduzidas com carinho. Mangás, manhwas e novels em português.",
  keywords: ["BL", "Boys Love", "mangá", "manhwa", "tradução", "yaoi"],
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ConsentimentoBanner userId={session?.user?.id} />
        </SessionProvider>
      </body>
    </html>
  );
}
