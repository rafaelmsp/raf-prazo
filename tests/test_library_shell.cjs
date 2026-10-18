/* Contratos da identidade e do menu global da Biblioteca — Raf-Prazo 2.4.1. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const page=read('prazos/index.html');
const css=read('assets/prazos-library-shell.css');
const js=read('assets/prazos-library-shell.js');
const home=read('assets/prazos-home.js');

test('biblioteca reutiliza barra superior com logo, atualizacoes e alternancia de tema',()=>{
 for(const id of ['rafAppShell','menuToggle','mainSidebar','themeToggle','themeEmoji','themeLabel','libraryMain','menuBackdrop'])
  assert.ok(page.includes('id="'+id+'"'), 'Elemento de identidade ausente: '+id);
 assert.match(page, /class="raf-header"/);
 assert.match(page, /class="raf-logo"/);
 assert.match(page, /Inteligência em prazos judiciais/);
 assert.match(page, /href="\.\.\/index\.html#atualizacoes"/);
 assert.match(page, /assets\/prazos-library-shell\.css/);
 assert.match(page, /assets\/prazos-library-shell\.js/);
 assert.doesNotMatch(page, /class="top"/);
});

test('menu oferece destinos reais sem apagar a Biblioteca nem alterar atos',()=>{
 const expected=['../index.html','./','../index.html#calendario','../index.html#atualizacoes','../index.html#historico','../index.html#fontes','../index.html#configuracoes','../index.html#tutorial','../index.html#sobre','../index.html#termos'];
 for(const url of expected)assert.ok(page.includes('href="'+url+'"'),url);
 assert.match(page, /class="raf-nav-link active" href="\.\/" aria-current="page"/);
 for(const id of ['search','regime','category','favorites','recent','groups','preview','dialog','confirm','apply'])
  assert.ok(page.includes('id="'+id+'"'),'Biblioteca perdeu: '+id);
 assert.match(page, /raf-prazo-22\.js/);
 assert.match(page, /prazos-library\.js/);
});

test('menu e tema acessíveis para desktop e Android, sem valores inventados',()=>{
 assert.match(css, /#1261A0/);
 assert.match(css, /max-width:1060px/);
 assert.match(css, /max-width:650px/);
 assert.match(css, /raf-nav-backdrop/);
 assert.match(css, /\.raf-app-shell\.menu-open/);
 assert.match(js, /aria-expanded/);
 assert.match(js, /sidebar\.inert/);
 assert.match(js, /Escape/);
 assert.match(js, /localStorage\.setItem\('raf-prazo:theme'/);
 assert.match(js, /raf-prazo:theme/);
 new vm.Script(js,{filename:'assets/prazos-library-shell.js'});
});

test('atalhos do menu sao encaminhados apenas para controles existentes da pagina principal',()=>{
 const routes={
  '#calendario':'navCalendar','#atualizacoes':'rafNewsOpen',
  '#historico':'navHistory','#fontes':'sourcesTop',
  '#configuracoes':'navSettings','#tutorial':'navTutorial',
  '#sobre':'navAbout','#termos':'navTerms'
 };
 for(const [hash,id] of Object.entries(routes)){
  assert.ok(home.includes("'"+hash+"':'"+id+"'"),hash);
  assert.ok(read('src/template.html').includes('id="'+id+'"'),id);
 }
 assert.match(home, /applyNavigationHash\(\);/);
 assert.match(home, /requestAnimationFrame\(\(\)=>button\.click\(\)\)/);
 new vm.Script(home,{filename:'assets/prazos-home.js'});
});
