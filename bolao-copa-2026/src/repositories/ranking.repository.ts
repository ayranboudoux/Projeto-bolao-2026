import { redisClient } from "../config/redis.client";

const RANKING_KEY = "ranking:global";

// Repositório responsável pelo ranking global de pontuação em tempo real.
// Utiliza sorted sets (ZSET) do Redis: a pontuação é o "score" e o
// identificador do usuário é o "member", garantindo ordenação em memória.
export class RankingRepository {
  async incrementarPontuacao(usuarioId: number, pontos: number): Promise<void> {
    await redisClient.zincrby(RANKING_KEY, pontos, String(usuarioId));
  }

  async obterPontuacao(usuarioId: number): Promise<number> {
    const score = await redisClient.zscore(RANKING_KEY, String(usuarioId));
    return score ? Number(score) : 0;
  }

  // Retorna o top N do ranking, do maior para o menor pontuador,
  // junto com a pontuação (withscores), conforme a estrutura sorted set.
  async obterTopRanking(quantidade: number): Promise<Array<{ usuarioId: number; pontos: number }>> {
    const resultado = await redisClient.zrevrange(RANKING_KEY, 0, quantidade - 1, "WITHSCORES");

    const ranking: Array<{ usuarioId: number; pontos: number }> = [];
    for (let i = 0; i < resultado.length; i += 2) {
      ranking.push({
        usuarioId: Number(resultado[i]),
        pontos: Number(resultado[i + 1]),
      });
    }
    return ranking;
  }
}
