# Prompt 1 - Segurança

Aplicado após a auditoria inicial. Plano: (1) limitar leitura do JSON em bytes antes de materializar todo o corpo; (2) tornar explícito conflito de ID com conteúdo divergente. Sem alteração de schema ou policies. Autorização de trabalho: pedido do usuário para realizar a atividade; não houve OK individual registrado para cada correção, como sugerem os prompts de referência.

| Achado | Risco | Local inicial | Decisão |
|---|---|---|---|
| Corpo lido integralmente antes do limite | Médio | lib/tasks.mjs:30 | Corrigir com leitura incremental de até 10.000 bytes |
| ID reutilizado com payload diferente | Baixo | lib/tasks.mjs:34-37 | Retornar 409, preservando registro original |
| Identidade e titularidade | Médio se removidas | route.ts:6-7; tasks.mjs:22-49 | Manter identidade do servidor, ignorar owner do JSON, testar isolamento |
| SQL injection | Baixo na implementação | tasks.mjs:22-49 | Manter bind de parâmetros em todas as consultas |

Regras do front: filtros, ordenação e contagem são apenas apresentação. Título, descrição, prioridade, prazo e status são revalidados no servidor. O cliente não escolhe o proprietário. Não existem valores financeiros nem permissões administrativas.

Segredos: nenhum encontrado no código da aplicação. Nenhuma rotação de chave da aplicação é necessária com base nessa inspeção. Credenciais de publicação são externas e não integram o repositório. D1 não é exposto ao navegador; RLS, auth.uid e service_role são não aplicáveis.

Não foi desligada nenhuma proteção. SQL usa parâmetros. React renderiza título e descrição como texto, sem dangerouslySetInnerHTML. Origem é conferida nas gravações; JSON é exigido. Respostas de tarefas não são cacheadas. Autenticação depende do proxy confiável do Sites e não deve ser exposta diretamente com cabeçalhos arbitrários em outro provedor.
