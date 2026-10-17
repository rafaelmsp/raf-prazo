/* Central de Atualizações — cinco abas, persistência local e invariantes jurídicos. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const page of ['index.html','src/template.html']){
 const html=fs.readFileSync(path.join(root,page),'utf8');
 test('cinco abas com painéis separados e navegação responsiva em '+page,()=>{
  const start=html.indexOf('<div class="raf-tabs" role="tablist"');
  const end=html.indexOf('<div class="raf-modal-footer">',start);
  assert.ok(start>=0&&end>start);
  const modal=html.slice(start,end);
  for(const [label,id] of [['Calendário','News'],['TJRJ','Tjrj'],['Pendências','Pending'],['Fontes','Sources'],['Sincronização','Sync']]){
   assert.ok(modal.includes('id="rafTab'+id+'"'),label);
   assert.ok(modal.includes('id="rafPanel'+id+'"'),label);
   assert.ok(modal.includes('>'+label+'</button>'),label);
  }
  assert.equal((modal.match(/class="raf-tab" role="tab"/g)||[]).length,5);
  const calendar=modal.slice(modal.indexOf('id="rafPanelNews" role="tabpanel"'),modal.indexOf('id="rafPanelTjrj" role="tabpanel"'));
  const tjrj=modal.slice(modal.indexOf('id="rafPanelTjrj" role="tabpanel"'),modal.indexOf('id="rafPanelPending" role="tabpanel"'));
  const pending=modal.slice(modal.indexOf('id="rafPanelPending" role="tabpanel"'),modal.indexOf('id="rafPanelSources" role="tabpanel"'));
  assert.ok(calendar.includes('id="rafUpdatesList"'));
  assert.ok(calendar.includes('id="rafHolidayYear"'));
  assert.ok(calendar.includes('id="rafClearHolidays"'));
  assert.ok(calendar.includes('id="rafRestoreHolidays"'));
  assert.ok(tjrj.includes('id="rafTjrjNewsMount"'));
  assert.ok(tjrj.includes('id="rafTjrjOptInMount"'));
  assert.ok(!tjrj.includes('id="rafCandidatesList"'));
  assert.ok(pending.includes('id="rafCandidatesList"'));
  assert.ok(pending.includes('id="rafClearPending"'));
  assert.ok(pending.includes('id="rafRestorePending"'));
  assert.ok(html.includes('overflow-x:auto;overscroll-behavior-x:contain'));
  assert.ok(html.includes("pending:$('rafPanelPending')"));
 });
 test('limpeza por aba é reversível e não altera a contagem em '+page,()=>{
  assert.ok(html.includes("const HIDE_KEY='raf-prazo:updates-holidays-hidden:v1'"));
  assert.ok(html.includes("const HIDE_PENDING_KEY='raf-prazo:updates-pending-hidden:v1'"));
  assert.ok(html.includes("localStorage.setItem(HIDE_PENDING_KEY"));
  assert.ok(html.includes("localStorage.setItem(HIDE_KEY"));
  assert.ok(html.includes('if(!confirm('));
  assert.ok(html.includes("persistPending(new Set())"));
  assert.ok(html.includes("persistHidden(new Set())"));
  assert.ok(html.includes('source.filter(c=>!hidden.has(changeId(c)))'));
  assert.ok(html.includes("return (window.RafPrazoData?.base?.changes||[]).filter"));
  assert.ok(html.includes("if(scope.kind==='tjrj')continue"));
  assert.ok(html.includes('function calculate(keepMonth=false)'));
  assert.ok(html.includes('data-raf-tab="pending"'));
 });
 test('cada script embutido mantém sintaxe JavaScript válida em '+page,()=>{
  let checked=0;
  for(const match of html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/g)){
   if(/type="application\\/json"/.test(match[1]))continue;
   new vm.Script(match[2],{filename:page+'#script-'+checked});
   checked++;
  }
  assert.ok(checked>=3,'scripts JS embutidos devem ser testados');
 });
}
test('index gerado mantém a mesma interface do template',()=>{
 const a=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const b=fs.readFileSync(path.join(root,'src/template.html'),'utf8');
 const beforeJSON=x=>x.replace(/(<script id="rafEmbeddedBase" type="application\\/json">)[\\s\\S]*?(<\\/script>)/,'$1[BASE]$2');
 assert.equal(beforeJSON(a),beforeJSON(b));
});
