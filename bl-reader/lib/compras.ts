import { prisma } from "@/lib/prisma";
import { StatusCompra } from "@/lib/constants";

/**
 * Verifica se um usuário tem uma compra aprovada para uma obra.
 * Sempre valida no banco de dados — nunca confiar no lado do cliente.
 */
export async function usuarioComprou(
  userId: string,
  obraId: string
): Promise<boolean> {
  const compra = await prisma.compra.findFirst({
    where: {
      userId,
      obraId,
      status: StatusCompra.APROVADO,
    },
    select: { id: true },
  });
  return compra !== null;
}

/**
 * Retorna todas as obras compradas e aprovadas de um usuário.
 */
export async function obrasCompradas(userId: string) {
  return prisma.compra.findMany({
    where: { userId, status: StatusCompra.APROVADO },
    include: {
      obra: {
        select: {
          id: true,
          titulo: true,
          capaUrl: true,
          generos: true,
          capitulos: {
            where: { publicado: true },
            select: { id: true, numero: true, titulo: true },
            orderBy: { numero: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
