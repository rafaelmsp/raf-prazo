# Raf-Prazo — Plano incremental de desenvolvimento

Cada etapa tem escopo reduzido: implementar, testar, publicar e somente depois avançar.

## Etapa 1 — Identificacao visual no calendario
**Estado: implementada em 17/10/2026.**
- [x] Identificar separadamente feriados (rosa), suspensoes TJRJ cadastradas (amarelo), recesso CPC (lilas), fins de semana e datas manuais
- [x] Legenda compatível com dispositivos móveis, modo claro e escuro
- [x] Preservar destaque do marco inicial e vencimento
- [x] Testes no Chromium em desktop e mobile; casos 27/10/2026 + 3 dias uteis com e sem suspensao TJRJ
- [x] Publicar `index.html` e `src/template.html` no GitHub
- [x] Teste automatizado de regressão de classificacoes

## Etapa 2 — Informacoes do dia selecionado
**Estado: planejada.**
- [ ] Ao tocar/clicar em uma data, oferecer painel de detalhes sem alterar automaticamente o marco inicial
- [ ] Exibir motivo, natureza do evento, origem, abrangencia e link oficial (quando cadastrado)
- [ ] Indicar explicitamente quando o dia nao possui impedimento cadastrado, sem prometer completude
- [ ] Testar acessibilidade e funcionamento mobile

## Etapa 3 — Eventos extraordinarios e escopo
**Estado: planejada.**
- [ ] Modelar ocorrencias sem efeito automatico (mero expediente, ponto facultativo, indisponibilidade)
- [ ] Registrar data e horario de inicio/fim e se houve suspensao, prorrogacao do vencimento ou informacao
- [ ] Restringir abrangencia por tribunal, comarca, unidade ou processo, conforme fonte oficial
- [ ] Evitar excluir datas de prazo sem ato juridico especifico confirmado

## Etapa 4 — Rastreabilidade e historico
**Estado: planejada.**
- [ ] Identificador persistente do evento, documento de origem, data de conferência e revisao
- [ ] Historico de inclusao, alteracao, revogacao e efeito em calculos anteriores
- [ ] Identificacao de versao da base no relatorio e exportacao

## Etapa 5 — Cobertura e validacao
**Estado: planejada.**
- [ ] Adicionar fontes verificadas e casos reais ao conjunto de testes
- [ ] Testar municipio, periodo, prazos em dias e eventual indisponibilidade sistêmica
- [ ] Revisar linguagem de avisos e documentacao

> Limite jurídico: o Raf-Prazo é ferramenta auxiliar e nao oficial. O cadastro de um evento ou exibicao de uma cor nao substitui a consulta de atos e sistemas oficiais. A primeira etapa nao alterou o motor de contagem.
