/* Raf-Prazo 2.2 — catálogo jurídico e interface progressiva. Não modifica o motor legado de contagem. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const KEY='raf-prazo:juridical-profile:v1';
 const LAW_9099='https://www.planalto.gov.br/ccivil_03/leis/l9099.htm';
 const CPC='https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm';
 const CNJ='https://atos.cnj.jus.br/atos/detalhar/4509';
 const FONAJE='https://www.cnj.jus.br/enunciados-civeis/';
 const configurations=Object.freeze({
  jec:Object.freeze({
   label:'Juizado Especial Cível',
   short:'JEC · Lei 9.099/95',
   hint:'Prazos processuais fixados em dias: contagem em dias úteis (art. 12-A da Lei 9.099/95).',
   source:LAW_9099,
   presets:Object.freeze([
    {id:'custom',label:'Prazo informado pelo usuário',days:null,category:'Personalizado',kind:'custom',description:'Informe a duração determinada nos autos ou prevista em lei. Nenhum prazo será presumido.',basis:'Prazo judicial ou legal informado',url:LAW_9099},
    {id:'jec_recurso',label:'Recurso inominado',days:10,category:'Recursos',description:'Dez dias após a ciência da sentença; confirme a possibilidade de recurso e o marco nos autos.',basis:'Lei 9.099/95, arts. 12-A e 42, caput',url:LAW_9099},
    {id:'jec_resposta',label:'Resposta ao recurso',days:10,category:'Recursos',description:'Dez dias após intimação do recorrido, observado o processamento do recurso.',basis:'Lei 9.099/95, arts. 12-A e 42, § 2º',url:LAW_9099},
    {id:'jec_embargos',label:'Embargos de declaração',days:5,category:'Recursos',description:'Cinco dias após ciência da decisão; observar os efeitos dos embargos sobre outros recursos.',basis:'Lei 9.099/95, arts. 12-A, 49 e 50',url:LAW_9099},
    {id:'jec_contestacao',label:'Contestação / defesa no JEC',days:null,kind:'procedural',category:'Defesa',description:'O Enunciado 10 do FONAJE admite contestação até a audiência de instrução e julgamento. Confirme audiência, citação e orientação do juízo; não aplicar 15 dias do CPC por padrão.',basis:'Lei 9.099/95, arts. 27 a 30; FONAJE, Enunciado 10 (orientação não vinculante)',url:FONAJE},
    {id:'jec_manifestacao',label:'Manifestação ou réplica',days:null,kind:'manual',category:'Defesa',description:'Conferir intimação e ato determinado. Documentos apresentados em audiência admitem manifestação imediata (art. 29, parágrafo único); não há prazo geral de 15 dias.',basis:'Lei 9.099/95, art. 29, parágrafo único; ato judicial',url:LAW_9099},
    {id:'jec_cumprimento_pagar',label:'Cumprimento de sentença — pagar quantia',days:null,kind:'conditional',referenceDays:15,category:'Execução',description:'Referência de 15 dias para pagamento voluntário (CPC, art. 523), aplicável subsidiariamente quando cabível. Confira a ordem de pagamento, a intimação, a natureza da obrigação e o marco processual. A multa do art. 523 é tratada no Enunciado 97 do FONAJE; não presumir honorários de 10%.',basis:'Lei 9.099/95, art. 52; CPC, art. 523; FONAJE, Enunciado 97',url:CPC,secondaryUrl:FONAJE},
    {id:'jec_cumprimento_fazer',label:'Cumprimento de sentença — fazer/não fazer',days:null,kind:'manual',category:'Execução',description:'O prazo decorre da decisão que impõe a obrigação e de sua intimação. Não existe período uniforme de pagamento aplicável a obrigações de fazer.',basis:'Lei 9.099/95, art. 52, V e VI; CPC, art. 536, no que couber',url:LAW_9099},
    {id:'jec_embargos_titulo_judicial',label:'Embargos à execução — título judicial',days:null,kind:'conditional',referenceDays:15,category:'Execução',description:'O Enunciado 142 do FONAJE orienta prazo de 15 dias a partir da intimação da penhora na execução de título judicial. Confirme penhora, intimação, garantia e entendimento do juízo; enunciado não é lei vinculante.',basis:'Lei 9.099/95, art. 52, IX; FONAJE, Enunciados 117, 121 e 142',url:FONAJE,secondaryUrl:LAW_9099},
    {id:'jec_embargos_titulo_extrajudicial',label:'Embargos à execução — título extrajudicial',days:null,kind:'procedural',category:'Execução',description:'O art. 53, § 1º, prevê embargos por escrito ou verbalmente na audiência de conciliação após a penhora. Verifique a designação e a intimação; não aplicar automaticamente 15 dias do título judicial.',basis:'Lei 9.099/95, art. 53, § 1º; FONAJE, Enunciado 117',url:LAW_9099,secondaryUrl:FONAJE},
    {id:'jec_audiencia',label:'Providência determinada em audiência',days:null,kind:'manual',category:'Diligências',description:'O prazo depende da ata e da decisão, não do nome do ato.',basis:'Lei 9.099/95, arts. 27 a 29; ata',url:LAW_9099},
    {id:'jec_tutela',label:'Cumprimento de tutela de urgência',days:null,kind:'manual',category:'Diligências',description:'O prazo para cumprir a ordem deve ser extraído da decisão e da intimação específica.',basis:'Decisão judicial e legislação aplicável',url:LAW_9099},
    {id:'jec_preparo',label:'Preparo do recurso — 48 horas',days:null,kind:'hours',category:'Recursos',unit:'hours',duration:48,description:'Não calculável por este motor de dias úteis: 48 horas seguintes à interposição, independentemente de intimação.',basis:'Lei 9.099/95, art. 42, § 1º',url:LAW_9099}
   ])
  }),
  cpc:Object.freeze({
   label:'Processo Civil',
   short:'CPC · Procedimento comum',
   hint:'Prazos processuais em dias: dias úteis, salvo regra específica (CPC, art. 219).',
   source:CPC,
   presets:Object.freeze([
    {id:'custom',label:'Prazo informado pelo usuário',days:null,kind:'custom',category:'Personalizado',description:'Informe a duração e confirme o marco jurídico e a regra especial do caso.',basis:'CPC, arts. 219 e 224 — regra geral',url:CPC},
    {id:'cpc_apelacao',label:'Apelação',days:15,category:'Recursos',description:'Prazo recursal geral; verificar exceções, tempestividade e ciência da decisão.',basis:'CPC, arts. 1.003, § 5º, e 1.009',url:CPC},
    {id:'cpc_contrarrazoes',label:'Contrarrazões à apelação',days:15,category:'Recursos',description:'Quinze dias após intimação do apelado; verificar procedimentos especiais.',basis:'CPC, art. 1.010, § 1º',url:CPC},
    {id:'cpc_embargos',label:'Embargos de declaração',days:5,category:'Recursos',description:'Prazo geral de cinco dias; conferir a decisão e efeitos sobre outros recursos.',basis:'CPC, art. 1.023',url:CPC},
    {id:'cpc_agravo_instrumento',label:'Agravo de instrumento',days:15,category:'Recursos',description:'Verificar cabimento e termo inicial do agravo.',basis:'CPC, arts. 1.003, § 5º, e 1.015',url:CPC},
    {id:'cpc_agravo_interno',label:'Agravo interno',days:15,category:'Recursos',description:'Prazo geral de quinze dias; observar regimento e cabimento.',basis:'CPC, arts. 1.003, § 5º, e 1.021',url:CPC},
    {id:'cpc_resposta_agravo',label:'Resposta ao agravo interno',days:15,category:'Recursos',description:'Prazo de quinze dias ao agravado, conforme intimação.',basis:'CPC, art. 1.021, § 2º',url:CPC},
    {id:'cpc_recursos_superiores',label:'Recurso especial ou extraordinário',days:15,category:'Recursos',description:'Prazo recursal geral; verificar admissibilidade, hipóteses próprias e marcos.',basis:'CPC, arts. 1.003, § 5º, e 1.029',url:CPC},
    {id:'cpc_contestacao',label:'Contestação',days:15,category:'Defesa',description:'Quinze dias, mas o termo inicial depende das hipóteses do art. 335 e da modalidade de citação.',basis:'CPC, art. 335',url:CPC},
    {id:'cpc_replica_fatos',label:'Réplica — fatos impeditivos/modificativos/extintivos',days:15,category:'Defesa',description:'Quando alegados fatos previstos no art. 350; depende da intimação.',basis:'CPC, art. 350',url:CPC},
    {id:'cpc_replica_preliminar',label:'Réplica — preliminares',days:15,category:'Defesa',description:'Manifestação do autor sobre matérias do art. 337, quando determinada.',basis:'CPC, art. 351',url:CPC},
    {id:'cpc_emenda_inicial',label:'Emenda da petição inicial',days:15,category:'Petição inicial',description:'Correção ou complementação indicada pelo juiz; verifique a determinação.',basis:'CPC, art. 321',url:CPC},
    {id:'cpc_pagamento_523',label:'Pagamento voluntário — cumprimento de sentença',days:15,category:'Cumprimento',description:'Prazo de pagamento após intimação na hipótese do art. 523; confirmar natureza da obrigação.',basis:'CPC, art. 523, caput',url:CPC},
    {id:'cpc_impugnacao_525',label:'Impugnação ao cumprimento de sentença',days:15,category:'Cumprimento',description:'Prazo após transcurso do art. 523 sem pagamento; não confundir com a data de intimação original.',basis:'CPC, art. 525, caput',url:CPC},
    {id:'cpc_pagamento_829',label:'Pagamento na execução extrajudicial',days:3,category:'Execução',description:'Três dias após citação na execução por quantia certa; confirmar procedimento e título.',basis:'CPC, art. 829, caput',url:CPC},
    {id:'cpc_embargos_execucao',label:'Embargos à execução',days:15,category:'Execução',description:'Contagem na forma do art. 915 e seus marcos específicos; não confundir com impugnação.',basis:'CPC, art. 915',url:CPC},
    {id:'cpc_impugnacao_monitoria',label:'Embargos à ação monitória',days:15,category:'Procedimentos especiais',description:'Prazo dos embargos ao mandado monitório; conferir citação e decisão.',basis:'CPC, arts. 701 e 702',url:CPC},
    {id:'cpc_manifestacao_laudo',label:'Manifestação sobre laudo pericial',days:15,category:'Provas',description:'Manifestação das partes sobre laudo após intimação; observar decisão ou regra específica.',basis:'CPC, art. 477, § 1º',url:CPC},
    {id:'cpc_tutela',label:'Cumprimento de tutela ou decisão específica',days:null,kind:'manual',category:'Diligências',description:'Não existe duração geral única. Confira o comando judicial, destinatário e intimação.',basis:'Decisão judicial; CPC, arts. 297 e 536',url:CPC},
    {id:'cpc_manifestacao_generica',label:'Manifestação determinada pelo juízo',days:null,kind:'manual',category:'Diligências',description:'Conferir despacho e regra eventualmente aplicável; não impor 15 dias automaticamente.',basis:'CPC, arts. 218 e 224; decisão',url:CPC},
    {id:'cpc_ato_especial',label:'Ato em procedimento especial',days:null,kind:'manual',category:'Procedimentos especiais',description:'Prazo dependente de legislação especial, decisão e circunstâncias processuais.',basis:'Legislação especial e decisão judicial',url:CPC}
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
  const list=$('rafActList'),count=$('rafActCount'),alertBox=$('rafActAlert'),referenceBtn=$('rafConditionalApply');
  if(!list||!count||!alertBox||!referenceBtn)return;
  let referenceAccepted=false;
  const presetStatus=item=>item.kind==='hours'?'48 horas · não calculado':item.kind==='conditional'?item.referenceDays+' dias · condicionado':item.kind==='procedural'?'Conferir audiência/rito':item.kind==='manual'?'Prazo nos autos':item.days===null?'Definir prazo':item.days+' dias úteis';
  const classLabel=item=>item.kind==='conditional'?'Prazo condicionado ao procedimento':item.kind==='procedural'?'Prazo condicionado à audiência/rito':item.kind==='manual'?'Prazo definido nos autos':item.kind==='hours'?'Prazo especial em horas':item.kind==='custom'?'Prazo informado pelo usuário':'Prazo legal definido';
  const create=(tag,className,value)=>{
   const node=document.createElement(tag);
   if(className)node.className=className;
   if(value!==undefined)node.textContent=value;
   return node;
  };
  const groupOrder=['Recursos','Defesa','Petição inicial','Cumprimento','Execução','Procedimentos especiais','Provas','Diligências','Personalizado'];
  const buildActs=requested=>{
   const data=configurations[validRegime(regime.value)];
   act.replaceChildren();
   for(const item of data.presets){
    const option=document.createElement('option');
    option.value=item.id;
    option.textContent=item.label;
    act.append(option);
   }
   act.value=data.presets.some(x=>x.id===requested)?requested:'custom';
  };
  // Toda a biblioteca é apresentada imediatamente, em seções abertas.
  // A marcação estática em HTML permanece como fallback durante a carga do JS.
  const renderList=()=>{
   const data=configurations[validRegime(regime.value)];
   const groups=groupOrder.filter(category=>data.presets.some(item=>(item.category||'Outros')===category));
   list.replaceChildren();
   count.textContent=data.presets.length+' opções · '+(regime.value==='jec'?'JEC':'CPC');
   for(const category of groups){
    const matches=data.presets.filter(item=>(item.category||'Outros')===category);
    const section=create('section','raf-library-group');
    section.dataset.category=category;
    const heading=create('h3','raf-library-group-title',category);
    heading.append(create('span','',String(matches.length)));
    section.append(heading);
    for(const item of matches){
     const button=create('button','raf-library-item');
     button.type='button';
     button.dataset.preset=item.id;
     button.setAttribute('aria-pressed',String(item.id===act.value));
     const copy=create('span','raf-library-item-copy');
     copy.append(create('strong','',item.label),create('small','',item.basis));
     const duration=create('span','raf-library-item-time',presetStatus(item));
     if(item.days===null)duration.dataset.unknown='true';
     duration.dataset.kind=item.kind||'fixed';
     button.append(copy,duration);
     button.addEventListener('click',()=>{
      act.value=item.id;
      referenceAccepted=false;
      days.value=item.days===null?'':String(item.days);
      days.dispatchEvent(new Event('input',{bubbles:true}));
      refresh();
      renderList();
     });
     section.append(button);
    }
    list.append(section);
   }
  };
  const updateView=()=>{
   const r=configurations[validRegime(regime.value)],selected=byId(regime.value,act.value);
   const summary=$('rafRuleSummary'),description=$('rafActDescription'),link=$('rafRuleLink');
   $('rafRegimeCaption').textContent=r.hint;
   summary.textContent=r.short+' · '+classLabel(selected)+' · '+presetStatus(selected);
   description.textContent=selected.description;
   $('rafActBasis').textContent=selected.basis;
   link.href=selected.url;
   $('rafOriginGuidance').textContent=communications[origin.value]?.message||communications.conferido.message;
   $('rafSourceGuidance').href=origin.value==='djen'||origin.value==='pessoal'?CNJ:validRegime(regime.value)==='jec'?LAW_9099:CPC;
   $('rafSourceGuidance').textContent=origin.value==='djen'||origin.value==='pessoal'?'Consultar normas do CNJ ↗':'Consultar fundamento legal ↗';
   $('rafContextResult').textContent=(regime.value==='jec'?'JEC':'CPC')+' · '+(selected.id==='custom'?'Prazo informado':selected.label);
   $('rafProfileShort').textContent=(regime.value==='jec'?'JEC':'CPC')+' · '+(selected.id==='custom'?'Prazo personalizado':selected.label);
   $('rafProfileSub').textContent=selected.id==='custom'?'Personalizar procedimento e ato':presetStatus(selected)+' · '+selected.basis;
   const requiresReview=['manual','procedural','conditional','hours'].includes(selected.kind);
   alertBox.hidden=!requiresReview;
   referenceBtn.hidden=selected.kind!=='conditional'||referenceAccepted;
   if(selected.kind==='hours')alertBox.textContent='Prazo em horas: este motor não calcula o vencimento. Verifique interposição, horário e regras de preparo.';
   else if(selected.kind==='conditional')alertBox.textContent=(referenceAccepted?'Referência adotada por escolha do usuário. ':'Referência ainda não aplicada. ')+selected.description;
   else if(selected.kind==='procedural')alertBox.textContent='Ato sujeito ao rito/audiência: '+selected.description+' Se houver período fixado nos autos, informe-o manualmente.';
   else if(selected.kind==='manual')alertBox.textContent='Prazo conforme os autos: '+selected.description+' Informe os dias somente após conferir a decisão/intimação.';
   else alertBox.textContent='';
   referenceBtn.textContent=selected.kind==='conditional'?'Usar '+selected.referenceDays+' dias após conferir a hipótese':'';
   referenceBtn.disabled=selected.kind!=='conditional';
   const inactiveHours=$('rafSpecialDeadline');
   inactiveHours.hidden=selected.id!=='jec_recurso'&&selected.kind!=='hours';
   days.disabled=selected.kind==='hours';
   if(selected.kind==='hours')days.setAttribute('aria-label','Prazo especial em horas: contagem de dias desativada');
   else days.setAttribute('aria-label','Duração do prazo em dias úteis');
   $('sourceFoot').textContent=regime.value==='jec'?'Fonte legal: Lei 9.099/95, art. 12-A · normas subsidiárias quando aplicáveis':'Fonte legal: CPC, arts. 219, 220 e 224';
   window.RafPrazo22Current=Object.freeze({
    regime:regime.value,regime_label:r.label,preset:selected.id,act_label:selected.label,
    days:days.value.trim()===''?null:Number(days.value),basis:selected.basis,source:selected.url,
    preset_kind:selected.kind||'fixed',category:selected.category||'Outros',
    duration_hours:selected.kind==='hours'?selected.duration:null,
    reference_days:selected.kind==='conditional'?selected.referenceDays:null,
    legal_classification:classLabel(selected),
    reference_accepted:!!(selected.kind==='conditional'&&referenceAccepted),
    requires_manual_review:['manual','procedural','conditional','hours'].includes(selected.kind),
    communication:origin.value,communication_label:communications[origin.value].label,
    communication_date:$('rafCommunicationDate').value||null,description:selected.description,
    count_mode:selected.kind==='hours'?'hours_unsupported':'business_days',validated_start:start.value||null
   });
  };
  const refresh=()=>{updateView();safeWrite()};
  buildActs(saved.preset);
  if(act.value!=='custom'){
   const initial=byId(regime.value,act.value);
   days.value=initial.days===null?'':String(initial.days);
   days.dispatchEvent(new Event('input',{bubbles:true}));
  }
  referenceBtn.addEventListener('click',()=>{
   const selected=byId(regime.value,act.value);
   if(selected.kind!=='conditional'||!Number.isSafeInteger(selected.referenceDays))return;
   referenceAccepted=true;
   days.value=String(selected.referenceDays);
   days.dispatchEvent(new Event('input',{bubbles:true}));
   refresh();
   renderList();
  });
  regime.addEventListener('change',()=>{
   referenceAccepted=false;
   const old=byId(regime.value==='jec'?'cpc':'jec',act.value);
   buildActs('custom');
   if(old.id!=='custom')days.value='';
   refresh();
   renderList();
   days.dispatchEvent(new Event('input',{bubbles:true}));
  });
  act.addEventListener('change',()=>{
   referenceAccepted=false;
   const selected=byId(regime.value,act.value);
   days.value=selected.days!==null?String(selected.days):'';
   days.dispatchEvent(new Event('input',{bubbles:true}));
   refresh();
   renderList();
  });
  origin.addEventListener('change',refresh);
  $('rafCommunicationDate').addEventListener('change',refresh);
  days.addEventListener('input',()=>{
   const selected=byId(regime.value,act.value);
   if(selected.kind==='conditional'&&Number(days.value)!==selected.referenceDays)referenceAccepted=false;
   if(selected.kind==='hours'&&days.value.trim()!=='')act.value='custom';
   else if(selected.days!==null&&Number(days.value)!==selected.days)act.value='custom';
   refresh();
   renderList();
  });
  // Os botões de dias do motor legado não emitem input; sincronizar o catálogo ao final do clique.
  $('quick')?.addEventListener('click',event=>{
   if(!event.target.closest('[data-days]'))return;
   act.value='custom';
   referenceAccepted=false;
   refresh();
   renderList();
  });
  start.addEventListener('change',refresh);
  window.addEventListener('raf-prazo:sync',updateView);
  refresh();
  renderList();
 };
 window.RafPrazoLegal22=Object.freeze({configurations,communications,getCurrent:()=>window.RafPrazo22Current||null});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();