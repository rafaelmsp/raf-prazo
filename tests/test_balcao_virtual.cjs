/* Regression test of actual Balcao Virtual phrase library and menu wiring. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'assets/balcao-virtual.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/balcao-virtual.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const template=fs.readFileSync(path.join(root,'src/template.html'),'utf8');
const marker="const categories=['Todas',";
assert.ok(js.includes(marker),'Could not find phrase library');
const instrumented=js.replace(marker,"globalThis.__testPhrases=phrases;\n"+marker);
const ctx={document:{readyState:'loading',addEventListener(){}},Set,Array,String,Object,RegExp};
vm.runInNewContext(instrumented,ctx,{timeout:1500});
const phrases=ctx.__testPhrases;
test('Biblioteca extensa e categorizada',()=>{
 assert.equal(phrases.length,47,'All 47 curated phrases must remain available');
 const cats=new Set(phrases.map(p=>p[0]));
 for(const cat of ['Abertura','Identificação','Consulta','Andamentos','Recursos','Audiências','Execução','Atendimento','Encerramento'])assert.ok(cats.has(cat),cat);
 for(const phrase of phrases)assert.equal(phrase.length,4);
 for(const phrase of phrases)assert.ok(phrase[2].length>=24,phrase[1]);
});
test('Opening rules are preserved in copyable text',()=>{
 const initial=phrases.find(p=>p[1]==='Boas-vindas e regras completas')?.[2];
 for(const needle of ['Ato Normativo Conjunto TJ/CGJ nº 15/2026','carteira da OAB','câmera','10 (dez) minutos','3 (três) processos'])assert.ok(initial.includes(needle),needle);
});
test('Pages retain main calculator and load Balcao page',()=>{
 for(const file of [html,template]){
  for(const part of ['id="mainContent"','id="navBalcaoVirtual"','assets/balcao-virtual.js?v=1','assets/balcao-virtual.css?v=1'])assert.ok(file.includes(part),part);
  assert.ok(file.includes('function renderCalendar()'));
  assert.ok(file.includes('rafEmbeddedBase'));
 }
 assert.ok(css.includes('.raf-bv-active #mainContent > :not(#rafBalcaoView)'));
 assert.ok(css.includes('.raf-bv-copy'));
 assert.ok(css.includes('@media(max-width:650px)'));
});
test('Copy button receives correct text, without sending data',()=>{
 for(const part of ["navigator.clipboard.writeText(text)","document.execCommand('copy')","btn.setAttribute('aria-label'","copy(interpolated(p[2]),btn)","id='rafBvSearch'","id='rafBvProcess'","id='rafBvReturn'"])assert.ok(js.includes(part),part);
 assert.ok(!/fetch\(|XMLHttpRequest|WebSocket/.test(js),'Clipboard module must not transmit user data');
 assert.ok(!/innerHTML\s*=\s*.*phrase/i.test(js),'Phrase text should use textContent, not HTML');
});
