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
