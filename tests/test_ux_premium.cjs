/* UX Premium — contratos de integridade e navegação. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),template=read('src/template.html');
const lib=read('prazos/index.html'),ux=read('assets/ux-premium.js'),css=read('assets/ux-premium.css');
const art=read('assets/ux-premium-art.css'),libJs=read('assets/ux-premium-library.js');

test('Código JavaScript premium é sintaticamente válido',()=>{
  for(const file of ['assets/ux-premium.js','assets/ux-premium-library.js','assets/certidoes.js'])
    cp.execFileSync(process.execPath,['--check',path.join(root,file)]);
});

test('A interface nova está integrada ao aplicativo real e à biblioteca, sem duplicar template',()=>{
  assert.equal(html,template);
  for(const asset of ['assets/ux-premium.css?v=3.1','assets/ux-premium-art.css?v=3.0',
                       'assets/ux-premium.js?v=3.1','assets/certidoes.js?v=3.1'])
    assert.ok(html.includes(asset),asset);
  for(const asset of ['../assets/ux-premium-library.css?v=3.0','../assets/ux-premium-library.js?v=3.0'])
    assert.ok(lib.includes(asset),asset);
  assert.ok(html.includes('id="navCertidoes"'));
  assert.ok(html.includes('id="calendar"'));
  assert.ok(html.includes('id="due"'));
  assert.ok(html.includes('id="start"'));
  assert.ok(html.includes('id="days"'));
  assert.ok(!html.includes('id="navPauta"'));
});

test('UX premium oferece home, busca, SVG e fluxo para ferramentas existentes',()=>{
  for(const phrase of ['rafUxHomeNav','rafUxSearchDialog','raf-ux-home-active','rafUxHomeGrid']) assert.ok(ux.includes(phrase),phrase);
  for(const word of ['calculator','certidoes','balcao','library','calendar','sources']){
    assert.ok(ux.includes(word),word);
  }
  assert.ok(ux.includes("window.dispatchEvent(new CustomEvent('raf-prazo:section'"));
  assert.ok(ux.includes("window.location.assign('prazos/')"));
  assert.ok(ux.includes("svg('scale')"));
  assert.ok(ux.includes('key.toLowerCase()'));
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage\.setItem/.test(ux));
});

test('Identidade visual inclui fotografia gerada, versões responsivas e tema noturno',()=>{
  assert.ok(css.includes('.raf-ux-hero'));
  assert.ok(css.includes('.raf-ux-home-grid'));
  assert.ok(css.includes('.raf-cert-category'));
  assert.ok(css.includes('prefers-reduced-motion'));
  assert.ok(css.includes('max-width:650px'));
  assert.ok(art.includes('data:image/webp;base64,'));
  assert.ok(art.length>1500);
  assert.ok(libJs.includes('#certidoes'));
  assert.ok(libJs.includes('#balcao-virtual'));
});

test('Visão geral apresenta modelos favoritos e recentes reais, sem conteúdo editado',()=>{
  for(const id of ['rafUxFavoritesList','rafUxRecentsList','rafUxTotalModels',
    'rafUxPautaModels','rafUxAllFavorites','rafUxAllRecent']) assert.ok(ux.includes(id),id);
  assert.ok(ux.includes("certidoes.summary()"));
  assert.ok(ux.includes("certidoes?.open({id})"));
  assert.ok(ux.includes("certidoes?.open({mode})"));
  assert.ok(ux.includes("window.addEventListener('raf-prazo:certidoes-change',renderCollections)"));
  assert.ok(ux.includes("const entries = catalog().map(model=>("));
  assert.ok(ux.includes("AR negativo OJA diligência negativa"));
  assert.ok(!ux.includes("model.text"),'Visão geral não recebe textos editáveis');
});
