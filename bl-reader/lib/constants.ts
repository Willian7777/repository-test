// Constantes que substituem os enums do Prisma (SQLite não suporta enums nativos)
// Estes valores são os mesmos armazenados no banco como strings

export const Role = { LEITORA: "LEITORA", ADMIN: "ADMIN" } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const StatusObra = {
  RASCUNHO: "RASCUNHO",
  PUBLICADO: "PUBLICADO",
  ARQUIVADO: "ARQUIVADO",
} as const;
export type StatusObra = (typeof StatusObra)[keyof typeof StatusObra];

export const StatusCompra = {
  PENDENTE: "PENDENTE",
  APROVADO: "APROVADO",
  CANCELADO: "CANCELADO",
  REEMBOLSADO: "REEMBOLSADO",
} as const;
export type StatusCompra = (typeof StatusCompra)[keyof typeof StatusCompra];

export const AcaoAudit = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  COMPRA_INICIADA: "COMPRA_INICIADA",
  COMPRA_APROVADA: "COMPRA_APROVADA",
  COMPRA_CANCELADA: "COMPRA_CANCELADA",
  ADMIN_UPLOAD: "ADMIN_UPLOAD",
  ADMIN_CRIAR_OBRA: "ADMIN_CRIAR_OBRA",
  ADMIN_EDITAR_OBRA: "ADMIN_EDITAR_OBRA",
  ADMIN_PUBLICAR_OBRA: "ADMIN_PUBLICAR_OBRA",
  ADMIN_OCR: "ADMIN_OCR",
  ADMIN_TRADUCAO: "ADMIN_TRADUCAO",
  USUARIO_EXCLUIR_CONTA: "USUARIO_EXCLUIR_CONTA",
  USUARIO_DOWNLOAD_DADOS: "USUARIO_DOWNLOAD_DADOS",
} as const;
export type AcaoAudit = (typeof AcaoAudit)[keyof typeof AcaoAudit];
