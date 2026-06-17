"use client";

import { useState } from "react";
import { InventoryValuation } from "@/types/inventory";
import InventoryView from "@/components/InventoryView";

const LEAGUE_LIST = [
  { id: "Runes of Aldur", label: "Runes of Aldur" },
  { id: "Hardcore Runes of Aldur", label: "HC Runes of Aldur" },
  { id: "Standard", label: "Standard" },
  { id: "Hardcore", label: "Hardcore" },
];

export default function InventoryPage() {
  const [account, setAccount] = useState("");
  const [character, setCharacter] = useState("");
  const [league, setLeague] = useState("Runes of Aldur");
  const [sessid, setSessid] = useState("");
  const [showSessid, setShowSessid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InventoryValuation | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account.trim() || !character.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: account.trim(),
          character: character.trim(),
          league,
          sessid: sessid.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Erro ${res.status}`);
      } else {
        setResult(data);
      }
    } catch {
      setError("Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Valoração de <span className="text-amber-400">Inventário</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Informe sua conta e personagem para estimar o valor de mercado dos seus itens equipados.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Account name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
              Nome da conta <span className="text-red-400">*</span>
            </label>
            <input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="SuaConta123"
              required
              className="w-full bg-[#080b10] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/60 transition-all"
            />
            <p className="text-xs text-gray-600 mt-1">
              Nome de conta do pathofexile.com (não o nome do personagem)
            </p>
          </div>

          {/* Character name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
              Nome do personagem <span className="text-red-400">*</span>
            </label>
            <input
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder="NomeDoPersonagem"
              required
              className="w-full bg-[#080b10] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/60 transition-all"
            />
          </div>
        </div>

        {/* League */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Liga</label>
          <div className="flex gap-2 flex-wrap">
            {LEAGUE_LIST.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLeague(l.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  league === l.id
                    ? "bg-amber-500 text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* POESESSID toggle */}
        <div className="border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={() => setShowSessid(!showSessid)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
          >
            <span>{showSessid ? "▼" : "▶"}</span>
            Perfil privado? Usar POESESSID (opcional)
          </button>

          {showSessid && (
            <div className="mt-3 space-y-2">
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3">
                <p className="text-xs text-amber-400 font-medium mb-1">⚠️ Aviso de segurança</p>
                <p className="text-xs text-amber-400/70">
                  O POESESSID é seu cookie de sessão do pathofexile.com. Ele é enviado diretamente
                  ao servidor do PoE e <strong>nunca é armazenado</strong> por esta aplicação.
                  Use somente em instâncias locais confiáveis.
                  <br />
                  Para obtê-lo: F12 no browser → Application → Cookies → pathofexile.com → POESESSID
                </p>
              </div>
              <input
                type="password"
                value={sessid}
                onChange={(e) => setSessid(e.target.value)}
                placeholder="cole seu POESESSID aqui"
                autoComplete="off"
                className="w-full bg-[#080b10] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/60 transition-all font-mono text-xs"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !account.trim() || !character.trim()}
          className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-xl text-sm transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Carregando...
            </>
          ) : (
            "Calcular valor do inventário"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm text-red-400">
            <span className="font-semibold">Erro: </span>{error}
          </p>
          {error.includes("privado") && (
            <p className="text-xs text-red-400/70 mt-1">
              Para acessar perfis privados, forneça o POESESSID nas opções avançadas acima.
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {result && <InventoryView data={result} league={league} />}
    </div>
  );
}
