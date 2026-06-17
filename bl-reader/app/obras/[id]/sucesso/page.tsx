import { auth } from "@/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pagamento Confirmado" };

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ compraId?: string }>;
}) {
  const session = await auth();
  const { compraId } = await searchParams;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card-zaika p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-black mb-2 zaika-gradient-text">Pagamento Confirmado!</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
          Sua obra foi desbloqueada e está disponível na sua biblioteca. Boa leitura! 🌸
        </p>

        {session?.user ? (
          <div className="flex flex-col gap-3">
            <Link href="/biblioteca" className="btn-primary">Ir para Minha Biblioteca</Link>
            <Link href="/obras" className="btn-outline">Ver Mais Obras</Link>
          </div>
        ) : (
          <Link href="/login" className="btn-primary">Entrar para Acessar</Link>
        )}

        {compraId && (
          <p className="text-xs mt-6" style={{ color: "var(--color-muted)" }}>
            Ref.: {compraId}
          </p>
        )}
      </div>
    </div>
  );
}
