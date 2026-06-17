import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ObraCard from "@/components/ObraCard";
import Link from "next/link";
import { StatusObra } from "@/lib/constants";

export default async function HomePage() {
  const session = await auth();

  const destaque = await prisma.obra.findMany({
    where: { status: StatusObra.PUBLICADO },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const compraIds = session?.user
    ? (
        await prisma.compra.findMany({
          where: { userId: session.user.id, status: "APROVADO" },
          select: { obraId: true },
        })
      ).map((c) => c.obraId)
    : [];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-4" style={{ background: "linear-gradient(135deg, #fce8f3 0%, #ede9fe 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold mb-3 tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
            ✦ Histórias BL em Português
          </p>
          <h1 className="text-5xl md:text-7xl font-black mb-4 zaika-gradient-text leading-none">
            ZAIKA
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto" style={{ color: "var(--color-muted)" }}>
            Mangás, manhwas e novels BL traduzidos com cuidado — para você que merece ler histórias incríveis no seu idioma.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/obras" className="btn-primary text-base px-8 py-3">
              Ver Catálogo
            </Link>
            {!session?.user && (
              <Link href="/login" className="btn-outline text-base px-8 py-3">
                Criar Conta Grátis
              </Link>
            )}
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20" style={{ background: "var(--color-primary)" }} />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-10" style={{ background: "var(--color-secondary)" }} />
      </section>

      {/* ── Como funciona ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: "var(--color-card)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--foreground)" }}>
            Como funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "📖", titulo: "Escolha uma obra", texto: "Navegue pelo catálogo e encontre a história perfeita para você." },
              { icon: "💳", titulo: "Pagamento simbólico", texto: "Desbloqueie a obra inteira com um único pagamento via PIX ou cartão." },
              { icon: "🌸", titulo: "Leia quando quiser", texto: "Acesse todos os capítulos na sua biblioteca, a qualquer hora." },
            ].map(({ icon, titulo, texto }) => (
              <div key={titulo} className="text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold mb-2" style={{ color: "var(--foreground)" }}>{titulo}</h3>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Obras em destaque ─────────────────────────────────────────────── */}
      {destaque.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                ✦ Obras em Destaque
              </h2>
              <Link href="/obras" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {destaque.map((obra) => (
                <ObraCard key={obra.id} {...obra} comprado={compraIds.includes(obra.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!session?.user && (
        <section className="py-16 px-4 text-center" style={{ background: "linear-gradient(135deg, #fce8f3 0%, #ede9fe 100%)" }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--foreground)" }}>Pronta para começar?</h2>
          <p className="mb-6" style={{ color: "var(--color-muted)" }}>Entre com sua conta Google e explore o catálogo.</p>
          <Link href="/login" className="btn-primary text-base px-8 py-3">Entrar Agora</Link>
        </section>
      )}
    </div>
  );
}

