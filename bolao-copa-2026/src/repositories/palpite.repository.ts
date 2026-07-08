import { prismaClient } from "../config/prisma.client";

// Repositório responsável pelos palpites oficiais no banco relacional.
// Garante, via chave única composta (usuarioId + partidaId), que cada
// usuário tenha apenas um palpite por partida (regra de unicidade).
export class PalpiteRepository {
  async criarOuAtualizar(
    usuarioId: number,
    partidaId: number,
    placarCasa: number,
    placarVisitante: number
  ) {
    // upsert respeita a constraint única composta definida no schema.prisma,
    // permitindo alterar o palpite até o horário de início da partida.
    return prismaClient.palpite.upsert({
      where: {
        usuario_partida_unique: { usuarioId, partidaId },
      },
      update: { placarCasa, placarVisitante },
      create: { usuarioId, partidaId, placarCasa, placarVisitante },
    });
  }

  async listarPorPartida(partidaId: number) {
    return prismaClient.palpite.findMany({
      where: { partidaId },
      include: { usuario: true },
    });
  }

  async atualizarPontuacao(id: number, pontosGanhos: number) {
    return prismaClient.palpite.update({
      where: { id },
      data: { pontosGanhos },
    });
  }
}
