# Raf-Prazo 2.2 — Entrega JEC padrão e UX premium

**Data:** 17/10/2026 · **Modalidade:** incrementos sobre a calculadora 2.1 · **Ramo:** `feature/raf-prazo-22-premium-jec-default`

## Decisão de produto

O Raf-Prazo é **nacional e independente**. O perfil inicial para um novo usuário é **Juizado Especial Cível (JEC)**, com **Processo Civil (CPC)** como opção. Perfil e ato selecionados são independentes do tribunal, UF e município. Por padrão, o local do calendário permanece Duque de Caxias/RJ, e pode ser alterado.

## Comportamento implementado

- Painel principal: **Marco conferido + duração em dias úteis**, sem crescimento artificial do calendário. O botão compacto de **procedimento/ato** abre um drawer independente, que não altera o tamanho dos três painéis.
- Presets JEC: personalizado, recurso inominado de 10 dias (art. 42), resposta ao recurso de 10 dias (art. 42, § 2º), embargos de declaração de 5 dias (art. 49).
- Presets CPC: personalizado, apelação de 15 dias, contrarrazões à apelação de 15 dias, embargos de declaração de 5 dias. Lei e artigo indicados junto ao seletor.
- Alteração manual na duração desativa o preset escolhido; mudança de procedimento também limpa o preset, sem redefinir arbitrariamente a duração manual.
- Seção recolhível para identificar se o marco corresponde à publicação DJEN, intimação pessoal, ciência em audiência ou conferência manual. **A data informativa da comunicação não é usada para derivar automaticamente o marco** e pode cair em fim de semana.
- O marco inicial de contagem do motor legado continua sendo um dia de segunda a sexta (parâmetro conferido), conforme a política atual. O sistema não afirma que esta regra regula todas as datas de comunicações processuais.
- O preparo recursal no JEC (48 horas, art. 42, § 1º) é explicitamente destacado **fora** do motor de dias úteis.
- Perfil, ato e tipo da comunicação persistidos localmente na chave `raf-prazo:juridical-profile:v1`; não alteram o local de outros usuários, nem as chaves TJRJ de exclusões individuais.
- Memórias textuais, visualização e snapshots de novos cálculos incluem identificação do procedimento e do ato.
- Modo claro e escuro: mesma identidade visual do Raf-Prazo, cartões leves e texto legível. Procedimento, ato, fundamento e comunicação ficam no drawer lateral no desktop e em folha retrátil inferior no celular, com retorno de foco ao botão de abertura.

## O que deliberadamente NÃO foi feito

- Não foram implementados nem ativados modos CLT, CPP, preparo em horas ou cálculos automáticos de aperfeiçoamento de citação/intimação do Domicílio Judicial.
- Não há afirmação de cobertura nacional de feriados locais. A base atual contém feriados nacionais e, em regime opt-in, RJ e Duque de Caxias, com fontes explícitas e cobertura parcial.
- Não foram promovidos documentos TJRJ `pending_review` a suspensões automaticamente confirmadas.
- O cálculo continua estimativo, e os procedimentos podem ter peculiaridades que demandem verificação no processo.

## Referências normativas

- Lei 9.099/1995, arts. 12-A, 42 e 49: https://www.planalto.gov.br/ccivil_03/leis/l9099.htm
- CPC, arts. 219, 220, 224, 1.003, 1.009, 1.010 e 1.023: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm
- Resolução CNJ 455/2022 e alterações (DJEN / Domicílio): https://atos.cnj.jus.br/atos/detalhar/4509

## Arquitetura de arquivos

- `assets/raf-prazo-22.js`: catálogo de regimes, atos e controlador dos seletores.
- `src/template.html`: fonte dos componentes, integração, CSS e contexto da memória.
- `index.html`: publicação HTML sincronizada com a fonte.
- `tests/test_raf_prazo_22.cjs`: testes automatizados do catálogo e isolamento de estados.
- `tests/browser_22.py`: testes em Chromium com 360, 390, 430 e 1366 pixels, captura de screenshots.
- `.github/workflows/testar-mobile.yml`: navegador real e artefato visual.
- `.github/workflows/testar-atualizacoes.yml` e `.github/workflows/atualizar.yml`: regressões JavaScript/Python, dados e atualização.

## Critérios para publicação

1. Testes Node incluindo `test_raf_prazo_22.cjs`: sucesso.
2. Testes Python e validação conservadora de dados: sucesso.
3. Chromium nas quatro larguras, incluindo modo escuro, presets, memória e persistência: sucesso.
4. Build `scripts/build_html.py` sem diferenças indevidas.
5. GitHub Pages deve servir `id="rafRegime"`, `id="rafAct"` e o JS `RafPrazoLegal22`.

**Observação:** a aprovação do código e dos testes não equivale a validação jurídica oficial dos prazos. Conferir intimação, procedimento, abrangência do calendário e eventual decisão judicial.

## Revisão de UX 2.2.1 — simetria entre calendário e painel

O bloco de procedimento e ato passou para a janela `#rafProfileDialog`, aberta por `#rafProfileOpen`. A janela ocupa camada própria (`dialog.showModal()`), não altera a altura da grade de três colunas e oferece opção Concluir/Fechar e ESC. O bloco de parâmetros mostra apenas um resumo JEC/CPC com o ato atual, seguido dos campos essenciais de data e duração. Foi removida a regra de altura mínima artificial de 750 px. Os testes Chromium verificam posição do calendário antes/depois da abertura, ausência de transbordamento horizontal e funcionamento de controle em temas claro e escuro.
