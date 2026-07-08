import { PrismaClient } from "@prisma/client";

// Cliente único do ORM (PostgreSQL) reutilizado em toda a aplicação,
// evitando múltiplas conexões abertas simultaneamente.
export const prismaClient = new PrismaClient();

export async function disconnectPrisma(): Promise<void> {
  await prismaClient.$disconnect();
}
