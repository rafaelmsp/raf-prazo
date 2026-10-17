# Biblioteca de Prazos — Raf-Prazo 2.2.5

Data: 17/10/2026. **Disponível no seletor "Procedimento e ato"**; JEC permanece o padrão. Não existe lista juridicamente exaustiva de todos os prazos brasileiros: os atos abaixo são exemplos selecionados com suporte normativo e categorias de revisão explícitas.

## Conteúdo

- **JEC**: 13 itens com divisão entre título judicial/extrajudicial, obrigação de pagar versus fazer e prazos legais, procedimentais ou definidos no processo.
- **CPC**: 21 itens incluindo prazo livre, apelação, contrarrazões, embargos, agravos, recursos superiores, contestação, réplicas específicas, emenda inicial, execução, cumprimento de sentença, monitória, provas e atos dependentes de despacho.

## Regras de segurança

1. Só os presets com duração legal pré-cadastrada preenchem **dias úteis**; isso não define automaticamente termo inicial, suspensão, competência, intimação nem tempestividade.
2. O catálogo agora distingue **prazo legal definido**, **prazo condicionado ao procedimento**, **rito/audiência** e **prazo definido nos autos**. A duração de uma hipótese condicionada não é preenchida até o usuário acionar explicitamente a referência após conferir o caso; o sistema limpa os dias ao trocar de ato.
3. O preparo recursal do JEC está cadastrado para **consulta da regra de 48 horas** e não é convertido em dois dias úteis. Quando selecionado, o campo de dias é desativado, e o resultado não deve apresentar vencimento válido por esse motor.
4. **Todos os prazos cadastrados ficam listados imediatamente**, em categorias abertas: Recursos, Defesa, Cumprimento, Execução e outros. Não é preciso saber o nome do ato nem digitar nada. O usuário pode percorrer a lista e tocar no ato desejado.
5. O seletor nativo permanece oculto como espelho de estado. A interação é feita por cartões com ato, duração e lei, em lista rolável de altura limitada. O HTML contém **13 opções JEC e 21 opções CPC pré-renderizadas**, evitando uma área vazia enquanto o JavaScript carrega. A versão do script foi atualizada no endereço para minimizar cache antigo do Android.
6. O motor legado, o calendário quadrado, os feriados opt-in e a coleta conservadora de indícios TJRJ permanecem inalterados.

## Referências oficiais
- Lei 9.099/1995, arts. 12-A, 42, 49, 50, 52 e 53: https://www.planalto.gov.br/ccivil_03/leis/l9099.htm
- CPC, arts. 219, 224, 321, 335, 350–351, 477, 523–525, 701–702, 829, 915, 1.003, 1.009–1.010, 1.015, 1.021, 1.023 e 1.029: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105compilada.htm

## Testes de aceitação
- Os 13 atos JEC e 21 atos CPC estão presentes logo na abertura, sem pesquisa ou filtro.
- Categorias abertas e destaque do ato selecionado; fundamento e duração visíveis.
- Verificar que a lista continua com conteúdo mesmo se o script do catálogo não carregar.
- Preenchimento numérico em atos de duração definida.
- Revisão manual e bloqueio de cálculo em horas.
- Troca de JEC para CPC sem transportar indevidamente a duração anterior.
- Persistência local e atualização da memória jurídica.
- Chromium em 360, 390, 430 e 1366 px; drawer e calendário quadrado preservados.

## Limites
O catálogo não abrange todas as leis especiais, os recursos de todos os tribunais ou os atos de todos os ramos processuais. Casos com contagem em horas, calendário local pendente, prazo específico da decisão ou peculiaridades processuais exigem conferência humana.

## Conferência legal específica do JEC — versão 2.2.5

| Ato | Regra apresentada | Fundamento |
|---|---|---|
| Contestação no JEC | Rito/audiência — não impor 15 dias do CPC | Lei 9.099/95, arts. 27–30; Enunciado 10 FONAJE |
| Manifestação/réplica | Conferir nos autos; manifestação sobre documento apresentado em audiência pode ser imediata | Lei 9.099/95, art. 29, parágrafo único |
| Cumprimento de sentença: pagar quantia | **Referência de 15 dias**, somente após confirmar enquadramento e intimação | Lei 9.099/95, art. 52; CPC, art. 523, no que couber; Enunciado 97 FONAJE (multa) |
| Cumprimento de sentença: fazer/não fazer | Conforme decisão, sem período geral de 15 dias | Lei 9.099/95, art. 52, V/VI; CPC, art. 536, no que couber |
| Embargos à execução de título judicial | **Referência de 15 dias após intimação da penhora**, aplicação somente após conferência | Enunciados 117/121/142 FONAJE; Lei 9.099/95, art. 52, IX |
| Embargos à execução de título extrajudicial | Observar penhora e audiência, sem herdar os 15 dias do título judicial | Lei 9.099/95, art. 53, § 1º |

Os enunciados do FONAJE são interpretações não vinculantes, não a lei. Os prazos de referência de 15 dias **não** são aplicados automaticamente. Clicar em **Usar 15 dias após conferir a hipótese** registra a opção na memória (`reference_days`, `reference_accepted` e `requires_manual_review`); a ferramenta não confirma o requisito jurídico, a intimação nem o marco inicial. Alterar o ato limpa os dias anteriormente aplicados.

Fontes oficiais: https://www.cnj.jus.br/enunciados-civeis/ · https://www.planalto.gov.br/ccivil_03/leis/l9099.htm · https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105compilada.htm
