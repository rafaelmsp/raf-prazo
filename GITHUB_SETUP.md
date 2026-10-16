# Publicação GitHub — Raf-Prazo

**Conta conectada identificada:** `rafaelmsp`  
**Repositório pretendido:** `rafaelmsp/raf-prazo`  
**Branch:** `main`  
**Hospedagem pretendida:** `https://rafaelmsp.github.io/raf-prazo/` (somente depois de publicar e habilitar GitHub Pages).  
**Situação em 16/10/2026:** a conexão de leitura e escrita para repositórios existentes foi confirmada, mas o repositório `raf-prazo` ainda não existe. Não houve publicação remota nem ativação de Pages/Actions.

## Caminho 1 — PowerShell automatizado (recomendado)

1. Instale [Git](https://git-scm.com/downloads) e [GitHub CLI](https://cli.github.com/), se necessário.
2. Extraia o pacote completo e abra PowerShell na pasta do projeto.
3. Execute `gh auth login` e autentique-se no GitHub `rafaelmsp`.
4. Execute `./PUBLICAR_NO_GITHUB.ps1` (ou `powershell -ExecutionPolicy Bypass -File .\PUBLICAR_NO_GITHUB.ps1`, se a política de execução impedir o script).
5. O script solicita confirmação antes de criar um repositório **público**, faz commit e envia para `main` sem forçar histórico remoto.
6. Em **Settings → Pages**, escolha `Deploy from a branch`, `main`, `/(root)` e **Save**.
7. Em **Actions**, abra `Raf-Prazo — Atualizar calendário` e clique **Run workflow**. Acompanhe os logs.

O script não contém senhas nem tokens. O login é realizado pelo próprio GitHub CLI.

## Caminho 2 — Sem GitHub CLI

1. Abra [Criar repositório no GitHub](https://github.com/new?name=raf-prazo).
2. Nome: `raf-prazo`; visibilidade **Public**; **não** inicialize com README, licença ou `.gitignore` (o pacote já contém README e `.gitignore`).
3. Crie o repositório.
4. No terminal, dentro da pasta extraída:

```bash
git init -b main
git config user.name "Rafael Moraes da Silva Passos"
git config user.email "26491941+rafaelmsp@users.noreply.github.com"
git add .
git commit -m "feat: publicar Raf-Prazo v2.0"
git remote add origin https://github.com/rafaelmsp/raf-prazo.git
git push -u origin main
```

Se a pasta já tiver `.git`, não repita `git init`; confira `git remote -v`. Nunca use `git push --force` sem revisão explícita do histórico.

## GitHub Pages e atualização

- A aplicação é o arquivo `index.html` na raiz.
- O GitHub Pages publicará a branch `main`, pasta `/(root)`.
- A rotina `.github/workflows/atualizar.yml` tem execução manual e agenda diária. Ela necessita de `contents: write` e de Actions habilitado.
- **Somente os feriados nacionais estruturados previstos no código são atualizados automaticamente.** Atos TJRJ e feriados locais dependem de conferência humana e cadastro em `dados/`.
- Após cadastrar um ato, execute `python scripts/sync.py --offline`, `python scripts/build_html.py`, rode os testes e envie o commit; ou use o workflow manual para reconstrução.

## Verificação pós-publicação

- [ ] `https://github.com/rafaelmsp/raf-prazo` abre.
- [ ] `https://rafaelmsp.github.io/raf-prazo/` abre (depois de habilitar Pages).
- [ ] Modal de Termo de Uso aparece na primeira visita.
- [ ] Calculadora funciona em desktop e celular.
- [ ] Central **Atualizações do Calendário Judicial** informa fontes e limitações.
- [ ] `feriados.json` carrega na aba Network, sem erros.
- [ ] Workflow executa e registra log/commit quando houver alterações.
- [ ] README e aviso legal estão acessíveis no repositório.

## Direitos e resguardo

A publicação do código como **público** permite sua visualização. O projeto **não** inclui licença aberta de redistribuição; a documentação indica © 2026 Rafael Moraes da Silva Passos, todos os direitos reservados, ressalvados direitos de terceiros e os termos do GitHub. O Termo de Uso não afasta responsabilidade legal. A calculadora é independente e **não oficial**.
