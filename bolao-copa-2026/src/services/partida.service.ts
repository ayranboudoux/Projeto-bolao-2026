import { PartidaRepository } from "../repositories/partida.repository";
import { PalpiteRepository } from "../repositories/palpite.repository";
import { RankingRepository } from "../repositories/ranking.repository";
import { FeedRepository } from "../repositories/feed.repository";

const PONTOS_PLACAR_EXATO = 50;

// Serviço responsável pelo fluxo de encerramento de partida.
// Orquestra as três tecnologias simultaneamente:
// 1) ORM: registra o placar final.
// 2) ORM: busca os palpites da partida e calcula pontuação.
// 3) Redis: atualiza o ranking global (sorted set).
// 4) MongoDB: registra evento de conquista para cada acerto.
export class PartidaService {
  constructor(
    private partidaRepository = new PartidaRepository(),
    private palpiteRepository = new PalpiteRepository(),
    private rankingRepository = new RankingRepository(),
    private feedRepository = new FeedRepository()
  ) {}

  async encerrarPartida(partidaId: number, placarCasa: number, placarVisitante: number) {
    await this.partidaRepository.encerrarPartida(partidaId, placarCasa, placarVisitante);

    const palpites = await this.palpiteRepository.listarPorPartida(partidaId);

    console.log("[Redis] Atualizando pontuações no ranking...");

    for (const palpite of palpites) {
      const acertouPlacarExato =
        palpite.placarCasa === placarCasa && palpite.placarVisitante === placarVisitante;

      if (acertouPlacarExato) {
        await this.palpiteRepository.atualizarPontuacao(palpite.id, PONTOS_PLACAR_EXATO);
        await this.rankingRepository.incrementarPontuacao(palpite.usuarioId, PONTOS_PLACAR_EXATO);

        await this.feedRepository.registrarEvento({
          tipo: "MEDALHA_GANHA",
          usuarioNome: palpite.usuario.nome,
          mensagem: `${palpite.usuario.nome} acertou o placar em cheio e ganhou ${PONTOS_PLACAR_EXATO} pontos!`,
          detalhes: { partidaId, pontos: PONTOS_PLACAR_EXATO },
          criadoEm: new Date(),
        });
      } else {
        // Garante que o usuário apareça no ranking mesmo com 0 pontos.
        await this.rankingRepository.incrementarPontuacao(palpite.usuarioId, 0);
      }
    }
  }
}
