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
const ctx={document:doc,window:{RafPrazoData:app,addEventListener:(name,cb)=>events[name]=cb},
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
test('data sem documento oficial ou ato pendente não é promovida',()=>{
 app.base.candidates[0].stale=true;app.base.candidates[1].stale=true;events['raf-prazo:sync']();
 assert.equal(articles().length,0);
});
