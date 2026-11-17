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

test('Catálogo completo: 18 certidões, cinco fornecidas e 13 sugestões preservadas', () => {
  assert.equal(models.length,18);
  assert.equal(new Set(models.map(model=>model.id)).size,18);
  const fornecidas = models.filter(model=>model.verified);
  const complementares = models.filter(model=>!model.verified);
  assert.equal(fornecidas.length,5);
  assert.equal(complementares.length,13);
  for(const model of fornecidas){
    assert.ok(model.title.startsWith('* '),model.title);
    assert.ok(model.text.startsWith('Certifico que'), model.id);
  }
  for(const model of complementares){
    assert.ok(!model.title.startsWith('* '),model.title);
    assert.ok(model.text.startsWith('Certifico que'), model.id);
    assert.ok(model.note.length>10, model.id);
  }
  const oldIds = [
    'aud-instrucao','aud-ata','acordo-juntado','peticao-juntada','procuracao-juntada',
    'adv-cadastro','doc-nao-localizado','ar-devolvido','ar-negativo','mandado-juntado',
    'decurso-prazo','manifestacao-juntada','conclusao-efetivada'
  ];
  assert.deepEqual(Array.from(complementares,model=>model.id),oldIds);
});

test('Redação literal preservada e repetição da audiência eliminada', () => {
  const expected=[
    'Certifico que os autos foram arquivados indevidamente',
    'Certifico que os presentes autos encontram-se aguardando audiência de conciliação designada.',
    'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao MM. Juiz Titular.',
    'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao Juiz Leigo responsável.',
    'Certifico que o feito foi retirado da pauta de audiências em face de devolução de Diligência negativa de index 317752646. Fica a parte autora intimada a se manifestar sobre certidão do OJA.'
  ];
  assert.deepEqual(Array.from(models.filter(x=>x.verified),model=>model.text),expected);
});

test('Pauta é uma categoria dentro de Certidões, com quatro modelos', () => {
  assert.deepEqual(Array.from(models.filter(x=>x.group==='Arquivamento'),x=>x.id),['arquivamento-indevido']);
  assert.deepEqual(Array.from(models.filter(x=>x.group==='Pauta'),x=>x.id),
    ['aud-conciliacao','acordo-pauta','acordo-pauta-juiz-leigo','pauta-diligencia-negativa-oja']);
  assert.deepEqual(Array.from(new Set(models.map(x=>x.group))),
    ['Arquivamento','Pauta','Audiências','Acordos','Juntadas','Habilitação','Comunicação processual','Prazos','Encaminhamentos']);
  assert.ok(models.find(x=>x.id==='arquivamento-indevido').note.includes('Confira'));
  assert.ok(models.find(x=>x.id==='pauta-diligencia-negativa-oja').note.includes('AR negativo'));
  assert.ok(models.find(x=>x.id==='pauta-diligencia-negativa-oja').note.includes('substituído'));
  assert.ok(js.includes("item.text + ' ' + item.note"),'Busca deve alcançar AR negativo');
  assert.ok(js.includes("const categories = ['Todas', ...new Set(models.map(item => item.group))]"));
  assert.ok(js.includes("category === 'Todas' || item.group === category"));
  assert.ok(js.includes("show(true,true,'Pauta')"), 'Link legado #pauta abre o filtro Pauta');
  assert.ok(js.includes('os demais são sugestões complementares'),'Aviso diferencia textos fornecidos das sugestões');
});

test('Página principal, template e módulos permanecem sincronizados',() => {
  assert.equal(html,template);
  for(const part of ['id="navCertidoes"','assets/certidoes.css?v=3.1','assets/certidoes.js?v=3.1',
    'id="navBalcaoVirtual"','id="mainContent"']) assert.ok(html.includes(part),part);
  assert.ok(!html.includes('id="navPauta"'),'Pauta não deve ocupar o menu principal');
  for (const asset of ['assets/ux-premium.css?v=3.1','assets/ux-premium-art.css?v=3.0','assets/ux-premium.js?v=3.1']) assert.ok(html.includes(asset),asset);
  assert.ok(css.includes('.raf-cert-active #mainContent > :not(#rafCertView)'));
  assert.ok(css.includes('@media(max-width:650px)'));
  assert.ok(js.includes("window.addEventListener('raf-prazo:section'"));
  assert.ok(!js.includes('navPauta.addEventListener'),'Sem navegação independente de Pauta');
  assert.ok(js.includes("nav.addEventListener('click', () => show(true))"));
  assert.ok(js.includes("location.hash === '#pauta'"));
  assert.ok(js.includes("location.hash === '#certidoes'"));
  assert.ok(balcao.includes("name:'balcao'"));
  assert.ok(balcao.includes("name==='certidoes'"));
});

test('Revisão antes da cópia, sem transmissão e com persistência somente de IDs de modelos',() => {
  assert.ok(js.includes("const text = $('rafCertEditor').value.trim()"));
  assert.ok(js.includes('window.confirm('));
  assert.ok(js.includes('navigator.clipboard?.writeText'));
  assert.ok(js.includes("document.execCommand('copy')"));
  assert.ok(js.includes('section.hidden = !on;'));
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(js));
  assert.ok(!/innerHTML\s*=\s*.*selected\.text/.test(js));
  assert.ok(js.includes("const knownIds = new Set(models.map(item => item.id))"));
  assert.ok(js.includes("knownIds.has(id)"),'Somente IDs estáticos conhecidos devem ser aceitos');
  assert.ok(js.includes("storage.setItem(key, JSON.stringify(ids))"),'Persistência limitada a array de IDs');
  assert.ok(!js.includes("storage.setItem(key, JSON.stringify(models))"));
  for(const id of ['rafCertTabAll','rafCertTabFavorites','rafCertTabRecent','rafCertFavorite'])
    assert.ok(js.includes(id),id);
  assert.ok(js.includes('window.RafPrazoCertidoes = Object.freeze('));
  assert.ok(js.includes("fireChange('favorites')"));
  assert.ok(js.includes("fireChange('recent')"));
});
