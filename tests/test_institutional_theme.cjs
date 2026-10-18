/* Paleta sóbria Raf-Prazo 2.3.2: branco, cinza frio e azul PJe. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'src/template.html'),'utf8');
const generated=fs.readFileSync(path.join(root,'index.html'),'utf8');
const markerOffice='/* Raf-Prazo 2.3.1 — identidade institucional.';
const markerCalendar='/* Raf-Prazo 2.3.2 — calendário sóbrio:';
const first=html.indexOf(markerOffice),second=html.indexOf(markerCalendar);
assert.ok(first>=0&&second>first);
const cssOffice=html.slice(first,second);
const cssCalendar=html.slice(second,html.indexOf('</style>',second));

test('identidade institucional é reproduzível e azul PJe nas duas páginas',()=>{
 assert.equal(generated,html);
 for(const token of [
  '--office-blue:#1261a0','--office-panel:#ffffff',
  '--office-subtle:#f7f9fb','--office-blue-tint:#eff5fa'
 ]) assert.ok(cssOffice.includes(token),'Token institucional ausente: '+token);
 assert.ok(cssOffice.includes(':root[data-theme="dark"]'));
});
test('identidade do site não sobrescreve a camada semântica do calendário',()=>{
 assert.ok(cssOffice.includes('.workspace>.panel:not(.raf-22-calendar)'));
 for(const selector of [
  '.day.blocked','.day.due','.calendar .day','.legend .marker','.raf-23-calendar-main #calendar'
 ])assert.ok(!cssOffice.includes(selector),'Os estados do calendário têm camada independente: '+selector);
 assert.ok(cssCalendar.includes('.calendar .day.blocked.raf-weekend'));
 assert.ok(cssCalendar.includes('.calendar .day.due,.calendar .day.due.blocked'));
});
test('dias e legenda: cores neutras diferentes, sem rosa/lilás e com prioridade ao vencimento',()=>{
 const light=['--raf-holiday-bg:#eef3f7','--raf-susp-bg:#e8f1f7',
  '--raf-recess-bg:#f3f5f7','--raf-manual-bg:#edf5f2',
  '--weekend:#f0f2f5','--calendar-pje-blue:#1261a0'];
 for(const token of light)assert.ok(html.includes(token),'Esperada paleta clara sóbria: '+token);
 assert.doesNotMatch(html, /--raf-(?:holiday|susp|recess|manual)-bg:\s*#(?:f9e0e2|eee3fc)\b/i,
  'Não reintroduzir cores rosa ou lilás antigas');
 for(const type of ['raf-holiday','raf-suspension','raf-recess','raf-manual','raf-weekend']){
  assert.ok(cssCalendar.includes('.legend .marker.'+type),'Legenda deve refletir o dia '+type);
 }
 assert.ok(cssCalendar.includes('color:#fff;box-shadow:none'),
  'Vencimento azul deve preservar contraste legível');
 assert.ok(cssCalendar.includes('.calendar .day.origin{outline:2px solid var(--calendar-pje-blue)'));
});
test('modo escuro mantém classes jurídicas legíveis sem cor decorativa',()=>{
 const expected=[
  '--raf-holiday-bg:#25384a','--raf-susp-bg:#203e57',
  '--raf-recess-bg:#2b3846','--raf-manual-bg:#253e3b',
  '--calendar-pje-blue:#2b709f'
 ];
 for(const token of expected)assert.ok(html.includes(token),'Token escuro ausente: '+token);
 assert.ok(cssCalendar.includes(':root[data-theme="dark"] .calendar .day.blocked.raf-weekend'));
});
test('cartões, menus, drawer, biblioteca e atualizações usam tons neutros',()=>{
 for(const selector of [
  '.raf-22-results .result-block{background:var(--office-blue-tint)',
  '.raf-22-parameters .raf-22-profile-trigger{background:var(--office-subtle)',
  '.sidebar .nav-link.active{background:var(--office-blue)',
  '.raf-22-drawer-content .raf-library-item{background:var(--office-panel)',
  '.raf-update-modal .raf-tab[aria-selected="true"]{color:var(--office-blue-strong)',
  '.raf-23-day-focus{background:var(--office-panel)'
 ])assert.ok(cssOffice.includes(selector),'Estilo neutro ausente: '+selector);
});
test('a identidade não utiliza degradês decorativos',()=>{
 assert.doesNotMatch(cssOffice,/linear-gradient|radial-gradient/);
 assert.ok(cssOffice.includes('border-left:3px solid #8192a5'));
});
