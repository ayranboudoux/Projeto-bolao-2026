import { PalpiteRepository } from "../repositories/palpite.repository";
import { PartidaRepository } from "../repositories/partida.repository";
import { FeedRepository } from "../repositories/feed.repository";

// Serviço responsável pelo fluxo de apostas: valida regras no banco
// relacional, persiste o palpite e registra a atividade no MongoDB.
export class PalpiteService {
  constructor(
    private palpiteRepository = new PalpiteRepository(),
    private partidaRepository = new PartidaRepository(),
    private feedRepository = new FeedRepository()
  ) {}

  async registrarPalpite(
    usuarioId: number,
    usuarioNome: string,
    partidaId: number,
    placarCasa: number,
    placarVisitante: number
  ) {
    const partida = await this.partidaRepository.buscarPorId(partidaId);
    if (!partida) {
      throw new Error("Partida não encontrada.");
    }

    // Regra de negócio: bloqueio de palpites após o início da partida.
    if (new Date() >= partida.dataHoraInicio || partida.encerrada) {
      throw new Error("Não é possível palpitar: a partida já começou ou foi encerrada.");
    }

    // Unicidade garantida pela chave composta no banco relacional (upsert).
    const palpite = await this.palpiteRepository.criarOuAtualizar(
      usuarioId,
      partidaId,
      placarCasa,
      placarVisitante
    );

    const nomeTimeCasa = partida.timeCasa.nome;
    const nomeTimeVisitante = partida.timeVisitante.nome;

    await this.feedRepository.registrarEvento({
      tipo: "PALPITE_CRIADO",
      usuarioNome,
      mensagem: `${usuarioNome} fez um palpite no jogo ${nomeTimeCasa} x ${nomeTimeVisitante}`,
      detalhes: {
        partidaId,
        placarPalpite: `${placarCasa}x${placarVisitante}`,
      },
      criadoEm: new Date(),
    });

    return palpite;
  }
}
