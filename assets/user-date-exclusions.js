/* Raf-Prazo — exclusões pontuais decididas pelo usuário. NÃO homologadas. */
(()=>{
'use strict';
const KEY='raf-prazo:exclusoes-individuais:v1';
const $=id=>document.getElementById(id);
const isoOk=s=>{if(typeof s!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===s};
const weekend=s=>isoOk(s)&&[0,6].includes(new Date(s+'T00:00:00Z').getUTCDay());
const place=()=>({uf:$('uf')?.value||'',city:String($('city')?.value||''),cityName:$('city')?.selectedOptions?.[0]?.textContent||''});
const dateKey=(date,p)=>isoOk(date)&&/^[A-Z]{2}$/.test(p?.uf||'')&&/^\d{7}$/.test(String(p?.city||''))?p.uf+':'+p.city+':'+date:null;
function read(){try{const r=JSON.parse(localStorage.getItem(KEY)||'{}');return r&&typeof r==='object'&&!Array.isArray(r)?r:{}}catch(_){return {}}}
function resolve(date,p){
 const k=dateKey(date,p);if(!k||weekend(date))return null;
 const item=read()[k];return item&&item.date===date&&item.uf===p.uf&&String(item.ibge)===String(p.city)&&
 item.status==='user_selected_unverified'&&typeof item.reason==='string'&&item.reason.length>=4?item:null;
}
function selectedForPlace(p){
 const prefix=p?.uf+':'+p?.city+':';
 return Object.entries(read()).filter(([k])=>k.startsWith(prefix)).slice(0,150)
  .map(([,value])=>value).filter(x=>x&&x.status==='user_selected_unverified');
}
window.RafPrazoUserDates=Object.freeze({resolve,selectedForPlace});
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node};
function ensure(){
 let section=$('rafManualExcludedDay');if(section)return section;
 const anchor=$('rafDayHelp');if(!anchor)return null;
 section=el('section');section.id='rafManualExcludedDay';section.className='raf-manual-exclude';section.hidden=true;
 const heading=el('h3','Decisão individual sobre a contagem');
 const warning=el('p','A exclusão é uma SIMULAÇÃO LOCAL, não é feriado nem suspensão homologada. Confira o fundamento e a abrangência nos atos oficiais.');
 warning.className='raf-manual-help';
 const label=el('label','Motivo da exclusão (obrigatório)');label.htmlFor='rafManualExcludedReason';
 const field=el('input');field.id='rafManualExcludedReason';field.type='text';field.maxLength=140;field.placeholder='Ex.: suspensão indicada no ato publicado';field.autocomplete='off';
 const urlLabel=el('label','Fonte / ato (link HTTPS opcional)');urlLabel.htmlFor='rafManualExcludedSource';
 const url=el('input');url.id='rafManualExcludedSource';url.type='url';url.maxLength=600;url.placeholder='https://www.tjrj.jus.br/...';
 const status=el('p','');status.id='rafManualExcludedStatus';status.setAttribute('role','status');
 const button=el('button','Excluir este dia da contagem (simulação)');button.id='rafManualExcludedToggle';button.type='button';button.className='btn';
 section.append(heading,warning,label,field,urlLabel,url,status,button);anchor.parentNode.insertBefore(section,anchor);
 button.addEventListener('click',()=>{
  const date=section.dataset.date,p=place(),k=dateKey(date,p);
  if(!k||weekend(date))return;
  const items=read(),previous=items[k]||null;
  if(previous){delete items[k]}
  else{
   const reason=field.value.trim();const source=url.value.trim();
   if(reason.length<4){status.textContent='Descreva o motivo com pelo menos 4 caracteres.';return}
   if(source){try{const u=new URL(source);if(u.protocol!=='https:'||u.username||u.password)throw Error('invalid')}catch(_){status.textContent='A fonte precisa ser um endereço HTTPS válido.';return}}
   if(Object.keys(items).length>=250){status.textContent='Limite de 250 registros atingido. Desative datas antigas.';return}
   if(!confirm('Esta data NÃO está sendo homologada pelo TJRJ. Desconsiderá-la cria apenas uma SIMULAÇÃO local para '+p.cityName+'/'+p.uf+'. Deseja continuar?'))return;
   items[k]={date,uf:p.uf,ibge:String(p.city),city_name:p.cityName,reason,source_url:source,
    selected_at:new Date().toISOString(),status:'user_selected_unverified'};
  }
  try{localStorage.setItem(KEY,JSON.stringify(items))}catch(_){status.textContent='Não foi possível salvar; o cálculo não foi alterado.';return}
  const next=items[k]||null;
  window.RafPrazoManualAudit?.(next?'EXCLUSAO_ATIVADA':'EXCLUSAO_DESATIVADA',date,previous,next);
  window.RafPrazoRecalculate?.();
  window.RafPrazoRefreshDay?.(date);
  renderDate(date);
 });
 const style=el('style');
 style.textContent='.raf-manual-exclude{padding:12px;margin:10px 0;border:1px solid var(--line);border-radius:10px;background:var(--paper2)}.raf-manual-exclude[hidden]{display:none}.raf-manual-exclude h3{font-size:13px;margin:0 0 8px}.raf-manual-exclude label{display:block;font-size:11px;font-weight:700;margin-top:8px}.raf-manual-exclude input{width:100%;box-sizing:border-box;padding:9px;margin-top:4px;background:var(--paper);color:var(--text);border:1px solid var(--line);border-radius:7px}.raf-manual-help,.raf-manual-exclude #rafManualExcludedStatus{font-size:11px;line-height:1.5;color:var(--muted)}.raf-manual-exclude .btn{margin-top:9px;white-space:normal}.calendar .day.raf-user-exclusion{outline:2px solid #a04a83;outline-offset:-3px}';
 document.head.append(style);
 return section;
}
function renderDate(date){
 const section=ensure();if(!section)return;
 section.dataset.date=date;
 const p=place(),current=resolve(date,p);
 const label=$('rafManualExcludedStatus'),button=$('rafManualExcludedToggle');
 const dayValid=isoOk(date)&&!weekend(date);
 const block=window.RafPrazoReasonForDate?.(date);
 const alreadyExcluded=!!block&&block.type!=='EXCLUSAO_USUARIO';
 section.hidden=!dayValid;
 if(!dayValid)return;
 // Um feriado estadual/municipal conhecido oferece nome e fonte para a escolha individual.
 const holiday=(window.RafPrazoData?.base?.events||[]).find(e=>e.date===date&&
  (e.type==='ESTADUAL'&&e.scope?.uf===p.uf||
   e.type==='MUNICIPAL'&&e.scope?.uf===p.uf&&e.scope?.ibge===String(p.city)));
 $('rafManualExcludedReason').value=current?.reason||(holiday&&!alreadyExcluded?holiday.name+' — conferir expediente forense':'');
 $('rafManualExcludedSource').value=current?.source_url||(holiday&&!alreadyExcluded?holiday.source?.url||'':'');
 button.disabled=!current&&alreadyExcluded;
 button.textContent=current?'✓ Dia desconsiderado — reativar contagem':'Excluir este dia da contagem (simulação)';
 label.textContent=current?'Exclusão individual ATIVA — pode ser desfeita.':
  alreadyExcluded?'Dia já não contado por '+(block.name||'regra atual')+'. Não precisa de exclusão duplicada.':
  'Por padrão, este dia é contado. Você pode excluí-lo somente como simulação identificada.';
}
function decorate(){
 for(const btn of $('calendar')?.querySelectorAll('button.day')||[]){
  const m=/^(\d{2})\/(\d{2})\/(\d{4}):/.exec(btn.title||'');
  if(m)btn.classList.toggle('raf-user-exclusion',!!resolve([m[3],m[2],m[1]].join('-'),place()));
 }
}
$('calendar')?.addEventListener('click',event=>{
 const btn=event.target.closest('button.day');if(!btn)return;
 const m=/^(\d{2})\/(\d{2})\/(\d{4}):/.exec(btn.title||'');
 if(m)renderDate([m[3],m[2],m[1]].join('-'));
});
if($('calendar'))new MutationObserver(decorate).observe($('calendar'),{childList:true});
window.addEventListener('raf-prazo:sync',decorate);
ensure();decorate();
})();