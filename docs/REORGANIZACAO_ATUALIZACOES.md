# Central de Atualizações — Raf-Prazo 2.1

Data: 17/10/2026. Escopo: interface local, sem modificação do motor de contagem.

## Estrutura
- **Calendário**: mudanças oficialmente cadastradas, com filtro de ano e cartões expansíveis.
- **TJRJ**: indícios documentais extraídos de fontes oficiais; busca, links para fontes, marcação de vistos e simulações individuais explicitamente não homologadas.
- **Pendências**: documentos TJRJ sem validação, candidatos de APIs e outras entradas não promovidas à base de eventos; mostram razão, fonte e evidência.
- **Fontes**: informações e limites das origens de dados.
- **Sincronização**: versão da base, origem online/cache/incorporada, última consulta, status e contagem de fontes.

A navegação horizontal é responsiva para telas Android de 360–430 px e mantém os cinco painéis isolados. A interface usa cartões recolhíveis para apresentar detalhes sob demanda.

## Segurança da função de limpeza

A limpeza usa exclusivamente as chaves locais:
- `raf-prazo:updates-holidays-hidden:v1`
- `raf-prazo:tjrj-news-hidden:v1`
- `raf-prazo:updates-pending-hidden:v1`

**Ocultar item** remove somente da lista visível. **Limpar lista** solicita confirmação e oculta no máximo os cartões atualmente renderizados por vez (Calendário: 40; TJRJ: 40; Pendências: 60). **Restaurar** remove só as preferências de ocultação daquela aba. A chave independente de leitura TJRJ é `raf-prazo:tjrj-news-seen:v1`.

Mudanças na origem, estado, nome ou aplicação do evento do calendário, ou no hash documental de um indício TJRJ, geram uma versão de identidade diferente e podem reaparecer mesmo após ocultação antiga. Os candidatos usam ID, status, referência de origem e motivo.

Nenhuma dessas ações deve escrever em `feriados.json`, `dados/coleta-tjrj.json`, nos dados de coleta ou nas seleções de exclusão do usuário (`raf-prazo:tjrj-exclusions-user:v1` e `raf-prazo:exclusoes-individuais:v1`).

Se `localStorage` estiver indisponível ou cheio, o aplicativo informa o erro, em vez de prometer persistência.

## Regras jurídicas preservadas

A coleta TJRJ é informativa; `pending_review` não é suspensão homologada, nem implica aplicação automática ao vencimento. A simulação individual do usuário é apresentada em área independente e marcada como não homologada.

O modo conservador, o tratamento de fins de semana, o marco inicial e a contagem processual não foram alterados por esta reorganização. O aplicativo é um apoio de conferência, nunca uma certificação de prazo.

## Validação

A suíte `tests/test_update_tabs.cjs` verifica a estrutura das cinco abas, isolamento das listas, armazenamento e sintaxe de scripts embutidos. `tests/test_tjrj_news.cjs` verifica versão dos indícios, notificações, limpeza reversível e confirmação. `tests/test_tjrj_optin.cjs` verifica que a simulação continua independente da nova aba Pendências.

O workflow `.github/workflows/testar-atualizacoes.yml` executa os testes Node e Python em branches e PRs, sem escrita em repositório. A publicação só deve ser considerada concluída após testes e deploy do GitHub Pages verificados.

## Limitações

A consulta manual busca somente a **última base publicada**; não pesquisa o portal TJRJ em tempo real. Nem todos os atos e comarcas estão necessariamente cobertos. A identificação automática de notícias não constitui validação jurídica dos efeitos sobre o processo.
