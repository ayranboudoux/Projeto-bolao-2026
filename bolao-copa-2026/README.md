# Bolão Copa do Mundo 2026 — Persistência Poliglota

Projeto acadêmico que implementa a camada de persistência e lógica de dados de
um sistema de bolão para a Copa do Mundo de 2026, aplicando o conceito de
**persistência poliglota**: três tecnologias de banco de dados, cada uma
resolvendo um problema diferente.

## Arquitetura

| Tecnologia | Papel | Uso no projeto |
|---|---|---|
| **PostgreSQL** (via **Prisma ORM**) | Dados estruturados, consistência forte | Usuários, seleções, partidas e palpites oficiais |
| **Redis** | Banco em memória, leitura/ordenação ultrarrápida | Ranking global de pontuação (sorted sets) |
| **MongoDB** | Banco de documentos, dados semiestruturados | Feed de atividades e linha do tempo (documentos polimórficos) |

### Camadas de código

```
src/
  config/        -> clientes de conexão (Prisma, Redis, MongoDB)
  repositories/   -> isola as consultas de cada tecnologia
  services/       -> orquestra as 3 tecnologias nas regras de negócio
  types/          -> tipos compartilhados (ex: eventos do feed)
  runner.ts       -> script principal que demonstra o fluxo ponta a ponta
prisma/
  schema.prisma   -> modelagem do banco relacional
```

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose

## Como executar

```bash
# 1. Clonar o repositório e instalar dependências
npm install

# 2. Subir a infraestrutura (PostgreSQL, Redis, MongoDB) via containers
npm run docker:up

# 3. Aguardar alguns segundos para os bancos inicializarem, depois rodar as migrações
npm run prisma:migrate

# 4. Executar a simulação
npm run dev
```

Ou simplesmente:

```bash
npm run setup
```

Para encerrar a infraestrutura:

```bash
npm run docker:down
```

## Regras de negócio implementadas

- **Bloqueio de palpites**: um palpite só pode ser criado/alterado até o horário de
  início da partida (validado no `PalpiteService` consultando o banco relacional).
- **Unicidade de palpite**: cada usuário possui no máximo um palpite por partida,
  garantido por chave única composta (`usuarioId` + `partidaId`) no PostgreSQL.
- **Atualização do ranking em tempo real**: implementada com sorted sets (`ZSET`)
  do Redis, garantindo ordenação processada em memória.
- **Polimorfismo do feed**: a coleção `feed_atividades` do MongoDB aceita
  documentos com campos dinâmicos (`detalhes`), suportando diferentes tipos de
  evento (palpite, entrada em grupo, medalha) sem schema rígido.

## Fluxos demonstrados no runner

1. **Fluxo de apostas**: validação de horário (ORM) → persistência do palpite (ORM) → evento no feed (MongoDB).
2. **Fluxo de encerramento de partida**: registro do placar (ORM) → cálculo de pontuação (ORM) → atualização do ranking (Redis) → evento de conquista (MongoDB).
3. **Fluxo de consulta do painel**: dados cadastrais (ORM) + topo do ranking (Redis) + últimos eventos (MongoDB).

## Variáveis de ambiente

Veja `.env.example`. Para uso local com o `docker-compose.yml` fornecido, os
valores padrão já funcionam sem necessidade de alteração.
