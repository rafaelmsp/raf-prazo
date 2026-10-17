/* Raf-Prazo: indícios extraídos de fontes TJRJ, SEM efeito na contagem. */
(()=>{
'use strict';
const officialHosts=new Set(['www.tjrj.jus.br','portaltj.tjrj.jus.br']);
const effects={
 possible_deadline_suspension:'Possível suspensão de prazos',
 possible_deadline_extension:'Possível prorrogação de vencimento',
 system_unavailability:'Indisponibilidade de sistema',
 service_interruption:'Interrupção de expediente',
 optional_workday:'Ponto facultativo',
 normal_expediente:'Expediente normal mencionado',
 holiday_mention:'Feriado mencionado no informativo (não validado)'
};
const $=id=>document.getElementById(id);
const validURL=u=>{try{const p=new URL(u);return p.protocol==='https:'&&officialHosts.has(p.hostname)&&!p.username&&!p.password&&(!p.port||p.port==='443')&&(p.pathname.startsWith('/web/portal-conhecimento/')||p.pathname.startsWith('/documents/'))}catch(_){return false}};
const validDate=x=>{if(typeof x!=='string'||!/^20\d{2}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(x))return false;const d=new Date(x+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x};
const el=(tag,cls,text)=>{const a=document.createElement(tag);if(cls)a.className=cls;if(text!==undefined)a.textContent=text;return a};
function extractedByDay(){
 const grouped=new Map();
 if($('uf')?.value!=='RJ')return grouped;
 const candidates=window.RafPrazoData?.base?.candidates;
 if(!Array.isArray(candidates))return grouped;
 for(const doc of candidates.slice(0,300)){
  if(!doc||doc.type!=='CANDIDATO_TJRJ'||doc.status!=='pending_review'||doc.verified!==false||doc.applies_to_deadlines!==false||doc.stale===true)continue;
  if(!validURL(doc.source_url)||!/^[a-f0-9]{64}$/.test(doc.source_hash_sha256||''))continue;
  const occurrences=doc.structured?.occurrences;
  if(!Array.isArray(occurrences))continue;
  for(const a of occurrences.slice(0,120)){
   if(!a||!validDate(a.date)||!Object.prototype.hasOwnProperty.call(effects,a.effect_hint)||a.status!=='pending_review'||a.verified!==false||a.applies_to_deadlines!==false)continue;
   if(a.source_url!==doc.source_url||a.source_hash_sha256!==doc.source_hash_sha256)continue;
   const excerpt=String(a.evidence_excerpt||'').trim();
   if(excerpt.length<18||excerpt.length>450)continue;
   const key=[a.date,a.effect_hint,excerpt.toLocaleLowerCase('pt-BR').replace(/\s+/g,' ')].join('|');
   let day=grouped.get(a.date);
   if(!day){day=new Map();grouped.set(a.date,day)}
   let signal=day.get(key);
   if(!signal){signal={date:a.date,effect:a.effect_hint,excerpt,yearInferred:a.year_inferred===true,scope:a.scope_hint||{},page:Number.isInteger(a.document_page)?a.document_page:null,acts:Array.isArray(a.act_references)?a.act_references.slice(0,3):[],references:[]};day.set(key,signal)}
   if(!signal.references.some(s=>s.url===doc.source_url))signal.references.push({url:doc.source_url,sha256:doc.source_hash_sha256});
  }
 }
 return new Map([...grouped].map(([date,items])=>[date,[...items.values()].slice(0,8)]));
}
function btnDate(btn){const m=/^(\d{2})\/(\d{2})\/(\d{4}):/.exec(btn?.title||'');return m?[m[3],m[2],m[1]].join('-'):null}
function decorate(){
 const calendar=$('calendar');if(!calendar)return;
 const days=extractedByDay();
 for(const btn of calendar.querySelectorAll('button.day')){
  const signals=days.get(btnDate(btn))||[];
  btn.classList.toggle('raf-official-pending-day',signals.length>0);
  if(!btn.dataset.rafTjrjBaseTitle)btn.dataset.rafTjrjBaseTitle=btn.title;
  const original=btn.dataset.rafTjrjBaseTitle;
  btn.title=signals.length?original+' · TJRJ: '+signals.length+' indício(s) documental(is) NÃO validado(s) — NÃO altera o prazo':original;
  btn.setAttribute('aria-label',btn.title+'; abrir detalhes da data');
 }
 const legend=document.querySelector('.calendar + .legend');
 if(legend&&!legend.querySelector('.raf-official-pending-legend')){
  const label=el('span','raf-official-pending-legend');
  label.append(el('i','marker raf-official-pending-marker'),document.createTextNode('TJRJ: documento em análise'));
  legend.append(label);
 }
}
function ensureSection(){
 let section=$('rafTjrjOfficialDay');if(section)return section;
 const note=$('rafDayHelp');if(!note)return null;
 section=el('section','raf-official-day');
 section.id='rafTjrjOfficialDay';section.hidden=true;
 section.setAttribute('aria-label','Indícios do TJRJ coletados automaticamente, sem validação jurídica');
 section.append(el('h3','', 'TJRJ · Documento coletado automaticamente — não validado'));
 section.append(el('p','raf-official-warning','Indicação informativa: não comprova suspensão para seu processo ou comarca e NÃO altera a contagem.'));
 const list=el('div','raf-official-list');list.id='rafTjrjOfficialDayList';section.append(list);
 note.parentNode.insertBefore(section,note);
 return section;
}
function showDay(date){
 const section=ensureSection();if(!section)return;
 const list=$('rafTjrjOfficialDayList');list.replaceChildren();
 const signals=extractedByDay().get(date)||[];section.hidden=!signals.length;
 for(const signal of signals){
  const card=el('article','raf-official-card');
  card.append(el('strong','',effects[signal.effect]),el('p','',signal.excerpt));
  card.append(el('small','','Vigência e abrangência não verificadas.'+(signal.yearInferred?' Ano inferido do documento: conferir.':'')));
  if(signal.page)card.append(el('small','','Página da extração no PDF: '+signal.page));
  if(signal.acts.length)card.append(el('small','','Referências textuais (não verificadas): '+signal.acts.join(' · ')));
  if(Array.isArray(signal.scope.comarcas_mentioned)&&signal.scope.comarcas_mentioned.length)card.append(el('small','','Comarcas mencionadas, abrangência não comprovada: '+signal.scope.comarcas_mentioned.join(', ')));
  const refs=el('div','raf-official-sources');
  for(const [i,s] of signal.references.entries()){
   const a=el('a','','Abrir fonte oficial '+(i+1)+' ↗');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';
   refs.append(a,el('code','','SHA-256 coletado: '+s.sha256));
  }
  card.append(refs);list.append(card);
 }
}
const style=document.createElement('style');
style.textContent=[
'.calendar .day.raf-official-pending-day{position:relative;outline:2px dashed #b37b19;outline-offset:-3px}',
'.calendar .day.raf-official-pending-day::after{content:"?";position:absolute;right:2px;top:2px;width:15px;height:15px;line-height:15px;text-align:center;border-radius:50%;font-size:10px;font-weight:800;color:#fff;background:#925a00;pointer-events:none;z-index:2}',
'.raf-official-pending-marker{background:#925a00!important;border:2px dashed #efd5a0!important}',
'.raf-official-day{margin:12px 0;padding:12px;border:1px solid #bb9454;border-radius:10px;background:var(--paper2)}',
'.raf-official-day[hidden]{display:none}',
'.raf-official-day h3{margin:0 0 6px;font-size:12px}',
'.raf-official-warning{font-size:11px;line-height:1.55;color:var(--muted);margin:0 0 9px}',
'.raf-official-card{border:1px solid var(--line);border-radius:9px;padding:10px;margin:8px 0;overflow-wrap:anywhere}',
'.raf-official-card strong,.raf-official-card small{display:block;font-size:11px;line-height:1.5}',
'.raf-official-card p{font-size:12px;line-height:1.5;margin:7px 0}',
'.raf-official-card small{color:var(--muted)}',
'.raf-official-sources{display:flex;flex-direction:column;gap:3px;margin-top:10px}',
'.raf-official-sources a{font-size:11px;font-weight:700;color:var(--accent);text-decoration:underline}',
'.raf-official-sources code{font-size:9px;color:var(--muted);overflow-wrap:anywhere}'
].join('\n');
document.head.append(style);
const cal=$('calendar');
if(cal){
 new MutationObserver(decorate).observe(cal,{childList:true});
 cal.addEventListener('click',ev=>{const btn=ev.target.closest('button.day');const date=btnDate(btn);if(date)showDay(date)});
}
window.addEventListener('raf-prazo:sync',decorate);
$('uf')?.addEventListener('change',()=>queueMicrotask(decorate));
ensureSection();decorate();
window.RafPrazoTjrjEvidence=Object.freeze({list:()=>[...extractedByDay()].map(([date,a])=>({date,count:a.length,sources:a.map(x=>x.references.length)}))});
})();