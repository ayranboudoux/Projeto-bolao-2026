// Tipos relacionados ao feed de atividades (MongoDB).
// O feed aceita diferentes tipos de notificação sem estrutura rígida
// (polimorfismo do feed), por isso o campo `detalhes` é flexível.

export type TipoEvento = "PALPITE_CRIADO" | "ENTRADA_GRUPO" | "MEDALHA_GANHA";

export interface EventoFeed {
  tipo: TipoEvento;
  usuarioNome: string;
  mensagem: string;
  // Campos dinâmicos específicos de cada tipo de evento (placar, pontos, etc).
  // Mantém o documento flexível sem exigir uma estrutura fixa por tipo.
  detalhes?: Record<string, unknown>;
  criadoEm: Date;
}

export interface RankingEntry {
  usuarioId: number;
  nome: string;
  pontos: number;
  posicao: number;
}
