# Biblioteca de Prazos — Raf-Prazo 2.2.4

Data: 17/10/2026. **Disponível no seletor "Procedimento e ato"**; JEC permanece o padrão. Não existe lista juridicamente exaustiva de todos os prazos brasileiros: os atos abaixo são exemplos selecionados com suporte normativo e categorias de revisão explícitas.

## Conteúdo

- **JEC**: 11 itens incluindo prazo livre, recurso inominado (10 dias), resposta ao recurso (10 dias), embargos declaratórios (5 dias), atos de defesa, execução, cumprimento de sentença, diligências e preparo recursal em horas.
- **CPC**: 21 itens incluindo prazo livre, apelação, contrarrazões, embargos, agravos, recursos superiores, contestação, réplicas específicas, emenda inicial, execução, cumprimento de sentença, monitória, provas e atos dependentes de despacho.

## Regras de segurança

1. Só os presets com duração legal pré-cadastrada preenchem **dias úteis**; isso não define automaticamente termo inicial, suspensão, competência, intimação nem tempestividade.
2. Atos de duração não generalizável (por exemplo, defesa no JEC, manifestação genérica ou cumprimento de tutela) vêm com **Conferir prazo**. A duração deve ser informada após leitura da decisão e dos autos, sem herdar o número anteriormente selecionado.
3. O preparo recursal do JEC está cadastrado para **consulta da regra de 48 horas** e não é convertido em dois dias úteis. Quando selecionado, o campo de dias é desativado, e o resultado não deve apresentar vencimento válido por esse motor.
4. **Todos os prazos cadastrados ficam listados imediatamente**, em categorias abertas: Recursos, Defesa, Cumprimento, Execução e outros. Não é preciso saber o nome do ato nem digitar nada. O usuário pode percorrer a lista e tocar no ato desejado.
5. O seletor nativo permanece oculto como espelho de estado. A interação é feita por cartões com ato, duração e lei, em lista rolável de altura limitada. O HTML contém **11 opções JEC e 21 opções CPC pré-renderizadas**, evitando uma área vazia enquanto o JavaScript carrega. A versão do script foi atualizada no endereço para minimizar cache antigo do Android.
6. O motor legado, o calendário quadrado, os feriados opt-in e a coleta conservadora de indícios TJRJ permanecem inalterados.

## Referências oficiais
- Lei 9.099/1995, arts. 12-A, 42, 49, 50, 52 e 53: https://www.planalto.gov.br/ccivil_03/leis/l9099.htm
- CPC, arts. 219, 224, 321, 335, 350–351, 477, 523–525, 701–702, 829, 915, 1.003, 1.009–1.010, 1.015, 1.021, 1.023 e 1.029: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105compilada.htm

## Testes de aceitação
- Os 11 atos JEC e 21 atos CPC estão presentes logo na abertura, sem pesquisa ou filtro.
- Categorias abertas e destaque do ato selecionado; fundamento e duração visíveis.
- Verificar que a lista continua com conteúdo mesmo se o script do catálogo não carregar.
- Preenchimento numérico em atos de duração definida.
- Revisão manual e bloqueio de cálculo em horas.
- Troca de JEC para CPC sem transportar indevidamente a duração anterior.
- Persistência local e atualização da memória jurídica.
- Chromium em 360, 390, 430 e 1366 px; drawer e calendário quadrado preservados.

## Limites
O catálogo não abrange todas as leis especiais, os recursos de todos os tribunais ou os atos de todos os ramos processuais. Casos com contagem em horas, calendário local pendente, prazo específico da decisão ou peculiaridades processuais exigem conferência humana.
