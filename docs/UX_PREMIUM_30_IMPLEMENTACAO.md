# RAF-PRAZO — UX Premium 3.0 (implementação integrada)

## Objetivo

Criar uma identidade visual profissional e responsiva, inspirada em sistemas SaaS corporativos, mantendo o RAF-PRAZO **auxiliar, independente e não oficial**. A nova experiência não altera a implementação do cálculo jurídico, a seleção de atos, as fontes e o tratamento conservador do TJRJ.

## Componentes entregues

| Módulo | Arquivo | Finalidade |
|---|---|---|
| Design system | `assets/ux-premium.css` | Sidebar navy, header claro, tipografia, cartões, calculadora, editor e responsividade |
| Imagem original | `assets/ux-premium-art.css` | Fotografia de Justiça criada por IA, WebP incluído no CSS local; imagem apenas ilustrativa |
| Navegação | `assets/ux-premium.js` | Ícones SVG internos, Visão geral, atalhos reais, busca `Ctrl+K`, tema herdado |
| Biblioteca de prazos | `assets/ux-premium-library.css` e `.js` | Identidade consistente, SVG e acesso às ferramentas principais |
| Certidões | `assets/certidoes.js` | 18 modelos, cinco fornecidos com `*`, filtro Pauta com quatro certificados |

## Nova certidão — diligência negativa

Redação fornecida literalmente:

> Certifico que o feito foi retirado da pauta de audiências em face de devolução de Diligência negativa de index 317752646. Fica a parte autora intimada a se manifestar sobre certidão do OJA.

**Classificação:** Certidões do Dia a Dia → Pauta. **Busca:** título, texto, categoria e observações, incluindo a expressão `AR negativo`. A certidão do OJA não é automaticamente o mesmo que um aviso de recebimento postal (AR). O index é particular do caso e precisa ser atualizado para outra utilização. Não afirmar retirada da pauta nem regularidade da intimação sem verificar o processo e as rotinas da unidade.

## Segurança de alterações e retrocompatibilidade

- `index.html` e `src/template.html` permanecem idênticos; build existente preservado.
- Mantidos IDs da calculadora, calendário, modais, histórico, termos, PJe/TJRJ e biblioteca.
- O menu **Pauta não existe** como item autônomo: é somente categoria dentro de **Certidões**.
- `#pauta` continua funcionando como link antigo para filtro Pauta.
- A home `#inicio` é opcional; a URL sem fragmento mantém a calculadora existente como tela principal, para não romper hábitos e atalhos antigos.
- A nova UX **não persiste** textos de certidões, não envia documentos para servidores e não inventa dados ou fontes.
- Imagem e ícones são incluídos localmente, sem CDN, telemetria ou dependência externa.
- A foto não apresenta dados processuais ou tribunal real; ícones e fotografia são decorativos, com leitura sobre superfície opaca.
- Controle de movimento reduzido, tema claro/escuro, indicadores de foco e menus acessíveis preservados.

## Testes e aceite

- Node: `tests/test_certidoes.cjs` e `tests/test_ux_premium.cjs`.
- Chromium: `tests/browser_ux_premium.py` em 360, 390, 430, 1024 e 1366 px.
- Regressões existentes JEC/CPC, 42 células do calendário, memória, biblioteca, atualização de dados, termos, temas e cálculos continuam na CI.
- Não publicar se um teste jurídico falhar; diferenciar atualização visual esperada de regressão funcional.

## Reversão

O deploy é feito por GitHub Pages após merge em `main`. Para reverter a camada visual, remover referências de `ux-premium*.css/js` de `index.html`, `src/template.html` e `prazos/index.html`; conservar o registro da nova certidão no catálogo. Registrar a reversão em commit e aguardar deploy Pages.
