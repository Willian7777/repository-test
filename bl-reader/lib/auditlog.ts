import { prisma } from "@/lib/prisma";
import { AcaoAudit } from "@/lib/constants";
import crypto from "crypto";

/**
 * Registra uma ação no log de auditoria.
 * O IP é armazenado como hash SHA-256 — não é dado pessoal identificável diretamente (LGPD).
 */
export async function registrarAuditoria({
  userId,
  acao,
  entidade,
  entidadeId,
  ip,
  metadata,
}: {
  userId?: string;
  acao: AcaoAudit;
  entidade?: string;
  entidadeId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const ipHash = ip
      ? crypto.createHash("sha256").update(ip).digest("hex")
      : undefined;

    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        acao,
        entidade: entidade ?? null,
        entidadeId: entidadeId ?? null,
        ipHash: ipHash ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (err) {
    // Log de auditoria nunca deve derrubar a operação principal
    console.error("[AuditLog] Falha ao registrar:", err);
  }
}

export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
