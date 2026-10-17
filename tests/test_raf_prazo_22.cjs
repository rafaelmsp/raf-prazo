/* Raf-Prazo 2.2: presets, separação da data informativa e memória. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(ROOT,'assets/raf-prazo-22.js'),'utf8');
class Node {
 constructor(id){this.id=id;this.value='';this.textContent='';this.href='';this.hidden=false;this.children=[];this.listeners={};this.className='';this.open=false;this.focused=false;}
 replaceChildren(...items){this.children=[...items]}
 append(item){this.children.push(item)}
 addEventListener(type,callback){this.listeners[type]=callback}
 dispatchEvent(event){this.listeners[event.type]?.(event);return true}
 trigger(name){this.listeners[name]?.({target:this})}
 showModal(){this.open=true}
 close(){this.open=false;this.listeners.close?.()}
 focus(){this.focused=true}
 closest(name){return name==='[data-days]'?this:null}
}
const ids=['rafRegime','rafAct','rafOrigin','days','start','rafRegimeCaption','rafRuleSummary','rafActDescription','rafActBasis','rafRuleLink','rafOriginGuidance','rafSourceGuidance','rafContextResult','rafSpecialDeadline','rafCommunicationDate','sourceFoot','quick','rafProfileOpen','rafProfileDialog','rafProfileShort','rafProfileSub'];
const nodes=Object.fromEntries(ids.map(id=>[id,new Node(id)]));
nodes.rafRegime.value='jec';nodes.rafOrigin.value='conferido';nodes.start.value='2026-10-19';nodes.days.value='15';
const storage=new Map();const windowStub={addEventListener(){}};
const doc={readyState:'complete',getElementById:id=>nodes[id]||null,createElement:()=>new Node('option')};
class Event{constructor(type){this.type=type}}
vm.runInNewContext(code,{document:doc,window:windowStub,
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},Event,Map,Set,JSON,Object,Array,Date});
const metadata=()=>windowStub.RafPrazoLegal22.getCurrent();
test('resultado acima dos parâmetros e calendário sem expansão artificial',()=>{
 for(const file of ['index.html','src/template.html']){
  const html=fs.readFileSync(path.join(ROOT,file),'utf8');
  const start=html.indexOf('<div class="workspace">');
  const result=html.indexOf('<section class="panel raf-22-results"',start);
  const params=html.indexOf('<section class="panel raf-22-parameters"',start);
  const calendar=html.indexOf('<section class="panel raf-22-calendar"',start);
  const verification=html.indexOf('<section class="panel raf-22-verification"',start);
  assert.ok(start>=0&&start<result&&result<params&&params<calendar&&calendar<verification);
  assert.ok(html.includes('id="rafCalendarSettings"'));
  assert.ok(html.includes('raf-22-primary-date'));
  assert.ok(html.includes('.raf-22-calendar #calendar{'));
  assert.ok(html.includes('aspect-ratio:7/6'));
  assert.ok(html.includes('aspect-ratio:1/1'));
  assert.ok(html.includes('height:54px!important'));
  assert.ok(html.includes('id="rafProfileDialog"'));
  assert.ok(html.includes('id="rafTjrjNewsMount"'));
  assert.ok(html.includes("legal_profile:window.RafPrazo22Current||null"));
 }
});
test('JEC é padrão e prazo inicial manual não inventa ato',()=>{
 assert.equal(nodes.rafRegime.value,'jec');
 assert.equal(nodes.rafAct.value,'custom');
 assert.equal(nodes.days.value,'15');
 assert.equal(metadata().regime,'jec');
 assert.equal(metadata().count_mode,'business_days');
 assert.equal(nodes.rafSpecialDeadline.hidden,true);
 assert.ok(nodes.rafRuleSummary.textContent.includes('JEC'));
 assert.ok(nodes.rafProfileShort.textContent.includes('JEC'));
 nodes.rafProfileOpen.trigger('click');
 assert.equal(nodes.rafProfileDialog.open,true);
 nodes.rafProfileDialog.close();
 assert.equal(nodes.rafProfileDialog.open,false);
});
test('recurso do JEC define exatamente 10 dias e lei',()=>{
 nodes.rafAct.value='jec_recurso';nodes.rafAct.trigger('change');
 assert.equal(Number(nodes.days.value),10);
 assert.equal(nodes.rafSpecialDeadline.hidden,false);
 assert.equal(metadata().basis,'Lei 9.099/95, arts. 12-A e 42, caput');
 assert.ok(metadata().source.startsWith('https://www.planalto.gov.br/'));
});
test('embargos de declaração JEC definem 5 dias',()=>{
 nodes.rafAct.value='jec_embargos';nodes.rafAct.trigger('change');
 assert.equal(Number(nodes.days.value),5);
 assert.equal(nodes.rafSpecialDeadline.hidden,true);
 assert.equal(metadata().preset,'jec_embargos');
 assert.ok(nodes.rafProfileShort.textContent.includes('Embargos'));
});
test('modificação manual rompe preset e preserva número informado',()=>{
 nodes.days.value='9';nodes.days.trigger('input');
 assert.equal(nodes.rafAct.value,'custom');
 assert.equal(metadata().days,9);
});
test('CPC tem catálogo separado e não herda um ato JEC',()=>{
 nodes.rafRegime.value='cpc';nodes.rafRegime.trigger('change');
 assert.equal(nodes.rafAct.value,'custom');
 assert.equal(metadata().regime,'cpc');
 assert.ok(nodes.rafRuleSummary.textContent.includes('CPC'));
 assert.equal(nodes.rafSpecialDeadline.hidden,true);
 nodes.rafAct.value='cpc_apelacao';nodes.rafAct.trigger('change');
 assert.equal(Number(nodes.days.value),15);
 assert.equal(metadata().basis,'CPC, arts. 1.003, § 5º, e 1.009');
});
test('data de registro e origem não calculam ciência automaticamente',()=>{
 const before=nodes.start.value;
 nodes.rafOrigin.value='pessoal';nodes.rafOrigin.trigger('change');
 nodes.rafCommunicationDate.value='2026-10-18';nodes.rafCommunicationDate.trigger('change');
 assert.equal(nodes.start.value,before);
 assert.equal(metadata().communication_date,'2026-10-18');
 assert.ok(nodes.rafOriginGuidance.textContent.includes('não é necessariamente'));
 assert.ok(nodes.rafSourceGuidance.href.includes('cnj.jus.br'));
});
test('preferências persistem somente em chave isolada',()=>{
 const stored=JSON.parse(storage.get('raf-prazo:juridical-profile:v1'));
 assert.deepEqual(Object.keys(stored).sort(),['origin','preset','regime','version']);
 assert.equal(stored.regime,'cpc');assert.equal(stored.origin,'pessoal');
 assert.equal(storage.has('raf-prazo:tjrj-exclusions-user:v1'),false);
 assert.equal(storage.has('raf-prazo:exclusoes-individuais:v1'),false);
});
for(const target of ['src/template.html','index.html']){
 const html=fs.readFileSync(path.join(ROOT,target),'utf8');
 test('integração do catálogo e memória em '+target,()=>{
  for(const id of ['rafRegime','rafAct','rafRuleSummary','rafOrigin','rafCommunicationDate','rafContextResult'])
   assert.ok(html.includes('id="'+id+'"'),'Faltou '+id);
  assert.ok(html.includes('src="assets/raf-prazo-22.js"'));
  assert.ok(html.includes("legal_profile:window.RafPrazo22Current||null"));
  assert.ok(html.includes('id="rafEmbeddedBase"'));
  assert.ok(html.includes("if(scope.kind==='tjrj')continue"));
  assert.ok(html.includes('id="rafTabPending"'));
  const left=html.slice(html.indexOf('<section class="panel raf-22-parameters"'),html.indexOf('<section class="panel raf-22-calendar"'));
  assert.ok(left.includes('id="rafProfileOpen"'));
  assert.ok(!left.includes('id="rafRegime"'),'Os seletores não devem esticar o painel de parâmetros');
  assert.ok(!left.includes('id="rafRuleBox"'),'O quadro legal não deve ficar no painel esquerdo');
  const drawer=html.slice(html.indexOf('<dialog id="rafProfileDialog"'),html.indexOf('<dialog id="rafDayDialog"'));
  for(const id of ['rafRegime','rafAct','rafRuleBox','rafCommunicationDetails','rafProfileDone'])assert.ok(drawer.includes('id="'+id+'"'),'Drawer deve conter '+id);
  assert.ok(!html.includes('min-height:750px'),'Remover altura artificial de 750px');
  assert.ok(html.includes('.raf-22-drawer::backdrop'));
  assert.ok(html.includes('raf-22-drawer-footer'));
  
 });
}
