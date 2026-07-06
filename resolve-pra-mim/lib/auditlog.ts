import { prisma } from "@/lib/prisma";
import type { AcaoAudit } from "@/lib/constants";
import crypto from "node:crypto";

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

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}
