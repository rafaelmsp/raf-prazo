/* Exibe o que foi efetivamente coletado pelo TJRJ no JSON publicado. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const el=(tag,text)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x};
const effects={possible_deadline_suspension:'Possível suspensão de prazos',possible_deadline_extension:'Possível prorrogação',holiday_mention:'Feriado mencionado',system_unavailability:'Indisponibilidade mencionada',service_interruption:'Alteração de expediente'};
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const sourceOkay=u=>{try{const x=new URL(u);return x.protocol==='https:'&&['www.tjrj.jus.br','portaltj.tjrj.jus.br'].includes(x.hostname)&&!x.username&&!x.password}catch(_){return false}};
function extracted(){
 const candidates=window.RafPrazoData?.base?.candidates;
 if(!Array.isArray(candidates))return [];
 const items=new Map();
 for(const c of candidates){
  if(c?.type!=='CANDIDATO_TJRJ'||c.stale===true||!sourceOkay(c.source_url))continue;
  for(const o of c.structured?.occurrences||[]){
   if(!o||o.status!=='pending_review'||o.verified!==false||o.applies_to_deadlines!==false)continue;
   if(!Object.hasOwn(effects,o.effect_hint)||!/^20\d{2}-\d{2}-\d{2}$/.test(o.date||''))continue;
   if(o.source_url!==c.source_url||o.source_hash_sha256!==c.source_hash_sha256)continue;
   const excerpt=String(o.evidence_excerpt||'').trim();if(excerpt.length<18)continue;
   const id=[o.date,o.effect_hint,normalize(excerpt)].join('|');
   if(!items.has(id))items.set(id,{id,date:o.date,effect:o.effect_hint,excerpt,acts:[],sources:[]});
   const item=items.get(id);
   for(const act of o.act_references||[])if(typeof act==='string'&&!item.acts.includes(act))item.acts.push(act);
   if(!item.sources.includes(c.source_url))item.sources.push(c.source_url);
  }
 }
 return [...items.values()].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,35);
}
let root,button,status,list,pending=false;
function ensure(){
 if(root)return;const anchor=$('rafCandidatesList');if(!anchor)return;
 root=el('section');root.className='raf-tjrj-news-search';root.id='rafTjrjNewsSearch';
 root.append(el('h3','Pesquisar novidades do TJRJ'));
 root.append(el('p','Consulta a última base publicada no Raf-Prazo, NÃO realiza consulta ao vivo ao TJRJ. Documentos pendentes não são suspensões homologadas.'));
 button=el('button','Buscar atualizações publicadas');button.type='button';button.className='btn';button.id='rafTjrjSearchButton';
 status=el('p','');status.id='rafTjrjSearchStatus';status.setAttribute('role','status');
 list=el('div');list.id='rafTjrjNewsResults';root.append(button,status,list);
 anchor.parentNode.insertBefore(root,anchor);
 button.addEventListener('click',()=>{
  const sync=$('sync');
  if(!sync||sync.disabled){status.textContent='Sincronização já em andamento ou indisponível.';return;}
  pending=true;button.disabled=true;button.textContent='Consultando base...';
  status.textContent='Buscando a versão mais recente de feriados.json publicada pelo coletor.';
  sync.click();
 });
 const css=el('style');
 css.textContent='.raf-tjrj-news-search{margin:0 0 12px;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--paper2)}.raf-tjrj-news-search h3{margin:0 0 7px;font-size:13px}.raf-tjrj-news-search p,.raf-tjrj-news-search small{font-size:11px;line-height:1.5;color:var(--muted)}.raf-tjrj-news-search .btn{margin:8px 0}.raf-tjrj-news-result{padding:9px 0;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:3px}.raf-tjrj-news-result strong{font-size:12px}.raf-tjrj-news-result a{font-size:11px;color:var(--accent);text-decoration:underline;overflow-wrap:anywhere}';
 document.head.append(css);
}
function render(){
 ensure();if(!root)return;
 const sync=window.RafPrazoData?.base?.sync||{};
 const last=sync.tjrj_collector_at;const d=last?new Date(last):null;
 const when=d&&!isNaN(+d)?d.toLocaleString('pt-BR'):'não registrada';
 const records=extracted(),state=sync.tjrj_collector_status;
 status.textContent=(pending?'Base novamente consultada. ':'')+'Última coleta TJRJ: '+when+' · '+(sync.tjrj_sources_success??'?')+'/'+(sync.tjrj_sources_checked??'?')+' consultas · '+(state==='ok'?'sucesso':state==='partial'?'parcial':'não confirmada')+'. '+records.length+' indício(s) distinto(s).';
 pending=false;button.disabled=false;button.textContent='Buscar atualizações publicadas';
 list.replaceChildren();
 if(!records.length){list.append(el('p','Nenhum indício disponível. A ausência de resultado NÃO significa ausência de suspensão.'));return}
 for(const record of records){
  const card=el('article');card.className='raf-tjrj-news-result';
  card.append(el('strong',record.date+' · '+effects[record.effect]));
  card.append(el('p',record.excerpt.slice(0,340)));
  if(record.acts.length)card.append(el('small','Ato(s) mencionado(s): '+record.acts.slice(0,3).join(', ')));
  card.append(el('small',record.sources.length+' URL(s) oficiais · aplicabilidade ainda não verificada'));
  const a=el('a','Abrir publicação do TJRJ ↗');a.href=record.sources[0];a.target='_blank';a.rel='noopener noreferrer';card.append(a);
  list.append(card);
 }
}
window.RafPrazoTjrjNews=Object.freeze({list:extracted});
window.addEventListener('raf-prazo:sync',render);
$('rafNewsOpen')?.addEventListener('click',render);
render();
})();