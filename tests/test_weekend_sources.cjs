/* Executa o predicado do próprio HTML para sábados/domingos e valida as proteções. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const template=fs.readFileSync(path.join(root,'src','template.html'),'utf8');
const optin=fs.readFileSync(path.join(root,'assets','tjrj-optin.js'),'utf8');
const base=JSON.parse(fs.readFileSync(path.join(root,'feriados.json'),'utf8'));
function predicate(html){
 const m=html.match(/const isWeekendDate=n=>([^;]+);/);
 assert.ok(m,'predicado de fim de semana obrigatório');
 return vm.runInNewContext('(n)=>'+m[1],{MS:86400000,Number,Date});
}
const day=iso=>Math.floor(Date.parse(iso+'T00:00:00Z')/86400000);

test('o próprio predicado distingue sexta, sábado, domingo, segunda e virada de ano',()=>{
 for(const html of [index,template]){
  const weekend=predicate(html);
  for(const date of ['2026-10-17','2026-10-18','2027-01-02','2027-01-03'])assert.equal(weekend(day(date)),true,date);
  for(const date of ['2026-10-16','2026-10-19','2027-01-01','2027-01-04'])assert.equal(weekend(day(date)),false,date);
  assert.equal(weekend(null),false);
 }
});

test('cálculo, escolha no calendário e campo de data recusam finais de semana',()=>{
 for(const html of [index,template]){
  assert.ok(html.includes('let weekendStart=isWeekendDate(start),invalid=start===null||weekendStart'),'Cálculo não pode aceitar marco de final de semana');
  assert.ok(html.includes('chooseStart.disabled=isWeekendDate(n)'),'Botão do calendário deve ser desativado');
  assert.ok(html.includes('chooseStart.onclick=()=>{if(isWeekendDate(n))return;'),'Clique não deve conseguir burlar botão desativado');
  assert.ok(html.includes("if(isWeekendDate(next)){$('start').value=lastValidStart;"),'Campo de data deve recusar');
  assert.ok(html.includes("initial.getDay()===0||initial.getDay()===6"),'Data inicial sugerida deve ser útil na semana');
  assert.ok(html.includes('id="rafStartRule"'),'Instrução visível obrigatória');
  assert.ok(html.includes("btn.addEventListener('click',()=>openDayDetails(n))"),'Ainda deve ser possível consultar o dia');
 }
});

test('ativação local do TJRJ não pode excluir finais de semana duas vezes',()=>{
 assert.ok(optin.includes("const isWeekendDate=date=>"));
 assert.ok(optin.includes('!isWeekendDate(signal.date)&&Array.isArray(signal.references)'));
 const fn=vm.runInNewContext('(date)=>'+optin.match(/const isWeekendDate=date=>([^;]+);/)[1],{Date,Set});
 assert.equal(fn('2026-10-17'),true);
 assert.equal(fn('2026-10-19'),false);
});

test('fontes nacionais usam API mais leis; cobertura estadual e municipal permanece ausente',()=>{
 assert.deepEqual(base.sync.brasilapi_years_checked,[2026,2027,2028]);
 assert.equal(base.coverage.state,'not_applied');
 assert.equal(base.coverage.municipal,'not_applied');
 assert.equal(base.coverage.tjrj,'discovery_only');
 assert.equal(base.events.filter(e=>e.type==='NACIONAL').length,27);
 assert.equal(base.events.filter(e=>e.type==='SUSPENSAO_TJRJ').length,0);
});
