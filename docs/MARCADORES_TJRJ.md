# Raf-Prazo — Marcadores informativos do TJRJ

**Estado:** integrado ao calendário em 17/10/2026. **Atenção:** isto não é validação jurídica nem homologação.

## De onde os dados vêm

Fluxo publicado:

1. `scripts/collect_tjrj.py` consulta URLs HTTPS oficiais em `www.tjrj.jus.br` e `portaltj.tjrj.jus.br`; guarda `source_url`, `source_hash_sha256` (SHA-256 dos bytes recebidos), horário e `structured.occurrences` em `dados/coleta-tjrj.json`.
2. `scripts/extract_tjrj.py` procura, no texto recuperado, uma **menção de data próxima a uma expressão de efeito jurídico**. O resultado é apenas um *indício*: `pending_review`, `verified:false`, `applies_to_deadlines:false`.
3. `scripts/sync.py` copia esses indícios para os **candidates** de `feriados.json`, preservando os hashes e URLs. Não os copia para `events`.
4. `scripts/build_html.py` incorpora `feriados.json` à versão HTML offline.
5. `assets/tjrj-markers.js` lê `window.RafPrazoData.base.candidates` (dados efetivamente carregados da base) e **marca o dia com contorno pontilhado e um ?**, apenas quando UF=RJ e há uma ocorrência estruturada coerente. Clicar abre a ficha contendo trecho extraído, fontes oficiais e hash SHA-256.

Nenhum marcador se baseia em lista de datas TJRJ codificada no JavaScript. O exemplo de 30/10/2026 só aparece se estiver nos candidatos coletados. Para duas URLs que descrevem a mesma ocorrência, a visualização reúne os endereços em uma única ficha — não são duas suspensões distintas.

## Verificações de segurança

- O endereço do documento e do trecho extraído devem coincidir e pertencer a domínios e caminhos oficiais previamente autorizados.
- Os dois hashes devem coincidir e ter 64 dígitos hexadecimais.
- Tanto o documento quanto o indício devem ter `status:pending_review`, `verified:false` e `applies_to_deadlines:false`.
- O marcador não aparece se o documento está sinalizado como `stale`, a data é inválida ou a UF selecionada não é RJ.
- O módulo somente modifica **a interface**, nunca `reason()`, `calculate()` ou `events` usados na contagem.
- A origem é rotulada como “documento coletado automaticamente — não validado”. O hash identifica o conteúdo recebido pela coleta, mas não equivale à assinatura digital ou prova da vigência do ato.

## Limitações ainda existentes

A coleta usa uma lista inicial de páginas e links encontrados nessas páginas; **não cobre automaticamente todas as publicações do TJRJ**. PDFs complexos, tabelas, mudanças por comarca, imagens sem texto selecionável e atos posteriores podem não ser extraídos corretamente. No informativo anual de 2026, nenhuma ocorrência datada individual foi extraída na última execução analisada, apesar de o PDF ter sido recuperado. A notícia do Aviso 290/2026 gerou menções de 30/10/2026; o ano foi inferido do contexto do documento e ainda requer conferência.

Um dia marcado não significa que houve suspensão em toda a Justiça do RJ ou que o prazo do processo deve mudar. Mesmo um dia **sem marcador** não é necessariamente útil forense. Para que o projeto aplique suspensões, será necessária uma etapa jurídica distinta de verificação de vigência, abrangência, exceções e possíveis retificações.

### Prova de origem e testes

`tests/test_tjrj_markers.py` cruza `dados/coleta-tjrj.json` com `feriados.json` e confere que os trechos publicados são cópias de ocorrências geradas pela coleta, seus endereços e hashes coincidem e não existe suspensão TJRJ ativa.

Para depuração, `window.RafPrazoTjrjEvidence.list()` mostra **apenas** as datas com indícios publicados e quantas fontes foram agregadas. Não altera nenhum dado.

Rodar os testes:
```sh
python -m unittest discover -s tests -p 'test_*.py' -v
node --check assets/tjrj-markers.js
```
