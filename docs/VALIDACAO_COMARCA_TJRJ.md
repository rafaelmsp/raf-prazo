# Raf-Prazo — Associação textual de comarca e data (TJRJ)

**Entrega incremental:** 17/10/2026 · **Estado:** integrado à coleta diária.
**Regra jurídica:** sem homologação automática e sem alteração de prazos.

## Fluxo de execução

1. `scripts/collect_tjrj.py` acessa os documentos oficiais configurados, registra endereços, horário, conteúdo e SHA-256.
2. `scripts/pdf_table_tjrj.py` extrai linhas do informativo anual com período, referência do ato e ementa, quando reconhecíveis.
3. `scripts/scope_tjrj.py` procura construções textuais explícitas como **“Comarca de Duque de Caxias, nos dias 30 e 31 de julho de 2026”**. Só associa o nome à **data específica** quando ambos aparecem na mesma construção; a informação isolada de outra comarca não é suficiente.
4. `scripts/sync.py` publica indícios e trechos nos candidatos do `feriados.json`; não transfere esses candidatos para `events`.
5. `assets/tjrj-markers.js` mostra no calendário a data e, na ficha, o possível efeito, a página do PDF, o trecho da ementa e a **associação textual comarca-data pendente**.

## Resultado da consulta de 17/10/2026

Nas duas URLs oficiais do **mesmo informativo de suspensão de prazos de 2026**, o coletor registrou indício para **31/07/2026** na página 33, com referência ao **Ato Executivo nº 117** e menção textual à **Comarca de Duque de Caxias**.

A redação coletada também cita **30/07/2026 para Duque de Caxias**. Contudo, essa data não foi automaticamente incluída como ocorrência adicional nessa etapa porque o extrator tabular conseguiu ancorar **31/07** à coluna de período. Isso demonstra uma limitação real de cobertura — o sistema não deve inventar nem extrapolar eventos.

Os endereços oficiais `www.tjrj.jus.br` e `portaltj.tjrj.jus.br` representam duas formas de acessar o documento, **não dois atos diferentes**.

## Regras e limites

- `scope_hint.kind` permanece `unresolved`.
- `date_linked_comarcas` e `scope_evidence` são *indícios de vínculo textual*, não certificação de jurisdição, abrangência ou validade jurídica.
- `assessment: textual_date_link_pending` indica uma associação linguística específica, sujeita a revisão.
- `verified: false` e `applies_to_deadlines: false` continuam obrigatórios.
- Menções vagas, sem data e ano ou com comarcas diferentes não são promovidas a abrangência comprovada.
- Casos com vários municípios e datas podem exigir análise do **texto completo do ato publicado**, retificações e regras de expediente, instância e unidade.
- Ausência de marcação não comprova dia útil forense. Presença de marcação não comprova suspensão processual.
- O processo diário é automatizado pelo GitHub Actions. A implementação e o controle dos testes foram realizados durante o desenvolvimento assistido.

## Verificação automatizada

Executar:

```sh
python -m unittest discover -s tests -p 'test_*.py' -v
node --check assets/tjrj-markers.js
```

Os testes em `tests/test_scope_tjrj.py` verificam: associação de 30/31 de julho a Duque de Caxias; não associação de Mesquita e Nova Iguaçu; recusa de datas divergentes, sem ano e impossíveis; permanência do status pendente. `tests/test_pdf_table_tjrj.py` verifica a integração ao registro extraído da tabela.

**Próximo passo:** comparar automaticamente a fonte tabular com o texto integral do Ato Executivo citado, sem ativar a contagem enquanto a coerência e a abrangência não estiverem comprovadas.
