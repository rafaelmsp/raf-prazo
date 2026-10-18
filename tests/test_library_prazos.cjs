const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const file = p => fs.readFileSync(path.join(root, p), 'utf8');
const page = file('prazos/index.html');
const script = file('assets/prazos-library.js');
const home = file('src/template.html');
const homeScript = file('assets/prazos-home.js');
const homeCss = file('assets/prazos-home.css');

test('biblioteca reutiliza o catálogo real com IDs existentes e links relativos', () => {
  assert.match(page, /\.\.\/assets\/raf-prazo-22\.js/);
  assert.match(page, /\.\.\/index\.html/);
  assert.match(script, /RafPrazoLegal22\?\.configurations/);
  assert.doesNotMatch(script, /const configurations=/);
  const sandbox = {
    window: {},
    document: { readyState: 'loading', addEventListener() {} }
  };
  vm.runInNewContext(file('assets/raf-prazo-22.js'), sandbox);
  const catalogs = sandbox.window.RafPrazoLegal22.configurations;
  assert.equal(catalogs.jec.presets.length, 13);
  assert.equal(catalogs.cpc.presets.length, 21);
  assert.equal(catalogs.jec.presets.find(p => p.id === 'jec_preparo').kind, 'hours');
  assert.equal(catalogs.jec.presets.find(p => p.id === 'jec_cumprimento_pagar').kind, 'conditional');
});

test('transferência conservadora não calcula horas nem atos sem prazo definido', () => {
  assert.match(script, /selected\.kind==='hours'/);
  assert.match(script, /conditionalConfirmed:selected\.kind==='conditional'/);
  assert.match(script, /!\$\('#confirm'\)\.checked/);
  assert.match(homeScript, /raf-prazo:library:intent:v1/);
  assert.match(homeScript, /conditionalConfirmed\s*===\s*true/);
  assert.match(homeScript, /accept\.click\(\)/);
  assert.match(homeScript, /item\.kind === 'hours'/);
  assert.match(homeScript, /item\.kind === 'manual'/);
  assert.match(homeScript, /item\.kind === 'procedural'/);
});

test('calculadora tem acesso contextual, restauração de dados e prioridade mobile', () => {
  assert.match(home, /assets\/prazos-home\.js/);
  assert.match(home, /assets\/prazos-home\.css/);
  assert.match(homeScript, /Não sabe o prazo\? Consultar biblioteca/);
  assert.match(homeScript, /DOMContentLoaded/);
  assert.match(homeScript, /raf-prazo:library:return:v1/);
  assert.match(homeScript, /start\.dispatchEvent/);
  assert.match(homeScript, /days\.dispatchEvent/);
  assert.match(homeCss, /raf-22-parameters\s*\{\s*order:\s*1/);
  assert.match(homeCss, /raf-22-results\s*\{\s*order:\s*2/);
});

test('biblioteca contém busca, filtros, favoritos e confirmação explícita', () => {
  for (const id of ['search', 'regime', 'category', 'favorites', 'recent', 'dialog', 'confirm', 'apply'])
    assert.match(page, new RegExp('id="' + id + '"'));
  assert.match(script, /raf-prazo:library:favorites/);
  assert.match(script, /raf-prazo:library:recent/);
  assert.match(script, /localStorage/);
  assert.match(script, /sessionStorage/);
});
