/* Testa o código real de filtragem e contagem de feriados RJ/Caxias. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'feriados.json'),'utf8'));
const src=fs.readFileSync(path.join(root,'index.html'),'utf8');
const extract=(start,end)=>{
  const i=src.indexOf(start);
  assert.ok(i>=0,start);
  const j=src.indexOf(end,i+start.length);
  assert.ok(j>=0,end);
  return src.slice(i,j);
};
const code=extract('function baseEvent(n){','function localLegalEvent(n){');
function evaluate(date,options={}){
 const p={uf:options.uf||'RJ',city:options.city||'3301702',cityName:'Duque de Caxias'};
 const useLocal=options.useLocal||false;
 const sandbox={baseData:data,sel:()=>p,iso:n=>new Date(n*86400000).toISOString().slice(0,10),
   $:id=>({checked:useLocal}),Date};
 const fn=vm.runInNewContext('('+code.trim()+')',sandbox);
 return fn(Math.floor(Date.parse(date+'T00:00:00Z')/86400000));
}
const eventDate=(date,opts)=>evaluate(date,opts)?.type||null;
test('feriados legais RJ/Caxias somente se habilitados',()=>{
 assert.equal(eventDate('2026-02-17'),null);
 assert.equal(eventDate('2026-02-17',{useLocal:true}),'ESTADUAL');
 assert.equal(eventDate('2026-04-23',{useLocal:true}),'ESTADUAL');
 assert.equal(eventDate('2026-06-04',{useLocal:true}),'ESTADUAL');
 assert.equal(eventDate('2026-04-03',{useLocal:true}),'MUNICIPAL');
 assert.equal(eventDate('2026-06-13',{useLocal:true}),'MUNICIPAL');
});
test('feriados estaduais valem no RJ mas municipais somente Caxias',()=>{
 assert.equal(eventDate('2026-02-17',{uf:'RJ',city:'3304557',useLocal:true}),'ESTADUAL');
 assert.equal(eventDate('2026-04-03',{uf:'RJ',city:'3304557',useLocal:true}),null);
 assert.equal(eventDate('2026-02-17',{uf:'SP',city:'3550308',useLocal:true}),null);
 assert.equal(eventDate('2026-04-03',{uf:'SP',city:'3550308',useLocal:true}),null);
 assert.equal(eventDate('2026-05-01',{uf:'SP',city:'3550308',useLocal:false}),'NACIONAL');
});
test('25 agosto e 28 outubro não são feriados automáticos',()=>{
 for(const date of ['2026-08-25','2026-10-28','2026-12-31'])
  assert.equal(eventDate(date,{useLocal:true}),null,date);
});
test('2027 e 2028 calculados pela Páscoa, sem data fixa inventada',()=>{
 const settings={useLocal:true};
 assert.equal(eventDate('2027-02-09',settings),'ESTADUAL');
 assert.equal(eventDate('2027-03-26',settings),'MUNICIPAL');
 assert.equal(eventDate('2027-05-27',settings),'ESTADUAL');
 assert.equal(eventDate('2028-02-29',settings),'ESTADUAL');
 assert.equal(eventDate('2028-04-14',settings),'MUNICIPAL');
 assert.equal(eventDate('2028-06-15',settings),'ESTADUAL');
});
test('interface avisa sobre a aplicabilidade forense e mantém desativado por padrão',()=>{
 assert.ok(src.includes('<input type="checkbox" id="useLocal"><span id="rafUseLocalLabel">'));
 assert.ok(src.includes('function updateLocalAvailability(){'));
 assert.ok(src.includes("if(!$('useLocal').checked||place.uf!=='RJ')continue;"));
 assert.ok(src.includes('raf-local-information'));
 assert.ok(src.includes('FERIADO_LOCAL_INATIVO'));
});
