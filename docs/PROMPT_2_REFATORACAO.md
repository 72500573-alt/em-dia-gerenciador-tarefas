# Prompt 2 - Refatoração segura

Arquivo: `lib/tasks.mjs`. Objetivo: separar responsabilidades mantendo nome público `handleTasks`, rotas, schema e comportamento.

## Mapeamento inicial
- `validateTask`: regras de negócio e validação.
- `json`: resposta HTTP.
- `handleTasks`: autenticação recebida do servidor, URL/método/origem, leitura do corpo, coordenação das operações.
- Consultas SELECT/INSERT/UPDATE/DELETE: acesso a dados.
- UI: já separada em `app/page.tsx`.

Dependências: handler usa validação e banco injetado. Não há banco global nem estado global no handler. SELECT repetido em consulta e retorno de alterações. A UI mantém estado local; o bloqueio visual não é proteção de concorrência.

## Plano em etapas pequenas
1. Extrair `validateTask` para `lib/task-validation.mjs`, mantendo reexport público. Rodar os 25 testes.
2. Extrair SQL para `lib/task-repository.mjs`; manter contrato de handleTasks. Rodar os 25 testes novamente.

Antes da refatoração existem 25 testes de caracterização e integração passando. Correções de segurança ocorreram antes da extração e estão registradas separadamente. Nenhuma regra, rota ou coluna será alterada. Não há nova dependência. Não houve confirmação individual do plano; execução ocorreu dentro do pedido amplo de realizar a atividade.

## Resultado
As evidências de cada etapa ficam em `docs/evidencias/testes-refatoracao-1.txt` e `testes-refatoracao-2.txt`. Bugs de comportamento descobertos durante a refatoração: nenhum. Limitação mantida: listagem sem paginação.
