# Auditoria abrangente - Prompt 4

Data: 02/11/2026. Objeto: primeira implementação de Em dia, antes das correções e refatoração. Inspeção somente de leitura do código; este relatório é o único arquivo produzido nesta etapa. Referências de linha correspondem à versão inicial, preservada no histórico Git. Não houve migrations nem instalação durante esta análise.

## Cinco achados prioritários

1. **Médio:** ainda não existem testes automatizados do CRUD e isolamento de usuários.
2. **Médio:** limite de JSON aplicado depois de `request.text()`, permitindo carregar um corpo grande antes da rejeição.
3. **Baixo:** reenvio do mesmo ID com conteúdo diferente retorna silenciosamente o registro anterior.
4. **Baixo:** `lib/tasks.mjs` mistura validação, protocolo HTTP e SQL; candidato principal à refatoração por responsabilidades.
5. **Baixo:** listagem sem paginação pode ficar lenta com grande volume.

Nenhuma vulnerabilidade de risco alto foi confirmada na leitura. Isso não representa garantia de ausência de vulnerabilidades.

## 1. Testes de integração

| Achado | Risco | Arquivo e linha | Correção sugerida |
|---|---|---|---|
| Script de teste existe, mas não há casos nem banco de testes | Médio | package.json:15; diretório tests vazio | Criar testes HTTP com SQLite temporário isolado |
| CRUD, titularidade e concorrência sem cobertura | Médio | lib/tasks.mjs:15-50 | Testar cadastro, consulta, edição, exclusão, 401, 404, 409 e chamadas simultâneas |

Comando previsto: `npm test`. Não executado nesta etapa: nenhum teste implementado. Banco de produção não foi acessado. Login é delegado à plataforma. Checkout, assinatura e webhooks não existem no escopo.

## 2. Confiança no cliente

| Achado | Risco | Arquivo e linha | Correção sugerida |
|---|---|---|---|
| Limite de corpo aplicado após leitura integral | Médio | lib/tasks.mjs:30 | Ler o stream com limite em bytes e interromper ao exceder |
| Validações de título, data, prioridade e status existem no servidor | Baixo | lib/tasks.mjs:2-9 | Manter e testar entradas inválidas |
| Titularidade vem do servidor e todas as consultas usam owner | Baixo | app/api/tasks/[[...path]]/route.ts:6-7; lib/tasks.mjs:22-49 | Testar usuário A contra dados de B |
| Não foram encontrados segredos na implementação da aplicação | Baixo | app/page.tsx; lib/tasks.mjs; db/schema.ts | Não adicionar tokens ao front-end; manter arquivos de ambiente ignorados |
| Identidade externa ainda não verificada em hospedagem | Médio | app/chatgpt-auth.ts:24-49 | Verificar aplicação publicada; confiar somente em cabeçalhos inseridos pela plataforma |

Banco: tabela `tasks`; D1 acessível apenas pelo servidor, sem API SQL pública. RLS e policies do Supabase não se aplicam. O controle equivalente é `WHERE owner=?` em leitura, alteração e exclusão. Não há service_role, anon key nem integração de pagamentos. Não há regra de preço/admin/plano apenas no cliente.

## 3. Condições de corrida

| Achado | Risco | Arquivo e linha | Correção sugerida |
|---|---|---|---|
| ID primário impede duplicação do cadastro | Baixo | db/schema.ts:4; lib/tasks.mjs:34 | Verificar dois POST simultâneos |
| UPDATE/DELETE com versão fazem comparação atômica no banco | Baixo | lib/tasks.mjs:43-46 | Testar conflito de edição e exclusão desatualizada |
| Listagem carrega todos os registros do dono | Baixo | lib/tasks.mjs:23 | Planejar paginação se o volume crescer |

Não existe estoque, saldo, cupom ou recurso limitado. Não há lock em memória nem Redis. `locked` na UI apenas evita clique repetido; as garantias de integridade estão no banco.

## 4. Idempotência

| Achado | Risco | Arquivo e linha | Correção sugerida |
|---|---|---|---|
| Mesmo ID com conteúdo divergente devolve dado anterior sem aviso | Baixo | lib/tasks.mjs:34-37 | Comparar conteúdo e responder 409 em divergência |
| Não há webhooks nem gateway de pagamento | Baixo | lib/tasks.mjs:15-50 | Não aplicável: não inventar infraestrutura fora do escopo |

## 5. Separação de responsabilidades

| Achado | Risco | Arquivo e linha | Correção sugerida |
|---|---|---|---|
| API mistura validação, HTTP e SQL | Baixo | lib/tasks.mjs:1-51 | Separar validação e repositório sem mudar handleTasks |
| UI concentra filtros, formulário e lista | Baixo | app/page.tsx:1-33 (linhas extensas) | Organização futura; não é prioridade de segurança |

Em código próprio: CSS é o maior em bytes; página concentra a UI; tasks é o módulo de servidor mais relevante. Arquivos do starter não são candidatos prioritários.

**Próximo prompt: Prompt 1**, para planejar e corrigir o limite de corpo e revisar titularidade; depois Prompt 3 e Prompt 2. O enunciado menciona “5 prompts de correção”, mas o material fornecido contém quatro prompts.
