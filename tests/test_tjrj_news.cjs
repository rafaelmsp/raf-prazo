/* Painel de novidades: alimentação pela base publicada, sem inventar horários TJRJ. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'assets/tjrj-news.js'),'utf8');
class El {
 constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.id='';this.value='';this.textContent='';this.parentNode=null;this.className='';this.hidden=false;}
 append(...children){for(const n of children){if(n instanceof El)n.parentNode=this;this.children.push(n)}}
 insertBefore(node,anchor){const i=this.children.indexOf(anchor);assert.ok(i>=0);this.children.splice(i,0,node);node.parentNode=this}
 replaceChildren(...children){this.children=[];this.append(...children)}
 addEventListener(ev,fn){this.listeners[ev]=fn}
 setAttribute(k,v){this[k]=v}
 click(){this.listeners.click?.({target:this})}
}
const parent=new El('section'),head=new El('head'),kicker=new El('div'),candidates=new El('div'),newsBtn=new El('button'),dot=new El('span'),sync=new El('button');kicker.id='kicker';candidates.id='rafCandidatesList';newsBtn.id='rafNewsOpen';dot.id='rafNewsDot';sync.id='sync';parent.id='rafPanelNews';parent.append(kicker,candidates);
Object.defineProperty(candidates,'previousElementSibling',{get(){return kicker}});
const find=(root,id)=>{if(root.id===id)return root;for(const x of root.children)if(x instanceof El){const v=find(x,id);if(v)return v}return null};
const nodes=[parent,head,newsBtn,dot,sync];
const doc={head,createElement:tag=>new El(tag),getElementById:id=>nodes.map(n=>find(n,id)).find(Boolean)||null};
const url='https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295';
const url2='https://portaltj.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295';
const occurrence={date:'2026-10-30',effect_hint:'possible_deadline_suspension',evidence_excerpt:'Suspensão dos prazos processuais no dia 30 de outubro de 2026.',status:'pending_review',verified:false,applies_to_deadlines:false};
const candidatesData=[url,url2].map((u,i)=>({type:'CANDIDATO_TJRJ',status:'pending_review',verified:false,applies_to_deadlines:false,stale:false,
 source_url:u,source_hash_sha256:'a'.repeat(64),first_seen_at:'2026-10-17T07:30:00+00:00',
 structured:{occurrences:[{...occurrence,source_url:u,source_hash_sha256:'a'.repeat(64)}]}}));
const app={base:{candidates:candidatesData,changes:[],sync:{tjrj_collector_status:'ok',tjrj_collector_at:'2026-10-17T07:30:00+00:00'}},mode:'online',error:''};
const storage=new Map();let syncClicks=0;const events={};sync.addEventListener('click',()=>{syncClicks++;events['raf-prazo:sync']?.()});
let confirmCalls=0;const ctx={document:doc,confirm:()=>{confirmCalls++;return true},alert:()=>{},window:{RafPrazoData:app,addEventListener:(name,cb)=>events[name]=cb},
 localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,v)=>storage.set(key,v)},
 Date,URL,Map,Set,JSON,Object,String,RegExp};
vm.runInNewContext(source,ctx);
const get=id=>doc.getElementById(id);
function articles(){return get('rafTjrjNewsList').children.filter(x=>x.tag==='article')}
test('agrega duas URLs da mesma notícia em um só indício',()=>{
 assert.equal(articles().length,1);
 assert.equal(articles()[0].children[articles()[0].children.length-1].children.length,2);
 assert.ok(get('rafTjrjNewsStatus').textContent.includes('1 indício(s)'));
});
test('receber novidades mantém indicador até ler',()=>{
 assert.equal(dot.hidden,false);
 get('rafTjrjMarkSeen').click();
 assert.equal(dot.hidden,true);
});
test('busca atualiza apenas a última base publicada',()=>{
 get('rafTjrjSearchNow').click();
 assert.equal(syncClicks,1);
 assert.ok(get('rafTjrjNewsStatus').textContent.includes('Base pública consultada'));
});
test('limpar itens TJRJ oculta somente na interface, e restaurar recupera a fonte',()=>{
 assert.equal(articles().length,1);
 get('rafTjrjClearList').click();
 assert.ok(confirmCalls>=1,'Limpeza exige confirmação');
 assert.equal(articles().length,0);
 assert.ok(app.base.candidates.length===2,'Base original permanece intacta');
 assert.ok(get('rafTjrjNewsStatus').textContent.includes('1 oculto(s)'));
 get('rafTjrjRestoreList').click();
 assert.equal(articles().length,1);
});
test('ocultar item individual e restaurar não muda o documento oficial',()=>{
 const card=articles()[0];
 const button=card.children.find(x=>x.tag==='button'&&x.textContent==='Ocultar item');
 assert.ok(button);
 button.click();assert.equal(articles().length,0);
 get('rafTjrjRestoreList').click();assert.equal(articles().length,1);
});
test('data sem documento oficial ou ato pendente não é promovida',()=>{
 app.base.candidates[0].stale=true;app.base.candidates[1].stale=true;events['raf-prazo:sync']();
 assert.equal(articles().length,0);
});

test('sincronização não transforma candidato TJRJ em evento homologado',()=>{
 assert.equal(app.base.candidates.every(x=>x.applies_to_deadlines===false),true);
});

test('feed exibe chegada mais recente antes da data do evento mais nova',()=>{
 const make=(date,first,hash,updated,source)=>({
  type:'CANDIDATO_TJRJ',status:'pending_review',verified:false,applies_to_deadlines:false,stale:false,
  source_url:source||url,source_hash_sha256:hash,first_seen_at:first,content_changed_at:updated,
  structured:{occurrences:[{date,effect_hint:'possible_deadline_suspension',evidence_excerpt:'Indício documental sobre suspensão a conferir referente à data '+date+'.',
   status:'pending_review',verified:false,applies_to_deadlines:false,source_url:source||url,source_hash_sha256:hash}]}
 });
 const old=make('2026-12-15','2026-10-17T06:00:00+00:00','a'.repeat(64),'2026-10-17T06:00:00+00:00');
 const newDoc=make('2026-02-02','2026-10-17T12:00:00+00:00','b'.repeat(64),'2026-10-17T12:00:00+00:00',url2);
 app.base.candidates=[old,newDoc];
 events['raf-prazo:sync']();
 assert.equal(articles().length,2);
 assert.ok(articles()[0].children.some(x=>x.textContent.includes('Data do evento mencionada: 2026-02-02')));
 assert.ok(articles()[0].children.some(x=>x.textContent.includes('Recebido/atualizado no Raf-Prazo:')));
 assert.ok(get('rafTjrjNewsFeed').children.some(x=>x.textContent.includes('Ordem de chegada')));
});
test('atualização de documento antigo sobe para o topo sem alterar data do evento',()=>{
 const first=app.base.candidates[0];
 first.content_changed_at='2026-10-18T12:00:00+00:00';
 first.source_hash_sha256='c'.repeat(64);
 first.structured.occurrences[0].source_hash_sha256='c'.repeat(64);
 events['raf-prazo:sync']();
 assert.ok(articles()[0].children.some(x=>x.textContent.includes('Data do evento mencionada: 2026-12-15')));
});
test('reconsulta de documento sem mudança não cria novidade fictícia',()=>{
 const old=app.base.candidates[1];
 old.last_seen_at='2026-11-01T12:00:00+00:00';
 events['raf-prazo:sync']();
 assert.ok(articles()[0].children.some(x=>x.textContent.includes('Data do evento mencionada: 2026-12-15')));
 assert.ok(app.base.candidates.every(x=>x.applies_to_deadlines===false));
});
