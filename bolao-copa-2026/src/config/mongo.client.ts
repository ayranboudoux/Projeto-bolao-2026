import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "bolao_copa_2026";

// Cliente MongoDB responsável pelo armazenamento de dados semiestruturados:
// linha do tempo e feed de atividades globais do sistema.
const mongoClient = new MongoClient(MONGO_URI);

let db: Db;

export async function connectMongo(): Promise<Db> {
  if (!db) {
    await mongoClient.connect();
    db = mongoClient.db(MONGO_DB_NAME);
  }
  return db;
}

export function getMongoDb(): Db {
  if (!db) {
    throw new Error("MongoDB ainda não foi conectado. Chame connectMongo() primeiro.");
  }
  return db;
}

export async function disconnectMongo(): Promise<void> {
  await mongoClient.close();
}
