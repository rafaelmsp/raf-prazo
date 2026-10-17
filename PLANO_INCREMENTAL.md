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
**Estado: implementada em 17/10/2026.**
- [x] Ao tocar/clicar em uma data, abrir ficha sem alterar automaticamente o marco inicial
- [x] Mostrar botao explicito **Usar como marco inicial**, preservando funcionalidade anterior
- [x] Exibir motivo, tipo, abrangencia, impacto no prazo, fonte HTTPS quando existente, data de verificacao e versao da base
- [x] Informar ausência de impedimento cadastrado com aviso de cobertura parcial, sem garantir dia util forense
- [x] Validar interface em Chromium desktop (1366x768) e mobile (390x844), sem erros JavaScript
- [x] Testar feriado nacional, suspensao TJRJ, fim de semana, dia contado e selecao expressa do novo marco
- [x] Sincronizar `index.html` e `src/template.html` e incluir testes de regressao

**Limite:** a ficha descreve dados e regras ja disponiveis; nao amplia a cobertura ou realiza coleta automatica de atos TJRJ.

## Etapa 3 — Eventos extraordinarios e escopo
**Estado: implementada em 17/10/2026.**
- [x] Formulario para registrar ocorrencias informativas, alteracao de expediente, indisponibilidade e possivel suspensao
- [x] Registrar data e horario local de inicio e fim; limitar intervalo a 31 dias e rejeitar dados invalidos
- [x] Classificar efeito declarado: informativo, possivel suspensao da contagem ou possivel prorrogacao de vencimento
- [x] Identificar ambito declarado (tribunal, comarca, vara/unidade, processo) e localidade selecionada; sem homologacao automatica
- [x] Mostrar indicacao visual no calendario e os registros pendentes na ficha do dia
- [x] Armazenar e permitir excluir registros somente neste navegador (ate 40)
- [x] Nao alterar o motor de contagem: relatos sao `pending`, `verified: false`, `applies_to_deadlines: false`
- [x] Testar em Chromium desktop e mobile: evento multidiario, persistencia, exclusao, rejeicao de periodo invalido e vencimento inalterado
- [x] Atualizar arquivos publicados `index.html`, `src/template.html` e teste permanente de regressao

**Limites:** esta etapa nao consulta indisponibilidade oficial automaticamente, nao autentica documentos, nao valida alcance individual ou certifica prorrogação. Uma ocorrencia extraordinaria pendente nao se torna uma exclusao automatica apenas por ter uma URL cadastrada. O registro local nao e compartilhado entre dispositivos.

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
