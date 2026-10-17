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
    {id:'custom',label:'Prazo informado pelo usuário',days:null,category:'Personalizado',kind:'custom',description:'Informe a duração determinada nos autos ou prevista em lei. Nenhum prazo será presumido.',basis:'Prazo judicial ou legal informado',url:LAW_9099},
    {id:'jec_recurso',label:'Recurso inominado',days:10,category:'Recursos',description:'Dez dias após a ciência da sentença; confirme a possibilidade de recurso e o marco nos autos.',basis:'Lei 9.099/95, arts. 12-A e 42, caput',url:LAW_9099},
    {id:'jec_resposta',label:'Resposta ao recurso',days:10,category:'Recursos',description:'Dez dias após intimação do recorrido, observado o processamento do recurso.',basis:'Lei 9.099/95, arts. 12-A e 42, § 2º',url:LAW_9099},
    {id:'jec_embargos',label:'Embargos de declaração',days:5,category:'Recursos',description:'Cinco dias após ciência da decisão; observar os efeitos dos embargos sobre outros recursos.',basis:'Lei 9.099/95, arts. 12-A, 49 e 50',url:LAW_9099},
    {id:'jec_contestacao',label:'Contestação / defesa no JEC',days:null,kind:'manual',category:'Defesa',description:'Não há prazo geral de 15 dias automaticamente aplicável à contestação no JEC. Confira citação, audiência e decisão.',basis:'Lei 9.099/95, arts. 27 a 30',url:LAW_9099},
    {id:'jec_manifestacao',label:'Manifestação ou réplica',days:null,kind:'manual',category:'Defesa',description:'Prazo conforme intimação/decisão do juízo; não presumir os 15 dias do CPC.',basis:'Lei 9.099/95, arts. 2º e 30; determinação judicial',url:LAW_9099},
    {id:'jec_cumprimento',label:'Cumprimento de sentença',days:null,kind:'manual',category:'Execução',description:'Conferir intimação e providência exigida. O CPC aplica-se apenas no que couber, sem prazo único universal.',basis:'Lei 9.099/95, art. 52',url:LAW_9099},
    {id:'jec_embargos_execucao',label:'Embargos à execução',days:null,kind:'manual',category:'Execução',description:'Conferir modalidade executiva, garantia e rito aplicável; não presumir prazo do CPC sem análise.',basis:'Lei 9.099/95, arts. 52, IX, e 53',url:LAW_9099},
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
  const search=$('rafActSearch'),categoryBox=$('rafActFilters'),list=$('rafActList'),count=$('rafActCount'),alertBox=$('rafActAlert');
  if(!search||!categoryBox||!list||!count||!alertBox)return;
  let activeCategory='Todos';
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const presetStatus=item=>item.kind==='hours'?'48 horas · não calculável':item.days===null?'Conferir prazo':item.days+' dias úteis';
  const create=(tag,className,value)=>{
   const node=document.createElement(tag);
   if(className)node.className=className;
   if(value!==undefined)node.textContent=value;
   return node;
  };
  const buildActs=(requested)=>{
   const data=configurations[validRegime(regime.value)];
   act.replaceChildren();
   for(const item of data.presets){
    const option=document.createElement('option');option.value=item.id;
    option.textContent=item.label;
    act.append(option);
   }
   act.value=data.presets.some(x=>x.id===requested)?requested:'custom';
   activeCategory='Todos';
   search.value='';
  };
  const renderCategories=()=>{
   categoryBox.replaceChildren();
   const data=configurations[validRegime(regime.value)];
   const categories=['Todos',...new Set(data.presets.map(item=>item.category||'Outros'))];
   for(const name of categories){
    const button=create('button','raf-library-filter',name);
    button.type='button';button.dataset.category=name;
    button.setAttribute('aria-pressed',String(activeCategory===name));
    button.addEventListener('click',()=>{
     activeCategory=name;
     renderCategories();
     renderList();
    });
    categoryBox.append(button);
   }
  };
  const renderList=()=>{
   const data=configurations[validRegime(regime.value)];
   const q=normalize(search.value);
   const matches=data.presets.filter(item=>(activeCategory==='Todos'||(item.category||'Outros')===activeCategory)&&
    (!q||normalize([item.label,item.category,item.basis,item.description].join(' ')).includes(q)));
   list.replaceChildren();
   count.textContent=data.presets.length+' atos · '+matches.length+' exibidos';
   for(const item of matches){
    const button=create('button','raf-library-item');
    button.type='button';button.dataset.preset=item.id;
    const active=item.id===act.value;
    button.setAttribute('aria-pressed',String(active));
    const copy=create('span','raf-library-item-copy');
    copy.append(create('strong','',item.label),create('small','',item.basis));
    const label=create('span','raf-library-item-time',presetStatus(item));
    if(item.days===null)label.dataset.unknown='true';
    button.append(copy,label);
    button.addEventListener('click',()=>{
     act.value=item.id;
     const previous=days.value;
     if(item.days!==null){
      days.value=String(item.days);
     }else if(item.id!=='custom'||previous.trim()===''){
      days.value='';
     }
     days.dispatchEvent(new Event('input',{bubbles:true}));
     refresh();
     renderList();
    });
    list.append(button);
   }
   if(!matches.length)list.append(create('p','raf-library-empty','Nenhum ato encontrado. Tente outro termo ou escolha a categoria Todos.'));
  };
  const updateView=()=>{
   const r=configurations[validRegime(regime.value)],selected=byId(regime.value,act.value);
   const summary=$('rafRuleSummary'),description=$('rafActDescription'),link=$('rafRuleLink');
   $('rafRegimeCaption').textContent=r.hint;
   summary.textContent=r.short+' · '+(selected.kind==='hours'?'prazo especial em horas — não calculado':selected.kind==='manual'?'prazo a conferir na decisão':selected.days===null?'prazo definido pelo usuário':selected.days+' dias úteis');
   description.textContent=selected.description;
   $('rafActBasis').textContent=selected.basis;
   link.href=selected.url;
   $('rafOriginGuidance').textContent=communications[origin.value]?.message||communications.conferido.message;
   $('rafSourceGuidance').href=origin.value==='djen'||origin.value==='pessoal'?CNJ:validRegime(regime.value)==='jec'?LAW_9099:CPC;
   $('rafSourceGuidance').textContent=origin.value==='djen'||origin.value==='pessoal'?'Consultar normas do CNJ ↗':'Consultar fundamento legal ↗';
   $('rafContextResult').textContent=(regime.value==='jec'?'JEC':'CPC')+' · '+(selected.id==='custom'?'Prazo informado':selected.label);
   $('rafProfileShort').textContent=(regime.value==='jec'?'JEC':'CPC')+' · '+(selected.id==='custom'?'Prazo personalizado':selected.label);
   $('rafProfileSub').textContent=selected.id==='custom'?'Personalizar procedimento e ato':presetStatus(selected)+' · '+selected.basis;
   if(selected.kind==='hours'){
    alertBox.hidden=false;
    alertBox.textContent='Atenção: este prazo é expresso em horas e não pode ser calculado pelo motor de dias úteis. Verifique a interposição e as regras de preparo.';
   }else if(selected.kind==='manual'){
    alertBox.hidden=false;
    alertBox.textContent='Este ato depende da decisão, intimação ou modalidade processual. Preencha manualmente a duração no campo Prazo após conferir os autos.';
   }else{
    alertBox.hidden=true;
    alertBox.textContent='';
   }
   const inactiveHours=$('rafSpecialDeadline');
   inactiveHours.hidden=selected.id!=='jec_recurso'&&selected.kind!=='hours';
   $('sourceFoot').textContent=regime.value==='jec'?'Fonte legal: Lei 9.099/95, art. 12-A · normas subsidiárias quando aplicáveis':'Fonte legal: CPC, arts. 219, 220 e 224';
   window.RafPrazo22Current=Object.freeze({
    regime:regime.value,regime_label:r.label,preset:selected.id,act_label:selected.label,
    days:days.value.trim()===''?null:Number(days.value),basis:selected.basis,source:selected.url,
    preset_kind:selected.kind||'fixed',category:selected.category||'Outros',
    duration_hours:selected.kind==='hours'?selected.duration:null,
    requires_manual_review:!!(selected.kind==='manual'||selected.kind==='hours'),
    communication:origin.value,communication_label:communications[origin.value].label,
    communication_date:$('rafCommunicationDate').value||null,description:selected.description,
    count_mode:'business_days',validated_start:start.value||null
   });
  };
  const refresh=()=>{updateView();safeWrite()};
  buildActs(saved.preset);
  search.addEventListener('input',renderList);
  if(act.value!=='custom'){
   days.value=byId(regime.value,act.value).days;
   days.dispatchEvent(new Event('input',{bubbles:true}));
  }
  regime.addEventListener('change',()=>{
   buildActs('custom');
   refresh();
   renderCategories();
   renderList();
   days.dispatchEvent(new Event('input',{bubbles:true}));
  });
  act.addEventListener('change',()=>{
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
   if(selected.days!==null&&Number(days.value)!==selected.days)act.value='custom';
   refresh();
   renderList();
  });
  // Os botões de dias do motor legado não emitem input; sincronizar o catálogo ao final do clique.
  $('quick')?.addEventListener('click',event=>{
   if(!event.target.closest('[data-days]'))return;
   act.value='custom';
   refresh();
   renderList();
  });
  start.addEventListener('change',refresh);
  window.addEventListener('raf-prazo:sync',updateView);
  refresh();
  renderCategories();
  renderList();
 };
 window.RafPrazoLegal22=Object.freeze({configurations,communications,getCurrent:()=>window.RafPrazo22Current||null});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();