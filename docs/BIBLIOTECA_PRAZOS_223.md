# Biblioteca de Prazos — Raf-Prazo 2.2.3

Data: 17/10/2026. **Disponível no seletor "Procedimento e ato"**; JEC permanece o padrão. Não existe lista juridicamente exaustiva de todos os prazos brasileiros: os atos abaixo são exemplos selecionados com suporte normativo e categorias de revisão explícitas.

## Conteúdo

- **JEC**: 11 itens incluindo prazo livre, recurso inominado (10 dias), resposta ao recurso (10 dias), embargos declaratórios (5 dias), atos de defesa, execução, cumprimento de sentença, diligências e preparo recursal em horas.
- **CPC**: 21 itens incluindo prazo livre, apelação, contrarrazões, embargos, agravos, recursos superiores, contestação, réplicas específicas, emenda inicial, execução, cumprimento de sentença, monitória, provas e atos dependentes de despacho.

## Regras de segurança

1. Só os presets com duração legal pré-cadastrada preenchem **dias úteis**; isso não define automaticamente termo inicial, suspensão, competência, intimação nem tempestividade.
2. Atos de duração não generalizável (por exemplo, defesa no JEC, manifestação genérica ou cumprimento de tutela) vêm com **Conferir prazo**. A duração deve ser informada após leitura da decisão e dos autos, sem herdar o número anteriormente selecionado.
3. O preparo recursal do JEC está cadastrado para **consulta da regra de 48 horas** e não é convertido em dois dias úteis. Quando selecionado, o campo de dias é desativado, e o resultado não deve apresentar vencimento válido por esse motor.
4. Categorias e busca são **locais**: não transferem dados de processos a servidores e não dependem de autenticação. A pesquisa ignora diferenças entre maiúsculas/minúsculas e acentos e permite buscar por artigo.
5. O seletor nativo permanece apenas como espelho de valor para o catálogo e teste de integração, oculto; a interação real usa cartões, filtros e pesquisa em um painel com rolagem, sem o menu grande do Android.
6. O motor legado, o calendário quadrado, os feriados opt-in e a coleta conservadora de indícios TJRJ permanecem inalterados.

## Referências oficiais
- Lei 9.099/1995, arts. 12-A, 42, 49, 50, 52 e 53: https://www.planalto.gov.br/ccivil_03/leis/l9099.htm
- CPC, arts. 219, 224, 321, 335, 350–351, 477, 523–525, 701–702, 829, 915, 1.003, 1.009–1.010, 1.015, 1.021, 1.023 e 1.029: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105compilada.htm

## Testes de aceitação
- Pesquisa de nomes e artigos com e sem acentos.
- Filtragem por categoria com destaque do item ativo e área de leitura de fundamento.
- Preenchimento numérico em atos de duração definida.
- Revisão manual e bloqueio de cálculo em horas.
- Troca de JEC para CPC sem transportar indevidamente a duração anterior.
- Persistência local e atualização da memória jurídica.
- Chromium em 360, 390, 430 e 1366 px; drawer e calendário quadrado preservados.

## Limites
O catálogo não abrange todas as leis especiais, os recursos de todos os tribunais ou os atos de todos os ramos processuais. Casos com contagem em horas, calendário local pendente, prazo específico da decisão ou peculiaridades processuais exigem conferência humana.
