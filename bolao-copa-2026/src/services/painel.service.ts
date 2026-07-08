import { UsuarioRepository } from "../repositories/usuario.repository";
import { RankingRepository } from "../repositories/ranking.repository";
import { FeedRepository } from "../repositories/feed.repository";
import { RankingEntry } from "../types/feed.types";

// Serviço responsável pelo fluxo de consulta do painel.
// Agrega dados das três fontes: cadastro (ORM), ranking (Redis)
// e linha do tempo de eventos (MongoDB).
export class PainelService {
  constructor(
    private usuarioRepository = new UsuarioRepository(),
    private rankingRepository = new RankingRepository(),
    private feedRepository = new FeedRepository()
  ) {}

  async obterTopRankingComNomes(quantidade: number): Promise<RankingEntry[]> {
    const topRanking = await this.rankingRepository.obterTopRanking(quantidade);

    const ranking: RankingEntry[] = [];
    for (let i = 0; i < topRanking.length; i++) {
      const usuario = await this.usuarioRepository.buscarPorId(topRanking[i].usuarioId);
      ranking.push({
        usuarioId: topRanking[i].usuarioId,
        nome: usuario?.nome ?? "Desconhecido",
        pontos: topRanking[i].pontos,
        posicao: i + 1,
      });
    }
    return ranking;
  }

  async obterUltimosEventosFeed(quantidade: number) {
    return this.feedRepository.listarUltimosEventos(quantidade);
  }
}
