/* Raf-Prazo 2.2: presets, separação da data informativa e memória. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(ROOT,'assets/raf-prazo-22.js'),'utf8');
class Node {
 constructor(id){this.id=id;this.value='';this.textContent='';this.href='';this.hidden=false;this.children=[];this.listeners={};this.className='';}
 replaceChildren(...items){this.children=[...items]}
 append(item){this.children.push(item)}
 addEventListener(type,callback){this.listeners[type]=callback}
 dispatchEvent(event){this.listeners[event.type]?.(event);return true}
 trigger(name){this.listeners[name]?.({target:this})}
 closest(name){return name==='[data-days]'?this:null}
}
const ids=['rafRegime','rafAct','rafOrigin','days','start','rafRegimeCaption','rafRuleSummary','rafActDescription','rafActBasis','rafRuleLink','rafOriginGuidance','rafSourceGuidance','rafContextResult','rafSpecialDeadline','rafCommunicationDate','sourceFoot','quick'];
const nodes=Object.fromEntries(ids.map(id=>[id,new Node(id)]));
nodes.rafRegime.value='jec';nodes.rafOrigin.value='conferido';nodes.start.value='2026-10-19';nodes.days.value='15';
const storage=new Map();const windowStub={addEventListener(){}};
const doc={readyState:'complete',getElementById:id=>nodes[id]||null,createElement:()=>new Node('option')};
class Event{constructor(type){this.type=type}}
vm.runInNewContext(code,{document:doc,window:windowStub,
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},Event,Map,Set,JSON,Object,Array,Date});
const metadata=()=>windowStub.RafPrazoLegal22.getCurrent();
test('JEC é padrão e prazo inicial manual não inventa ato',()=>{
 assert.equal(nodes.rafRegime.value,'jec');
 assert.equal(nodes.rafAct.value,'custom');
 assert.equal(nodes.days.value,'15');
 assert.equal(metadata().regime,'jec');
 assert.equal(metadata().count_mode,'business_days');
 assert.equal(nodes.rafSpecialDeadline.hidden,true);
 assert.ok(nodes.rafRuleSummary.textContent.includes('JEC'));
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
 });
}
