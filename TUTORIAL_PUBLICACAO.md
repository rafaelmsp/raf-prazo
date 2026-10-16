# Tutorial — Raf-Prazo no GitHub Pages

## 1. Testar no computador

Extraia o ZIP, abra a pasta `raf-prazo` e dê dois cliques em `index.html`. Na primeira abertura, leia o Termo de Uso e escolha **Li e concordo**. Se não concordar, o programa não libera a calculadora. Teste o menu retrátil, os temas, o calendário e o sino de atualizações. A base incorporada funciona mesmo sem rede; a consulta externa poderá não funcionar por `file://`.

## 2. Conferir a data TJRJ

Defina o marco inicial em **27/10/2026** e o prazo em **3 dias úteis**, mantendo marcadas as opções de recesso e atos do TJRJ. O resultado auxiliar deve ser **03/11/2026**: 28/10 e 29/10 são contados; 30/10 tem suspensão confirmada; 31/10 e 01/11 são fim de semana; 02/11 é Finados. Esse exemplo não substitui a conferência do processo real.

## 3. Criar o repositório

1. Acesse [github.com/new](https://github.com/new).
2. Nome: **raf-prazo**. Escolha **Public** para GitHub Pages gratuito em repositórios pessoais (conforme disponibilidade do plano).
3. Crie o repositório vazio. **Não envie informações sigilosas, documentos processuais ou dados de terceiros.**
4. Na página do repositório, clique em **Add file → Upload files**. Envie **o conteúdo da pasta** (inclusive `.github/workflows/atualizar.yml`). A interface web pode não preservar pastas ocultas em todos os fluxos; se necessário, use Git no terminal conforme o passo alternativo abaixo.
5. Confirme o commit na branch `main`.

### Alternativa confiável: enviar pelo Git

No terminal aberto dentro da pasta `raf-prazo`:

```bash
git init
git add .
git commit -m "feat: publicar Raf-Prazo"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/raf-prazo.git
git push -u origin main
```

Substitua `SEU-USUARIO` pelo seu usuário real do GitHub. O GitHub poderá solicitar autenticação pelo navegador.

## 4. Ativar a página pública

No repositório, abra **Settings → Pages → Build and deployment**. Em **Source**, escolha **Deploy from a branch**; em **Branch**, escolha **main** e a pasta **/(root)**. Salve. Após o processamento, abra o endereço indicado pelo GitHub Pages.

## 5. Ativar atualização gratuita

Abra **Actions**, habilite os workflows se o GitHub solicitar, escolha **Raf-Prazo — Atualizar calendário** e clique em **Run workflow**. O workflow usa Python, consulta a BrasilAPI, valida os eventos e atualiza `feriados.json` e `index.html` se houver mudanças. O agendamento é diário, aproximadamente 07h17 de Brasília, sem garantia de execução no minuto exato.

Se ocorrer erro de permissão no `git push`, em **Settings → Actions → General → Workflow permissions**, escolha **Read and write permissions**, se a configuração estiver disponível e você tiver autorização para alterá-la. Alternativamente, ajuste as permissões do repositório conforme a política aplicável.

## 6. Verificar fontes e atualizações

No Raf-Prazo publicado, clique no sino **Atualizações**:

- **Alterações:** datas confirmadas, inclusão/remoção e links de origem.
- **Fontes:** BrasilAPI, legislação federal, IBGE e TJRJ, com a situação da cobertura.
- **Sincronização:** versão, última consulta registrada, origem carregada e limites.

Um evento adicional da BrasilAPI que não seja feriado nacional legalmente confirmado ficará como **pendente** e **não afetará o cálculo**. Atos TJRJ e feriados locais não são automaticamente varridos: exigem verificação humana e inclusão nos arquivos `dados/`.

## 7. Atualizar um ato do TJRJ

Edite `dados/atos-tjrj.json` com base na publicação oficial, preservando o formato e a URL. Após salvar, execute o workflow manualmente. Nunca use como fonte exclusiva um comentário, uma notícia de terceiros ou uma imagem sem identificação de ato e abrangência.

## 8. Testes antes de divulgar

Confirme a visualização em desktop e celular, o funcionamento dos botões, o aviso de cobertura parcial, o registro local dos termos, os links oficiais e a atualização do calendário. Solicite revisão jurídica do Termo de Uso e da política de privacidade antes da divulgação ampla. **Não utilize o resultado como única base para a prática de atos processuais.**
