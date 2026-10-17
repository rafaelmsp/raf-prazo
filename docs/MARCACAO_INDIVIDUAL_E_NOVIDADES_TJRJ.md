# Raf-Prazo — Marcação individual e novidades do TJRJ

Atualizado em 17/10/2026. Recursos do site estático: GitHub Pages + GitHub Actions.

## 1. Marcar uma data como NÃO CONTADA

- Abra o **calendário**, selecione uma data e consulte os detalhes.
- Se a data é um dia útil que ainda seria contado, aparece **Decisão individual sobre a contagem**. Informe o motivo e, preferencialmente, o link do ato ou da legislação.
- Para feriado estadual do RJ ou municipal de Duque de Caxias presente na base, o formulário **sugere o nome e a fonte legal**, para evitar digitação desnecessária.
- Clique em **Excluir este dia da contagem (simulação)** e confirme. O vencimento será recalculado.
- Clique novamente para **reativar a contagem**. A escolha é salva **somente neste navegador** e associada ao município escolhido. O histórico registra ativação e desativação sem certificação de autoria.
- Não se permite marcar novamente como não contados **sábado, domingo ou dia já excluído** por feriado nacional, recesso, feriado local habilitado globalmente ou outra escolha ativa.
- A opção **Considerar feriados estaduais/municipais** permanece para ativação *em lote*. Com essa opção desligada, a seleção individual permite desconsiderar só a data desejada. Não cria feriado ou suspensão oficial.

O registro aparece na memória como **EXCLUSAO_USUARIO**, com alerta de **SIMULAÇÃO NÃO HOMOLOGADA**. A escolha nunca altera os arquivos oficiais nem a contagem de outros usuários.

## 2. Buscar novidades de possíveis suspensões do TJRJ

- Entre em **Atualizações** → **Buscar novidades de suspensão — TJRJ**.
- O painel tem **campo de pesquisa por comarca, data, ato ou palavra**, lista de trechos extraídos, links das fontes oficiais, informações sobre a última coleta e marcação de resultados ainda não vistos.
- O botão **Buscar atualizações agora** força uma consulta **à última base publicada** pelo projeto. Não executa o Python em tempo real contra o site do tribunal.
- O coletor Python é executado pelo **GitHub Actions aproximadamente a cada quatro horas**, sujeito à fila do serviço, consulta documentos e links oficiais cadastrados e atualiza `dados/coleta-tjrj.json` e `feriados.json`. A opção `workflow_dispatch` permite executar manualmente o workflow no GitHub a quem tenha permissão.
- A interface possui contador/sininho de novidades detectadas. O usuário também pode usar **Marcar novidades como vistas**. Trata-se de notificações **dentro do site**, ao abri-lo ou sincronizá-lo; **não há push no celular** nem alerta garantido quando o navegador está fechado.

### Limitação importante da cobertura

O coletor acompanha **algumas fontes oficiais configuradas e os links que conseguir descobrir nessas páginas**, não todos os atos publicados ou todas as comarcas do TJRJ. Uma data ausente do painel pode ainda estar suspensa. Um trecho encontrado não comprova automaticamente a validade, vigência, retificação, abrangência ou natureza processual de uma suspensão.

O TJRJ informa que seu informativo de suspensão de prazos é **meramente informativo e não substitui a publicação oficial**. Assim, cada resultado extraído permanece `pending_review`, `verified:false` e `applies_to_deadlines:false`. Nenhum indício é aplicado automaticamente à contagem.

## 3. Implementação e verificação

- `assets/user-date-exclusions.js`: campo de exclusão individual, validação de datas, armazenamento local, desativação, auditoria e sugestão de fonte de feriado local.
- `assets/tjrj-news.js`: painel pesquisável, proveniência, novidades, fontes e estado visto/não visto.
- `index.html` e `src/template.html`: integração com memória, cálculo e sininho.
- `scripts/collect_tjrj.py`: coleta das fontes públicas oficiais conhecidas.
- `.github/workflows/atualizar.yml`: seis execuções agendadas por dia e validações de segurança.

Comandos:
```bash
node --check assets/user-date-exclusions.js
node --check assets/tjrj-news.js
node --test tests/test_user_date_exclusions.cjs
node --test tests/test_tjrj_news.cjs
python -m unittest discover -s tests -p 'test_*.py' -v
```

**Uso jurídico:** resultados auxiliares; conferir CPC, publicação/intimação, expediente no TJRJ, instância, comarca, sistemas, decisões e eventuais prorrogações. Ativações locais não atestam a tempestividade de peças processuais.
