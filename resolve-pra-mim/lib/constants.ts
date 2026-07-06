export const Role = { USER: "USER", ADMIN: "ADMIN" } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Plano = { FREE: "FREE", PRO: "PRO" } as const;
export type Plano = (typeof Plano)[keyof typeof Plano];

export const NivelRisco = {
  BAIXO: "BAIXO",
  MÉDIO: "MÉDIO",
  ALTO: "ALTO",
  URGENTE: "URGENTE",
} as const;
export type NivelRisco = (typeof NivelRisco)[keyof typeof NivelRisco];

export const TipoDocumento = {
  multa: "multa",
  contrato: "contrato",
  boleto: "boleto",
  edital: "edital",
  notificacao: "notificacao",
  outro: "outro",
} as const;
export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento];

export const AcaoAudit = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  ANALISE_CRIADA: "ANALISE_CRIADA",
  ALERTA_CRIADO: "ALERTA_CRIADO",
  CHAT_MENSAGEM: "CHAT_MENSAGEM",
  ASSINATURA_INICIADA: "ASSINATURA_INICIADA",
  ASSINATURA_APROVADA: "ASSINATURA_APROVADA",
  ASSINATURA_CANCELADA: "ASSINATURA_CANCELADA",
  USUARIO_CADASTRO: "USUARIO_CADASTRO",
  USUARIO_EXCLUIR_CONTA: "USUARIO_EXCLUIR_CONTA",
} as const;
export type AcaoAudit = (typeof AcaoAudit)[keyof typeof AcaoAudit];

// Limites por plano
export const LIMITE_ANALISES = { FREE: 5, ANONIMO: 1, PRO: Infinity } as const;
