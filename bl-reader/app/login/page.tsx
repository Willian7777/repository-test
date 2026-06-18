import type { Metadata } from "next";
import LoginTabs from "@/components/LoginTabs";

export const metadata: Metadata = { title: "Entrar | ZAIKA" };

// Checa no servidor se o Google está configurado
function googleConfigurado() {
  const id = process.env.GOOGLE_CLIENT_ID ?? "";
  return id.length > 0 && id !== "PREENCHA";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; callbackUrl?: string; error?: string }>;
}) {
  const { tab, callbackUrl, error } = await searchParams;
  const abaInicial = tab === "cadastro" ? "cadastro" : "entrar";
  const destino = callbackUrl ?? "/";

  return (
    <div
      className="min-h-[90vh] flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #fce8f3 0%, #ede9fe 100%)" }}
    >
      {/* Card */}
      <div className="card-zaika w-full max-w-md overflow-hidden">
        {/* Cabeçalho */}
        <div className="text-center pt-8 pb-4 px-8">
          <h1 className="text-4xl font-black zaika-gradient-text">ZAIKA</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Histórias BL traduzidas com carinho 🌸
          </p>
        </div>

        <LoginTabs
          abaInicial={abaInicial}
          destino={destino}
          googleAtivo={googleConfigurado()}
          erro={error}
        />
      </div>
    </div>
  );
}

