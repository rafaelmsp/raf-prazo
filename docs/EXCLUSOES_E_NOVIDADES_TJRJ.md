# Raf-Prazo 2.1 — Dia não contado e busca de novidades TJRJ

**Data:** 17 de outubro de 2026. **Uso:** calculadora auxiliar de prazos; registros não homologados não são atos do tribunal.

## 1. Excluir individualmente um dia útil

1. No calendário, clique em um **dia útil** que não esteja sendo excluído.
2. Em **Decisão individual sobre a contagem**, informe o **motivo** (mínimo de 4 caracteres) e, se houver, um link HTTPS para a fonte.
3. Selecione **Excluir este dia da contagem (simulação)** e confirme o aviso.
4. O cálculo é refeito com o rótulo **SIMULAÇÃO DO USUÁRIO — EXCLUSÃO NÃO HOMOLOGADA**.
5. Reabra o dia para **reativar a contagem**. O registro fica apenas no navegador e é auditável localmente.

Regras: a escolha está vinculada a UF, código IBGE e data; finais de semana são excluídos automaticamente e não aceitam ativação adicional; dias já desconsiderados por legislação/recesso ficam sem botão redundante; registros locais não alteram `feriados.json`, não criam atos oficiais nem são compartilhados com outros usuários. São persistidos no `localStorage` e na memória dos novos cálculos salvos, com hora, motivo e fonte informada. A integridade desses dados locais **não é criptograficamente certificada**.

O recurso permite corrigir a *simulação* quando uma data ausente é relevante, mas não substitui a verificação do calendário forense. A autorização para excluir um dia é uma escolha expressa do usuário, não validação pelo TJRJ.

## 2. Buscar novidades de possíveis suspensões

Abra **Atualizações** e localize **Buscar novidades de suspensão — TJRJ**.

- Pesquise por comarca, data ou palavras do ato usando o campo de busca.
- Clique em **Buscar atualizações agora** para consultar a última base `feriados.json` publicada.
- A lista mostra datas, tipos de indícios, trechos documentais e links oficiais.
- Documentos duplicados em `www.tjrj.jus.br` e `portaltj.tjrj.jus.br` são agrupados quando têm o mesmo trecho de evento.
- Um indicador em **Atualizações** sinaliza novos indícios não visualizados; **Marcar novidades como vistas** limpa esses alertas neste navegador.

### De onde vêm as novidades

O coletor Python `scripts/collect_tjrj.py` acessa exclusivamente os endereços oficiais autorizados. Consulta, entre outros, o **Informativo 2026 de 1ª e 2ª instâncias** e o **informativo 2026 da Capital/2ª instância**:

- https://www.tjrj.jus.br/documents/d/portal-conhecimento/suspensao-prazos-1a-e-2a-instancia_2026_seesc
- https://www.tjrj.jus.br/documents/d/portal-conhecimento/suspensao-prazos-comarca-capital-e-2a-inst_2026_seesc

Além dos PDFs, consulta páginas de notícias já cadastradas e segue alguns links relevantes identificados nelas. A rotina é executada pelo GitHub Actions conforme agenda programada no repositório. Cada ocorrência possui fonte, hash SHA-256 do documento, trecho de origem e status `pending_review`. Se uma fonte falhar, a base pode estar parcial; o aplicativo não inventa suspensões nem garante atualização exaustiva.

**Limitação técnica:** o botão de busca, numa aplicação estática, **não pode executar uma nova raspagem do site do TJRJ no servidor**. Ele atualiza a cópia publicada pela automação. Portanto, uma notícia postada há poucos minutos pode ainda não ter sido coletada. Os avisos de novidades aparecem ao abrir/sincronizar o aplicativo; não constituem notificações push fora do navegador, nem garantem cobertura de todos os atos oficiais.

**Limitação jurídica:** a própria seção do TJRJ informa que seus documentos de consulta não substituem a publicação oficial. Indícios de suspensão, indisponibilidade, ponto facultativo, alteração de expediente ou feriado **não se tornam automaticamente suspensão processual**. Confira comarca, órgão, instância, vigência, exceções, prorrogações e publicação oficial.

## 3. Testes de regressão

```sh
node --check assets/user-date-exclusions.js
node --check assets/tjrj-news.js
node --test tests/test_user_date_exclusions.cjs
node --test tests/test_tjrj_news.cjs
python -m unittest discover -s tests -p 'test_*.py' -v
```

As verificações de rede e a implantação contínua são executadas no GitHub Actions. A partir desta fase a interface utiliza **somente um painel de novidades**, para evitar listas duplicadas de suspensões.
