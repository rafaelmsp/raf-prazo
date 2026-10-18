# Raf-Prazo 2.4 — Relatório de implementação e QA local

**Estado:** implementado e testado LOCALMENTE na branch `feature/biblioteca-prazos-2.4`.
**Status de publicação:** NÃO publicado; não houve push, PR nem deploy.
**Base da branch:** `bd9af17f524c1512df731b7b021423f266235fe7` (`main`).
**Ambiente:** Windows, Desktop Commander e Codex CLI 0.163.0 (modelo `gpt-5.6-terra`, raciocínio `low`). Revisão complementar via Desktop Commander.

## Entregas

1. **Home e UX mobile:** nova ligação `Prazos judiciais` no menu; link `Não sabe o prazo? Consultar biblioteca` junto dos campos; em celulares a ordem é parâmetros → resultado → calendário, sem alterar a contagem. Scripts e estilos próprios `assets/prazos-home.js` e `assets/prazos-home.css`.
2. **Biblioteca estática:** `prazos/index.html`, `assets/prazos-library.js` e `assets/prazos-library.css`; busca textual, filtros por procedimento e categoria, favoritos, recentes, grupos com contagem real, ficha de cada ato, fundamento, descrição e fonte. Desktop com três colunas; mobile com uma coluna.
3. **Dados jurídicos:** reuso do catálogo `window.RafPrazoLegal22.configurations` existente; 13 presets JEC e 21 CPC, incluindo um personalizado por regime, que não aparece entre os atos da biblioteca. Total exibido: 32 atos reais. Nenhum novo prazo ou fundamento inventado; ausência de validação jurídica integral explicitada na interface.
4. **Transferência assistida:** checkbox de confirmação obrigatório na ficha; somente prazos numéricos permitidos são transferidos pela intenção temporária em `sessionStorage`, revalidada na calculadora. Prazos condicionados exigem confirmação ativa e referência existente; prazos em horas, audiência ou sem duração são apenas informativos. A intenção é consumida e descartada. Data e duração anteriormente preenchidas são preservadas no retorno; localização permanece sob a persistência própria da calculadora. Nenhum marco é inferido.
5. **Regressão protegida:** código original do motor de contagem, calendário e sincronização TJRJ não foi alterado.

## Evidências

- `node --check assets/prazos-home.js`: **PASS**
- `node --check assets/prazos-library.js`: **PASS**
- `node --test tests/test_library_prazos.cjs`: **4/4 PASS**
- `node --test tests/*.cjs`: **61/61 PASS na revisão seguinte**, após atualização dos contratos de teste desatualizados; na implementação inicial houve 53 PASS / 4 FAIL.
- Baseline `bd9af17` isolada: `node --test tests/*.cjs` = **49 PASS / 4 FAIL**, total 53. Mesmos quatro contratos falhos em ambas as versões: arquivo de tema institucional; duas expectativas sobre abas de atualizações; e uma expectativa de ficha de fim de semana. Não foram alterados para mascarar as falhas.
- `python -m unittest discover -s tests -p 'test_*.py'`: **66/66 PASS**
- `python scripts/build_html.py`: **PASS** (base `20022b1f5a80`)
- `git diff --check`: **PASS**
- Chrome real em modo headless e emulação: **360, 390 e 430 px**, sem rolagem horizontal; desktop **1366 px**, renderização em três colunas.
- Fluxo Chrome: acesso à biblioteca; seleção de recurso inominado 10 dias; confirmação; retorno com ato e data inicial preservados; preparo JEC de 48 horas sem botão de aplicar; referência condicionada `jec_cumprimento_pagar` somente com confirmação; sem exceções JavaScript.
- Chrome desktop: seleção preenche ficha lateral e opção `Conferir condições e aplicar` abre a confirmação.

**Capturas locais (Windows, fora do Git):**
`C:\Users\Rafael\raf24-mobile-calculator-verified.png`,
`C:\Users\Rafael\raf24-mobile-library-verified.png`,
`C:\Users\Rafael\raf24-desktop-library-selected.png`.

## Limites e próximas validações

- Esta entrega não comprova que todos os atos e fundamentos estão juridicamente atualizados: reusa os presets existentes e ressalta a conferência dos autos, do marco, do rito e das normas oficiais.
- Aceite inicial dos Termos de Uso continua obrigatório; após o aceite, a calculadora é a primeira função visível do aplicativo no celular.
- As quatro falhas Node preexistentes foram regularizadas em seguida, ajustando testes à identidade visual aprovada e usando verificações tolerantes a espaços em dois contratos. O motor e o calendário continuaram intocados.
- Testes de navegador foram executados em Chrome headless com viewport emulado, não em um aparelho Android físico.
- Não houve validação de workflow remoto nem do GitHub Pages atualizado, pois **publicação não foi autorizada**. Logo, não marcar 100% nem afirmar que a URL pública apresenta o 2.4.
- A implantação, criação de PR ou push exige nova autorização expressa do proprietário.

## Como testar localmente

Na pasta `C:\Users\Rafael\raf-prazo`:

```powershell
python -m http.server 8766 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8766/` e `http://127.0.0.1:8766/prazos/`. Não usar URL pública para testar a branch antes de publicar.

**Regra de segurança:** mudanças permanecem apenas na branch isolada; `main` e o site publicado permanecem intactos.

## Validação adicional do modo escuro

O Chrome headless confirmou o tema escuro na largura móvel de 390 px, com 32 atos, sem exceções de JavaScript. Foi ajustado o contraste dos rótulos informativos azuis para #9bd0ff no modo escuro, preservando o cabeçalho institucional. Verificados também os tamanhos de 360 e 430 px e a prévia da ficha jurídica em três colunas no desktop.

## Continuidade — regularização de testes preexistentes

- `tests/test_institutional_theme.cjs` foi atualizado para verificar o azul PJe, fins de semana em vermelho sóbrio e feriados em cores semânticas, sem exigir a paleta neutra intermediária rejeitada. Preserva testes da separação da camada do calendário, tema escuro e hierarquia mobile.
- `tests/test_update_tabs.cjs`: mantém a exigência de TJRJ como aba inicial, sem depender de uma quebra de linha literal.
- `tests/test_weekend_sources.cjs`: mantém a exigência de atualizar o contexto na ficha, sem depender de indentação literal.
- `node --test tests/*.cjs`: **61/61 PASS**, nenhuma falha remanescente.
- `python -m unittest discover -s tests -p test_*.py`: **66/66 PASS**.
- `python scripts/build_html.py`: **PASS**; `index.html` idêntico a `src/template.html`.
- Arquivos JSON de calendário e coleta válidos. Há **24 candidatos TJRJ**, nenhum com aplicação de prazo ativada; **zero** eventos automáticos de suspensão TJRJ e **zero** ocorrências estruturadas ativadas.
- Workflow: testes locais equivalentes aos comandos estáticos foram executados. **Coleta TJRJ, sincronização remota, execução do GitHub Actions e publicação não foram executadas** nesta etapa por alterarem dados/conectarem fontes externas. O workflow existente contém rotina automática de publicação quando executado em `main`; não acioná-lo para validar esta branch sem autorização.
- **Não foi realizado push, PR, merge ou deploy**; testes só na branch local.
