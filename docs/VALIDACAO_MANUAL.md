# Verificação da interface e publicação

Data: 02/11/2026 (horário de Brasília).

- Build de produção: concluído sem erro.
- Checagem TypeScript (`node node_modules/typescript/bin/tsc --noEmit`): aprovada após tipar respostas JSON.
- Publicação: confirmada pelo serviço em https://tarefas-nicollas-2026.windylens.chatgpt.site.
- Acesso à página: público. Operações de tarefas exigem entrar com ChatGPT; cada conta tem seus próprios dados.
- Navegador: página publicada aberta; layout de computador, estado vazio e mensagem de autenticação conferidos visualmente. Captura real em `evidencias/aplicacao-publicada.jpg`.
- CRUD manual autenticado: **não verificado**, pois o navegador não estava autenticado. Não se apresenta screenshot de dados fictícios como prova de teste.
- Responsividade: regras CSS implementadas; teste visual em dispositivo móvel **não verificado**.
- Banco/API: 25 testes via HTTP e SQLite real aprovados; limites estão em PROMPT_3_TESTES.md.

## Roteiro que falta executar com a conta do aluno
1. Entrar no sistema; criar “Revisar atividade”, prioridade alta e prazo válido.
2. Recarregar e conferir persistência; buscar pelo título e abrir detalhes.
3. Alterar título/prazo, concluir, conferir filtro Concluídas e reabrir.
4. Tentar salvar título vazio; verificar impedimento e mensagem.
5. Excluir a tarefa criada para teste e conferir a lista.
6. Abrir no celular e conferir formulário, filtros e ações.

## Publicação no GitHub
O plugin foi confirmado instalado, mas suas ferramentas não ficaram disponíveis na sessão. A alternativa pelo navegador chegou ao login. Uma revisão automática bloqueou uma observação da autenticação por envolver accounts.google.com sem autorização específica confirmada. Não houve envio ao GitHub nem ao Classroom. Não foram solicitadas senhas pelo chat. O código e a documentação permanecem versionados no repositório de origem do Sites; isso não substitui o GitHub exigido.
