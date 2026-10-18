/* PWA online-only: contratos de instalação e dependência do site. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('manifest.webmanifest'));
const health=JSON.parse(read('pwa-health.json'));
const sw=read('sw.js'),pwa=read('assets/raf-pwa.js'),css=read('assets/raf-pwa.css');
const home=read('src/template.html'),index=read('index.html'),library=read('prazos/index.html');

test('PWA abre o mesmo site oficial em janela propria no GitHub Pages',()=>{
 assert.equal(manifest.start_url,'./');
 assert.equal(manifest.scope,'./');
 assert.equal(manifest.id,'./');
 assert.equal(manifest.display,'standalone');
 assert.equal(manifest.theme_color,'#1261A0');
 assert.equal(manifest.lang,'pt-BR');
 assert.match(manifest.description,/Requer internet/);
 assert.deepEqual(manifest.icons.map(x=>x.sizes),['192x192','512x512','512x512']);
 assert.equal(manifest.icons[2].purpose,'maskable');
});

test('ícones PNG próprios têm tamanhos reais e assinaturas corretas',()=>{
 for(const [filename,size] of [['assets/pwa-icon-192.png',192],['assets/pwa-icon-512.png',512],['assets/pwa-icon-maskable-512.png',512]]){
  const image=fs.readFileSync(path.join(root,filename));
  assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a',filename);
  assert.equal(image.readUInt32BE(16),size,filename);
  assert.equal(image.readUInt32BE(20),size,filename);
 }
});

test('service worker nunca oferece app offline nem persiste conteúdo',()=>{
 assert.match(sw,/addEventListener\('fetch'/);
 assert.match(sw,/event\.respondWith\(fetch\(req,\{cache:'no-store'\}\)\)/);
 assert.match(sw,/event\.request|event\.request|event\.respondWith/);
 assert.doesNotMatch(sw,/caches\.open\s*\(/);
 assert.doesNotMatch(sw,/cache\.put\s*\(/);
 assert.doesNotMatch(sw,/cache\.addAll\s*\(/);
 assert.doesNotMatch(sw,/offline\.html|respondWith\(new Response/);
 assert.match(sw,/startsWith\('raf-prazo-pwa-'\)/);
});

test('site controla o estado online com prova na sua origem, sem confiar só em wifi',()=>{
 assert.equal(health.service,'raf-prazo');
 assert.equal(health.online,true);
 assert.match(pwa,/pwa-health\.json/);
 assert.match(pwa,/cache:'no-store'/);
 assert.match(pwa,/credentials:'same-origin'/);
 assert.match(pwa,/response\.json\(\)/);
 assert.match(pwa,/data\.service!=='raf-prazo'\|\|data\.online!==true/);
 assert.match(pwa,/application\.inert=locked/);
 assert.match(pwa,/addEventListener\('offline'/);
 assert.match(pwa,/addEventListener\('online'/);
 assert.match(pwa,/setInterval\(\(\)=>/);
 assert.match(pwa,/beforeinstallprompt/);
 assert.match(pwa,/serviceWorker\.register/);
});

test('PWA integrado à calculadora e à Biblioteca sem duplicar motor ou catálogo',()=>{
 assert.equal(index,home,'build deve gerar o HTML com os mesmos metadados');
 for(const document of [home,library]){
  assert.match(document,/<link rel="manifest" href="(?:\.\.\/)?manifest\.webmanifest">/);
  assert.match(document,/raf-pwa\.css\?v=2\.5/);
  assert.match(document,/raf-pwa\.js\?v=2\.5/);
  assert.match(document,/id="rafPwaGate"/);
  assert.match(document,/id="rafPwaRetry"/);
 }
 assert.match(css,/#rafPwaGate\[hidden\]/);
 assert.match(css,/z-index:2147483646/);
 assert.match(home, /assets\/prazos-home\.css/);
 assert.match(library,/prazos-library\.js/);
});
