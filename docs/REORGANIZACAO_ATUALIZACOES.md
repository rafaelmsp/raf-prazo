# Central de Atualizações — Raf-Prazo

**Revisão:** 22/10/2026. **Escopo:** organização e UX, sem mudança no motor jurídico de contagem de prazos.

## Estrutura

As cinco abas têm responsabilidades independentes:

| Aba | Responsabilidade |
| --- | --- |
| **TJRJ** (inicial) | Notícias e indícios documentais coletados, pesquisa, fonte oficial, hora de chegada/coleta e simulações locais separadas |
| **Calendário** | Eventos incluídos, alterados ou removidos, filtro por ano, âmbito, fundamento e aplicação |
| **Pendências** | Candidatos de fontes TJRJ/API não homologados, evidências e motivos de pendência |
| **Fontes** | Origem, status e cobertura de leis, bases externas e documentos judiciais |
| **Sincronização** | Versão publicada, data/hora, status de coleta, fonte online/cache e atualização da base |

A navegação horizontal foi conferida no Chrome nas larguras de 320, 360, 390, 412 e 430 px e em 1366 px. A aba ativa deve continuar visível e os dados extensos estão em cards recolhíveis.

## Limpar, ocultar, marcar como visto e restaurar

**Ocultar item** esconde apenas o cartão selecionado na aba correspondente. **Limpar lista** pede confirmação e oculta todos os resultados elegíveis da aba, ou todos os resultados do filtro de ano/pesquisa aplicado, mesmo quando a interface exibe somente os primeiros 40/60 cartões. A confirmação informa quantidade e abrangência; cancelar não altera os itens.

**Restaurar** reexibe os cartões ocultos daquela aba, sem mudar outras listas nem decisões individuais de cálculo. **Marcar como visto** altera somente o indicador de leitura, não remove cartões. Abrir a Central em TJRJ não marca o Calendário como visto.

Preferências de ocultação usam chaves exclusivas no localStorage:
- raf-prazo:updates-holidays-hidden:v1
- raf-prazo:tjrj-news-hidden:v1
- raf-prazo:updates-pending-hidden:v1

A leitura do TJRJ usa raf-prazo:tjrj-news-seen:v1. Registros de seleção/exclusão de datas pelo usuário são independentes: raf-prazo:tjrj-exclusions-user:v1 e raf-prazo:exclusoes-individuais:v1.

**A limpeza não modifica feriados.json, dados/coleta-tjrj.json, eventos oficiais nem cálculos.** Falha de localStorage precisa gerar aviso real, sem fingir persistência. Versões novas podem aparecer após ocultação antiga por terem identidade/hash diferente.

## Validade das fontes e efeitos jurídicos

Um registro pending_review é indício, não homologação. Datas de avisos de indisponibilidade, alteração de expediente, suspensão mencionada ou ponto facultativo não entram automaticamente na contagem. Qualquer exclusão individual permanece escolha local, com aviso de que não constitui efeito oficialmente reconhecido.

A coleta TJRJ ocorre por automação GitHub Actions, com limites de cobertura. **Atualizar base publicada** solicita a versão disponível de feriados.json e não pesquisa o tribunal em tempo real. A ordenação de notícias considera chegada ou mudança de conteúdo, não a data da suspensão possivelmente mencionada.

## Validação

- Testes Node completos: 79 aprovados; Python: 67 aprovados.
- Testes reais em Chrome/Playwright, 320/360/390/412/430/1366 px.
- Regressão test_updates_bulk_browser.py: oito verificações para listas acima do limite de renderização, pesquisa, nova versão, notificação, falha de armazenamento e isolamento.
- Capturas comparativas antes/depois em docs/evidencias/.
- Geração do HTML pelo script de build reproduzível, com JSON e scripts sintaticamente válidos.

Consultar o relatório docs/CONTINUIDADE_CENTRAL_ATUALIZACOES.md para SHA inicial, defeitos reproduzidos, capturas, arquivos modificados e situação da publicação.

**Limitação:** os testes automatizados em Chrome não substituem uma sessão manual num Android físico; a aprovação do CI por si só não significa que a versão nova já esteja publicada no GitHub Pages.
