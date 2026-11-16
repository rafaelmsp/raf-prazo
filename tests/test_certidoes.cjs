/* RAF-PRAZO — regressão da biblioteca auxiliar de certidões.
   Valida redações preservadas, isolamento, navegação e uso conservador. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const js = read('assets/certidoes.js');
const css = read('assets/certidoes.css');
const balcao = read('assets/balcao-virtual.js');
const html = read('index.html');
const template = read('src/template.html');
const needle = '  const $ = id => document.getElementById(id);';
assert.ok(js.includes(needle),'Não foi possível instrumentar a biblioteca');
const instrumented = js.replace(needle, '  globalThis.__certModels = models;\n' + needle);
const ctx = { document: {readyState:'loading',addEventListener(){}}, Set, Array, String, Object, RegExp };
vm.runInNewContext(instrumented,ctx,{timeout:1500});
const models = ctx.__certModels;

test('15 modelos bem identificados, com 2 textos fornecidos',() => {
  assert.equal(models.length,15);
  assert.equal(new Set(models.map(x=>x.id)).size,models.length);
  assert.equal(models.filter(x=>x.verified).length,2);
  for(const model of models){
    assert.ok(model.id && model.group && model.title && model.note && model.text);
    assert.ok(model.text.startsWith('Certifico que'), model.title);
    assert.ok(model.verified || /\[[^\]]+\]/.test(model.text),model.title);
  }
});

test('Redação literal dos dois modelos fornecidos preservada',() => {
  assert.equal(models.find(x=>x.id==='aud-conciliacao').text,
    'Certifico que os presentes autos encontram-se aguardando audiência de conciliação designada.');
  assert.equal(models.find(x=>x.id==='acordo-pauta').text,
    'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao MM. Juiz Titular.');
});

test('Categorias de apoio às rotinas cartorárias',() => {
  const groups = new Set(models.map(x=>x.group));
  for(const name of ['Audiências','Acordos','Juntadas','Habilitação','Comunicação processual','Prazos','Encaminhamentos'])assert.ok(groups.has(name),name);
  assert.ok(models.find(x=>x.id==='decurso-prazo').note.includes('Exige checagem'));
  assert.ok(models.find(x=>x.id==='ar-devolvido').note.includes('terceiro'));
});

test('Página principal, template e módulos permanecem sincronizados',() => {
  assert.equal(html,template);
  for(const part of ['id="navCertidoes"','assets/certidoes.css?v=1','assets/certidoes.js?v=1',
    'id="navBalcaoVirtual"','id="mainContent"']) assert.ok(html.includes(part),part);
  assert.ok(css.includes('.raf-cert-active #mainContent > :not(#rafCertView)'));
  assert.ok(css.includes('@media(max-width:650px)'));
  assert.ok(js.includes("window.addEventListener('raf-prazo:section'"));
  assert.ok(balcao.includes("name:'balcao'"));
  assert.ok(balcao.includes("name==='certidoes'"));
});

test('Revisão antes da cópia, sem persistência nem transmissão',() => {
  assert.ok(js.includes("const text = $('rafCertEditor').value.trim()"));
  assert.ok(js.includes('window.confirm('));
  assert.ok(js.includes('navigator.clipboard?.writeText'));
  assert.ok(js.includes("document.execCommand('copy')"));
  assert.ok(js.includes("section.hidden = !on;"));
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage\.setItem|sessionStorage\.setItem/.test(js));
  assert.ok(!/innerHTML\s*=\s*.*selected\.text/.test(js));
});
