/* Raf-Prazo: opt-in INDIVIDUAL de datas TJRJ pendentes, não homologadas. */
(()=>{
'use strict';
const KEY='raf-prazo:tjrj-exclusions-user:v1',allow=new Set(['possible_deadline_suspension','holiday_mention']);
const $=id=>document.getElementById(id);
const read=()=>{try{let v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch(_){return {}}};
const place=()=>({uf:$('uf')?.value||'',city:$('city')?.value||'',cityName:$('city')?.selectedOptions[0]?.textContent||'Município'});
const cityKey=p=>p?.uf==='RJ'&&/^\d{7}$/.test(String(p.city||''))?'RJ:'+p.city:null;
const iso=x=>typeof x==='string'&&/^20\d{2}-\d{2}-\d{2}$/.test(x)&&!isNaN(new Date(x+'T00:00:00Z').getTime())&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const key=(date,p)=>cityKey(p)&&iso(date)?cityKey(p)+':'+date:null;
const signals=date=>window.RafPrazoTjrjEvidence?.signals(date)||[];
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const applicable=(signal,p)=>{
 const cities=signal?.scope?.date_linked_comarcas;
 return !Array.isArray(cities)||!cities.length||cities.some(x=>normalize(x)===normalize(p.cityName));
};
const eligible=signal=>!!signal&&allow.has(signal.effect)&&iso(signal.date)&&Array.isArray(signal.references)&&signal.references.length>0;
const matches=(data,signal)=>eligible(signal)&&data?.date===signal.date&&data.effect===signal.effect&&data.excerpt===signal.excerpt
 &&signal.references.some(ref=>ref.url===data.source_url&&ref.sha256===data.source_hash_sha256);
function activeChoice(date,p=place()){
 const saved=read()[key(date,p)];if(!saved)return null;
 const signal=signals(date).find(s=>matches(saved,s)&&applicable(s,p));
 return signal?{...saved,signal}:null;
}
function allForPlace(p=place()){
 const scope=cityKey(p);if(!scope)return [];
 return Object.entries(read()).filter(([k])=>k.startsWith(scope+':')).slice(0,100).map(([k,v])=>({...v,valid_with_current_source:!!activeChoice(v.date,p)}));
}
function toggle(date,signal){
 const p=place(),k=key(date,p);
 if(!k||!eligible(signal)||!applicable(signal,p))return;
 const choices=read(),old=choices[k]||null;
 if(old&&matches(old,signal))delete choices[k];
 else{
  if(!confirm('ATENÇÃO: o indício do TJRJ NÃO foi validado juridicamente.\n\nDesconsiderar '+date+' no cálculo, somente para '+p.cityName+'/'+p.uf+'?\n\nO vencimento será uma SIMULAÇÃO baseada na sua escolha, não um prazo homologado pelo tribunal. Confira o ato e o processo antes de utilizar.'))return;
  const ref=signal.references[0];
  choices[k]={date,uf:p.uf,city:String(p.city),city_name:p.cityName,effect:signal.effect,excerpt:signal.excerpt,
   source_url:ref.url,source_hash_sha256:ref.sha256,activated_at:new Date().toISOString(),status:'user_selected_unverified'};
 }
 try{localStorage.setItem(KEY,JSON.stringify(choices))}catch(_){alert('Falha ao salvar no navegador. Nenhuma alteração foi aplicada.');return}
 window.RafPrazoTjrjAudit?.(choices[k]?'ATIVACAO_LOCAL':'DESATIVACAO_LOCAL',date,old,choices[k]||null);
 window.RafPrazoRecalculate?.();
 window.RafPrazoRefreshDay?.(date);
 updateDayControls();updateNewsControls();decorateChoices();
}
window.RafPrazoTjrjSelection=Object.freeze({
 resolve:(date,p)=>{const v=activeChoice(date,p);return v?{source_url:v.source_url,status:'user_selected_unverified',date}:null},
 selectedForPlace:allForPlace
});

const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
let selectedDay=null;
const description=e=>e.effect==='holiday_mention'?'Feriado citado no PDF':'Possível suspensão processual';
function makeButton(date,signal){
 const p=place(),selected=activeChoice(date,p),active=!!selected&&matches(selected,signal),ok=applicable(signal,p),b=el('button','btn raf-optin-button',ok?(active?'✓ Desconsiderado — desativar':'Desconsiderar na contagem (simulação)'):'Outra comarca — não aplicável');
 b.type='button';b.disabled=!ok;b.setAttribute('aria-pressed',String(active));
 b.addEventListener('click',()=>toggle(date,signal));
 return b;
}
function updateDayControls(){
 const list=$('rafTjrjOfficialDayList');
 if(!list||!selectedDay)return;
 const events=signals(selectedDay);
 [...list.querySelectorAll('.raf-official-card')].forEach((card,i)=>{
  card.querySelector('.raf-optin-button')?.remove();
  const event=events[i];if(eligible(event))card.append(makeButton(selectedDay,event));
 });
}
function updateNewsControls(){
 const root=$('rafCandidatesList');if(!root)return;
 root.querySelector('#rafTjrjOptInNews')?.remove();
 const box=el('section','raf-optin-news');box.id='rafTjrjOptInNews';
 box.append(el('strong','','TJRJ — dias não contados por escolha do usuário'));
 box.append(el('p','raf-optin-warning','Sem login ou aprovação administrativa nesta versão. A exclusão é individual e NÃO é homologada: não utilize o vencimento simulado como prazo confirmado.'));
 const seen=new Set();
 const available=window.RafPrazoTjrjEvidence?.list()||[];
 let count=0;
 for(const {date} of available){
  for(const event of signals(date)){
   if(!eligible(event))continue;
   const identifier=date+'|'+event.effect+'|'+event.excerpt;
   if(seen.has(identifier))continue;seen.add(identifier);
   const row=el('div','raf-optin-item');
   row.append(el('strong','',date+' · '+description(event)));
   const cities=event.scope?.date_linked_comarcas||[];
   row.append(el('small','',cities.length?'Comarca mencionada (não confirmada): '+cities.join(', '):'Abrangência não determinada'));
   row.append(makeButton(date,event));
   const source=el('a','','Conferir fonte oficial ↗');
   source.href=event.references[0].url;source.rel='noopener noreferrer';source.target='_blank';row.append(source);
   box.append(row);
   count++;if(count>=35)break;
  }
  if(count>=35)break;
 }
 if(!count)box.append(el('p','raf-optin-warning','Nenhum indício TJRJ com possível suspensão ou feriado está disponível para este estado.'));
 root.prepend(box);
}
function decorateChoices(){
 const cal=$('calendar');if(!cal)return;
 for(const btn of cal.querySelectorAll('button.day')){
  const m=/^(\d{2})\/(\d{2})\/(\d{4}):/.exec(btn.title||'');
  const date=m?[m[3],m[2],m[1]].join('-'):null;
  btn.classList.toggle('raf-user-tjrj-selected',!!(date&&activeChoice(date)));
 }
}
const styles=document.createElement('style');
styles.textContent=[
 '.calendar .day.raf-user-tjrj-selected{outline:2px solid #13806b!important;outline-offset:-3px}',
 '.calendar .day.raf-user-tjrj-selected::after{content:"✓";background:#13806b;color:#fff}',
 '.calendar .day.blocked.raf-user-tjrj:not(.due){background:#def4ed;color:#0a6551;border:1px solid #74c5b3}',
 '.raf-optin-button{margin-top:9px;max-width:100%;white-space:normal;line-height:1.4}',
 '.raf-optin-news{padding:12px;margin:10px 0 14px;border:1px dashed #a87932;border-radius:10px;background:var(--paper2)}',
 '.raf-optin-news strong{font-size:12px}',
 '.raf-optin-warning{font-size:11px;color:var(--muted);line-height:1.5;margin:6px 0}',
 '.raf-optin-item{padding:9px;margin:8px 0;border:1px solid var(--line);border-radius:8px;display:flex;flex-direction:column;align-items:flex-start;gap:4px}',
 '.raf-optin-item strong,.raf-optin-item small,.raf-optin-item a{font-size:11px}',
 '.raf-optin-item small{color:var(--muted)}',
 '.raf-optin-item a{color:var(--accent);text-decoration:underline}'
].join('\n');
document.head.append(styles);
$('calendar')?.addEventListener('click',event=>{
 const button=event.target.closest('button.day');if(!button)return;
 const m=/^(\d{2})\/(\d{2})\/(\d{4}):/.exec(button.title||'');
 if(!m)return;selectedDay=[m[3],m[2],m[1]].join('-');
 queueMicrotask(updateDayControls);
});
$('rafNewsOpen')?.addEventListener('click',()=>queueMicrotask(updateNewsControls));
window.addEventListener('raf-prazo:sync',()=>{decorateChoices();updateNewsControls();updateDayControls()});
decorateChoices();updateNewsControls();
window.RafPrazoRecalculate?.();
})();
