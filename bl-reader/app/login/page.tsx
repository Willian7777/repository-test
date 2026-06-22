import type { Metadata } from "next";
import LoginTabs from "@/components/LoginTabs";

export const metadata: Metadata = { title: "Entrar | ZAIKA" };

function ativo(val?: string) { return !!val && val !== "PREENCHA"; }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; callbackUrl?: string; error?: string }>;
}) {
  const { tab, callbackUrl, error } = await searchParams;
  const abaInicial = tab === "cadastro" ? "cadastro" : "entrar";
  const destino = callbackUrl ?? "/";

  const provedores = {
    google:   ativo(process.env.GOOGLE_CLIENT_ID),
    facebook: ativo(process.env.FACEBOOK_CLIENT_ID),
    github:   ativo(process.env.GITHUB_CLIENT_ID),
    discord:  ativo(process.env.DISCORD_CLIENT_ID),
  };

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
          provedores={provedores}
          erro={error}
        />
      </div>
    </div>
  );
}

