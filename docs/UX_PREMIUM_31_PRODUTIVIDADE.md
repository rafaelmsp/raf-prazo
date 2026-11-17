# RAF-PRAZO — UX Premium 3.1: produtividade com privacidade

## Finalidade
Continuação do design system 3.0, voltada à rotina do cartório. A calculadora, o calendário, os prazos legais e a coleta do TJRJ não recebem alterações nas regras jurídicas.

## Entregas
- Favoritos: botão ☆ nos cartões e no editor, com opção de remover a marcação.
- Recentes: lista de até oito IDs dos modelos copiados com sucesso nesta aba; selecionar sem copiar não conta.
- Visão geral: listas de certidões favoritas e utilizadas recentemente, com estados vazios informativos.
- Busca Ctrl+K ampliada para títulos e categorias de certidões, com navegação direta ao modelo.
- Indicadores reais: 18 modelos totais, quatro na categoria Pauta, derivados do catálogo.
- API interna de metadados window.RafPrazoCertidoes: somente ID, título, categoria e origem do modelo.

## Privacidade
- Favoritos no localStorage: raf-prazo:certidoes:favorites:v1; apenas IDs de modelos.
- Recentes no sessionStorage: raf-prazo:certidoes:recent:v1; apenas IDs de modelos.
- Textos digitados e números/index processuais editados não são persistidos por esse módulo.
- Validação de IDs conhecidos, deduplicação, limites de tamanho e tratamento de indisponibilidade do armazenamento.
- Clipboard continua sob controle do navegador e do sistema operacional.

## Integridade
- Os 18 modelos e respectivas notas permanecem intactos; Pauta continua sendo categoria interna.
- Os cinco modelos fornecidos mantêm asterisco no título.
- AR postal negativo e diligência negativa do OJA permanecem situações distintas.
- Não há alteração de contagem de prazos, fontes, motor JEC/CPC, PJe, ou sincronização com tribunais.

## Testes e publicação
- Node: tests/test_certidoes.cjs e tests/test_ux_premium.cjs.
- Chromium: tests/browser_ux_premium.py em 360, 390, 430, 1024 e 1366 px, validando favoritos, recentes, armazenamento somente de IDs, busca, Pauta e editor.
- Execução dos demais testes preexistentes antes de integrar à branch main.

## Reversão
Reverter o PR 3.1 caso surja regressão; a alteração da versão anterior que incluiu a certidão do OJA deve permanecer.