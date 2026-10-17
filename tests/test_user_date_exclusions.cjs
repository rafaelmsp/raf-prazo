/* Exercita o módulo REAL de exclusão de dias úteis sem homologação. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const original=fs.readFileSync(path.join(root,'assets/user-date-exclusions.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
class Node {
 constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.id='';this.value='';this.textContent='';this.dataset={};this.classList={toggle(){}};this.style={};this.parentNode=null;this.selectedOptions=[];}
 append(...items){for(const item of items){if(item instanceof Node)item.parentNode=this;this.children.push(item)}}
 insertBefore(node,anchor){const at=this.children.indexOf(anchor);assert.ok(at>=0);this.children.splice(at,0,node);node.parentNode=this}
 setAttribute(k,v){this[k]=v}
 addEventListener(k,cb){this.listeners[k]=cb}
 click(){this.listeners.click?.({target:this})}
 querySelectorAll(){return []}
}
const rootEl=new Node('root'),head=new Node('head'),help=new Node('p'),calendar=new Node('div'),uf=new Node('select'),city=new Node('select');
help.id='rafDayHelp';calendar.id='calendar';uf.id='uf';uf.value='RJ';city.id='city';city.value='3301702';city.selectedOptions=[{textContent:'Duque de Caxias'}];
rootEl.append(help,calendar,uf,city);
const find=(root,id)=>{if(root.id===id)return root;for(const x of root.children){if(x instanceof Node){const v=find(x,id);if(v)return v}}return null};
const store=new Map(),audit=[];let confirms=0,recalcs=0;
const ctx={
 document:{head,getElementById:id=>find(rootEl,id),createElement:tag=>new Node(tag)},
 window:{addEventListener:()=>{},RafPrazoRecalculate:()=>recalcs++,RafPrazoManualAudit:(...x)=>audit.push(x),
 RafPrazoReasonForDate:()=>null,RafPrazoRefreshDay:()=>{}},
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
 MutationObserver:class {observe(){}},confirm:()=>{confirms++;return true},
 Date,URL,Set,Map,Object,String,RegExp,JSON,Number
};
vm.runInNewContext(original,ctx);
const api=ctx.window.RafPrazoUserDates;
const place={uf:'RJ',city:'3301702',cityName:'Duque de Caxias'};
function pick(date){
 const [y,m,d]=date.split('-');
 const btn={title:d+'/'+m+'/'+y+': dia',closest:()=>btn};
 calendar.listeners.click({target:btn});
}
test('escolha altera contagem individual, grava auditoria e permite reversão',()=>{
 assert.equal(api.resolve('2026-10-19',place),null);
 pick('2026-10-19');
 const reason=find(rootEl,'rafManualExcludedReason'),source=find(rootEl,'rafManualExcludedSource');
 const button=find(rootEl,'rafManualExcludedToggle');assert.ok(button);
 reason.value='Suspensão a conferir';source.value='https://www.tjrj.jus.br/documents/d/portal-conhecimento/ato';
 button.click();
 assert.ok(api.resolve('2026-10-19',place));
 assert.equal(audit[0][0],'EXCLUSAO_ATIVADA');assert.equal(confirms,1);
 assert.ok(recalcs>=2,'Recalcular no carregamento e após ativação');
 assert.equal(api.resolve('2026-10-19',{uf:'RJ',city:'3304557',cityName:'Rio de Janeiro'}),null);
 assert.equal(api.resolve('2026-10-19',{uf:'SP',city:'3550308',cityName:'São Paulo'}),null);
 button.click();
 assert.equal(api.resolve('2026-10-19',place),null);
 assert.equal(audit[1][0],'EXCLUSAO_DESATIVADA');
});
test('fim de semana nunca pode ser excluído de novo',()=>{
 pick('2026-10-17');
 assert.equal(find(rootEl,'rafManualExcludedDay').hidden,true);
 assert.equal(api.resolve('2026-10-17',place),null);
});
test('motivo é obrigatório e fonte não pode ser HTTP',()=>{
 pick('2026-10-20');const reason=find(rootEl,'rafManualExcludedReason'),source=find(rootEl,'rafManualExcludedSource'),button=find(rootEl,'rafManualExcludedToggle');
 reason.value='';button.click();assert.equal(api.resolve('2026-10-20',place),null);
 reason.value='Ato municipal';source.value='http://www.tjrj.jus.br/teste';button.click();
 assert.equal(api.resolve('2026-10-20',place),null);
});
test('integração com HTML preserva rótulo não homologado e memória',()=>{
 assert.ok(html.includes("type:'EXCLUSAO_USUARIO'"));
 assert.ok(html.includes("user_selected_exclusions:window.RafPrazoUserDates"));
 assert.ok(html.includes("window.RafPrazoManualAudit="));
 assert.ok(html.includes('<script src="assets/user-date-exclusions.js"></script>'));
 assert.ok(html.includes('<script src="assets/tjrj-news.js"></script>'));
});
