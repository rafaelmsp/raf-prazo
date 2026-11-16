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

test('Quatro modelos iniciais fornecidos, todos com asterisco no título', () => {
  assert.equal(models.length,4);
  assert.equal(new Set(models.map(model=>model.id)).size,4);
  for(const model of models){
    assert.ok(model.verified);
    assert.ok(model.title.startsWith('* '),model.title);
    assert.ok(model.id && model.group && model.note && model.text);
    assert.ok(model.text.startsWith('Certifico que'));
  }
});

test('Redação literal preservada e repetição da audiência eliminada', () => {
  const expected=[
    'Certifico que os autos foram arquivados indevidamente',
    'Certifico que os presentes autos encontram-se aguardando audiência de conciliação designada.',
    'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao MM. Juiz Titular.',
    'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao Juiz Leigo responsável.'
  ];
  assert.deepEqual(Array.from(models,model=>model.text),expected);
});

test('Seções separadas: Certidões recebe arquivamento e Pauta recebe três certidões', () => {
  assert.deepEqual(models.filter(x=>x.section==='certidoes').map(x=>x.id),['arquivamento-indevido']);
  assert.deepEqual(models.filter(x=>x.section==='pauta').map(x=>x.id),
    ['aud-conciliacao','acordo-pauta','acordo-pauta-juiz-leigo']);
  assert.ok(models.find(x=>x.id==='arquivamento-indevido').note.includes('Confira'));
  assert.ok(js.includes('item.section === mode'));
});

test('Página principal, template e módulos permanecem sincronizados',() => {
  assert.equal(html,template);
  for(const part of ['id="navCertidoes"','id="navPauta"','assets/certidoes.css?v=1','assets/certidoes.js?v=1',
    'id="navBalcaoVirtual"','id="mainContent"']) assert.ok(html.includes(part),part);
  assert.ok(css.includes('.raf-cert-active #mainContent > :not(#rafCertView)'));
  assert.ok(css.includes('@media(max-width:650px)'));
  assert.ok(js.includes("window.addEventListener('raf-prazo:section'"));
  assert.ok(js.includes("navPauta.addEventListener('click', () => show('pauta'))"));
  assert.ok(js.includes("nav.addEventListener('click', () => show('certidoes'))"));
  assert.ok(js.includes("location.hash === '#pauta'"));
  assert.ok(js.includes("location.hash === '#certidoes'"));
  assert.ok(balcao.includes("name:'balcao'"));
  assert.ok(balcao.includes("name==='certidoes'"));
});

test('Revisão antes da cópia, sem persistência nem transmissão',() => {
  assert.ok(js.includes("const text = $('rafCertEditor').value.trim()"));
  assert.ok(js.includes('window.confirm('));
  assert.ok(js.includes('navigator.clipboard?.writeText'));
  assert.ok(js.includes("document.execCommand('copy')"));
  assert.ok(js.includes('section.hidden = !on;'));
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage\.setItem|sessionStorage\.setItem/.test(js));
  assert.ok(!/innerHTML\s*=\s*.*selected\.text/.test(js));
});
