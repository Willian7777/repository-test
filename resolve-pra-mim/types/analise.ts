export interface NivelAnalise {
  o_que_e: string;
  prazo: string;
  o_que_fazer: string[];
  riscos: string[];
}

export interface ResultadoAnalise {
  tipo: "multa" | "contrato" | "boleto" | "edital" | "notificacao" | "outro";
  nivel_risco: "BAIXO" | "MÉDIO" | "ALTO" | "URGENTE";
  prazo_data: string | null;       // "DD/MM/AAAA" ou null
  prazo_dias_restantes: number | null;
  alerta_golpe: {
    suspeito: boolean;
    motivos: string[];
  };
  simples: NivelAnalise;
  normal: NivelAnalise;
  tecnico: NivelAnalise;
}

export type NivelLinguagem = "simples" | "normal" | "tecnico";

export interface AnaliseComId {
  id: string;
  resultado: ResultadoAnalise;
  tipoSugerido: string;
  createdAt: string;
  golpeSuspeito: boolean;
  nivelRisco: string;
}
