# Resultado dos quatro prompts

| Ordem | Prompt | Resultado e decisão |
|---|---|---|
| 1 | 4 - Auditoria abrangente | Cinco prioridades registradas: ausência de testes, leitura integral do corpo, ID divergente, mistura de camadas e ausência de paginação. Nenhum risco alto confirmado. |
| 2 | 1 - Segurança | Leitura incremental de até 10.000 bytes e conflito explícito de ID corrigidos. Titularidade, SQL parametrizado e validação no servidor preservados. |
| 3 | 3 - Integração | 25 testes com HTTP e SQLite real passaram. Inclui reenvio e edições simultâneas, erros e acesso indevido. Provedor de identidade é a única simulação. |
| 4 | 2 - Refatoração | Validação e SQL extraídos em duas etapas; 25 testes passaram após cada etapa. Sem mudança de schema, nomes públicos ou regras. |

## O que a IA produziu e o que precisou ser revisto
A IA produziu tela, CRUD, schema, testes e documentação. A auditoria identificou a leitura integral do JSON e o conflito silencioso no reenvio com conteúdo diferente, corrigidos antes da refatoração. A verificação TypeScript apontou que o JSON da resposta precisava de tipagem, ajustada antes da publicação. Os resultados não substituem uma revisão humana.

## Pontos para o aluno compreender
1. Validação HTML ajuda na experiência, mas a validação do servidor impede requisições manipuladas.
2. `owner` limita quem pode consultar ou alterar um registro.
3. A versão na condição do UPDATE impede perda silenciosa de alterações simultâneas.
4. O ID único e persistido na tentativa evita cadastro em duplicidade.
5. Refatorar altera organização; corrigir defeitos altera comportamento. Por isso as etapas foram separadas.

## Limites e pendências
A prévia gerenciada não fornece o login local; não se declara CRUD manual aprovado ali. A autenticação completa da plataforma não faz parte da suíte de integração. Não houve confirmação individual dos planos exigida literalmente pelos prompts de referência: foi seguido o pedido amplo de execução da atividade. O aluno deve revisar os planos, os cenários e as decisões antes da entrega. Relato pessoal de aprendizagem não foi inventado.

## Estado da entrega
Deploy publicado e página pública confirmada. Para usar o CRUD é preciso entrar com ChatGPT. Captura real e limites dos testes manuais em `VALIDACAO_MANUAL.md`. GitHub ainda pendente por bloqueio na autenticação; nada foi enviado ao Classroom. A turma também precisa ser informada.
