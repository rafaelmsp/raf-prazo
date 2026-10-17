# Raf-Prazo — Coleta automatizada de fontes oficiais do TJRJ

**Estado:** implementação de coleta informativa, 17/10/2026. **Não é serviço oficial.**

## Política de segurança

A coleta **não valida atos automaticamente, não confirma suspensão, não decide abrangência e não altera dias do calendário para a contagem processual**. Todos os registros publicados têm `status: pending_review`, `verified: false` e `applies_to_deadlines: false`. A eventual descoberta de uma fonte oficial não valida a aplicação dela a qualquer processo.

Nesta fase, o Raf-Prazo aplica somente feriados nacionais legais fixos e o recesso legal configurado. **Feriados estaduais/municipais, atos TJRJ e datas manuais estão desativados da contagem**, inclusive quando presentes em bases antigas do navegador. A calculadora NÃO é suficiente para afirmar tempestividade de prazo no TJRJ. Sempre conferir os sistemas e calendários oficiais.

## Fontes iniciais programadas

1. Informativo de Suspensão dos Prazos Processuais e Expediente Forense — 2026:
   https://www.tjrj.jus.br/documents/d/portal-conhecimento/suspensao-prazos-1a-e-2a-instancia_2026_seesc
2. Portal do Conhecimento — Feriados Locais e Suspensão de Prazos:
   https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/177451389
3. Publicação do Aviso nº 290/2026, usada como fonte para verificar a extração (sem efeito automático):
   https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295

São *URLs de descoberta*, não uma lista de decisões previamente validadas.

## Funcionamento

`scripts/collect_tjrj.py` acessa somente caminhos permitidos em `www.tjrj.jus.br` e `portaltj.tjrj.jus.br`. O coletor:
- consulta as três páginas/documentos oficiais e até oito links relevantes encontrados nessas páginas;
- aceita páginas HTML e PDFs com texto extraível (pypdf); não realiza OCR;
- limita tamanho de resposta e quantidade de consultas e registra falhas, inclusive bloqueios e indisponibilidade;
- registra URL oficial, título, trechos, datas **mencionadas** (não a data de suspensão), horários da coleta e SHA-256 do documento baixado;
- mantém registros anteriores, marcados como desatualizados quando não foram reconfirmados;
- grava `dados/coleta-tjrj.json` com o estado da execução;
- apresenta candidatos na central **Atualizações**, nunca como dias legalmente excluídos.

`scripts/sync.py` combina candidatos com a base de feriados nacionais em `feriados.json`. A interface `index.html` exibe o status e os documentos, mas o motor de prazos ignora esses candidatos.

## Automação no GitHub

Arquivo: `.github/workflows/atualizar.yml`.

O workflow executa diariamente, às 10h17 UTC (aproximadamente 07h17 de Brasília) e pode ser iniciado manualmente em **Actions > Raf-Prazo - Atualizar calendario > Run workflow**. Um disparo por atualização do próprio workflow/coletor poderá executar a coleta inicial.

Sequência: preparar Python/pypdf, executar testes locais sem rede, coletar fontes oficiais, validar invariantes de segurança, atualizar feriados nacionais, atualizar JSON incorporado e registrar mudanças no Git.

A execução bem-sucedida **não garante** que todas as fontes oficiais foram consultadas. Conferir `source_success/source_count` e `status`. Quando a rede falhar, mostrar `unavailable` ou `partial`; não inventar eventos nem substituir datas oficiais.

## Limites técnicos e jurídicos

- Fonte encontrada ≠ ato autêntico, vigente e aplicável; o TJRJ informa que seus informativos não substituem a publicação oficial.
- Datas publicadas ou mencionadas podem ser de assinatura, publicação, vigência, feriados distintos ou referências históricas.
- Um documento de 2026 pode estar desatualizado; não equivale a um monitoramento integral de novos avisos e indisponibilidades.
- Não existe neste estágio interpretação automática certificada de alcance por comarca, vara ou processo.
- Dados coletados são públicos, mas extração e disponibilidade podem mudar sem aviso; erros ficam visíveis no relatório.

## Verificação e manutenção

- Testes unitários: `python -m unittest discover -s tests -p 'test_*.py' -v`.
- Diagnóstico da última base coletada: `python scripts/collect_tjrj.py --check`.
- Executar coleta real: `python scripts/collect_tjrj.py` (requer acesso às fontes e biblioteca `pypdf`).
- Inspecionar o JSON antes de publicar: `dados/coleta-tjrj.json` e `feriados.json`.
- Confirmar que `feriados.json.events` não contém `SUSPENSAO_TJRJ` e que `candidates[*].applies_to_deadlines` é sempre falso.

**Aviso legal:** ferramenta auxiliar independente, sem vínculo, chancela ou certificação do TJRJ. O usuário permanece responsável por conferir regras e calendários oficiais, inclusive suspensões e indisponibilidades dos sistemas.
