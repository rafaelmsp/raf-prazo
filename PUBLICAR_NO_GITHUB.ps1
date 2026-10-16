# Raf-Prazo - Publicacao assistida (PowerShell 7 / Windows PowerShell 5.1)
# Requer Git e GitHub CLI (gh) autenticado. Nunca informe tokens neste script.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$repo = 'rafaelmsp/raf-prazo'
$remoteUrl = "https://github.com/$repo.git"
Write-Host 'Raf-Prazo | Publicacao GitHub' -ForegroundColor Cyan
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Instale o Git: https://git-scm.com/downloads' }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Instale GitHub CLI: https://cli.github.com/ e execute gh auth login' }
& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'Faca login com gh auth login e execute novamente.' }
$existing = & gh repo view $repo --json nameWithOwner --jq '.nameWithOwner' 2>$null
if ($LASTEXITCODE -eq 0 -and $existing) {
  Write-Host "Repositorio existente: $existing" -ForegroundColor Yellow
  $confirmed = Read-Host 'O repositorio ja existe. Continuar com envio sem sobrescrever historico remoto? (S/N)'
  if ($confirmed -notmatch '^[sS]$') { exit 0 }
} else {
  Write-Host 'O repositorio sera PUBLICO para usar GitHub Pages.' -ForegroundColor Yellow
  $confirmed = Read-Host "Criar $repo como PUBLICO? (S/N)"
  if ($confirmed -notmatch '^[sS]$') { exit 0 }
  & gh repo create $repo --public --description 'Raf-Prazo: calculadora auxiliar de prazos judiciais (projeto independente e nao oficial)' --disable-wiki
  if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel criar o repositorio. Verifique as permissoes.' }
}
if (-not (Test-Path '.git')) { & git init -b main }
& git branch -M main
$origin = & git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) { & git remote add origin $remoteUrl }
elseif ($origin -ne $remoteUrl) { throw "Remote origin diferente do esperado: $origin. Ajuste manualmente." }
& git add -A
& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  & git commit -m 'feat: publicar Raf-Prazo com calculadora, calendario e documentacao juridica'
  if ($LASTEXITCODE -ne 0) { throw 'Commit nao criado. Configure git user.name e git user.email.' }
}
& git push -u origin main
if ($LASTEXITCODE -ne 0) { throw 'Push falhou. Verifique se o remoto possui historico divergente e resolva sem force push.' }
Write-Host "Codigo publicado: https://github.com/$repo" -ForegroundColor Green
Write-Host 'Para publicar o site: Settings > Pages > Deploy from a branch > main > /(root) > Save.'
Write-Host 'Depois: Actions > Raf-Prazo - Atualizar calendario > Run workflow.'
Write-Host 'Nao afirme que os atos TJRJ sao coletados automaticamente; exigem curadoria humana.'
