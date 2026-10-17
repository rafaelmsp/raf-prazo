/* Navegação das Atualizações e isolamento da limpeza local. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const page of ['index.html','src/template.html']){
 test('quatro abas responsivas e painéis separados em '+page,()=>{
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const start=html.indexOf('<div class="raf-tabs" role="tablist"');
  const end=html.indexOf('<div class="raf-modal-footer">',start);
  const modal=html.slice(start,end);
  assert.ok(start>=0&&end>start);
  for(const [name,id] of [['Feriados','News'],['TJRJ','Tjrj'],['Fontes','Sources'],['Status','Sync']]){
   assert.ok(modal.includes('id="rafTab'+id+'"'),id);
   assert.ok(modal.includes('id="rafPanel'+id+'"'),id);
  }
  const news=modal.slice(modal.indexOf('id="rafPanelNews" role="tabpanel"'),modal.indexOf('id="rafPanelTjrj" role="tabpanel"'));
  const tjrj=modal.slice(modal.indexOf('id="rafPanelTjrj" role="tabpanel"'),modal.indexOf('id="rafPanelSources" role="tabpanel"'));
  assert.ok(news.includes('id="rafUpdatesList"'));
  assert.ok(news.includes('id="rafHolidayYear"'));
  assert.ok(news.includes('id="rafClearHolidays"'));
  assert.ok(news.includes('id="rafRestoreHolidays"'));
  assert.ok(!news.includes('id="rafCandidatesList"'));
  assert.ok(tjrj.includes('id="rafTjrjNewsMount"'));
  assert.ok(tjrj.includes('id="rafCandidatesList"'));
  assert.ok(tjrj.includes('<details class="raf-technical-details">'));
  assert.ok(html.includes('grid-template-columns:repeat(4,minmax(0,1fr))'));
  assert.ok(html.includes("tjrj:$('rafPanelTjrj')"));
 });
 test('limpar feriados só remove da exibição, não da base '+page,()=>{
  const html=fs.readFileSync(path.join(root,page),'utf8');
  assert.ok(html.includes("const HIDE_KEY='raf-prazo:updates-holidays-hidden:v1'"));
  assert.ok(html.includes('persistHidden(ids);renderChanges();updateBadge()'));
  assert.ok(html.includes("persistHidden(new Set());renderChanges();updateBadge()"));
  assert.ok(html.includes('source.filter(c=>!hidden.has(changeId(c)))'));
  assert.ok(html.includes('Ocultar este item'));
  assert.ok(html.includes('if(scope.kind===\'national\')return e'));
  assert.ok(html.includes('function calculate(keepMonth=false)'));
 });
}
