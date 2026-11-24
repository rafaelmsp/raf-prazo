# RAF-PRAZO — Certidões da categoria Pauta (24/11/2026)

## Alteração solicitada

Cadastro de **oito novas certidões** na categoria **Pauta**, dentro de **Certidões do Dia a Dia**, preservando literalmente os textos fornecidos pelo usuário, inclusive pontuação, abreviaturas e placeholders. Os novos títulos começam com `*` para identificação visual.

O catálogo passa de **18 para 26 modelos**. A categoria Pauta passa de **4 para 12 modelos**. Permanecem os 13 modelos complementares preexistentes e os cinco modelos anteriormente fornecidos, inclusive a versão específica de diligência negativa do OJA com index `317752646`.

## Novos modelos de Pauta

| ID interno | Título |
| --- | --- |
| pauta-oja-negativa-modelo | * Diligência negativa do OJA — index editável |
| pauta-ar-assinado-terceiro | * AR assinado por terceiros |
| pauta-pedido-desentranhamento | * Petição com pedido de desentranhamento |
| pauta-sem-tempo-despacho | * Sem tempo hábil para cumprimento do despacho |
| pauta-ar-negativo-retirada | * AR negativo — retirada da pauta |
| pauta-siscor-erro-ar | * SISCOR — erro na expedição do AR |
| pauta-desentranhamento-cumprido | * Determinação de desentranhamento cumprida |
| pauta-mandado-erro-material | * Erro material na digitação do mandado |

## Cuidados de uso

- Os textos são modelos fornecidos para conferência e adaptação, não certidões já emitidas.
- O copiador mostra aviso quando identificar placeholders `XXXXX`, `XXXX`, `XXXXXXX`, data `XX/XX/XXXX` ou a referência final incompleta `conforme despacho de index`.
- O último texto termina literalmente com `conforme despacho de index`; **não** foi inventado um número que o usuário não forneceu.
- A certificação de diligências, intimações, erros do SISCOR, retorno de AR, prazo hábil e cumprimento de ordens depende de conferência dos atos e do fluxo da serventia.
- **AR postal** e **diligência do OJA** são eventos distintos; há modelos separados para cada um.
- O editor continua sem enviar textos ao PJe ou armazenar dados processuais; somente os IDs de favoritos são persistidos no navegador.

## Regressão e publicação

- Testes do catálogo conferem os 26 IDs únicos, os oito textos literais, o asterisco, a preservação de todas as 13 sugestões preexistentes e Pauta (12).
- Testes do navegador conferem a busca global, abertura direta de modelos, cópia com aviso de placeholder, favoritos/recentes e contadores da home.
- `index.html` e `src/template.html` permanecem sincronizados. O script de certidões passa à versão de cache `v=3.2`.
- O site estático permanece sem login, sem conexão ao PJe e sem emissão de documentos oficiais.
