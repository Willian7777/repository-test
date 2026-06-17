import { signIn } from "@/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card-zaika p-8 w-full max-w-sm text-center">
        <h1 className="text-3xl font-black zaika-gradient-text mb-2">ZAIKA</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-muted)" }}>
          Entre para acessar histórias BL traduzidas 🌸
        </p>

        <form
          action={async () => {
            "use server";
            const params = await searchParams;
            await signIn("google", { redirectTo: params.callbackUrl ?? "/" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border font-semibold text-sm transition-all hover:shadow-md"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--foreground)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>
        </form>

        <p className="text-xs mt-6" style={{ color: "var(--color-muted)" }}>
          Ao entrar, você concorda com nossos{" "}
          <a href="/termos" className="underline hover:text-pink-600">Termos de Uso</a> e{" "}
          <a href="/privacidade" className="underline hover:text-pink-600">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}
