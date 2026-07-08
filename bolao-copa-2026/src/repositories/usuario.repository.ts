import { prismaClient } from "../config/prisma.client";

// Repositório responsável por isolar as consultas relacionadas a usuários
// no banco relacional, gerenciado via Prisma ORM.
export class UsuarioRepository {
  async criar(nome: string, email: string) {
    return prismaClient.usuario.create({ data: { nome, email } });
  }

  async buscarPorId(id: number) {
    return prismaClient.usuario.findUnique({ where: { id } });
  }

  async listarTodos() {
    return prismaClient.usuario.findMany();
  }
}
