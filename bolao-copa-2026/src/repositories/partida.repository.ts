import { prismaClient } from "../config/prisma.client";

// Repositório responsável pelas partidas no banco relacional:
// criação, consulta de horário (regra de bloqueio de palpites) e encerramento.
export class PartidaRepository {
  async criar(timeCasaId: number, timeVisitanteId: number, dataHoraInicio: Date) {
    return prismaClient.partida.create({
      data: { timeCasaId, timeVisitanteId, dataHoraInicio },
    });
  }

  async buscarPorId(id: number) {
    return prismaClient.partida.findUnique({
      where: { id },
      include: { timeCasa: true, timeVisitante: true },
    });
  }

  async encerrarPartida(id: number, placarCasa: number, placarVisitante: number) {
    return prismaClient.partida.update({
      where: { id },
      data: { placarCasa, placarVisitante, encerrada: true },
    });
  }
}
