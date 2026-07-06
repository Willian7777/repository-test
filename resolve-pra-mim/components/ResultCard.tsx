interface CardProps {
  titulo: string;
  icone: string;
  bgCor: string;
  bordaCor: string;
  tituloCor: string;
  conteudo: string | string[];
}

export function Card({ titulo, icone, bgCor, bordaCor, tituloCor, conteudo }: CardProps) {
  return (
    <div className={`rounded-xl border ${bordaCor} ${bgCor} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icone}</span>
        <h2 className={`font-semibold text-sm uppercase tracking-wide ${tituloCor}`}>{titulo}</h2>
      </div>
      {Array.isArray(conteudo) ? (
        <ul className="space-y-2">
          {conteudo.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-700 text-sm leading-relaxed">
              <span className={`${tituloCor} mt-0.5 font-bold shrink-0`}>{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-700 text-sm leading-relaxed">{conteudo}</p>
      )}
    </div>
  );
}

const BADGE_RISCO: Record<string, { label: string; classe: string }> = {
  BAIXO:   { label: "✅ Risco Baixo",   classe: "bg-green-100 text-green-700 border-green-200" },
  MÉDIO:   { label: "⚠️ Risco Médio",   classe: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ALTO:    { label: "🔴 Risco Alto",    classe: "bg-orange-100 text-orange-700 border-orange-200" },
  URGENTE: { label: "🚨 URGENTE",       classe: "bg-red-100 text-red-700 border-red-200 animate-urgente font-bold" },
};

const TIPO_EMOJI: Record<string, string> = {
  multa:       "🚗",
  contrato:    "📝",
  boleto:      "💳",
  edital:      "📋",
  notificacao: "🔔",
  outro:       "📄",
};

interface BadgeRiscoProps { nivel: string }
export function BadgeRisco({ nivel }: BadgeRiscoProps) {
  const cfg = BADGE_RISCO[nivel] ?? BADGE_RISCO.BAIXO;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${cfg.classe}`}>
      {cfg.label}
    </span>
  );
}

interface BadgeTipoProps { tipo: string }
export function BadgeTipo({ tipo }: BadgeTipoProps) {
  const emoji = TIPO_EMOJI[tipo] ?? "📄";
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-sm capitalize">
      {emoji} {tipo === "notificacao" ? "Notificação" : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
    </span>
  );
}
