# Raf-Prazo — Continuidade e auditoria da Central de Atualizações

**Data:** 22/10/2026  
**Repositório:** https://github.com/rafaelmsp/raf-prazo  
**Branch:** auditoria/central-atualizacoes-20261022  
**SHA inicial da main:** 85dcc68642aa848de56e8d674b5cbc429d9bf437  
**Commit funcional:** 6e47b16 — fix: limpar atualizacoes completas e preservar estados locais  
**Estado da publicação:** depende da integração da branch e da verificação do GitHub Pages.

## 1. Entrega já existente e preservada

A branch main possuía cinco abas — TJRJ (inicial), Calendário, Pendências, Fontes e Sincronização — além de base estática, pesquisa do TJRJ, detalhes expansíveis, controles de ocultação/restauração, regras conservadoras de prazo, simulações locais de exclusão de datas e os módulos Raf-Prazo 2.2/Balcão Virtual. Não houve reimplementação do motor jurídico.

Nenhuma correção deste ciclo exigiu alteração em calculate(), reason(), baseEvent(), feriados.json, dados/coleta-tjrj.json ou nas regras de termo inicial, fins de semana, JEC e CPC.

## 2. Defeitos reproduzidos antes de editar

| Regressão em Chrome | Antes | Depois |
| --- | --- | --- |
| Limpar 65 alterações de calendário | 40 ocultadas; 25 ainda visíveis | 0 visíveis |
| Limpar 130 pendências | 60 ocultadas; a página ainda exibia 60 | 0 visíveis |
| Limpar 55 notícias filtradas por comarca mencionada | 40 visíveis permaneciam | 0 visíveis |
| Reabrir a Central diretamente em TJRJ | Sino caía de 80 para 55 sem visualizar Calendário | Contador permanece 65 até abrir Calendário |
| Chegar nova versão de notícia ocultada | Necessitava teste específico | Versão com novo hash reaparece |
| Falha ao gravar preferências | Necessitava teste específico | Alerta real; cartão permanece |

A última linha do TJRJ decorre do filtro: o texto pesquisável incluía comarcas mencionadas, mas a ação de limpar comparava somente parte dos campos. A correção adotou um único predicado para ambos.

## 3. Mudanças realizadas

- Limpar lista oculta todos os resultados elegíveis da aba/filtro selecionado, inclusive registros que não foram renderizados pelos limites de 40 e 60 cards. A confirmação informa a quantidade e o escopo exatos.
- Restauração continua reversível e exclusiva da aba. A gravação é feita somente em localStorage; se falhar, aparece aviso e a interface não anuncia sucesso.
- Retirados cortes silenciosos de IDs ocultos no Calendário, Pendências e feed TJRJ. Eventos novos ou versões alteradas podem reaparecer.
- A abertura da Central não marca silenciosamente as mudanças do Calendário como vistas; isso só ocorre ao selecionar sua própria aba.
- A pesquisa TJRJ mantém a ordem por chegada/alteração, e o botão informa que atualiza somente a base já publicada, não o portal do tribunal em tempo real.
- A lista explicita quando há mais de 40 resultados, apresenta status técnicos importantes também em português, preserva os cinco painéis e mantém botões mais acessíveis ao toque.
- Melhor visibilidade da aba selecionada na navegação horizontal mobile.

## 4. Testes e evidências

**Referência antes da mudança:** 42 testes Node selecionados aprovados e 67 Python aprovados. Os novos cenários funcionais reproduziram quatro falhas de comportamento.

**Após correção:**
- 79 testes Node aprovados, 0 falhas.
- 67 testes Python aprovados, 0 falhas.
- Chrome/Playwright: 320, 360, 390, 412, 430 e 1366 px, com cinco abas, teclado, filtro, fechar/abrir, limpar, cancelar, restaurar, reload, tema e isolamento.
- Teste específico test_updates_bulk_browser.py: oito cenários aprovados, incluindo acima de 40 registros, atualização documental, indisponibilidade do armazenamento e preservação de decisões de prazo.
- Validação de sintaxe dos scripts JS, JSON público e geração reprodutível de index.html pelo build_html.py.

### Capturas da janela em Chrome

| 360 px | 390 px |
| --- | --- |
| ![Antes 360](evidencias/central-antes-360.png) | ![Antes 390](evidencias/central-antes-390.png) |
| ![Depois 360](evidencias/central-depois-360.png) | ![Depois 390](evidencias/central-depois-390.png) |

**Importante:** capturas e testes em Chrome emulado são evidência funcional de navegador; não constituem teste presencial em um aparelho Android físico.

## 5. Isolamento da contagem e segurança jurídica

As chaves de ocultação dos três conjuntos de notícias/alterações/candidatos são isoladas entre si. Ocultar/limpar/restaurar não modifica as chaves raf-prazo:tjrj-exclusions-user:v1 nem raf-prazo:exclusoes-individuais:v1. O cenário automatizado insere valores sentinela nessas duas chaves e confirma que permanecem idênticos após as limpezas.

Indícios TJRJ com pending_review, verified=false ou applies_to_deadlines=false não são promovidos a suspensões oficiais e não alteram automaticamente o vencimento. Indisponibilidade, expediente e ponto facultativo não comprovam, por si, suspensão de prazo.

## 6. Fontes, cobertura e limites

A coleta de fontes oficiais é agendada pelo GitHub Actions, sujeita a falhas ou indisponibilidade. O botão do navegador recarrega a base pública feriados.json; não faz pesquisa direta no portal TJRJ. Horário da coleta não equivale à data do ato processual. Notícias sem validação exigem conferência do documento, abrangência, comarca, atos correlatos e efeitos jurídicos.

A presente auditoria não comprova cobertura integral do TJRJ, nem substitui análise jurídica de prazo. O Raf-Prazo permanece gratuito, estático e sem login/perfis.

## 7. GitHub Actions e publicação

O primeiro commit deste ciclo contém alterações funcionais, testes de regressão e quatro capturas. A conclusão a 100% exige verificar o pipeline no GitHub, integrar a branch na main sem perder mudanças concorrentes, conferir GitHub Pages após o deploy e executar verificação do conteúdo público. O código local não equivale à versão publicada.

**Status verificável no momento desta redação: 75% — implementação e testes locais aprovados; publicação ainda não certificada.**
