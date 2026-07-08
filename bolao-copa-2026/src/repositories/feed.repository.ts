import { getMongoDb } from "../config/mongo.client";
import { EventoFeed } from "../types/feed.types";

const COLLECTION_NAME = "feed_atividades";

// Repositório responsável pelo feed de atividades globais (linha do tempo).
// Permite documentos com campos dinâmicos na mesma coleção, suportando
// diferentes tipos de evento sem uma estrutura rígida (polimorfismo do feed).
export class FeedRepository {
  async registrarEvento(evento: EventoFeed): Promise<void> {
    const db = getMongoDb();
    await db.collection<EventoFeed>(COLLECTION_NAME).insertOne(evento);
  }

  async listarUltimosEventos(quantidade: number): Promise<EventoFeed[]> {
    const db = getMongoDb();
    const eventos = await db
      .collection<EventoFeed>(COLLECTION_NAME)
      .find()
      .sort({ criadoEm: -1 })
      .limit(quantidade)
      .toArray();
    return eventos;
  }
}
