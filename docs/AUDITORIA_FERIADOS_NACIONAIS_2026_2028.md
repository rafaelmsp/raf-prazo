# Auditoria dos feriados nacionais — Raf-Prazo (2026 a 2028)

**Auditoria realizada em 19/10/2026.** O Raf-Prazo é um calculador auxiliar de prazos judiciais. O calendário federal **não substitui** o calendário forense do TJ, os atos das unidades judiciárias nem a análise da publicação/intimação.

## Resultado: uma lacuna no ano de 2026

A base anterior continha **nove datas nacionais fixas** por ano. A Portaria MGI nº **11.460/2025**, publicada no Diário Oficial da União em 30/12/2025, classifica também a **Paixão de Cristo, em 03/04/2026**, como **feriado nacional no calendário de 2026 da Administração Pública Federal** (art. 1º, inciso V).

**Fonte primária:** https://www.in.gov.br/web/dou/-/portaria-mgi-n-11.460-de-29-de-dezembro-de-2025-678388627

**Legislação de contexto:** Lei nº **9.093/1995**, art. 2º, que trata os feriados religiosos como dias de guarda declarados em lei municipal, incluindo a Sexta-feira da Paixão: https://www2.camara.leg.br/legin/fed/lei/1995/lei-9093-12-setembro-1995-348594-normaatualizada-pl.html

A classificação como feriado nacional **na portaria de 2026 para a Administração Pública Federal** não demonstra, isoladamente, que o ato da União regula todos os prazos do **TJRJ**. Em Duque de Caxias, a Sexta-feira da Paixão também consta da **Deliberação municipal nº 1.543/1970**. São fundamentos jurídicos diferentes; não são dois dias distintos para o cálculo.

## Datas fixas que já estavam cadastradas

01/01 (Confraternização Universal), 21/04 (Tiradentes), 01/05 (Dia do Trabalho), 07/09 (Independência do Brasil), 12/10 (Nossa Senhora Aparecida), 02/11 (Finados), 15/11 (Proclamação da República), 20/11 (Consciência Negra) e 25/12 (Natal).

Fontes principais: Leis nº 10.607/2002, 6.802/1980 e 14.759/2023.

## Correção implementada

- **2026:** os nove feriados fixos permanecem, e **03/04/2026 — Paixão de Cristo** foi acrescentado como **NACIONAL**, com origem `calendario_federal_2026`, fonte primária, data de conferência e campo `authority_scope: administracao_publica_federal_2026`. Total: **10 registros nacionais em 2026**.
- **2027 e 2028:** permanecem os nove feriados nacionais fixos por ano. As datas móveis **26/03/2027** e **14/04/2028** são conhecidas pela Páscoa e retornadas como candidatas da BrasilAPI, mas **não são promovidas a feriados nacionais por mera extrapolação de uma portaria anual de 2026**. Em Duque de Caxias, seguem disponíveis como feriados **municipais** com opção de aplicação local, fundada em lei municipal.
- **Carnaval, Quarta-feira de Cinzas, Corpus Christi no âmbito federal, emendas e vésperas** não são promovidos automaticamente a feriados nacionais em razão de registros de API ou de ponto facultativo. Corpus Christi continua sendo feriado **estadual no RJ**, sob fonte própria, com opção de aplicação local.
- Uma data presente simultaneamente nas bases nacional e municipal não é contada duas vezes: o motor encontra o evento nacional primeiro, e o dia é excluído uma única vez.
- Os indícios coletados do TJRJ continuam `pending_review`, `verified:false`, `applies_to_deadlines:false`. Esta correção não altera o status desses documentos.

## Principais testes

`tests/test_sync.py`, `tests/test_weekend_sources.cjs` e `tests/test_local_holidays_browser.cjs` verificam:

1. 10 feriados nacionais no calendário federal de 2026, nove em 2027 e nove em 2028 até confirmação oficial posterior.
2. 03/04/2026 com fonte MGI e sem duplicidade de registro nacional.
3. Carnaval e Corpus Christi não classificados como nacionais por engano.
4. 03/04/2026 reconhecido no motor mesmo que os feriados locais estejam desligados.
5. 2027/2028 preservados sem inventar futuras portarias; Caxias mantém sua fonte municipal.
6. Sábados e domingos continuam não contados e não podem ser escolhidos como marco inicial.

## Limites

A ausência de um feriado forense local ou de uma suspensão do TJRJ ainda pode alterar o vencimento real. O usuário deve conferir o calendário oficial da comarca, instância, unidade, processo e data de publicação/intimação. O campo `authority_scope` impede confundir a origem administrativa federal com prova de aplicação universal a todos os tribunais.

**Próxima revisão recomendada:** quando forem publicadas as portarias federais de feriados de **2027 e 2028**, confrontar com a base e promover novas datas **somente com nova fonte anual**.
