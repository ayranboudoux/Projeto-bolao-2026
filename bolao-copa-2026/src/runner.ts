import { connectMongo, disconnectMongo } from "./config/mongo.client";
import { disconnectPrisma, prismaClient } from "./config/prisma.client";
import { disconnectRedis, redisClient } from "./config/redis.client";

import { UsuarioRepository } from "./repositories/usuario.repository";
import { SelecaoRepository } from "./repositories/selecao.repository";
import { PartidaRepository } from "./repositories/partida.repository";

import { PalpiteService } from "./services/palpite.service";
import { PartidaService } from "./services/partida.service";
import { PainelService } from "./services/painel.service";

function formatarHorario(data: Date): string {
  return data.toTimeString().slice(0, 5);
}

async function limparDadosAnteriores() {
  // Limpa dados de execuções anteriores para que a simulação seja idempotente.
  await prismaClient.palpite.deleteMany();
  await prismaClient.partida.deleteMany();
  await prismaClient.selecao.deleteMany();
  await prismaClient.usuario.deleteMany();
  await redisClient.del("ranking:global");
}

async function main() {
  console.log("Iniciando simulação do bolão da copa 2026...\n");

  await connectMongo();
  await limparDadosAnteriores();

  const usuarioRepository = new UsuarioRepository();
  const selecaoRepository = new SelecaoRepository();
  const partidaRepository = new PartidaRepository();

  const palpiteService = new PalpiteService();
  const partidaService = new PartidaService();
  const painelService = new PainelService();

  // --- Cadastro inicial via ORM ---
  const carlos = await usuarioRepository.criar("Carlos", "carlos@example.com");
  const ana = await usuarioRepository.criar("Ana", "ana@example.com");

  const brasil = await selecaoRepository.criar("Brasil", "🇧🇷");
  const croacia = await selecaoRepository.criar("Croácia", "🇭🇷");

  // Partida com início em poucos segundos, simulando a janela de apostas aberta.
  const dataInicio = new Date(Date.now() + 2000);
  const partida = await partidaRepository.criar(brasil.id, croacia.id, dataInicio);

  console.log("[ORM] Usuários e jogos inseridos com sucesso.");

  // --- Fluxo de apostas ---
  await palpiteService.registrarPalpite(carlos.id, carlos.nome, partida.id, 1, 0);
  console.log(`[MongoDB] Evento registrado: "Carlos fez um palpite no jogo Brasil x Croácia"`);

  await palpiteService.registrarPalpite(ana.id, ana.nome, partida.id, 2, 0);
  console.log(`[MongoDB] Evento registrado: "Ana fez um palpite no jogo Brasil x Croácia"`);

  // Aguarda o horário de início da partida passar, validando a regra de bloqueio.
  await new Promise((resolve) => setTimeout(resolve, 2200));

  // --- Fluxo de encerramento de partida ---
  console.log("\n[Sistema] Jogo encerrado! Resultado oficial: Brasil 2 x 0 Croácia.\n");
  await partidaService.encerrarPartida(partida.id, 2, 0);

  console.log(`[MongoDB] Evento registrado: "Ana acertou o placar em cheio e ganhou 50 pontos!"\n`);

  // --- Fluxo de consulta do painel ---
  const topRanking = await painelService.obterTopRankingComNomes(10);
  console.log("[REDIS] --- TOP RANKING GLOBAL ---");
  for (const entrada of topRanking) {
    console.log(`${entrada.posicao}º Lugar: ${entrada.nome} - ${entrada.pontos} pontos`);
  }

  const ultimosEventos = await painelService.obterUltimosEventosFeed(10);
  console.log("\n[MONGO] --- ULTIMAS ATIVIDADES DO FEED ---");
  for (const evento of ultimosEventos) {
    const horario = formatarHorario(new Date(evento.criadoEm));
    const placar = evento.detalhes?.placarPalpite ? ` (Placar: ${evento.detalhes.placarPalpite})` : "";
    console.log(`- [${horario}] ${evento.mensagem}${placar}`);
  }

  console.log("\nSimulação concluída com sucesso. Conexões encerradas.");
}

main()
  .catch((erro) => {
    console.error("Erro durante a simulação:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
    await disconnectRedis();
    await disconnectMongo();
  });
