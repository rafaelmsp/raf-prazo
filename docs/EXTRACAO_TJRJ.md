# Raf-Prazo — Extração estruturada de fontes TJRJ

## Estado da etapa
**Entrega 1 de 4 da validação jurídica automatizada: EXTRAÇÃO (sem aplicação a prazos).**
A coleta continua automática e gratuita pelo GitHub Actions. Esta etapa **não autoriza feriados ou suspensões**.

## Fluxo dos dados

1. `scripts/collect_tjrj.py` consulta exclusivamente URLs do portal oficial do TJRJ e documentos descobertos em links oficiais, com HTTPS validado, limite de resposta e rastreabilidade SHA-256.
2. `scripts/extract_tjrj.py` analisa o texto extraído e registra: referências a atos, datas, possível natureza do efeito, menções a comarcas e sinais de exceções ou restrições.
3. `dados/coleta-tjrj.json` guarda as fontes e os indícios estruturados. Cada ocorrência recebe `status: pending_review`, `verified: false`, `applies_to_deadlines: false` e `scope_hint.kind: unresolved`.
4. `scripts/sync.py` propaga para `feriados.json` apenas as ocorrências **pendentes**, mantendo-as em `candidates[].structured.occurrences` — **nunca** em `events`.
5. A interface apresenta, na seção **Atualizações**, até três ocorrências estruturadas por documento, suas datas e referências detectadas, com link à fonte e aviso de que não afetam os cálculos.

O motor da contagem continua considerando apenas os feriados nacionais legais já incluídos em `events`; nenhuma coleta TJRJ é promovida automaticamente.

## Como interpretar a extração

- **Data da notícia ≠ data de suspensão.** Uma data só é candidata quando aparece na mesma frase ou linha de uma expressão relevante.
- **Ano inferido**: quando a notícia informa “30 de outubro” mas a referência é “Aviso nº 290/2026”, o ano pode ser inferido, sempre marcado com `year_inferred: true`.
- **Efeito possível**: `possible_deadline_suspension`, `possible_deadline_extension`, `system_unavailability`, `service_interruption`, `optional_workday` ou `normal_expediente`.
- **Abrangência não comprovada**: nomes de comarca são apenas menções textuais; não comprovam quais processos foram atingidos.
- **Ressalvas**: expressões como “exceto”, “somente”, “plantão” e “ressalvados” sinalizam necessidade de análise.
- **Integridade documental**: o hash SHA-256 permite comparar os bytes lidos em consultas diferentes, mas não certifica a autoridade do conteúdo, vigência ou interpretação.

## Limitações conhecidas

- É um extrator por padrões de texto, não interpretação jurídica completa. Pode perder eventos, gerar falsos positivos ou confundir datas em tabelas de PDFs e notícias longas.
- PDFs são lidos apenas nas primeiras 24 páginas, até aproximadamente 85 mil caracteres; o relatório marca extração truncada quando identifica limites, mas não comprova cobertura integral do documento.
- Não consulta automaticamente Diário Oficial, andamento de cada processo, PJe ou EPROC.
- Repetições de URL em domínios oficiais podem produzir candidatos duplicados.
- A publicação de um ato posterior, retificação ou revogação ainda precisa ser verificada.
- **Nenhum campo da extração pode ser convertido diretamente em dia não útil**. Para permitir aplicação automática será necessário validador jurídico independente, regras de vigência/escopo e suíte de testes.

## Testes

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
python scripts/collect_tjrj.py --check
```

Os testes `test_extract_tjrj.py` incluem: notícia com dia de suspensão e dia de expediente normal; data de publicação distinta; ponto facultativo; ausência de ano; data impossível; comarca com exceção; ato sem data; indisponibilidade sistêmica.

## Próximas etapas

**2. Validador jurídico:** decidir, com controles verificáveis, se a fonte é normativa, se o texto realmente estabelece suspensão, em que período, para qual âmbito e com quais exceções; quando incompleto, manter pendente.

**3. Aplicação controlada:** permitir somente regras com validação suficiente, preservando eventos anteriores, justificativa, fonte, versão e regressões dos cálculos.

**4. Casos reais e implantação:** executar testes com diferentes comarcas, retificações, prorrogações, pontos facultativos, datas de publicação e falhas de coleta antes de habilitar qualquer efeito automático.

**Aviso:** Raf-Prazo é independente e não oficial. Mesmo depois de futuras ampliações, a verificação nos atos e sistemas judiciais oficiais continua necessária.

## Leitura de tabelas do informativo anual (17/10/2026)

O novo `scripts/pdf_table_tjrj.py` processa linhas de tabelas do PDF oficial, preservando a separação entre **Período**, **Ato**, **Publicação** e **Ementa**, na medida em que o texto do PDF permitir. `scripts/collect_tjrj.py` solicita ao pypdf o modo de extração com preservação de layout e identifica as páginas com marcadores internos. A rotina lê até 80 páginas ou o limite de texto, e pode deixar ocorrências de fora.

Critérios conservadores: data válida na coluna inicial; número de ato reconhecível; expressão relevante na mesma linha/registro; quando a ementa contém datas em linguagem natural, a data inicial deve ser compatível. Dados com datas contraditórias ou números de atos confundidos com datas são rejeitados. O campo `document_page` mostra a página consultada (contagem de páginas do PDF), `extraction_method: pdf_table_row` mostra como o indício surgiu, e `source_hash_sha256` identifica os bytes coletados.

**Limitações de leitura reais:** textos de múltiplas colunas podem vir entrelaçados; nem toda linha isolada é recuperada e o mecanismo pode gerar falsos negativos. O cadastro de PDF é apenas uma fonte informativa e não substitui o DJERJ. O status dos registros continua `pending_review`, `verified: false`, `applies_to_deadlines: false`, e o campo `scope_hint.kind` permanece `unresolved`. **Nenhum registro do TJRJ passa a ser aplicado ao cálculo.**

O módulo `assets/tjrj-markers.js` exibe os indícios em datas do calendário para UF=RJ, com acesso à fonte, hash, referência textual do ato e página do PDF quando disponível. A presença de uma data no calendário **não comprova** que haja suspensão naquela comarca, unidade ou processo; a ausência também não certifica dia útil forense.

Testes dedicados: `tests/test_pdf_table_tjrj.py` — períodos múltiplos, suspensão e feriado, datas de publicação distintas, linhas repartidas, fontes sem ano, datas cruzadas entre comarcas e falsos números de leis. O workflow GitHub Actions executa esses testes antes da coleta/publicação.
