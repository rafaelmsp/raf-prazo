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
