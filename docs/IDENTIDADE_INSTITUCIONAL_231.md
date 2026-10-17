# Raf-Prazo 2.3.1 — Identidade visual institucional

**Escopo:** revisão cromática exclusiva do restante do site. As 42 células do calendário, cores de feriados/recessos/suspensões e legenda do calendário **permanecem inalteradas**.

## Direção aprovada
Visual claro, profissional e sóbrio, sem rosa, lilás, degradês ou pastéis decorativos nos elementos externos ao calendário.

| Aplicação | Cor |
|---|---|
| Fundo externo | `#F5F7FA` |
| Cartões e modais | `#FFFFFF` |
| Superfícies secundárias | `#F7F9FB` |
| Bordas | `#DCE4EC` |
| Texto principal | `#24364A` |
| Texto secundário | `#5D6D7E` |
| Azul PJe (ações e seleção) | `#1261A0` |
| Azul claro de apoio | `#EFF5FA` |

A identidade cobre navegação, cabeçalho, rodapé, resultado, parâmetros, biblioteca de prazos, modais, central de atualizações e cartões de status. Avisos mantêm distinção sem preenchimentos berrantes. A ficha lateral do dia recebe superfícies neutras, mas a grade do calendário não é modificada.

## Regras técnicas
- Novos tokens `--office-*` são isolados dos tokens do motor e calendário. Não substituir `--weekend`, `--raf-holiday-*`, `--raf-recess-*`, `--accent` globalmente.
- Seletores do painel principal usam `:not(.raf-22-calendar)` para proteger o calendário.
- O modo escuro usa tokens institucionais próprios e preserva contraste.
- Nenhuma alteração em feriados, fontes, contagem, presets JEC/CPC ou decisões sobre suspensões.

## Aceite
- Node: `tests/test_institutional_theme.cjs`, verificando isolação e ausência de gradientes.
- Chromium: 360, 390, 430, 1024 e 1366 pixels, verificando fundos reais nos modos claro e escuro e os tokens originais do calendário.
- Capturas comparativas em tema claro/escuro.
- Revisão da publicação no GitHub Pages após testes.

## Atualização 2.3.2 — cores sóbrias do calendário

A identidade neutra foi estendida aos quadradinhos do calendário, preservando as classes existentes e as regras de contagem. Foi eliminada a paleta rosa/lilás antiga, incluindo o estilo alternativo *Judicial Light*. O usuário continua distinguindo os estados por cores discretas, bordas, texto, rótulos e detalhes da data.

| Categoria | Fundo claro | Leitura |
|---|---|---|
| Fim de semana | `#F0F2F5` | Cinza-frio |
| Feriado | `#EEF3F7` | Azul-acinzentado |
| Suspensão | `#E8F1F7` | Azul-claro |
| Recesso | `#F3F5F7` | Cinza claro |
| Exclusão manual | `#EDF5F2` | Verde acinzentado |
| Vencimento | `#1261A0` | Azul PJe, texto branco |

Há equivalentes escuros discretos em `data-theme=dark`, com vencimento em `#2B709F`. A legenda usa os mesmos tons. O marco inicial continua com borda azul, e o dia contado preserva azul-claro. Não há mudança no significado jurídico nem na inclusão de feriados/suspensões. As diferenças de cor são complementadas pela inspeção do dia para acessibilidade.

**Testes de aceite:** comparar cores computadas das classes em Chromium, claro/escuro, em múltiplas resoluções; garantir 42 casas quadradas e a classificação do calendário, sem regressões JEC/CPC.
