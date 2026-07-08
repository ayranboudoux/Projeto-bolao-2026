import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Cliente Redis responsável pelo armazenamento em memória do ranking global.
// Utilizado para alta performance de leitura/ordenação de dados voláteis.
export const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

export async function disconnectRedis(): Promise<void> {
  await redisClient.quit();
}
