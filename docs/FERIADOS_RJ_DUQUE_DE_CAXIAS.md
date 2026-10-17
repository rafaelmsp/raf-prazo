# Raf-Prazo 2.1 — Feriados legais do RJ e de Duque de Caxias

**Primeira abrangência local:** estado do Rio de Janeiro (UF RJ) e município de Duque de Caxias (IBGE 3301702).
**Anos gerados:** 2026–2028. **Conferência das fontes:** 17/10/2026.

## Fontes primárias identificadas

- **Carnaval (terça-feira):** Lei estadual nº 5.243/2008. Texto na ALERJ: https://alerjln1.alerj.rj.gov.br/contlei.nsf/351902c88b9f0cde03256bcf00607a5b/063f7c027766eab48325744a007a4ab0
- **São Jorge, 23 de abril:** Lei estadual nº 5.198/2008. Tramitação oficial da ALERJ indicando conversão do projeto na lei: https://alerjln1.alerj.rj.gov.br/scpro0711.nsf/3372bd49984790dd83257258006f0719/094e2cd7679638b2832572a7006ee116
- **Corpus Christi:** Lei estadual nº 11.002/2025, publicada em 23/10/2025. Texto na ALERJ: https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L2NvbnRsZWkubnNmL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmLzQ2ODM3ZTRkMjJiMDFmMzUwMzI1OGQyYzAwNDhhYmRhP09wZW5Eb2N1bWVudA%3D%3D. STF noticiou manutenção da validade da lei na ADI 7898 em 24/06/2026: https://noticias.stf.jus.br/postsnoticias/stf-valida-criacao-de-feriado-de-corpus-christi-no-estado-do-rio-de-janeiro/
- **Duque de Caxias:** Deliberação municipal nº **1.543, de 16/04/1970**, art. 1º. **Documento original digitalizado pela Câmara Municipal**, no item "Deliberação 1.543 de 1970 (Feriados Municipais)": https://www.cmdc.rj.gov.br/?page_id=7592

### Distinção indispensável na lei municipal

O **art. 1º** declara feriados municipais: **Sexta-feira da Paixão, Corpus Christi, Santo Antônio e Finados**. Como Corpus Christi já é feriado estadual e Finados já está na base nacional, **não os duplicamos**.

O **art. 2º** considera **25 de agosto** (Patrono do Município) e **28 de outubro** (Servidor Público) **ponto facultativo nas repartições municipais**, quando dias úteis. **Não são promovidos a feriado municipal nem excluídos automaticamente.** Também não se inclui 31/12 como feriado municipal.

Calendário escolar e listas de pontos facultativos municipais não equivalem, por si, a calendário de suspensões processuais do TJRJ.

## Datas geradas por lei

| Ano | Carnaval (RJ) | Paixão (Caxias) | São Jorge (RJ) | Corpus Christi (RJ) | Santo Antônio (Caxias) |
| --- | --- | --- | --- | --- | --- |
| 2026 | 17/02 | 03/04 | 23/04 | 04/06 | 13/06 |
| 2027 | 09/02 | 26/03 | 23/04 | 27/05 | 13/06 |
| 2028 | 29/02 | 14/04 | 23/04 | 15/06 | 13/06 |

Feriados móveis são obtidos por algoritmo gregoriano de Páscoa em `scripts/local_holidays.py` — **não** por uma API de feriados municipais. A atualização automática do GitHub executa esse gerador, preservando o fundamento legal de cada ocorrência.

## Como o usuário aplica no prazo

1. Escolher **RJ** como estado e o município desejado.
2. Localizar a opção **Considerar feriados estaduais do RJ e municipais de Duque de Caxias (conferir TJRJ)**.
3. **Desligada por padrão:** o calendário apresenta os dias locais como referência e a ficha mostra a lei, mas a contagem não muda.
4. **Ligada:** os feriados estaduais valem em **qualquer município selecionado do RJ**; os municipais só valem para **Duque de Caxias (IBGE 3301702)**.
5. Fora do RJ, a opção fica indisponível. Nos outros municípios do RJ, o programa só tem a cobertura **estadual**, ainda não a municipal individual.
6. Fins de semana já são não contabilizados. Se um feriado cair no fim de semana, isso não exclui automaticamente outro dia.

Os atos de suspensão de prazos **específicos do TJRJ** permanecem em coleta informativa ou dependentes de decisão individual de simulação. **Feriado civil em lei e suspensão judicial não são conceitos intercambiáveis.** Mesmo com os feriados locais habilitados, o usuário precisa verificar o calendário forense do TJRJ, a competência, o expediente, a publicação, a ciência e eventuais atos de suspensão ou prorrogação.

## Estrutura técnica e testes

- `scripts/local_holidays.py`: cinco eventos legais por ano (três estaduais e dois municipais), sem duplicação.
- `scripts/sync.py`: incorpora eventos validados pela legislação e mantém candidatos TJRJ separados e não homologados.
- `feriados.json`: armazena os eventos, seus âmbitos, fontes e status.
- `index.html` e `src/template.html`: a opção `useLocal` determina se entram na contagem; feriados identificados mas não selecionados são exibidos como **feriado local não aplicado**.
- `tests/test_local_holidays.py`: Páscoa e datas móveis de 2026–2028, âmbito, fundamentos, duplicidade e pontos facultativos.
- `tests/test_local_holidays_browser.cjs`: executa a função real de seleção territorial do HTML, conferindo RJ, Duque de Caxias, demais municípios, SP e opção desligada.

A lista de leis é **curada a partir de fontes oficiais**, não extraída automaticamente de APIs de feriados estaduais/municipais. Novas leis e alterações exigem revisão e atualização da origem curada até implementarmos um monitor verificável de legislação local.
