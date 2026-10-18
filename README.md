# Raf-Prazo
### Calculadora Judicial de Prazos · HTML5 · Projeto independente

**Versão do aplicativo:** 2.2 (JEC padrão, CPC alternativo; coleta TJRJ conservadora)

**Extração estruturada TJRJ (fase 1):** [Como a coleta identifica indícios e por que não altera prazos](docs/EXTRACAO_TJRJ.md). Os registros são pendentes, não constituem validação de atos.  
**Desenvolvimento e autoria:** Rafael Moraes da Silva Passos  
**Edição desta documentação:** 17 de outubro de 2026  
**Distribuição:** acesso gratuito; código-fonte sem licença aberta de reutilização  
**Situação:** código publicado no GitHub; verificar o status de cada execução em Actions. A coleta de fontes TJRJ é parcial, não oficial e nunca altera automaticamente os prazos.

> [!IMPORTANT]
> **MODO CONSERVADOR (17/10/2026):** feriados nacionais fixos e o período do art. 220 do CPC integram a lógica conforme parâmetros da ferramenta. Feriados legais do RJ e Duque de Caxias podem ser considerados **somente por opção expressa do usuário**, com cobertura forense parcial. Documentos TJRJ não homologados são coletados como indícios e **nunca alteram automaticamente os prazos**; escolhas individuais geram simulações não homologadas. **Não use o resultado isoladamente para definir vencimento forense.** [Detalhes da coleta](docs/COLETA_TJRJ.md).

> [!CAUTION]
> **FERRAMENTA AUXILIAR, INDEPENDENTE E NÃO OFICIAL.** O Raf-Prazo **não certifica a tempestividade**, não calcula automaticamente todas as situações processuais e **não substitui** os sistemas judiciais, a consulta aos atos normativos, o calendário oficial, a análise da intimação nem a conferência do profissional responsável. **Nunca pratique um ato processual exclusivamente com base no resultado do aplicativo.**

---

## Sumário

