import Mascote from "@/components/Mascote";

type NivelRisco = "BAIXO" | "MÉDIO" | "ALTO" | "URGENTE" | null;

const MENSAGENS: Record<NonNullable<NivelRisco>, string> = {
  BAIXO:   "Tá tranquilo! Mas vale a pena entender o documento.",
  MÉDIO:   "Atenção aqui. Tem prazo pra resolver, não deixa pra última hora.",
  ALTO:    "Eita! Isso precisa de ação rápida. Leia com cuidado.",
  URGENTE: "URGENTE! Age agora, o prazo está chegando!",
};

const EXPRESSAO: Record<NonNullable<NivelRisco>, "normal" | "feliz" | "preocupado" | "urgente"> = {
  BAIXO:   "feliz",
  MÉDIO:   "normal",
  ALTO:    "preocupado",
  URGENTE: "urgente",
};

interface Props {
  mensagem?: string;
  risco?: NivelRisco;
  tamanho?: "sm" | "md";
}

export default function ZeBurocracia({ mensagem, risco, tamanho = "md" }: Props) {
  const texto = risco ? MENSAGENS[risco] : (mensagem ?? "Manda o documento que eu explico tudo!");
  const expressao = risco ? EXPRESSAO[risco] : "normal";
  const isUrgente = risco === "URGENTE";

  return (
    <div className={`flex items-end justify-center gap-3 ${tamanho === "sm" ? "text-sm" : ""}`}>
      <div
        className={`relative bg-white border rounded-2xl rounded-bl-none px-4 py-2.5 shadow-md max-w-xs ${
          isUrgente ? "border-red-200 bg-red-50" : "border-slate-200"
        }`}
      >
        <p className={`text-sm font-medium ${isUrgente ? "text-red-700" : "text-slate-700"}`}>
          {texto}
        </p>
      </div>
      <Mascote
        tamanho={tamanho === "sm" ? "sm" : "md"}
        expressao={expressao}
        className={isUrgente ? "animate-urgente" : ""}
      />
    </div>
  );
}
