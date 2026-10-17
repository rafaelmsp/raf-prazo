# Feed TJRJ — ordem de chegada (17/10/2026)

## Comportamento
A aba **TJRJ** apresenta **novidades mais recentes primeiro** segundo o registro de descoberta ou alteração do documento no Raf-Prazo. O campo `first_seen_at` permanece como a primeira descoberta; `content_changed_at` é atualizado **somente quando o hash da fonte muda**. `last_seen_at` representa mera consulta/recaptura e **não** é usado para reordenar.

A interface mostra **Recebido/atualizado no Raf-Prazo: DD/MM/AAAA HH:MM** e, em linha separada, **Data do evento mencionada: AAAA-MM-DD (não validada)**. Assim, uma notícia recebida hoje sobre data antiga aparece antes de uma notícia recebida anteriormente sobre uma data futura. Documentos duplicados com a mesma evidência são agrupados e usam a chegada mais recente de qualquer fonte correspondente.

O feed conserva os botões de marcar como vistas, ocultar, limpar com confirmação e restaurar, além da busca por texto. A alteração de hash também muda a identificação da notificação, permitindo reapresentar material atualizado. O botão de buscar continua consultando a última base publicada (não faz uma busca direta no portal TJRJ).

## Segurança e limites
A descoberta de um documento ou a alteração de seu conteúdo **não confirma suspensão judicial**. Indícios continuam `pending_review`, `verified=false`, `applies_to_deadlines=false`, e os prazos processuais não são alterados.

A data da chegada é **data de conhecimento pelo Raf-Prazo**, não a data oficial de publicação nem a de vigência do ato. Uma mudança no hash da página pode incluir alterações não substanciais; por isso o sistema exibe "recebido/atualizado", sem afirmar que o TJ publicou um novo ato.

Datas históricas anteriores à implantação do campo novo mantêm `first_seen_at` como critério de chegada até a próxima modificação real.

## Arquivos
- `scripts/collect_tjrj.py`: carimbo estável de alteração de conteúdo
- `scripts/sync.py`: propaga carimbo para `feriados.json`
- `assets/tjrj-news.js`: ordena pelo carimbo e esclarece a apresentação
- `tests/test_collect_tjrj.py` e `tests/test_tjrj_news.cjs`: validam chegada, mudança e reconsulta

## Critérios de aceite
1. Registro que chega por último aparece primeiro, independentemente da data do evento.
2. Conteúdo modificado recebe novo carimbo e sobe ao topo.
3. Reconsulta sem mudança não muda a posição.
4. Evidências duplicadas mantêm agrupamento; sem duplicar alertas falsos.
5. Em caso de horário igual, preserva-se a sequência original do feed, sem ordenar por data do evento.
6. Layout responsivo, fonte oficial e controles de limpeza sem alteração do motor jurídico.
