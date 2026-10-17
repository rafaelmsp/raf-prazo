/* Raf-Prazo 2.2: presets, separação da data informativa e memória. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(ROOT,'assets/raf-prazo-22.js'),'utf8');
class Node {
 constructor(id){this.id=id;this.value='';this.textContent='';this.href='';this.hidden=false;this.children=[];this.listeners={};this.className='';this.open=false;this.focused=false;this.dataset={};this.attributes={};this.type='';}
 replaceChildren(...items){this.children=[...items]}
 append(...items){this.children.push(...items)}
 addEventListener(type,callback){this.listeners[type]=callback}
 setAttribute(k,v){this.attributes[k]=String(v)}
 getAttribute(k){return this.attributes[k]??null}
 dispatchEvent(event){this.listeners[event.type]?.(event);return true}
 trigger(name){this.listeners[name]?.({target:this})}
 showModal(){this.open=true}
 close(){this.open=false;this.listeners.close?.()}
 focus(){this.focused=true}
 closest(name){return name==='[data-days]'?this:null}
}
const ids=['rafRegime','rafAct','rafOrigin','days','start','rafRegimeCaption','rafRuleSummary','rafActDescription','rafActBasis','rafRuleLink','rafOriginGuidance','rafSourceGuidance','rafContextResult','rafSpecialDeadline','rafCommunicationDate','sourceFoot','quick','rafProfileOpen','rafProfileDialog','rafProfileShort','rafProfileSub','rafActList','rafActCount','rafActAlert','rafConditionalApply'];
const nodes=Object.fromEntries(ids.map(id=>[id,new Node(id)]));
nodes.rafRegime.value='jec';nodes.rafOrigin.value='conferido';nodes.start.value='2026-10-19';nodes.days.value='15';
const storage=new Map();const windowStub={addEventListener(){}};
const doc={readyState:'complete',getElementById:id=>nodes[id]||null,createElement:()=>new Node('option')};
class Event{constructor(type){this.type=type}}
vm.runInNewContext(code,{document:doc,window:windowStub,
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},Event,Map,Set,JSON,Object,Array,Date});
const metadata=()=>windowStub.RafPrazoLegal22.getCurrent();
const cards=()=>nodes.rafActList.children.flatMap(group=>group.children.filter(c=>c.className==='raf-library-item'));
const groups=()=>nodes.rafActList.children.map(g=>g.dataset.category);
test('restaura cores históricas do calendário, com azul PJe apenas no cabeçalho',()=>{
 for(const file of ['index.html','src/template.html']){
  const html=fs.readFileSync(path.join(ROOT,file),'utf8');
  assert.ok(html.includes('--raf-holiday-bg:#f9e0e2'));
  assert.ok(html.includes('--raf-susp-bg:#ffefcc'));
  assert.ok(html.includes('--raf-recess-bg:#eee3fc'));
  assert.ok(html.includes('--raf-manual-bg:#dff2ee'));
  assert.ok(html.includes('--raf-holiday-bg:#542a35'),'Tema escuro restaurado');
  assert.ok(!html.includes('--calendar-pje-blue'),'Azul PJe não deve sobrescrever estados do calendário');
  assert.ok(html.includes('--pje-header:#1261a0'));
  assert.ok(html.includes('.header{background:var(--pje-header)'));
  assert.ok(html.includes('id="calendar"'));
  assert.ok(html.includes('aspect-ratio:1/1'));
  assert.ok(html.includes("btn.dataset.eventKind=category"));
 }
});
test('UX Premium 2.3 elimina o vencimento duplicado e mantém conferência do dia independente da regra jurídica',()=>{
 for(const target of ['src/template.html','index.html']){
  const html=fs.readFileSync(path.join(ROOT,target),'utf8');
  for(const id of ['rafDayFocus','rafDayFocusDate','rafDayFocusWeekday','rafDayFocusStatus','rafDayFocusNote','rafDayFocusDetails']){
   assert.ok(html.includes('id="'+id+'"'),'Faltou o campo do dia: '+id);
  }
  assert.ok(!html.includes('id="calendarDue"'),'Vencimento não deve ser repetido no calendário');
  assert.ok(!html.includes('id="calendarWeekday"'),'Dia da semana não deve ser duplicado');
  assert.ok(!html.includes("topDue=document.getElementById('calendarDue')"),'Observer obsoleto do vencimento duplicado');
  assert.ok(html.includes('raf-23-calendar-layout'));
  assert.ok(html.includes('raf-23-calendar-main'));
  assert.ok(html.includes('rafFocusedDay'));
  assert.ok(html.includes('updateRafDayFocus(focus)'));
  assert.ok(html.includes("btn.dataset.rafDay=String(n)"));
  assert.ok(html.includes('grid-template-columns:minmax(0,44fr) minmax(0,56fr)'));
  assert.ok(html.includes('@media (max-width:740px){'));
  assert.ok(html.includes('.raf-23-day-focus{display:none}'));
  assert.ok(html.includes("legal_profile:window.RafPrazo22Current||null"));
  assert.ok(html.includes('id="rafTabTjrj"'));
 }
});
test('desktop usa vencimento/parâmetros à esquerda e calendário à direita',()=>{
 for(const file of ['index.html','src/template.html']){
  const html=fs.readFileSync(path.join(ROOT,file),'utf8');
  assert.ok(html.includes('@media (min-width:1061px){'),'Breakpoints desktop necessários');
  assert.ok(html.includes('.workspace>.raf-22-parameters{grid-column:1;grid-row:2}'));
  assert.ok(html.includes('.workspace>.raf-22-results{grid-column:1;grid-row:1}'));
  assert.ok(html.includes('.workspace>.raf-22-calendar{grid-column:2;grid-row:1 / span 3;align-self:start}'));
  assert.ok(html.includes('@media (max-width:740px){'),'Layout do celular preservado');
 }
});
test('resultado acima dos parâmetros e calendário sem expansão artificial',()=>{
 for(const file of ['index.html','src/template.html']){
  const html=fs.readFileSync(path.join(ROOT,file),'utf8');
  const start=html.indexOf('<div class="workspace">');
  const result=html.indexOf('<section class="panel raf-22-results"',start);
  const params=html.indexOf('<section class="panel raf-22-parameters"',start);
  const calendar=html.indexOf('<section class="panel raf-22-calendar"',start);
  const verification=html.indexOf('<section class="panel raf-22-verification"',start);
  assert.ok(start>=0&&start<result&&result<params&&params<calendar&&calendar<verification);
  assert.ok(html.includes('id="rafCalendarSettings"'));
  assert.ok(html.includes('raf-22-primary-date'));
  assert.ok(html.includes('.raf-22-calendar #calendar{'));
  assert.ok(html.includes('aspect-ratio:7/6'));
  assert.ok(html.includes('aspect-ratio:1/1'));
  assert.ok(html.includes('height:54px!important'));
  assert.ok(html.includes('id="rafProfileDialog"'));
  assert.ok(html.includes('id="rafTjrjNewsMount"'));
  assert.ok(html.includes("legal_profile:window.RafPrazo22Current||null"));
 }
});
test('JEC é padrão e prazo inicial manual não inventa ato',()=>{
 assert.equal(nodes.rafRegime.value,'jec');
 assert.equal(nodes.rafAct.value,'custom');
 assert.equal(nodes.days.value,'15');
 assert.equal(metadata().regime,'jec');
 assert.equal(metadata().count_mode,'business_days');
 assert.equal(nodes.rafSpecialDeadline.hidden,true);
 assert.ok(nodes.rafRuleSummary.textContent.includes('JEC'));
 assert.ok(nodes.rafProfileShort.textContent.includes('JEC'));
 assert.equal(cards().length,13,'Todos os 13 atos JEC devem estar disponíveis sem pesquisa');
 assert.ok(groups().includes('Recursos'));
 assert.ok(groups().includes('Execução'));
 assert.equal(nodes.rafActCount.textContent,'13 opções · JEC');
 assert.ok(cards().every(x=>x.children.length===2),'Cada ato deve mostrar fundamento e duração');
 nodes.rafProfileOpen.trigger('click');
 assert.equal(nodes.rafProfileDialog.open,true);
 nodes.rafProfileDialog.close();
 assert.equal(nodes.rafProfileDialog.open,false);
});
test('recurso do JEC define exatamente 10 dias e lei',()=>{
 nodes.rafAct.value='jec_recurso';nodes.rafAct.trigger('change');
 assert.equal(Number(nodes.days.value),10);
 assert.equal(nodes.rafSpecialDeadline.hidden,false);
 assert.equal(metadata().basis,'Lei 9.099/95, arts. 12-A e 42, caput');
 assert.ok(metadata().source.startsWith('https://www.planalto.gov.br/'));
});
test('embargos de declaração JEC definem 5 dias',()=>{
 nodes.rafAct.value='jec_embargos';nodes.rafAct.trigger('change');
 assert.equal(Number(nodes.days.value),5);
 assert.equal(nodes.rafSpecialDeadline.hidden,true);
 assert.equal(metadata().preset,'jec_embargos');
 assert.ok(nodes.rafProfileShort.textContent.includes('Embargos'));
});
test('modificação manual rompe preset e preserva número informado',()=>{
 nodes.days.value='9';nodes.days.trigger('input');
 assert.equal(nodes.rafAct.value,'custom');
 assert.equal(metadata().days,9);
});
test('todos os atos aparecem prontamente, ordenados por categorias',()=>{
 assert.equal(cards().length,13);
 assert.equal(nodes.rafActList.children[0].dataset.category,'Recursos');
 assert.ok(cards().some(x=>x.dataset.preset==='jec_preparo'));
 assert.ok(cards().some(x=>x.dataset.preset==='jec_embargos_titulo_judicial'));
 assert.ok(cards().some(x=>x.dataset.preset==='jec_embargos_titulo_extrajudicial'));
 assert.ok(cards().some(x=>x.dataset.preset==='jec_cumprimento_pagar'));
 assert.ok(cards().some(x=>x.dataset.preset==='custom'));
});
test('FONAJE 142: referência de 15 dias não se aplica sem confirmação',()=>{
 const entry=cards().find(x=>x.dataset.preset==='jec_embargos_titulo_judicial');
 assert.ok(entry);
 entry.trigger('click');
 assert.equal(nodes.rafAct.value,'jec_embargos_titulo_judicial');
 assert.equal(nodes.days.value,'');
 assert.equal(metadata().days,null);
 assert.equal(metadata().reference_days,15);
 assert.equal(metadata().reference_accepted,false);
 assert.equal(metadata().requires_manual_review,true);
 assert.equal(nodes.rafConditionalApply.hidden,false);
 assert.ok(nodes.rafActAlert.textContent.includes('penhora'));
 nodes.rafConditionalApply.trigger('click');
 assert.equal(nodes.days.value,'15');
 assert.equal(metadata().reference_accepted,true);
 assert.equal(metadata().reference_days,15);
 assert.equal(nodes.rafConditionalApply.hidden,true);
 assert.ok(metadata().basis.includes('Enunciados 117, 121 e 142'));
});
test('título extrajudicial usa audiência, não herda prazo judicial de 15 dias',()=>{
 const entry=cards().find(x=>x.dataset.preset==='jec_embargos_titulo_extrajudicial');
 entry.trigger('click');
 assert.equal(nodes.days.value,'');
 assert.equal(metadata().reference_days,null);
 assert.equal(metadata().preset_kind,'procedural');
 assert.equal(nodes.rafConditionalApply.hidden,true);
 assert.ok(metadata().description.includes('audiência de conciliação'));
});
test('cumprimento de pagar: CPC 523 exige seleção explícita',()=>{
 const item=cards().find(x=>x.dataset.preset==='jec_cumprimento_pagar');
 item.trigger('click');
 assert.equal(nodes.days.value,'');
 assert.equal(metadata().reference_days,15);
 assert.equal(nodes.rafConditionalApply.hidden,false);
 assert.ok(metadata().basis.includes('CPC, art. 523'));
 nodes.rafConditionalApply.trigger('click');
 assert.equal(nodes.days.value,'15');
 const other=cards().find(x=>x.dataset.preset==='jec_cumprimento_fazer');
 other.trigger('click');
 assert.equal(nodes.days.value,'');
 assert.equal(metadata().preset_kind,'manual');
 assert.equal(nodes.rafConditionalApply.hidden,true);
});

test('prazo dependente de decisão não recebe prazo automático',()=>{
 const manual=cards().find(x=>x.dataset.preset==='jec_contestacao');
 assert.ok(manual);
 manual.trigger('click');
 assert.equal(nodes.rafAct.value,'jec_contestacao');
 assert.equal(nodes.days.value,'');
 assert.equal(metadata().days,null);
 assert.equal(metadata().requires_manual_review,true);
 assert.equal(nodes.rafActAlert.hidden,false);
 nodes.days.value='12';nodes.days.trigger('input');
 assert.equal(nodes.rafAct.value,'jec_contestacao');
 assert.equal(metadata().days,12);
});
test('preparo em horas não é transformado em dias úteis',()=>{
 const button=cards().find(x=>x.dataset.preset==='jec_preparo');
 assert.ok(button);
 button.trigger('click');
 assert.equal(nodes.rafAct.value,'jec_preparo');
 assert.equal(nodes.days.value,'');
 assert.equal(metadata().days,null);
 assert.equal(metadata().duration_hours,48);
 assert.equal(metadata().count_mode,'hours_unsupported');
 assert.equal(nodes.rafSpecialDeadline.hidden,false);
});
test('CPC tem catálogo separado e não herda um ato JEC',()=>{
 nodes.rafRegime.value='cpc';nodes.rafRegime.trigger('change');
 assert.equal(nodes.rafAct.value,'custom');
 assert.equal(metadata().regime,'cpc');
 assert.ok(nodes.rafRuleSummary.textContent.includes('CPC'));
 assert.equal(nodes.rafSpecialDeadline.hidden,true);
 assert.equal(cards().length,21,'Todos os 21 atos CPC disponíveis diretamente');
 assert.equal(nodes.rafActCount.textContent,'21 opções · CPC');
 assert.ok(groups().includes('Cumprimento'));
 nodes.rafAct.value='cpc_apelacao';nodes.rafAct.trigger('change');
 assert.equal(Number(nodes.days.value),15);
 assert.equal(metadata().basis,'CPC, arts. 1.003, § 5º, e 1.009');
});
test('data de registro e origem não calculam ciência automaticamente',()=>{
 const before=nodes.start.value;
 nodes.rafOrigin.value='pessoal';nodes.rafOrigin.trigger('change');
 nodes.rafCommunicationDate.value='2026-10-18';nodes.rafCommunicationDate.trigger('change');
 assert.equal(nodes.start.value,before);
 assert.equal(metadata().communication_date,'2026-10-18');
 assert.ok(nodes.rafOriginGuidance.textContent.includes('não é necessariamente'));
 assert.ok(nodes.rafSourceGuidance.href.includes('cnj.jus.br'));
});
test('preferências persistem somente em chave isolada',()=>{
 const stored=JSON.parse(storage.get('raf-prazo:juridical-profile:v1'));
 assert.deepEqual(Object.keys(stored).sort(),['origin','preset','regime','version']);
 assert.equal(stored.regime,'cpc');assert.equal(stored.origin,'pessoal');
 assert.equal(storage.has('raf-prazo:tjrj-exclusions-user:v1'),false);
 assert.equal(storage.has('raf-prazo:exclusoes-individuais:v1'),false);
});
for(const target of ['src/template.html','index.html']){
 const html=fs.readFileSync(path.join(ROOT,target),'utf8');
 test('integração do catálogo e memória em '+target,()=>{
  for(const id of ['rafRegime','rafAct','rafRuleSummary','rafOrigin','rafCommunicationDate','rafContextResult' ,'rafActList','rafActAlert'])
   assert.ok(html.includes('id="'+id+'"'),'Faltou '+id);
  assert.ok(html.includes('src="assets/raf-prazo-22.js?v=2.2.5"'));
  assert.ok(html.includes("legal_profile:window.RafPrazo22Current||null"));
  assert.ok(html.includes('id="rafEmbeddedBase"'));
  assert.ok(html.includes("if(scope.kind==='tjrj')continue"));
  assert.ok(html.includes('id="rafTabPending"'));
  assert.ok(html.includes('.raf-library-native-hidden{display:none!important}'));
  assert.ok(html.includes('id="rafActCount"'));
  assert.ok(html.includes('id="rafConditionalApply"'));
  assert.ok(html.includes('data-preset="jec_embargos_titulo_judicial"'));
  assert.ok(html.includes('data-preset="jec_embargos_titulo_extrajudicial"'));
  assert.ok(html.includes('data-preset="jec_cumprimento_pagar"'));
  assert.ok(html.includes('raf-library-legend'));
  assert.ok(!html.includes('data-preset="jec_embargos_execucao"'));
  assert.ok(!html.includes('data-preset="jec_cumprimento"'));
  assert.ok(!html.includes('id="rafActSearch"'),'Pesquisa não deve ocupar tela');
  assert.ok(!html.includes('id="rafActFilters"'),'Filtros não devem ocultar atos');
  assert.ok(html.includes('data-regime="jec"'));
  assert.ok(html.includes('data-regime="cpc"'));
  assert.ok(html.includes('data-preset="jec_recurso"'));
  assert.ok(html.includes('data-preset="cpc_apelacao"'));
  assert.ok(html.includes('assets/raf-prazo-22.js?v=2.2.5'));
  const left=html.slice(html.indexOf('<section class="panel raf-22-parameters"'),html.indexOf('<section class="panel raf-22-calendar"'));
  assert.ok(left.includes('id="rafProfileOpen"'));
  assert.ok(!left.includes('id="rafRegime"'),'Os seletores não devem esticar o painel de parâmetros');
  assert.ok(!left.includes('id="rafRuleBox"'),'O quadro legal não deve ficar no painel esquerdo');
  const drawer=html.slice(html.indexOf('<dialog id="rafProfileDialog"'),html.indexOf('<dialog id="rafDayDialog"'));
  for(const id of ['rafRegime','rafAct','rafRuleBox','rafCommunicationDetails','rafProfileDone'])assert.ok(drawer.includes('id="'+id+'"'),'Drawer deve conter '+id);
  assert.ok(!html.includes('min-height:750px'),'Remover altura artificial de 750px');
  assert.ok(html.includes('.raf-22-drawer::backdrop'));
  assert.ok(html.includes('raf-22-drawer-footer'));
  
 });
}