1. [Visão geral e objetivos](#1-visão-geral-e-objetivos)
2. [Funcionalidades](#2-funcionalidades)
3. [Como usar a calculadora](#3-como-usar-a-calculadora)
4. [Regras de contagem e limites jurídicos](#4-regras-de-contagem-e-limites-jurídicos)
5. [Fontes, abrangência e confiabilidade](#5-fontes-abrangência-e-confiabilidade)
6. [Atualizações do Calendário Judicial](#6-atualizações-do-calendário-judicial)
7. [Arquitetura e estrutura do repositório](#7-arquitetura-e-estrutura-do-repositório)
8. [Instalação e execução local](#8-instalação-e-execução-local)
9. [Publicação gratuita no GitHub Pages](#9-publicação-gratuita-no-github-pages)
10. [Sincronização com GitHub Actions](#10-sincronização-com-github-actions)
11. [Como cadastrar um ato oficial](#11-como-cadastrar-um-ato-oficial)
12. [Modelo de dados e validações](#12-modelo-de-dados-e-validações)
13. [Privacidade, segurança e armazenamento](#13-privacidade-segurança-e-armazenamento)
14. [Termo de Uso e resguardo jurídico](#14-termo-de-uso-e-resguardo-jurídico)
15. [Testes e garantia de qualidade](#15-testes-e-garantia-de-qualidade)
16. [Limitações conhecidas](#16-limitações-conhecidas)
17. [Solução de problemas](#17-solução-de-problemas)
18. [Manutenção e governança](#18-manutenção-e-governança)
19. [Autoria, direitos e referências](#19-autoria-direitos-e-referências)

---

## Novidade da versão 2.2 — JEC padrão, UX premium

O novo painel começa no **Juizado Especial Cível**, sem limitar a abrangência nacional do aplicativo. A escolha de procedimento, ato e fonte legal fica em um **painel retrátil independente**, acessado por botão compacto; os campos de data e prazo permanecem visíveis, e o calendário não é esticado pela configuração. O usuário pode alternar para **Processo Civil (CPC)**, selecionar um ato processual com prazo previsto (ou informar duração personalizada), consultar a base legal e registrar opcionalmente a origem da comunicação **sem inferir automaticamente ciência ou publicação**. A memória do cálculo registra o perfil selecionado.

O preparo recursal de 48 horas do JEC não é convertido em dois dias úteis. Os regimes CLT, CPP, contagem em horas e demais hipóteses especiais exigem implementação e validação separadas.

[Documento técnico completo do Raf-Prazo 2.2](docs/RAF_PRAZO_22_ENTREGA.md).

**Biblioteca de atos (2.2.5):** lista direta por categorias, com 13 opções no JEC e 21 no CPC. Prazos legais, condicionados e definidos nos autos são identificados separadamente; os 15 dias de referência em certas hipóteses do JEC só entram na calculadora por escolha expressa após conferência. Preparo recursal de 48 horas não é convertido em dias úteis. [Escopo e fontes](docs/BIBLIOTECA_PRAZOS_223.md).

## Identidade visual institucional 2.3.1

O restante do site recebeu uma paleta profissional de **branco, cinza frio e azul PJe**, com cartões, botões, modais, avisos e menus discretos. O calendário foi atualizado na versão **2.3.2**: dias não úteis em tons claros de cinza, azul-acinzentado e verde discreto, sem rosa/lilás; o vencimento permanece em azul PJe. [Especificação visual](docs/IDENTIDADE_INSTITUCIONAL_231.md).

## UX Premium 2.3 — desktop harmonizado

O novo layout prioriza o vencimento único e os parâmetros à esquerda (44%) e organiza o calendário judicial à direita (56%). A grade mantém 42 células quadradas; em telas largas, a área lateral mostra um resumo contextual da data selecionada, com botão para consultar detalhes e fontes na ficha já existente. O celular preserva o fluxo habitual. **Nenhuma regra jurídica da contagem foi alterada.**

[Plano e critérios da UX 2.3](docs/UX_PREMIUM_23.md).

## 1. Visão geral e objetivos

O **Raf-Prazo** é uma aplicação web estática, escrita em **HTML5, CSS e JavaScript**, voltada à **conferência auxiliar de prazos processuais em dias úteis**. Foi concebida para reduzir tarefas repetitivas, tornar visíveis as datas excluídas da contagem e facilitar a rastreabilidade de fontes.

### Objetivos

- Oferecer uma interface compacta e acessível para contagem **auxiliar** de prazos.
- Evidenciar o **marco inicial**, os dias contados, as exclusões e o vencimento estimado.
- Permitir conferência do calendário por **UF e município**.
- Separar **dados confirmados**, **candidatos pendentes** e **entradas manuais**.
- Apresentar a origem dos registros e o estado de atualização.
- Operar sem backend próprio, cadastro obrigatório ou serviço pago.
- Disponibilizar instruções de uso, aviso legal e Termo de Uso no aplicativo.

### Público potencial

Estudantes, estagiários, profissionais do Direito e pessoas que precisem **conferir** uma contagem. O uso em unidade judiciária ou ambiente institucional depende das regras internas, de eventual autorização e da verificação de segurança exigida pela instituição.

### Não é

Um sistema oficial de gestão processual, uma certidão de prazo, um sistema de acompanhamento de intimações, um serviço de advocacia ou um substituto do PJe/eproc e dos canais oficiais do tribunal.

## 2. Funcionalidades

| Recurso | Comportamento |
|---|---|
| Contagem em dias úteis | Recebe marco inicial e quantidade de **1 a 365 dias úteis**; exclui o marco inicial informado. |
| Atalhos de prazo | Botões de 5, 10, 15 e 30 dias. |
| Calendário | Navegação por mês, ficha de detalhes ao tocar nas datas, escolha expressa de novo marco e destaques para feriados, suspensões e ocorrências informativas. |
| Resultado em destaque | Data de vencimento acima do calendário e painel de resultado. |
| Recesso CPC | Opção para excluir o período de **20/12 a 20/01**; deve ser analisada conforme o caso concreto. |
| Eventos locais | Aplicação suspensa no modo conservador; conferir feriados municipais e estaduais em fontes oficiais. |
| Atos TJRJ | Coleta de documentos oficiais como alertas pendentes; nunca excluem dias da contagem automaticamente. |
| Datas manuais | Cadastro manual temporariamente desativado; registros antigos não entram na contagem. |
| Memória de cálculo | Relação cronológica de dias contados e excluídos, com cópia e impressão/PDF pelo navegador. |
| Histórico | Cálculos salvos com versão da base, parâmetros e memória cronológica congelada (para registros novos); reabertura recalcula na base atual. |
| Exportação | CSV da memória do cálculo e JSON com trilha local de alterações e cálculos salvos. |
| Interface | Modo claro inicial, modo escuro, menu lateral retrátil, apresentação compacta. |
| Atualizações | Central com **Alterações, Fontes e Sincronização**, indicando origem e limites. A seção **Rastreabilidade** registra alterações locais de eventos extraordinários e datas manuais. |
| Termos e tutorial | Modal de aceite inicial, consulta posterior dos termos e tutorial incorporado. |
| Offline | Base inicial de contingência embutida em `index.html`, sujeita a desatualização. |

**Documentação da auditoria local (Etapa 4):** [Registro de alterações e memórias congeladas](docs/AUDITORIA_LOCAL.md). A trilha fica somente no navegador e não é imutável nem certificada.

**Atenção:** os botões e recursos não substituem a confirmação do calendário forense oficial. A presença de um evento na interface não demonstra, por si, sua aplicabilidade a determinado processo.

## 3. Como usar a calculadora

1. Abra o aplicativo e leia o **Termo de Uso**. O aceite é solicitado na primeira utilização ou após mudança da versão dos termos.
2. Informe o **marco inicial** no campo próprio. **Não presuma** que seja a data da publicação, da intimação ou da ciência: identifique previamente o termo inicial juridicamente correto.
3. Informe o prazo em **dias úteis** (entre 1 e 365).
4. Selecione **UF e município**. Quando necessário, use o **código IBGE de 7 dígitos**.
5. Confira as opções **feriados locais**, **recesso CPC** e **atos do TJRJ**. Habilitar uma opção **não garante** que a base contenha todos os eventos.
6. Leia a mensagem de **cobertura parcial**, examine o calendário e abra a **Memória de cálculo**.
7. Consulte **Atualizações → Fontes / Sincronização** e verifique os atos que possam interferir no caso.
8. Confira o vencimento nos **sistemas oficiais**, na legislação, na decisão judicial e nos atos normativos pertinentes.
9. Se desejar, copie a memória, exporte CSV ou imprima. Evite incluir dados sigilosos nas anotações e arquivos gerados.

### Exemplo de teste (não é orientação para processo real)

Com marco informado em **27/10/2026**, prazo de **3 dias úteis** e a suspensão TJRJ cadastrada para **30/10/2026**, a simulação do projeto resulta em **03/11/2026**: 28 e 29/10 são contados; 30/10 é excluído pelo ato cadastrado; 31/10 e 01/11 são fim de semana; 02/11 é feriado nacional (Finados).

**Esse cenário é um teste funcional**, não a certificação de prazo de qualquer processo.

## 4. Regras de contagem e limites jurídicos

### Fundamentos de referência

- **CPC, art. 219:** contagem em dias úteis dos prazos processuais fixados em dias, no âmbito de sua aplicação.
- **CPC, art. 220:** suspensão do curso dos prazos processuais no período legal de 20 de dezembro a 20 de janeiro.
- **CPC, art. 224:** regras de contagem e de início/fim do prazo, observadas as hipóteses legais.
- **Constituição Federal, art. 5º, LXXVIII:** duração razoável do processo.
- **Constituição Federal, art. 37, caput:** eficiência administrativa como **inspiração do projeto**, e não como autorização ou homologação institucional.

**Não aplique mecanicamente essas regras a todo procedimento.** O Juizado Especial Cível, a legislação especial, os atos normativos, o regime de comunicação processual e as determinações judiciais podem impor particularidades. A própria identificação do marco inicial deve ocorrer **antes** do uso da ferramenta.

### Ordem geral das exclusões implementadas

O motor examina as datas posteriores ao marco informado e exclui, conforme as opções selecionadas:

1. Sábados e domingos.
2. Período de suspensão configurado de 20/12 a 20/01.
3. Datas cadastradas manualmente pelo usuário.
4. Eventos confirmados presentes na base de calendário, conforme abrangência e opções marcadas.
5. Feriados nacionais fixos de contingência previstos no motor.

A data de vencimento é o dia em que se completa o número solicitado de dias não excluídos. **Isso é uma regra técnica de cálculo**, não a determinação jurídica do termo inicial nem a verificação de todas as causas de suspensão/prorrogação.

### Situações que exigem conferência específica

Intimações eletrônicas, ciência tácita, publicação no Diário, recesso, feriados forenses, indisponibilidades de sistemas, suspensão em determinada unidade/comarca, prazo em horas ou meses, prazos materiais, decisões com regime próprio e qualquer hipótese regida por lei especial.

## 5. Fontes, abrangência e confiabilidade

| Origem | Utilização | Limite |
|---|---|---|
| **Legislação federal** | Feriados nacionais fixos incorporados ao motor e ao JSON. | Não cobre todos os feriados móveis, locais e forenses. |
| **BrasilAPI** | Consulta automática gratuita pelo script Python para anos configurados. | Registros extras, como Carnaval e Corpus Christi, **não são promovidos automaticamente** a suspensão forense. |
| **TJRJ (fonte oficial)** | Coletor de fontes HTML/PDF do tribunal; arquivo `dados/coleta-tjrj.json` armazena somente documentos pendentes. | Nenhum candidato é promovido a suspensão; cobertura não exaustiva e sem validação jurídica automática. |
| **Fontes estaduais/municipais** | Exibição e uso suspensos nesta fase. | Sem cobertura automática confiável: conferir na legislação e nos atos oficiais. |
| **IBGE** | Consulta de municípios e códigos de identificação. | IBGE não certifica feriados processuais. |
| **Usuário** | Cadastros novos manuais pausados; dados anteriores são apenas histórico local. | Entradas antigas não excluem dias úteis. |

**Ato TJRJ nº 290/2026 (30/10/2026):** foi mantido como referência histórica no Git, mas removido da base ativa por opção conservadora. O mecanismo de coleta poderá localizar a fonte novamente, apenas como candidata informativa. A eventual suspensão deve ser conferida no TJRJ antes de qualquer cálculo.

### Regra de segurança para os eventos publicados

Somente eventos com `status: "confirmed"`, `applies_to_deadlines: true`, data válida, abrangência identificada e fonte HTTPS válida entram na base ativa. Para eventos do TJRJ, o validador também exige URL no domínio `tjrj.jus.br`.

**Importante:** validação de formato e domínio **não comprova automaticamente** autenticidade material, vigência, aplicabilidade, ausência de exceções ou interpretação correta de um ato. A conferência jurídica é humana.

### Exemplo de fonte TJRJ já cadastrada

- **30/10/2026** — suspensão registrada a partir do **Aviso TJRJ nº 290/2026**, com referência à [publicação no portal do tribunal](https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295).
- O cadastro foi feito pontualmente, por curadoria, e **não comprova que outros atos estejam cobertos**.
- O usuário deve conferir a abrangência, as exceções e a situação atual do ato antes de aplicá-lo.

## 6. Atualizações do Calendário Judicial

A central é acessada pelo **sino** no cabeçalho e apresenta três painéis:

**Alterações** — inclusões, modificações e remoções de registros do calendário, quando disponíveis no arquivo de dados. Cada alteração pode indicar data, status, abrangência, origem e se foi aplicada. **Não é um serviço de monitoramento contínuo de publicações do tribunal.**

**Fontes** — identificação das fontes consultadas ou cadastradas, tipo de fonte, situação e limitações. Uma fonte listada **não significa** que todas as suas publicações tenham sido verificadas.

**Sincronização** — informa se a base foi carregada online, do cache local ou da base incorporada; mostra versão, data registrada da última consulta e possíveis falhas. **Última consulta não é sinônimo de última alteração nem de conferência jurídica completa.**

O contador do sino indica registros de alterações ainda não visualizados no navegador, **não** a quantidade de novas publicações oficiais do TJRJ.

## 7. Arquitetura e estrutura do repositório

**Arquitetura:** aplicação estática no navegador + arquivo JSON versionado + geração por scripts Python + atualização agendada pelo GitHub Actions. **Não há servidor de aplicação, banco de dados próprio, autenticação de usuário ou chave de API.**

```text
raf-prazo/
├── .github/
│   └── workflows/
│       └── atualizar.yml        # Rotina diária e execução manual
├── dados/
│   ├── atos-tjrj.json           # Atos TJRJ curados manualmente
│   └── feriados-locais.json     # Feriados estaduais/municipais curados
├── scripts/
│   ├── sync.py                  # Coleta nacional, validação e JSON
│   └── build_html.py            # Gera index.html com fallback embutido
├── src/
│   ├── template.html            # Fonte da interface
│   └── tutorial.html            # Tutorial integrado
├── tests/
│   ├── test_sync.py             # Testes unitários do sincronizador
│   └── browser_check.py         # Verificações opcionais em navegador
├── docs/
│   └── AVISO_LEGAL_E_PRIVACIDADE.md
├── index.html                   # Aplicação publicada / executável
├── feriados.json                # Base gerada de eventos e metadados
├── preview.png                  # Captura desktop
├── preview_mobile.png           # Captura mobile
├── README.md                    # Este documento
├── TUTORIAL_PUBLICACAO.md       # Tutorial detalhado de publicação
├── RELATORIO_TESTES.md          # Escopo dos testes executados
└── .gitignore
```

### Fluxo de atualização

```text
Legislação federal + BrasilAPI ──┐
                                 ├── scripts/sync.py
Atos TJRJ curados ───────────────┤       │
Feriados locais curados ─────────┘       ▼
                                    feriados.json
                                          │
                                scripts/build_html.py
                                          │
                                          ▼
                                   index.html
                                          │
                          GitHub Pages / navegador
                                          │
                 online → cache local → base embutida
```

**Fonte de verdade para desenvolvimento:** `src/template.html`, os arquivos `dados/` e os scripts. **Não edite apenas `index.html`** se quiser preservar alterações: ele é **gerado novamente** pelo processo de build.

## 8. Instalação e execução local

### Uso sem instalação

1. Baixe ou extraia o projeto.
2. Abra `index.html` em um navegador moderno (Chrome/Edge).
3. A base embutida permite um cálculo de contingência mesmo sem rede.
4. O carregamento de `feriados.json` pode falhar ao abrir via `file://`; o sistema deve sinalizar a contingência.

### Servidor local (recomendado)

Requisito: **Python 3.12+** para scripts e testes; o aplicativo em si funciona no navegador.

```bash
cd raf-prazo
python -m http.server 8000
```

Abra `http://localhost:8000`.

### Reconstrução e validação

```bash
python -m unittest discover -s tests -p "test_*.py" -v
python scripts/sync.py --check       # valida sem escrever
python scripts/sync.py --offline     # gera calendário sem acessar API
python scripts/sync.py               # consulta BrasilAPI (precisa de rede)
python scripts/build_html.py         # reconstrói index.html
```

**Cuidado:** `--offline` regrava a base com informações locais e legais fixas; pode alterar metadados de sincronização. Para apenas verificar os dados sem escrita, use `--check`.

Não são necessários Node.js, React, banco de dados ou pacotes Python externos para a geração básica. O teste visual opcional requer Playwright/Chromium no ambiente.

## 9. Publicação gratuita no GitHub Pages

1. Crie um repositório chamado `raf-prazo` em sua conta GitHub. **Não publique dados processuais, tokens ou documentos sigilosos.**
2. Envie **o conteúdo da pasta** `raf-prazo`, preservando `.github/workflows/atualizar.yml`.
3. Em **Settings → Pages**, escolha publicação pela branch `main`, diretório `/(root)`.
4. Aguarde a implantação e abra o endereço exibido pelo GitHub Pages.
5. Teste o modal de termos, o calendário, o aviso de cobertura, a central de fontes e os links externos.
6. Consulte [TUTORIAL_PUBLICACAO.md](TUTORIAL_PUBLICACAO.md) e [GITHUB_SETUP.md](GITHUB_SETUP.md) para instruções detalhadas e script PowerShell.

Exemplo de comandos, após criar o repositório vazio:

```bash
git init
git add .
git commit -m "docs: publicar Raf-Prazo com documentação e avisos legais"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/raf-prazo.git
git push -u origin main
```

**Este pacote não está conectado a um repositório remoto.** A presença de `.github/` e de um workflow não significa que o GitHub Pages ou o agendamento estejam ativos.

## 10. Sincronização com GitHub Actions

Workflow: [`.github/workflows/atualizar.yml`](.github/workflows/atualizar.yml).

**Disparos:** execução manual (`workflow_dispatch`) e cron diário `17 10 * * *` (**10h17 UTC**, aproximadamente **07h17 em Brasília**). Agendamentos do GitHub podem atrasar ou não executar em certas condições; **não há SLA de atualização**.

Etapas:

1. Baixa o repositório e prepara Python 3.12.
2. Executa os testes unitários.
3. Consulta a BrasilAPI para os anos configurados (atualmente **2026, 2027 e 2028**).
4. Incorpora somente os feriados nacionais fixos previstos na configuração legal; outros itens da API ficam como **candidatos pendentes**, sem alterar a contagem.
5. Busca documentos TJRJ em fontes oficiais, armazena candidatos NÃO aplicáveis e rejeita qualquer tentativa de inclusão automática como dia excluído.
6. Atualiza `dados/coleta-tjrj.json`, `feriados.json` e as bases embutidas no HTML e no template.
7. Faz commit/push **apenas se houver alterações**.

O workflow requer permissão de escrita para `contents`; políticas do repositório podem restringir esse acesso. Verifique os logs da execução e o commit produzido.

### Em caso de falha

Se a BrasilAPI não responder, o script registra falha parcial e mantém o conjunto de feriados fixos legais implementados. O navegador pode continuar usando a última base válida em cache ou a incorporada, **sem garantia de atualização de feriados locais ou atos judiciais**.

**Existe coleta automática PARCIAL de fontes HTML/PDF do TJRJ.** O coletor não abrange todo o portal nem confirma automaticamente atos, vigência ou suspensão de prazo. Consulte [COLETA_TJRJ.md](docs/COLETA_TJRJ.md).

## 11. Cadastro manual temporariamente suspenso

Os registros anteriores estão arquivados no histórico do Git, mas **não integram a contagem atual**. O projeto está na fase de coleta automática **informativa**, com validação por documentação oficial e sem promoção automática de eventos. A etapa de aprovação jurídica e eventual publicação de eventos que influenciem prazos só deverá ser reintroduzida após testes e definição de procedimento seguro.

Detalhes: [Coleta de fontes do TJRJ](docs/COLETA_TJRJ.md).

## 12. Modelo de dados e validações

Arquivo gerado: `feriados.json`. Campos principais:

| Campo | Significado |
|---|---|
| `schema` | Versão estrutural do JSON (atual: `1`). |
| `version` | Identificador derivado do conteúdo dos eventos; **não** equivale à versão do aplicativo. |
| `generated_at` | Momento da geração do arquivo. |
| `last_checked_at` | Registro de consulta automatizada quando aplicável; não certifica todas as fontes. |
| `coverage` | Anos nacionais cobertos e natureza da cobertura estadual, municipal e TJRJ. |
| `sync` | Estado da sincronização, anos consultados, falhas e indicação de curadoria manual. |
| `events` | Eventos ativos que podem interferir na contagem. |
| `candidates` | Eventos pendentes, **não aplicados** ao cálculo. |
| `changes` | Inclusões, alterações e remoções registradas na geração. |
| `sources` | Fontes, links, tipos e observações de cobertura. |

### Critérios técnicos do validador

- Data ISO `AAAA-MM-DD` válida; ID padronizado e único.
- Tipo compatível com `scope.kind` (`NACIONAL`, `ESTADUAL`, `MUNICIPAL`, `SUSPENSAO_TJRJ`).
- Eventos ativos exigem `status: "confirmed"` e `applies_to_deadlines: true`.
- URL HTTPS e nome/título de fonte obrigatórios.
- Para municípios, código IBGE com 7 dígitos; para TJRJ, domínio `tjrj.jus.br`.
- Eventos extras da BrasilAPI não se tornam automaticamente dias excluídos.

Essas verificações são **controles de integridade**, não parecer jurídico, prova de autenticidade do ato ou auditoria externa.

## 13. Privacidade, segurança e armazenamento

### Tratamento realizado pelo projeto

- Os cálculos e a memória são processados no **navegador**.
- Preferências, localidade, histórico, datas manuais, base em cache e registro de concordância podem ser mantidos em **`localStorage`**.
- A interface consulta `feriados.json` na origem de hospedagem e pode acessar a **API de localidades do IBGE** para listar municípios.
- O workflow, executado no ambiente do GitHub, consulta a **BrasilAPI** para atualização nacional.
- A hospedagem e os serviços de terceiros podem tratar **dados técnicos de conexão**, como IP, horários e informações de requisição, conforme suas políticas.
- Não há conta própria, servidor de aplicação ou banco de dados do Raf-Prazo nesta versão.

### Limitações da privacidade

`localStorage` **não é cofre criptográfico** nem mecanismo de autenticação. Qualquer pessoa com acesso ao mesmo perfil de navegador poderá encontrar dados ali registrados; extensões e scripts com acesso à origem também representam riscos. **Não insira nomes, CPF, documentos, números de processos sigilosos ou informações protegidas** em anotações e motivos de suspensão.

O aceite do Termo de Uso é guardado localmente e **não constitui prova robusta da identidade do usuário**, nem assinatura eletrônica qualificada. Limpar os dados do navegador pode apagar o aceite, o histórico e as preferências.

Consulte [AVISO_LEGAL_E_PRIVACIDADE.md](docs/AVISO_LEGAL_E_PRIVACIDADE.md) para o aviso jurídico e de privacidade complementar. Antes de disponibilizar publicamente, valide a descrição com os serviços efetivamente utilizados e considere revisão jurídica/LGPD.

### Medidas operacionais recomendadas

- Não adicionar tokens, credenciais ou informações pessoais ao repositório público.
- Exigir revisão humana de alterações em `dados/`.
- Não usar links não oficiais para cadastrar suspensão processual.
- Revisar alterações em workflows e permissões do GitHub.
- Manter backups do repositório e examinar o histórico de commits.
- Testar o funcionamento em navegadores e telas diferentes após cada mudança.

## 14. Termo de Uso e resguardo jurídico

### Natureza e posição do aviso

O aplicativo apresenta o **Termo de Uso e Aviso Legal v1.0 (16/10/2026)** na primeira utilização e o mantém acessível no menu lateral. Há também um aviso resumido próximo ao resultado.

O termo trata de:

1. **Finalidade auxiliar** e inexistência de certificação oficial de prazos.
2. **Independência institucional** em relação ao TJRJ, CNJ, OAB e demais órgãos.
3. **Fundamentação constitucional** (art. 37) como motivação, não chancela.
4. **Conferência obrigatória** de marcos iniciais, calendários, atos, exceções e normas.
5. **Limitações de cobertura e atualização** das fontes.
6. **Deveres do usuário**, inclusive observância das regras de sua instituição.
7. **Ausência de garantia absoluta** de precisão, disponibilidade e atualização.
8. **Responsabilidade conforme a legislação**, sem afastar obrigações irrenunciáveis.
9. **Privacidade e armazenamento local**.
10. **Direitos autorais, versões e aceite**.

### O que o Termo de Uso faz — e o que não faz

**Ajuda a demonstrar transparência**, delimitar a finalidade declarada, alertar sobre riscos e registrar a ciência do usuário no navegador.

**Não impede o ajuizamento de ações, não gera imunidade civil/administrativa/penal, não afasta deveres legais e não substitui diligência técnica**. Uma cláusula de isenção geral de responsabilidade pode ser inválida à luz da legislação aplicável, inclusive, quando pertinente, do Código de Defesa do Consumidor.

A responsabilidade de cada envolvido depende do caso concreto, de eventual defeito do software, da conduta das partes e das normas aplicáveis. Não se deve prometer "proteção total contra processos".

### Uso institucional e identidade visual

- Não utilize brasões, selos ou expressões que possam sugerir homologação ou vínculo oficial sem autorização.
- Não divulgue o software como **ferramenta do TJRJ**, do CNJ ou da OAB.
- Se houver interesse de unidade judiciária em utilizá-lo, observe o procedimento interno de avaliação, autorização e segurança da informação.
- A referência ao art. 37 da CF/88 **não autoriza**, por si, a implantação institucional.

### Revisão recomendada antes da publicação

1. Revisão jurídica do Termo de Uso, dos avisos e da descrição de privacidade.
2. Auditoria técnica das fontes, da contagem e dos cenários de erro.
3. Revisão de acessibilidade, proteção de dados e segurança de hospedagem.
4. Verificação de licenças de terceiros, caso componentes externos sejam adicionados.
5. Documentação da versão, da data e das mudanças introduzidas.

**Aviso jurídico complementar:** [docs/AVISO_LEGAL_E_PRIVACIDADE.md](docs/AVISO_LEGAL_E_PRIVACIDADE.md).

## 15. Testes e garantia de qualidade

### Testes automatizados

```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

A suíte existente verifica, entre outros cenários:

- Validação de ato TJRJ cadastrado.
- Rejeição de datas inválidas, registros pendentes e eventos não aplicáveis.
- Não promoção automática de Carnaval/Corpus Christi.
- Preservação de feriados fixos legais quando a BrasilAPI falha.
- Restrição temporal do feriado nacional de 20/11.
- Estrutura do JSON e presença da base incorporada no HTML.

O arquivo [RELATORIO_TESTES.md](RELATORIO_TESTES.md) descreve os testes de navegador e o cenário de contagem executados na construção. **Esses testes não comprovam exatidão universal nem ausência de falhas.**

### Checklist mínimo para cada publicação

- [ ] Testes unitários passam.
- [ ] JSON validado e fontes HTTPS conferidas.
- [ ] Termos e avisos jurídicos continuam acessíveis.
- [ ] Modo claro/escuro e layout mobile funcionam.
- [ ] A memória explica todas as exclusões.
- [ ] O estado offline/cache/online está visível.
- [ ] Eventos não confirmados não afetam o prazo.
- [ ] Nenhum dado sensível foi incluído no repositório.
- [ ] Alterações de regra ou ato foram revisadas por pessoa competente.

## 16. Limitações conhecidas

1. **Cobertura TJRJ incompleta:** atos não são coletados automaticamente; somente registros curados entram na base.
2. **Cobertura estadual e municipal incompleta:** `dados/feriados-locais.json` inicia sem eventos.
3. **Regras jurídicas especiais:** o cálculo não resolve automaticamente todas as peculiaridades de intimações, contagem, indisponibilidades e procedimentos especiais.
4. **Granularidade de alcance:** o esquema atual não representa adequadamente toda suspensão restrita a vara, órgão ou processo.
5. **Offline:** a base embutida pode estar desatualizada.
6. **Atualização agendada:** GitHub Actions pode atrasar ou falhar; a publicação real ainda depende de configuração do repositório.
7. **Aceite local:** não equivale a autenticação ou prova jurídica forte.
8. **Ausência de certificação:** nenhuma autoridade judiciária homologou a ferramenta.
9. **Privacidade:** a descrição precisa ser revalidada se novos provedores, bibliotecas, analytics ou mecanismos de coleta forem adicionados.
10. **Anos da base:** o sincronizador padrão cobre 2026–2028; para outros anos, atualize e valide a configuração.

## 17. Solução de problemas

| Sintoma | Verificação e providência |
|---|---|
| Termo reaparece | `localStorage` foi limpo, está bloqueado ou houve mudança de versão. Leia e aceite novamente. |
| "Base incorporada" | Falha ou bloqueio na leitura de `feriados.json`; use servidor local/Pages e verifique rede e console. |
| "Cobertura parcial" | Nem todos os feriados/atos locais estão cadastrados. Consulte fontes oficiais e cadastre somente eventos conferidos. |
| Município não aparece | Verifique conexão com o IBGE ou utilize código IBGE correto; confirme a UF. |
| Vencimento diverge | Confira marco inicial, prazo, recesso, opções, eventos manuais, abrangência e atos oficiais. |
| CSV não abre corretamente | Importe como UTF-8 e use `;` como separador. |
| Workflow não executa | Verifique Actions habilitado, branch padrão, permissões e logs do workflow. |
| Workflow falha ao publicar | Verifique permissões de escrita e proteção de branch. |
| Mudança sumiu do HTML | Edite `src/template.html` e rode `scripts/build_html.py`; `index.html` é gerado. |
| Calendário mostra dado antigo | Verifique cache local, versão JSON, histórico de commits e estado de sincronização. |

**Em caso de dúvida sobre prazo concreto, suspenda a confiança no cálculo auxiliar e consulte os sistemas e atos oficiais.**

## 18. Manutenção e governança

### Protocolo sugerido de alteração

1. Abrir uma issue ou registrar internamente a demanda.
2. Identificar o tipo: **correção de cálculo, ato normativo, fonte, interface ou privacidade**.
3. Para atos: arquivar referência oficial, data de consulta, abrangência e justificativa.
4. Alterar **fonte de verdade** (`src/`, `dados/`, `scripts/`) e não somente os arquivos gerados.
5. Executar testes, revisar impacto nos resultados e conferir o JSON final.
6. Registrar commit descritivo; preferir revisão por segunda pessoa em alterações jurídicas.
7. Atualizar documentação e versão do termo se houver alteração relevante.
8. Acompanhar o primeiro workflow após publicar.

### Política de incidentes

Se for identificado erro que possa modificar vencimentos, **não trate a correção como mera alteração visual**: registre a versão afetada, suspenda recomendações de uso quando necessário, corrija, teste cenários de regressão e comunique a limitação de modo visível. Preservar evidências técnicas e registros de versão pode ajudar na apuração e na melhoria do sistema, sem prometer efeito jurídico específico.

### Evoluções possíveis (não implementadas)

Monitoramento oficial de atos com revisão humana, escopo por comarca/vara, importação estruturada de fontes adicionais, testes jurídicos de regressão ampliados e política de privacidade revisada por responsável competente. **Não confundir propostas futuras com funcionalidades disponíveis.**

## 19. Autoria, direitos e referências

**Desenvolvedor:** Rafael Moraes da Silva Passos  
**Projeto:** Raf-Prazo — Calculadora Judicial de Prazos  
**Ano:** 2026  
**Natureza:** iniciativa particular, gratuita e **não oficial**.

**Direitos autorais:** © 2026 Rafael Moraes da Silva Passos. **Todos os direitos reservados.** O acesso gratuito e a visualização de um repositório público **não significam** licença geral de reprodução, modificação, redistribuição ou comercialização. Aplicam-se os direitos e permissões eventualmente previstos nos termos da plataforma e na legislação. Componentes e dados de terceiros permanecem sujeitos às respectivas condições.

### Referências normativas e técnicas

- [Constituição Federal de 1988](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm) — arts. 5º, LXXVIII, e 37, caput.
- [Código de Processo Civil — Lei nº 13.105/2015](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm) — arts. 219, 220 e 224.
- [Lei Geral de Proteção de Dados — Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).
- [Código de Defesa do Consumidor — Lei nº 8.078/1990](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm) — quando aplicável.
- [BrasilAPI](https://brasilapi.com.br/docs) — consulta estruturada complementar.
- [IBGE — API de Localidades](https://servicodados.ibge.gov.br/api/docs/localidades).
- [TJRJ — portal institucional](https://www.tjrj.jus.br/) e atos oficiais individualmente identificados.
- [GitHub Pages](https://docs.github.com/en/pages) e [GitHub Actions](https://docs.github.com/en/actions).

---

> **Aviso final:** o Raf-Prazo é uma **ferramenta de apoio à conferência**, não um serviço oficial nem garantia de tempestividade. A documentação e o Termo de Uso aumentam a transparência, mas **não afastam responsabilidades previstas em lei**. A conferência do caso concreto e das fontes oficiais permanece indispensável.

## Raf-Prazo 2.5 — PWA dependente do site

O Raf-Prazo pode ser instalado no Android a partir do site oficial, pelo Chrome,
como aplicativo em janela própria. Não há aplicação separada nem necessidade de
publicação na Play Store.

- **Requer internet:** todo início de sessão confirma acesso ao próprio site
  por meio de `pwa-health.json`, com `cache: no-store`. A verificação se repete
  periodicamente e ao retornar ao aplicativo.
- **Sem uso offline:** o Service Worker **não armazena** HTML, JavaScript, CSS,
  calendário ou biblioteca em CacheStorage. Requisições sob o escopo do app usam
  a rede e falham se o site estiver indisponível.
- **Bloqueio visível:** diante da ausência de resposta válida do site, a
  calculadora e a biblioteca ficam inacessíveis, com a mensagem
  "Sem conexão com o Raf-Prazo" e um botão "Tentar novamente".
- **Atualizações:** vêm do site GitHub Pages; não há outro backend. A atualização
  depende da rede, da publicação e da política de cache dos intermediários.
- **Preferências locais:** favoritos e histórico já existentes no navegador
  continuam locais e não constituem uma cópia offline executável do sistema.
- **Limite jurídico:** o teste de conectividade confirma acesso ao servidor,
  **não** certifica atualização de feriados, suspensões nem contagens.

Para validar: `node --test tests/*.cjs`,
`python -m unittest discover -s tests -p 'test_*.py'` e
`python tests/browser_pwa_online.py` (com Playwright e Chromium instalados).
