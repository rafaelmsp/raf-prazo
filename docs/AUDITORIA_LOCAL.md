# Raf-Prazo 2.1 — Etapa 4: rastreabilidade e memoria congelada

**Estado:** implementada em 17/10/2026. **Classificacao:** mecanismo auxiliar, local e nao certificado.

## Objetivo e escopo

1. Registrar as inclusoes, alteracoes e exclusoes de ocorrencias extraordinarias **salvas pelo usuario**.
2. Registrar alteracoes de datas e motivos informados manualmente por municipio.
3. Preservar, para cada calculo salvo depois desta atualizacao, uma copia independente da memoria de dias contados e nao contados, dos parametros do calculo, das fontes por linha e da versao da base em uso.
4. Exibir o historico local e a relacao de alteracoes ja registradas na base oficial/publicada, mantendo distinta sua origem.
5. Permitir exportar log e calculos salvos em JSON.

## Como usar

- Na calculadora, clique em **Rastreabilidade e historico de alteracoes** para consultar as acoes locais, a versao e as alteracoes cadastradas na base publicada.
- Clique em **Exportar dados JSON** para baixar a copia do log e calculos salvos no navegador.
- Em **Historico**, cada calculo salvo a partir desta versao oferece **Memoria salva**, para examinar a foto do calculo original.
- O botao **Reabrir** continua recalculando os parametros na base atualmente disponivel. A memoria salva e a referencia historica, e nao sera recalculada.
- No cadastro de ocorrencia extraordinaria, use **Editar** para atualizar os dados preservando o identificador local; **Excluir** mantem no log a copia do registro removido, ate que o log seja apagado.
- O botao **Limpar log local** apaga somente as acoes de auditoria, mantendo eventos e calculos. A limpeza do historico de calculos permanece independente.

## Dados registrados

A trilha local `raf-prazo:audit-events:v1` contem:
- ID local gerado pelo navegador, data/hora do registro, acao, referencia do evento;
- dados anteriores e posteriores, versao atual da base e municipio selecionado.

A memoria congelada do calculo contem:
- versao, geracao, ultima consulta e origem da base;
- prazo, marco inicial, vencimento, localidade e opcoes de contagem;
- memoria cronologica por dia com causa e link de fonte quando presente;
- datas manuais do municipio e ocorrencias extraordinarias declaradas na janela do prazo, marcadas sem efeito automatico.

Limites atuais: **ate 200 acoes locais** e **ate 30 calculos salvos**, conforme capacidade do armazenamento do navegador. Registros anteriores a etapa 4 nao possuem memoria congelada retroativa.

## Distincao entre eventos e ocorrencias

- Feriados e suspensoes incluidos na base `feriados.json` seguem o validador de fontes e a abrangencia definida na base.
- Registros de indisponibilidade, possivel suspensao ou alteracao de expediente adicionados pelo usuario continuam `pending` / `applies_to_deadlines: false` e **nao mudam a contagem**.
- O log nao promove registros pendentes a feriados oficiais nem interpreta automaticamente efeito juridico de um ato.
- A secao de alteracoes publicadas reflete apenas os registros disponiveis no array `changes` da base carregada, **nao** um historico completo e imutavel do tribunal.

## Privacidade, seguranca e limites probatorios

A trilha fica apenas no `localStorage` do navegador. **Nao ha autenticacao, assinatura, carimbo do tempo confiavel, controle de acesso, registro de IP, trilha imutavel nem servidor que certifique autoria.** Acoes podem ser alteradas pelo titular do dispositivo ou perdidas ao limpar dados. Datas/horarios sao informados pelo relogio local, sujeito a alteracao. O arquivo JSON exportado **nao constitui por si so prova pericial de autenticidade**.

Nao inserir dados pessoais, numeros de processo sigilosos ou documentos sensiveis sem uma avaliacao de privacidade. Os arquivos exportados podem conter anotacoes e memoria de calculo; guarde-os com cautela.

## Validacao

Testar separadamente: inclusao/edicao/exclusao de ocorrencia; inclusao/alteracao/exclusao de data manual; exportacao JSON; versao da base; abertura de memoria preservada apos alterar parametros atuais; desktop e mobile; ausencia de erro JavaScript.

Testes automatizados estaticos: `tests/test_calendar_audit.py`.
Testes funcionais locais: Chromium com resolucoes 1366x768 e 390x844, com verificacao de seis alteracoes, exportacao e memoria persistida.

**Nunca substituir a conferencia do calendario forense e dos atos oficiais aplicaveis ao processo.**
