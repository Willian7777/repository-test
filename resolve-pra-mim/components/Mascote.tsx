interface Props {
  tamanho?: "sm" | "md" | "lg" | "xl";
  expressao?: "normal" | "feliz" | "preocupado" | "urgente";
  className?: string;
}

const BOCA = {
  normal:     "M84 68 Q100 77 116 68",
  feliz:      "M80 63 Q100 81 120 63",
  preocupado: "M84 73 Q100 65 116 73",
  urgente:    "M84 74 Q100 63 116 74",
};

const COR_BOCA = {
  normal: "#60A5FA", feliz: "#34D399", preocupado: "#93C5FD", urgente: "#FCA5A5",
};

export default function Mascote({ tamanho = "md", expressao = "normal", className }: Props) {
  const boca = BOCA[expressao];
  const corBoca = COR_BOCA[expressao];
  const sizes = { sm: "w-20", md: "w-36", lg: "w-52", xl: "w-72" };

  return (
    <svg
      viewBox="0 0 200 230"
      className={`${sizes[tamanho]} h-auto select-none ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Resolvio, mascote do Resolve Pra Mim"
    >
      <defs>
        <linearGradient id="m-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="m-cape" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>
        <linearGradient id="m-screen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <filter id="m-shadow">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#1E40AF" floodOpacity="0.35" />
        </filter>
        <filter id="m-shadow-sm">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#1E40AF" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* ── Cape (atrás do corpo) ── */}
      <path
        d="M62 114 C36 124 28 168 32 212 Q66 225 100 222 Q134 225 168 212 C172 168 164 124 138 114 Z"
        fill="url(#m-cape)"
      />
      {/* brilho da capa */}
      <path d="M62 114 C50 130 44 160 46 200" stroke="white" strokeWidth="2" fill="none" opacity="0.12" strokeLinecap="round"/>

      {/* ── Braço esquerdo ── */}
      <rect x="6" y="118" width="48" height="20" rx="10" fill="url(#m-body)" />

      {/* Documento na mão esquerda */}
      <rect x="2" y="133" width="44" height="56" rx="7" fill="white" stroke="#DBEAFE" strokeWidth="1.5" />
      {/* Cabeçalho do documento */}
      <rect x="8" y="139" width="32" height="5" rx="2.5" fill="#BFDBFE" />
      {/* Linhas de texto */}
      <rect x="8" y="150" width="32" height="3.5" rx="1.5" fill="#DBEAFE" />
      <rect x="8" y="158" width="32" height="3.5" rx="1.5" fill="#DBEAFE" />
      <rect x="8" y="166" width="22" height="3.5" rx="1.5" fill="#DBEAFE" />
      {/* Carimbo de aprovação */}
      <circle cx="30" cy="178" r="10" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1.5" />
      <path d="M24 178 L28 182 L36 172" stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Braço direito ── */}
      <rect x="146" y="118" width="48" height="20" rx="10" fill="url(#m-body)" />

      {/* Lupa na mão direita */}
      <circle cx="172" cy="152" r="21" stroke="#F59E0B" strokeWidth="4.5" fill="none" />
      <circle cx="172" cy="152" r="16.5" fill="#EFF6FF" fillOpacity="0.55" />
      {/* reflexo na lupa */}
      <path d="M163 143 Q165 139 170 141" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
      {/* cabo da lupa */}
      <line x1="187" y1="167" x2="198" y2="180" stroke="#D97706" strokeWidth="6.5" strokeLinecap="round" />

      {/* ── Corpo ── */}
      <rect x="44" y="110" width="112" height="84" rx="18" fill="url(#m-body)" filter="url(#m-shadow)" />
      {/* Badge do peito (vidro) */}
      <rect x="64" y="126" width="72" height="56" rx="12" fill="white" fillOpacity="0.14" />
      {/* Checkmark grande no peito */}
      <path d="M76 154 L89 167 L124 134" stroke="white" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.88" />

      {/* ── Pescoço ── */}
      <rect x="78" y="92" width="44" height="22" rx="11" fill="url(#m-body)" />

      {/* ── Cabeça ── */}
      <rect x="28" y="14" width="144" height="84" rx="24" fill="url(#m-body)" filter="url(#m-shadow)" />

      {/* Tela/rosto */}
      <rect x="41" y="23" width="118" height="66" rx="15" fill="url(#m-screen)" />

      {/* ── Olho esquerdo ── */}
      <circle cx="81" cy="53" r="15" fill="#60A5FA" />
      <circle cx="83" cy="55" r="9" fill="#1E40AF" />
      <circle cx="86" cy="50" r="4" fill="white" opacity="0.9" />
      <circle cx="81" cy="59" r="2" fill="#3B82F6" opacity="0.5" />

      {/* ── Olho direito ── */}
      <circle cx="119" cy="53" r="15" fill="#60A5FA" />
      <circle cx="121" cy="55" r="9" fill="#1E40AF" />
      <circle cx="124" cy="50" r="4" fill="white" opacity="0.9" />
      <circle cx="119" cy="59" r="2" fill="#3B82F6" opacity="0.5" />

      {/* ── Boca (muda com a expressão) ── */}
      <path d={boca} stroke={corBoca} strokeWidth="4.5" fill="none" strokeLinecap="round" />

      {/* ── Antena ── */}
      <rect x="92" y="2" width="16" height="16" rx="8" fill="url(#m-body)" />
      {/* Bola da antena */}
      <circle cx="100" cy="2" r="11" fill="#F59E0B" />
      <circle cx="100" cy="2" r="8" fill="#FCD34D" />
      {/* R na bola */}
      <text
        x="100" y="7"
        textAnchor="middle"
        fontSize="10"
        fill="#92400E"
        fontWeight="900"
        fontFamily="system-ui, sans-serif"
      >
        R
      </text>

      {/* ── Pernas ── */}
      <rect x="56" y="192" width="38" height="42" rx="14" fill="#1D4ED8" />
      <rect x="106" y="192" width="38" height="42" rx="14" fill="#1D4ED8" />

      {/* ── Pés ── */}
      <ellipse cx="75" cy="231" rx="22" ry="9" fill="#1E40AF" />
      <ellipse cx="125" cy="231" rx="22" ry="9" fill="#1E40AF" />
    </svg>
  );
}
