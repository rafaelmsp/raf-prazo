/* Testa o opt-in sem navegador real, usando a base publicada e DOM mínimo. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'feriados.json'),'utf8'));
const doc=base.candidates.find(c=>c.type==='CANDIDATO_TJRJ'&&c.stale!==true&&
  c.structured?.occurrences?.some(x=>['possible_deadline_suspension','holiday_mention'].includes(x.effect_hint)));
assert.ok(doc,'É necessário pelo menos um indício pendente da coleta real');
const candidate=doc.structured.occurrences.find(x=>['possible_deadline_suspension','holiday_mention'].includes(x.effect_hint));
let selectedSignal={date:candidate.date,effect:candidate.effect_hint,excerpt:candidate.evidence_excerpt,
 scope:candidate.scope_hint||{},references:[{url:doc.source_url,sha256:doc.source_hash_sha256}]};
class El {
 constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.classList={toggle() {}};this.value='';this.textContent='';}
 append(...nodes){nodes.forEach(x=>{if(x instanceof El){x.parent=this;}this.children.push(x)});}
 prepend(...nodes){nodes.reverse().forEach(x=>{if(x instanceof El){x.parent=this;}this.children.unshift(x)})}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}
 querySelector(q){const id=q.startsWith('#')?q.slice(1):null;const walk=x=>{for(const c of x.children)if(c instanceof El){if(id&&c.id===id)return c;const found=walk(c);if(found)return found;}return null};return walk(this)}
 querySelectorAll(){return []}
 addEventListener(name,cb){this.listeners[name]=cb}
 setAttribute(name,value){this[name]=value}
 click(){this.listeners.click?.({target:this,preventDefault(){}})}
}
const elements={uf:new El('select'),city:new El('select'),calendar:new El('div'),rafTjrjOptInMount:new El('div'),rafNewsOpen:new El('button')};
elements.uf.value='RJ';elements.city.value='3301702';elements.city.selectedOptions=[{textContent:'Duque de Caxias'}];
const storage=new Map(),audits=[];let confirmCount=0,recalculations=0;
const windowStub={
 RafPrazoData:{base},
 RafPrazoTjrjEvidence:{signals:date=>date===candidate.date?[selectedSignal]:[],list:()=>[{date:candidate.date,count:1,sources:[1]}]},
 RafPrazoRecalculate:()=>{recalculations++},
 RafPrazoRefreshDay:()=>{},
 RafPrazoTjrjAudit:(...args)=>audits.push(args),
 addEventListener:()=>{}
};
const ctx={window:windowStub,document:{getElementById:id=>elements[id]||null,createElement:tag=>new El(tag),head:new El('head')},
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
 confirm:()=>{confirmCount++;return true},alert:()=>{},queueMicrotask:fn=>fn(),
 Date,JSON,Array,Object,Set,Map,Number,String,RegExp};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/tjrj-optin.js'),'utf8'),ctx);
function findButton(node){if(node.tag==='button'&&node.className?.includes('raf-optin-button'))return node;for(const n of node.children){if(n instanceof El){const found=findButton(n);if(found)return found}}return null}
test('ativa, registra, persiste e desativa sem login',()=>{
 const control=windowStub.RafPrazoTjrjSelection;
 assert.equal(control.resolve(candidate.date,{uf:'RJ',city:'3301702',cityName:'Duque de Caxias'}),null);
 const button=findButton(elements.rafTjrjOptInMount);assert.ok(button);
 button.click();
 assert.ok(control.resolve(candidate.date,{uf:'RJ',city:'3301702',cityName:'Duque de Caxias'}));
 assert.equal(confirmCount,1);assert.equal(audits[0][0],'ATIVACAO_LOCAL');
 assert.ok(recalculations>=2);
 const currentCity=elements.city.value;
 elements.city.value='3304557';elements.city.selectedOptions=[{textContent:'Rio de Janeiro'}];
 assert.equal(control.resolve(candidate.date,{uf:'RJ',city:'3304557',cityName:'Rio de Janeiro'}),null);
 elements.city.value=currentCity;elements.city.selectedOptions=[{textContent:'Duque de Caxias'}];
 const old=selectedSignal;
 selectedSignal={...old,references:[{...old.references[0],sha256:'f'.repeat(64)}]};
 assert.equal(control.resolve(candidate.date,{uf:'RJ',city:'3301702',cityName:'Duque de Caxias'}),null,'Fonte alterada deve invalidar escolha anterior');
 selectedSignal=old;
 assert.ok(control.resolve(candidate.date,{uf:'RJ',city:'3301702',cityName:'Duque de Caxias'}));
 const again=findButton(elements.rafTjrjOptInMount);assert.ok(again);again.click();
 assert.equal(control.resolve(candidate.date,{uf:'RJ',city:'3301702',cityName:'Duque de Caxias'}),null);
 assert.equal(audits.at(-1)[0],'DESATIVACAO_LOCAL');
});
