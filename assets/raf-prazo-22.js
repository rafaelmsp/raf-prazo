/* Raf-Prazo 2.2 — catálogo jurídico e interface progressiva. Não modifica o motor legado de contagem. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const KEY='raf-prazo:juridical-profile:v1';
 const LAW_9099='https://www.planalto.gov.br/ccivil_03/leis/l9099.htm';
 const CPC='https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm';
 const CNJ='https://atos.cnj.jus.br/atos/detalhar/4509';
 const configurations=Object.freeze({
  jec:Object.freeze({
   label:'Juizado Especial Cível',
   short:'JEC · Lei 9.099/95',
   hint:'Prazos processuais fixados em dias: contagem em dias úteis (art. 12-A da Lei 9.099/95).',
   source:LAW_9099,
   presets:Object.freeze([
    {id:'custom',label:'Prazo informado pelo usuário',days:null,description:'O prazo deve ser conferido na decisão ou na norma aplicável.',basis:'Prazo judicial ou legal informado',url:LAW_9099},
    {id:'jec_recurso',label:'Recurso inominado',days:10,description:'Prazo legal de 10 dias após a ciência da sentença; confira o marco.',basis:'Lei 9.099/95, arts. 12-A e 42, caput',url:LAW_9099},
    {id:'jec_resposta',label:'Resposta ao recurso',days:10,description:'Prazo de 10 dias após intimação; confira o termo inicial.',basis:'Lei 9.099/95, arts. 12-A e 42, § 2º',url:LAW_9099},
    {id:'jec_embargos',label:'Embargos de declaração',days:5,description:'Prazo de 5 dias; confira a ciência da decisão.',basis:'Lei 9.099/95, arts. 12-A e 49',url:LAW_9099}
   ])
  }),
  cpc:Object.freeze({
   label:'Processo Civil',
   short:'CPC · Procedimento comum',
   hint:'Prazos processuais em dias: dias úteis, salvo regra específica (CPC, art. 219).',
   source:CPC,
   presets:Object.freeze([
    {id:'custom',label:'Prazo informado pelo usuário',days:null,description:'Confirme a duração e a regra de contagem do ato processual.',basis:'CPC, arts. 219 e 224 — regra geral',url:CPC},
    {id:'cpc_apelacao',label:'Apelação',days:15,description:'Prazo recursal geral, sujeito a hipóteses especiais e regras de contagem.',basis:'CPC, arts. 1.003, § 5º, e 1.009',url:CPC},
    {id:'cpc_contrarrazoes',label:'Contrarrazões à apelação',days:15,description:'Prazo após intimação; verificar previsão especial no caso.',basis:'CPC, art. 1.010, § 1º',url:CPC},
    {id:'cpc_embargos',label:'Embargos de declaração',days:5,description:'Prazo geral do CPC para embargos de declaração.',basis:'CPC, art. 1.023',url:CPC}
   ])
  })
 });
 const communications=Object.freeze({
  conferido:{label:'Marco já conferido',message:'Informe no campo de data o marco jurídico que deve ser excluído da contagem. Nenhuma ciência será inferida automaticamente.'},
  djen:{label:'Publicação no DJEN',message:'Use como marco a data de publicação efetiva (não a disponibilização). A publicação e os dias de início seguem o CPC e as regras do CNJ; confirme no DJEN.'},
  pessoal:{label:'Intimação pessoal / Domicílio',message:'A data de envio não é necessariamente a data de aperfeiçoamento. Confirme ciência, destinatário e regra aplicável antes de informar o marco.'},
  audiencia:{label:'Ciência em audiência',message:'Informe o marco correspondente à ciência efetiva após conferir a ata, a decisão e a legislação aplicável.'},
  outro:{label:'Outro marco processual',message:'Confira a decisão e a norma especial e informe o marco jurídico já apurado.'}
 });
 const safeRead=()=>{try{
  const obj=JSON.parse(localStorage.getItem(KEY)||'null');
  return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{};
 }catch(_){return {}}};
 const safeWrite=()=>{try{
  localStorage.setItem(KEY,JSON.stringify({regime:$('rafRegime').value,preset:$('rafAct').value,
   origin:$('rafOrigin').value,version:1}));
  return true;
 }catch(_){return false}};
 const validRegime=x=>Object.hasOwn(configurations,x)?x:'jec';
 const byId=(regime,id)=>configurations[validRegime(regime)].presets.find(x=>x.id===id)||configurations[validRegime(regime)].presets[0];
 const init=()=>{
  const regime=$('rafRegime'),act=$('rafAct'),origin=$('rafOrigin'),days=$('days'),start=$('start');
  if(!regime||!act||!origin||!days||!start)return;
  const drawer=$('rafProfileDialog'),trigger=$('rafProfileOpen');
  if(!drawer||!trigger)return;
  trigger.addEventListener('click',()=>{if(!drawer.open)drawer.showModal()});
  drawer.addEventListener('close',()=>{if(document.contains?.(trigger))trigger.focus({preventScroll:true})});
  const saved=safeRead();
  regime.value=validRegime(saved.regime);
  origin.value=Object.hasOwn(communications,saved.origin)?saved.origin:'conferido';
  const buildActs=(requested)=>{
   const data=configurations[validRegime(regime.value)];
   act.replaceChildren();
   for(const item of data.presets){
    const option=document.createElement('option');option.value=item.id;
    option.textContent=item.days===null?item.label:item.label+' · '+item.days+' dias';
    act.append(option);
   }
   act.value=data.presets.some(x=>x.id===requested)?requested:'custom';
  };
  const updateView=()=>{
   const r=configurations[validRegime(regime.value)],selected=byId(regime.value,act.value);
   const summary=$('rafRuleSummary'),description=$('rafActDescription'),link=$('rafRuleLink');
   $('rafRegimeCaption').textContent=r.hint;
   summary.textContent=r.short+' · '+(selected.days===null?'prazo definido pelo usuário':selected.days+' dias úteis');
   description.textContent=selected.description;
   $('rafActBasis').textContent=selected.basis;
   link.href=selected.url;
   $('rafOriginGuidance').textContent=communications[origin.value]?.message||communications.conferido.message;
   $('rafSourceGuidance').href=origin.value==='djen'||origin.value==='pessoal'?CNJ:validRegime(regime.value)==='jec'?LAW_9099:CPC;
   $('rafSourceGuidance').textContent=origin.value==='djen'||origin.value==='pessoal'?'Consultar normas do CNJ ↗':'Consultar fundamento legal ↗';
   $('rafContextResult').textContent=(regime.value==='jec'?'JEC':'CPC')+' · '+(selected.id==='custom'?'Prazo informado':selected.label);
   $('rafProfileShort').textContent=(regime.value==='jec'?'JEC':'CPC')+' · '+(selected.id==='custom'?'Prazo personalizado':selected.label);
   $('rafProfileSub').textContent=selected.id==='custom'?'Personalizar procedimento e ato':selected.days+' dias úteis · '+selected.basis;
   const inactiveHours=$('rafSpecialDeadline');
   inactiveHours.hidden=selected.id!=='jec_recurso';
   $('sourceFoot').textContent=regime.value==='jec'?'Fonte legal: Lei 9.099/95, art. 12-A · normas subsidiárias quando aplicáveis':'Fonte legal: CPC, arts. 219, 220 e 224';
   window.RafPrazo22Current=Object.freeze({
    regime:regime.value,regime_label:r.label,preset:selected.id,act_label:selected.label,
    days:Number(days.value),basis:selected.basis,source:selected.url,
    communication:origin.value,communication_label:communications[origin.value].label,
    communication_date:$('rafCommunicationDate').value||null,description:selected.description,
    count_mode:'business_days',validated_start:start.value||null
   });
  };
  const refresh=()=>{updateView();safeWrite()};
  buildActs(saved.preset);
  if(act.value!=='custom'){
   days.value=byId(regime.value,act.value).days;
   days.dispatchEvent(new Event('input',{bubbles:true}));
  }
  regime.addEventListener('change',()=>{
   buildActs('custom');
   refresh();
   days.dispatchEvent(new Event('input',{bubbles:true}));
  });
  act.addEventListener('change',()=>{
   const selected=byId(regime.value,act.value);
   if(selected.days!==null){
    days.value=selected.days;
    days.dispatchEvent(new Event('input',{bubbles:true}));
   }
   refresh();
  });
  origin.addEventListener('change',refresh);
  $('rafCommunicationDate').addEventListener('change',refresh);
  days.addEventListener('input',()=>{
   const selected=byId(regime.value,act.value);
   if(selected.days!==null&&Number(days.value)!==selected.days)act.value='custom';
   refresh();
  });
  // Os botões de dias do motor legado não emitem input; sincronizar o catálogo ao final do clique.
  $('quick')?.addEventListener('click',event=>{
   if(!event.target.closest('[data-days]'))return;
   act.value='custom';
   refresh();
  });
  start.addEventListener('change',refresh);
  window.addEventListener('raf-prazo:sync',updateView);
  refresh();
 };
 window.RafPrazoLegal22=Object.freeze({configurations,communications,getCurrent:()=>window.RafPrazo22Current||null});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();