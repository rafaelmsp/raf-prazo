/* Contratos da identidade jurídica vigente: não reintroduzir a paleta intermediária 2.3.2. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'src/template.html'),'utf8');
const generated=fs.readFileSync(path.join(root,'index.html'),'utf8');
const homeCss=fs.readFileSync(path.join(root,'assets/prazos-home.css'),'utf8');
const libraryCss=fs.readFileSync(path.join(root,'assets/prazos-library.css'),'utf8');

test('template e index publicados têm a mesma interface, sem CSS duplicado',()=>{
 assert.equal(generated,html,'build deve manter index.html igual ao template');
 assert.equal((html.match(/assets\/prazos-home\.css/g)||[]).length,1);
 assert.equal((html.match(/assets\/prazos-home\.js/g)||[]).length,1);
});

test('identidade institucional mantém cabeçalho azul PJe, claro e escuro',()=>{
 for(const token of [
  '--office-blue:#1261a0',
  '--office-panel:#ffffff',
  '--office-subtle:#f7f9fb',
  '--office-blue-tint:#eff5fa',
  '--pje-header:#1261a0',
  '.header{background:var(--pje-header)'
 ])assert.ok(html.includes(token),'Identidade visual ausente: '+token);
 assert.ok(html.includes(':root[data-theme="dark"]'),'Modo escuro obrigatório');
 assert.ok(html.includes('.workspace>.panel:not(.raf-22-calendar)'),
  'Separar superfície do aplicativo e calendário');
});

test('calendário preserva semântica de fim de semana, feriado e vencimento',()=>{
 for(const token of [
  '--raf-weekend-bg:#b85a5f','--raf-weekend-bg:#79383e',
  '--raf-holiday-bg:#f9e0e2',
  '.calendar .day.blocked.raf-weekend:not(.due)',
  '.calendar .day.blocked.raf-holiday:not(.due)',
  "block.type==='FINAL DE SEMANA'?'raf-weekend'",
  '.day.due{background:var(--accent)'
 ])assert.ok(html.includes(token),'Semântica visual alterada: '+token);
 assert.ok(!homeCss.includes('raf-weekend-bg'),'UX mobile não deve alterar cores do calendário');
 assert.ok(!libraryCss.includes('raf-weekend-bg'),'Biblioteca não deve alterar cores do calendário');
});

test('Raf-Prazo 2.4 prioriza parâmetros móveis sem interferir na grade',()=>{
 assert.match(homeCss, /@media\s*\(max-width:\s*650px\)/);
 assert.match(homeCss, /\.workspace\s*>\s*\.raf-22-parameters\s*\{\s*order:\s*1/);
 assert.match(homeCss, /\.workspace\s*>\s*\.raf-22-results\s*\{\s*order:\s*2/);
 assert.match(homeCss, /\.workspace\s*>\s*\.raf-22-calendar\s*\{\s*order:\s*3/);
 assert.doesNotMatch(homeCss,/\.day\.(?:blocked|due)|\.calendar\s+\.day/);
});

test('biblioteca mantém azul institucional e contraste acessível no modo escuro',()=>{
 assert.match(libraryCss,/--pje:\s*#1261A0/i);
 assert.match(libraryCss,/:root\[data-theme="dark"\]/);
 assert.match(libraryCss,/#9bd0ff/i);
 assert.match(libraryCss,/\.side-cats.*\.side-preview\{/);
 assert.match(libraryCss,/@media\(max-width:760px\)/);
 assert.match(libraryCss, /:focus-visible/);
});
