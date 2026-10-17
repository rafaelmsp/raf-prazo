/* Prova que o painel mostra apenas indícios da base publicada, sem inventar suspensões. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'feriados.json'),'utf8'));
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.handlers={};this.textContent='';this.disabled=false;}
 append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes)}
 insertBefore(node,anchor){node.parentNode=this;const i=this.children.indexOf(anchor);this.children.splice(i<0?this.children.length:i,0,node)}
 addEventListener(type,cb){this.handlers[type]=cb}
 setAttribute(){}
 click(){this.handlers.click?.({target:this})}
}
const parent=new Element('div'),candidates=new Element('div');parent.append(candidates);
const sync=new Element('button'),open=new Element('button');
const nodes={rafCandidatesList:candidates,sync,rafNewsOpen:open};
let syncCalls=0;sync.addEventListener('click',()=>{syncCalls++});
const listeners={};
const window={RafPrazoData:{base},addEventListener:(type,cb)=>listeners[type]=cb};
const document={getElementById:id=>nodes[id]||null,createElement:tag=>new Element(tag),head:new Element('head')};
const context={window,document,URL,Date,Object,Array,Map,Set,String,isNaN};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/tjrj-news-search.js'),'utf8'),context);
test('indícios listados são os mesmos que saíram da coleta oficial',()=>{
 const records=window.RafPrazoTjrjNews.list();
 assert.ok(records.length>=1,'Esperado indício do TJRJ na base de teste');
 for(const item of records){
  assert.match(item.date,/^20\d{2}-\d{2}-\d{2}$/);
  assert.ok(item.sources.every(x=>x.startsWith('https://www.tjrj.jus.br/')||x.startsWith('https://portaltj.tjrj.jus.br/')));
  assert.ok(item.sources.length>=1);
  const matches=base.candidates.some(c=>c.type==='CANDIDATO_TJRJ'&&
   item.sources.includes(c.source_url)&&c.structured?.occurrences?.some(o=>o.date===item.date&&o.evidence_excerpt===item.excerpt&&o.applies_to_deadlines===false));
  assert.ok(matches,item.date+' sem prova de origem');
 }
 assert.equal(new Set(records.map(x=>x.id)).size,records.length,'Mesmo texto não deve duplicar duas URLs');
});
test('clicar em buscar consulta somente sincronização publicada',()=>{
 assert.ok(nodes.rafTjrjSearchButton);
 nodes.rafTjrjSearchButton.click();
 assert.equal(syncCalls,1,'Deve solicitar apenas atualização da base publicada');
 assert.match(nodes.rafTjrjSearchStatus.textContent,/Buscando/);
 listeners['raf-prazo:sync']();
 assert.match(nodes.rafTjrjSearchStatus.textContent,/Última coleta TJRJ/);
 assert.equal(nodes.rafTjrjSearchButton.disabled,false);
});
test('o módulo não transforma indícios em eventos ativos',()=>{
 assert.equal(base.events.some(e=>e.type==='SUSPENSAO_TJRJ'),false);
 assert.ok(fs.readFileSync(path.join(root,'assets/tjrj-news-search.js'),'utf8').includes('applies_to_deadlines!==false'));
 assert.ok(fs.readFileSync(path.join(root,'assets/tjrj-news-search.js'),'utf8').includes('NÃO realiza consulta ao vivo'));
});
