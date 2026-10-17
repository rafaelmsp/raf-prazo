/* Notícias de possíveis suspensões provenientes EXCLUSIVAMENTE da base TJRJ coletada. */
(()=>{
'use strict';
const KEY='raf-prazo:tjrj-news-seen:v1';
const HIDDEN='raf-prazo:tjrj-news-hidden:v1';
const getHidden=()=>{try{const items=JSON.parse(localStorage.getItem(HIDDEN)||'[]');return new Set(Array.isArray(items)?items.slice(-600):[])}catch(_){return new Set()}};
const saveHidden=items=>{try{localStorage.setItem(HIDDEN,JSON.stringify([...items].slice(-600)));return true}catch(_){if(typeof alert==='function')alert('Não foi possível salvar a limpeza neste navegador.');return false}};
const $=id=>document.getElementById(id);
const official=url=>{try{const u=new URL(url);return u.protocol==='https:'&&['www.tjrj.jus.br','portaltj.tjrj.jus.br'].includes(u.hostname)&&!u.username&&!u.password&&(u.pathname.startsWith('/documents/')||u.pathname.startsWith('/web/portal-conhecimento/'))}catch(_){return false}};
const effects={possible_deadline_suspension:'Possível suspensão de prazos',possible_deadline_extension:'Possível prorrogação',
 service_interruption:'Expediente alterado',system_unavailability:'Indisponibilidade de sistema',
 holiday_mention:'Feriado mencionado',optional_workday:'Ponto facultativo informado'};
const el=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
const readSeen=()=>{try{const o=JSON.parse(localStorage.getItem(KEY)||'[]');return new Set(Array.isArray(o)?o.slice(-600):[])}catch(_){return new Set()}};
let search='',lastScan='',searchInProgress=false;
function feed(){
 const docs=window.RafPrazoData?.base?.candidates||[],map=new Map();
 for(const doc of docs){
  if(doc.type!=='CANDIDATO_TJRJ'||doc.status!=='pending_review'||doc.applies_to_deadlines!==false||doc.verified!==false||doc.stale||!official(doc.source_url)||!/^[0-9a-f]{64}$/.test(doc.source_hash_sha256||''))continue;
  for(const e of doc.structured?.occurrences||[]){
   if(e?.status!=='pending_review'||e.verified!==false||e.applies_to_deadlines!==false||
     typeof e.date!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(e.date)||!Object.hasOwn(effects,e.effect_hint)||
     e.source_url!==doc.source_url||e.source_hash_sha256!==doc.source_hash_sha256)continue;
   const excerpt=String(e.evidence_excerpt||'').trim();
   if(excerpt.length<18)continue;
   // Duas URLs do mesmo documento não são duas suspensões.
   const id=[e.date,e.effect_hint,excerpt.toLowerCase().replace(/\s+/g,' ')].join('|');
   let row=map.get(id);
   const receivedAt=doc.content_changed_at||doc.first_seen_at||'';
   if(!row){row={id,date:e.date,effect:e.effect_hint,excerpt,scope:e.scope_hint||{},firstSeen:doc.first_seen_at||'',receivedAt,sources:[]};map.set(id,row)}
   if(!row.sources.some(x=>x.url===doc.source_url))row.sources.push({url:doc.source_url,hash:doc.source_hash_sha256,page:e.document_page||null});
   if(doc.first_seen_at&&(!row.firstSeen||doc.first_seen_at<row.firstSeen))row.firstSeen=doc.first_seen_at;
   // Para uma evidência agrupada, a entrada mais recente de QUALQUER fonte é a novidade.
   if(receivedAt&&(!row.receivedAt||receivedAt>row.receivedAt))row.receivedAt=receivedAt;
  }
 }
 return [...map.values()].map(row=>({...row,id:row.id+'|'+[...new Set(row.sources.map(s=>s.hash))].sort().join(',')}))
  // Ordem de chegada da notícia/versão ao sistema; NUNCA ordenar pela data do evento jurídico.
  .sort((a,b)=>(b.receivedAt||'').localeCompare(a.receivedAt||'')).slice(0,150);
}
function ensure(){
 let root=$('rafTjrjNewsFeed');if(root)return root;
 const parent=$('rafPanelTjrj')||$('rafPanelNews');if(!parent)return null;
 root=el('section');root.id='rafTjrjNewsFeed';root.className='raf-tjrj-feed';
 const title=el('h3','Últimas atualizações — TJRJ');
 const note=el('p','Ordem de chegada: registros novos ou alterados primeiro. A data do evento não determina a posição. Consulte a última coleta pública do GitHub Actions; não é busca em tempo real nem validação jurídica.');
 note.className='raf-tjrj-note';
 const controls=el('div');controls.className='raf-tjrj-controls';
 const field=el('input');field.type='search';field.id='rafTjrjNewsQuery';field.placeholder='Comarca, data, ato ou suspensão';field.setAttribute('aria-label','Pesquisar indícios do TJRJ');
 const button=el('button','Buscar atualizações agora');button.type='button';button.id='rafTjrjSearchNow';button.className='btn';
 const clear=el('button','Marcar como vistas');clear.type='button';clear.id='rafTjrjMarkSeen';clear.className='btn';
 const hide=el('button','Limpar lista');hide.type='button';hide.id='rafTjrjClearList';hide.className='btn';
 const restore=el('button','Restaurar');restore.type='button';restore.id='rafTjrjRestoreList';restore.className='btn';
 controls.append(field,button,clear,hide,restore);
 const status=el('p','');status.id='rafTjrjNewsStatus';status.className='raf-tjrj-note';status.setAttribute('role','status');
 const list=el('div');list.id='rafTjrjNewsList';list.setAttribute('aria-live','polite');
 root.append(title,note,controls,status,list);
 const mount=$('rafTjrjNewsMount');
 if(mount)mount.append(root);
 else {const candidates=$('rafCandidatesList');if(candidates)candidates.parentNode.insertBefore(root,candidates.previousElementSibling||candidates);else parent.append(root);}
 field.addEventListener('input',()=>{search=field.value.trim().toLocaleLowerCase('pt-BR');render()});
 button.addEventListener('click',()=>{
  searchInProgress=true;button.disabled=true;
  lastScan='Aguardando leitura da última base publicada…';
  render();
  const sync=$('sync');if(!sync){button.disabled=false;lastScan='Sincronização indisponível nesta página.';render();return}
  // A chamada HTTPS usa o sincronizador existente. Não dispara uma raspagem em tempo real do portal.
  sync.click();
 });
 clear.addEventListener('click',()=>{
  const seen=readSeen();for(const item of feed())seen.add(item.id);
  try{localStorage.setItem(KEY,JSON.stringify([...seen].slice(-600)))}catch(_){}
  render();
 });
 hide.addEventListener('click',()=>{
  const items=getHidden();let visible=0;
  for(const entry of feed()){
   const terms=[entry.date,entry.effect,entry.excerpt,...(entry.scope.date_linked_comarcas||[])].join(' ').toLocaleLowerCase('pt-BR');
   if(!items.has(entry.id)&&(!search||terms.includes(search))){items.add(entry.id);visible++;if(visible>=40)break}
  }
  if(!visible)return;
  if(typeof confirm==='function'&&!confirm('Ocultar os até 40 itens exibidos nesta aba somente neste navegador? Os documentos oficiais continuarão na base e poderão ser restaurados.'))return;
  if(saveHidden(items))render();
 });
 restore.addEventListener('click',()=>{if(saveHidden(new Set()))render()});
 const style=el('style');
 style.textContent='.raf-tjrj-arrival{font-size:11px!important;font-weight:780;color:var(--accent)!important}.raf-tjrj-detail summary{cursor:pointer;min-height:36px;font-size:11px;color:var(--accent);font-weight:700;padding:8px 0}.raf-tjrj-feed{padding:12px;margin:12px 0;border:1px solid var(--line);border-radius:10px;background:var(--paper2)}.raf-tjrj-feed h3{font-size:14px;margin:0 0 6px}.raf-tjrj-note{font-size:11px;color:var(--muted);line-height:1.5;margin:5px 0}.raf-tjrj-controls{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}.raf-tjrj-controls input{flex:2 1 170px;min-width:0;padding:9px;border:1px solid var(--line);border-radius:7px;background:var(--paper);color:var(--text)}.raf-tjrj-controls button{flex:1 1 125px;white-space:normal;font-size:11px}.raf-tjrj-item{padding:10px;margin:7px 0;border:1px solid var(--line);border-radius:9px}.raf-tjrj-item strong{font-size:12px}.raf-tjrj-item small{display:block;font-size:10px;color:var(--muted);margin:5px 0}.raf-tjrj-item p{font-size:11px;line-height:1.5;overflow-wrap:anywhere;margin:6px 0}.raf-tjrj-item a{font-size:11px;color:var(--accent);text-decoration:underline}.raf-tjrj-new{font-weight:800;color:#946006}.raf-tjrj-links{display:flex;gap:9px;flex-wrap:wrap;margin-top:8px}.raf-tjrj-dismiss{margin-top:8px;font-size:11px;min-height:35px;padding:7px 10px}.raf-tjrj-controls button{flex:1 1 112px}';
 document.head.append(style);
 return root;
}
function refreshBadge(unread){
 if(window.RafPrazoUpdateNotificationBadge){window.RafPrazoUpdateNotificationBadge();return}
 const dot=$('rafNewsDot');if(!dot)return;
 dot.textContent=unread>99?'99+':String(unread);dot.hidden=!unread;
}
window.RafPrazoTjrjNewsUnread=()=>feed().filter(row=>!readSeen().has(row.id)&&!getHidden().has(row.id)).length;
function render(){
 if(!ensure())return;
 const all=feed(),seen=readSeen(),hidden=getHidden(),unread=all.filter(x=>!seen.has(x.id)&&!hidden.has(x.id)).length;
 refreshBadge(unread);
 const base=window.RafPrazoData?.base;
 let text='Na base: '+all.length+' indício(s) · '+hidden.size+' oculto(s) neste navegador · '+unread+' ainda não visualizado(s).';
 text+=' Coleta TJRJ: '+(base?.sync?.tjrj_collector_status||'não informada');
 if(base?.sync?.tjrj_collector_at)text+=' · '+new Date(base.sync.tjrj_collector_at).toLocaleString('pt-BR');
 if(window.RafPrazoData?.error)text+=' · ATENÇÃO: falha na sincronização; a base anterior foi mantida.';
 if(lastScan)text+=' · '+lastScan;
 $('rafTjrjNewsStatus').textContent=text;
 const list=$('rafTjrjNewsList');list.replaceChildren();
 let shown=0;
 for(const row of all){
  const haystack=[row.date,row.effect,row.excerpt,...row.sources.map(s=>s.url),...(row.scope.date_linked_comarcas||[]),...(row.scope.comarcas_mentioned||[])].join(' ').toLocaleLowerCase('pt-BR');
  if(hidden.has(row.id)||search&&!haystack.includes(search))continue;
  const card=el('article');card.className='raf-tjrj-item';
  const heading=el('strong',effects[row.effect]);card.append(heading);
  const arrived=el('small',row.receivedAt?'Recebido/atualizado no Raf-Prazo: '+new Date(row.receivedAt).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Chegada sem horário registrado');
  arrived.className='raf-tjrj-arrival';card.append(arrived);
  card.append(el('small','Data do evento mencionada: '+row.date+' (não validada)'));
  if(!seen.has(row.id)){const state=el('small','NOVO / AINDA NÃO VISTO');state.className='raf-tjrj-new';card.append(state)}
  const scope=(row.scope.date_linked_comarcas||[]).join(', ');
  const more=el('details');more.className='raf-tjrj-detail';
  more.append(el('summary','Ver evidência e abrangência'));
  more.append(el('p',row.excerpt),el('small',scope?'Comarca mencionada: '+scope+' (não confirmada)':'Abrangência não verificada.'));
  card.append(more);
  if(row.firstSeen&&row.firstSeen!==row.receivedAt)card.append(el('small','Primeira identificação da fonte: '+new Date(row.firstSeen).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})));
  const links=el('div');links.className='raf-tjrj-links';
  for(const [i,ref] of row.sources.slice(0,3).entries()){
   const a=el('a','Fonte oficial '+(i+1)+' ↗');a.href=ref.url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);
  }
  const dismiss=el('button','Ocultar item');dismiss.type='button';dismiss.className='btn raf-tjrj-dismiss';dismiss.addEventListener('click',()=>{const items=getHidden();items.add(row.id);if(saveHidden(items))render()});card.append(dismiss,links);list.append(card);
  shown++;if(shown>=40)break;
 }
 if(!shown)list.append(el('p',all.length?'Nenhum item visível. Use Restaurar para rever os registros ocultos ou altere a busca.':search?'Nenhum resultado para esta pesquisa na base coletada.':'Nenhum indício disponível na base atual.'));
}
function finishSync(){
 if(!searchInProgress){render();return}
 searchInProgress=false;
 const button=$('rafTjrjSearchNow');if(button)button.disabled=false;
 lastScan=window.RafPrazoData?.mode==='online'?'Base pública consultada com sucesso. Os documentos TJRJ foram coletados anteriormente pelo GitHub Actions.':
  'Não foi possível obter uma base nova; verifique a origem e a última coleta.';
 render();
}
window.addEventListener('raf-prazo:sync',finishSync);
$('rafNewsOpen')?.addEventListener('click',render);
ensure();render();
})();