# Raf-Prazo 2.1 — Fontes de feriados e bloqueio de fins de semana

**Data da auditoria:** 17/10/2026. **Âmbito:** versão pública estática.

## Os feriados são todos carregados por API?

**Não.** A base `feriados.json` combina mais de uma origem:

| Informação | Fonte | Aplicação |
| --- | --- | --- |
| Feriados nacionais fixos | Lista prevista em leis federais no arquivo `scripts/sync.py`; consulta complementar à BrasilAPI para 2026–2028 | São considerados na contagem, independentemente da disponibilidade da API |
| Datas extras retornadas pela BrasilAPI | BrasilAPI, `https://brasilapi.com.br/api/feriados/v1/{ano}` | São candidatas, **não** feriados forenses aplicados automaticamente |
| Feriados estaduais | Nenhuma API integrada à contagem atual | Não são aplicados |
| Feriados municipais | IBGE fornece nomes e códigos de municípios, **não** os feriados locais | Não são aplicados |
| Atos do TJRJ | Coleta automatizada de notícias e PDFs oficiais | São indícios em análise; um usuário pode desconsiderar uma data como **simulação local não homologada**, por opção explícita |
| Fins de semana | Cálculo de dia da semana do JavaScript | Sábados e domingos são excluídos sem API |

A consulta à BrasilAPI é executada pelo workflow GitHub Actions e seu resultado é utilizado para confirmar os feriados nacionais fixos previstos em lei. Assim, o rótulo `brasilapi+lei` indica consulta + correspondência com a lista legal, **não** que toda a lista foi descoberta espontaneamente na API. Sem internet, as datas legais fixas são preservadas.

O `feriados.json` inclui os anos cobertos e o `sync.brasilapi_years_checked`, a indicação de falhas, a última consulta e o status de cada fonte. Dados locais e do TJRJ ainda não oferecem cobertura forense completa.

## Regra de sábado e domingo na escolha do marco inicial

- O calendário mantém os dias visíveis e permite abrir a **ficha do dia**.
- Na ficha de sábado ou domingo, o botão **Usar como marco inicial** fica desativado.
- No campo HTML de data, uma tentativa de selecionar sábado ou domingo é rejeitada e a última data válida é restaurada.
- A função de cálculo faz a mesma validação: **mesmo uma alteração programática não pode produzir um cálculo aceito com início no fim de semana**.
- Se a página abrir em sábado ou domingo, o marco inicialmente sugerido passa a ser a próxima segunda-feira.
- Fins de semana continuam automaticamente não contados, e a opção de excluir indícios TJRJ não oferece ativação redundante neles.

**Atenção jurídica:** o bloqueio do campo é uma escolha de interface solicitada para o cálculo do Raf-Prazo; não substitui as regras legais sobre publicação, intimação, começo do prazo, prorrogação e expediente forense. Em situações concretas, a data do fato processual pode ocorrer num sábado ou domingo, mas sua contagem deve obedecer às normas aplicáveis. O sistema é auxiliar e tem cobertura parcial.

## Testes automatizados

```sh
python -m unittest discover -s tests -p 'test_*.py' -v
node --test tests/test_weekend_sources.cjs
node --test tests/test_tjrj_optin.cjs
```

A suíte `tests/test_weekend_sources.cjs` avalia o **predicado real extraído do HTML**, compara dias úteis e fins de semana, e confere as proteções do calendário, campo de data, cálculo e opt-in. Também valida o relatório de fontes e a ausência de suspensões TJRJ globais.
