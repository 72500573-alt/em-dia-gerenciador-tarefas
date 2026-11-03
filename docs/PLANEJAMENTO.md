# Planejamento com IA

Tema A: gerenciador de tarefas. Nome: Em dia.

Problema: organizar tarefas da faculdade e do cotidiano, acompanhando prioridade, prazo e conclusão.

## Requisitos
- Cadastrar título obrigatório (até 100 caracteres), descrição opcional (até 1.000), prioridade baixa/média/alta, data válida e status pendente/concluída.
- Listar e consultar detalhes, pesquisar texto, filtrar e ordenar.
- Editar, concluir, reabrir e excluir após confirmação.
- Guardar registros no banco; usuário só acessa suas tarefas.
- Exibir mensagens claras; atender computador e celular.
- Impedir que edição antiga sobrescreva alteração mais recente.

## Telas e estrutura planejadas
Uma tela principal com resumo, navegação por status, filtros e lista. Formulário em modal; confirmação de exclusão em modal. React + TypeScript no cliente; rotas HTTP no servidor; SQLite/D1 persistente. Autenticação hospedada pelo Sites. Sem pagamentos, estoque, compartilhamento ou perfis administrativos.

A atividade permite persistência simples; D1 foi escolhido para validar dados no servidor e testar integração real. O projeto exige Node.js 24 para os testes com SQLite nativo. Não é um projeto de produção de grande escala.

## IA utilizada e revisão
ChatGPT/Codex nesta conversa, com geração de código, análise dos quatro prompts e execução de testes. Não foi necessário contratar ferramenta adicional para o projeto; a conta utilizada já estava disponível. As decisões priorizaram o CRUD solicitado. O aluno deve ler o código, executar os testes e demonstrar os fluxos antes de entregar.

A execução integral foi solicitada pelo usuário. Não se afirma que houve aprovações individuais dos planos dos prompts; eles estão documentados para revisão. Nenhum depoimento de aprendizagem foi inventado em nome do aluno.
