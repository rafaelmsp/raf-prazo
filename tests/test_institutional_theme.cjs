/* Identidade institucional: branco, cinza frio e azul PJe sem afetar o calendário. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'src/template.html'),'utf8');
const generated=fs.readFileSync(path.join(root,'index.html'),'utf8');
const marker='/* Raf-Prazo 2.3.1 — identidade institucional.';
const css=html.slice(html.indexOf(marker),html.indexOf('</style>',html.indexOf(marker)));
test('layout institucional é reproduzível nas duas páginas',()=>{
 assert.equal(generated,html);
 assert.ok(css.includes('--office-blue:#1261a0'));
 assert.ok(css.includes('--office-panel:#ffffff'));
 assert.ok(css.includes('--office-subtle:#f7f9fb'));
 assert.ok(css.includes('--office-blue-tint:#eff5fa'));
 assert.ok(css.includes(':root[data-theme="dark"]'));
});
test('paleta atua sobre o site, não sobre células e legendas do calendário',()=>{
 assert.ok(css.includes('.workspace>.panel:not(.raf-22-calendar)'));
 for(const selector of ['.day.blocked','.day.due','.calendar .day','.legend .marker','.raf-23-calendar-main #calendar']){
   assert.ok(!css.includes(selector),'Evitar alterar o calendário: '+selector);
 }
 assert.ok(html.includes('--raf-holiday-bg:#f9e0e2'));
 assert.ok(html.includes('--raf-recess-bg:#eee3fc'));
 assert.ok(html.includes('.calendar .day.due{background:var(--accent)'));
});
test('cartões, menus, drawer, biblioteca e atualizações usam tons neutros',()=>{
 for(const selector of [
  '.raf-22-results .result-block{background:var(--office-blue-tint)',
  '.raf-22-parameters .raf-22-profile-trigger{background:var(--office-subtle)',
  '.sidebar .nav-link.active{background:var(--office-blue)',
  '.raf-22-drawer-content .raf-library-item{background:var(--office-panel)',
  '.raf-update-modal .raf-tab[aria-selected="true"]{color:var(--office-blue-strong)',
  '.raf-23-day-focus{background:var(--office-panel)'
 ])assert.ok(css.includes(selector),'Estilo ausente: '+selector);
});
test('a camada institucional não usa degradês decorativos',()=>{
 assert.doesNotMatch(css,/linear-gradient|radial-gradient/);
 assert.ok(css.includes('border-left:3px solid #8192a5'));
});

test('somente barra superior Raf-Prazo em azul institucional PJe',()=>{
 assert.ok(html.includes('.header{background:#1261a0'));
 assert.ok(html.includes('.header .brand strong,.header .brand small{color:#fff}'));
 assert.ok(html.includes('--raf-holiday-bg:#f9e0e2'));
 assert.ok(html.includes('--raf-recess-bg:#eee3fc'));
 assert.ok(!html.includes('/* Raf-Prazo 2.3.2 — calendário sóbrio'));
});
