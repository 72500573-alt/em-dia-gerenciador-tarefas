# Prompt 3 - Testes de integração

Comando único: `npm test` (Node.js 24). Ferramenta: node:test, nativa do Node, sem pacote adicional. Banco real SQLite em arquivo temporário criado por mkdtemp; migrations reais aplicadas a cada execução, banco removido ao terminar. Não lê configuração de produção.

## Cenários previstos

Os nomes dos 25 testes em `tests/tasks.test.mjs` são frases “quando..., então...”. Cobrem cadastro/listagem/consulta, edição, conclusão/reabertura, exclusão, 8 entradas inválidas, limites válidos, falta de autenticação, acesso de B a dados de A, falsificação de owner, dois cadastros simultâneos, duas edições simultâneas, exclusão com versão antiga, reutilização de identificador, formato/tamanho de corpo, origem externa, texto com SQL/HTML, versões inválidas e persistência após reabrir o banco.

## Execução real e limites

Cada caso usa `fetch` contra servidor HTTP real em 127.0.0.1 e porta aleatória. Esse servidor chama o mesmo `handleTasks` utilizado pela rota publicada. O adaptador de driver traduz prepare/bind/first/all/run para SQLite nativo, executando as consultas reais e constraints reais: não simula banco nem regra de negócio.

A identidade externa é simulada por x-test-user apenas no servidor de teste, que não integra a aplicação publicada. O wrapper Vinext, o proxy de login e a API remota D1 não são exercitados por essa suíte. Os testes verificam o handler de produção via HTTP e SQLite, não toda a infraestrutura hospedada. Essa adaptação está explicitada para não apresentar cobertura maior do que a executada.

`Promise.all` dispara as requisições de repetição e concorrência juntas. SQLite processa gravações atomicamente. Pagamentos, planos, estoque, webhooks e saldo não fazem parte do sistema; não foram inventados testes para eles.

Resultado anterior à refatoração: **25 passaram, 0 falharam, 0 ignorados**. Saída integral em `evidencias/testes-antes-refatoracao.txt`. Nenhum teste foi apagado ou enfraquecido. Confirmação individual de cenários não foi coletada; o plano segue os requisitos do enunciado e deve ser revisado pelo aluno.
