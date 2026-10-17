# Raf-Prazo 2.1 — Ativação livre de datas TJRJ pelo usuário

**Estado:** implementado em 17/10/2026. **Sem login, administrador ou perfis nesta versão.**

## Como funciona

O coletor busca documentos oficiais do TJRJ automaticamente. O extrator registra as datas e seus efeitos possíveis no `dados/coleta-tjrj.json` e em `feriados.json`, com estado pendente. Essa parte **não ativa dias excluídos**.

O módulo `assets/tjrj-markers.js` fornece as ocorrências extraídas com links e hashes SHA-256. O módulo `assets/tjrj-optin.js` oferece, **sem exigir qualquer permissão ou perfil**, o botão **Desconsiderar na contagem (simulação)** em:

1. **Calendário:** tocar no dia sinalizado como indício do TJRJ, examinar o trecho da fonte e usar a opção.
2. **Atualizações:** abrir as atualizações; no painel de indícios extraídos há uma seção **TJRJ — dias não contados por escolha do usuário** com o mesmo comando.

As duas opções compartilham o mesmo estado. A ativação exige confirmar um aviso explícito sobre a ausência de validação jurídica. A desativação é imediata e reverte o cálculo.

## O que pode ser ativado

Somente **datas presentes em indícios extraídos na base efetivamente carregada**, atualmente identificados como possíveis suspensões de prazo ou menções a feriados. Outros alertas (expediente normal, indisponibilidade técnica, prorrogação eventual, ponto facultativo isolado) não viram dia excluído por esse controle. A opção está disponível para qualquer pessoa, mas somente quando a UF escolhida é RJ.

Quando existe vínculo textual explícito com uma comarca diferente da escolhida, a opção não fica habilitada para esse município. Quando a abrangência é desconhecida, o usuário pode optar pela simulação assumindo a responsabilidade de conferir a aplicabilidade.

## Privacidade e persistência

- As opções ficam **somente no localStorage do navegador** (chave `raf-prazo:tjrj-exclusions-user:v1`), separadas por UF/código IBGE municipal e data.
- A fonte URL, o hash SHA-256, o trecho extraído, o efeito e o horário de ativação são registrados para conferência posterior.
- Se o documento deixar de existir na base ativa, ficar desatualizado ou mudar de hash/trecho, **a escolha não será aplicada** enquanto não voltar a corresponder à evidência original.
- O log local registra ativação e desativação; os cálculos salvos a partir desta versão guardam a escolha e as linhas `ESCOLHA_USUARIO_TJRJ`.
- As opções **não são compartilhadas entre usuários**, não são enviadas ao GitHub e não alteram o `feriados.json` ou a lista de eventos oficiais globais.
- Não há controle de perfis, autenticação ou certificação da identidade do usuário nesta fase. Níveis de acesso poderão ser estudados posteriormente.

## Impacto na contagem

Sem opt-in, **a coleta não modifica nenhum prazo**. Com a escolha ativa, a função `reason()` identifica `ESCOLHA_USUARIO_TJRJ` no dia selecionado para o município escolhido, se a evidência da fonte continuar idêntica; a contagem desconsidera essa data e recalcula o vencimento. A tela de resultado e a memória de cálculo exibem o rótulo:

**SIMULAÇÃO DO USUÁRIO — EXCLUSÃO NÃO HOMOLOGADA.**

É uma simulação de calendário, não uma conclusão judicial sobre suspensão ou tempestividade. O termo inicial, eventual suspensão legal e as decisões específicas do tribunal devem ser confirmados diretamente nas fontes oficiais e nos autos.

## Testes

```sh
python -m unittest discover -s tests -p 'test_*.py' -v
node --check assets/tjrj-markers.js
node --check assets/tjrj-optin.js
node --test tests/test_tjrj_optin.cjs
```

O teste interativo em Node simula clique, confirmação, armazenamento, troca de comarca, alteração de hash do documento e desativação. O workflow de atualização executa esses testes antes da coleta e publicação.

**Próxima evolução:** controles administrativos e perfis poderão existir somente se forem necessários; não fazem parte da ativação local atual.
