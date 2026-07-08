import { prismaClient } from "../config/prisma.client";

// Repositório responsável pelo cadastro de seleções (times) no banco relacional.
export class SelecaoRepository {
  async criar(nome: string, bandeira?: string) {
    return prismaClient.selecao.upsert({
      where: { nome },
      update: {},
      create: { nome, bandeira },
    });
  }

  async buscarPorNome(nome: string) {
    return prismaClient.selecao.findUnique({ where: { nome } });
  }
}
