/* Biblioteca 2.4.2: categorias recolhíveis sem afetar prazos jurídicos. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const js=read('assets/prazos-library.js');
const css=read('assets/prazos-library.css');
const html=read('prazos/index.html');

test('cada agrupamento de prazos usa details/summary nativos acessíveis',()=>{
 assert.match(js,/document\.createElement\('details'\)/);
 assert.match(js,/document\.createElement\('summary'\)/);
 assert.match(js,/group\.append\(heading,cards\)/);
 assert.match(js,/count\.textContent=String\(rows\.length\)/);
 assert.match(js,/aria-label/);
 assert.match(css, /\.group > summary\.group-header/);
 assert.match(css, /group\[open\] \.group-chevron/);
 assert.match(css, /focus-visible/);
});

test('mobile abre só a primeira categoria; desktop permite várias',()=>{
 assert.match(js,/matchMedia\('\(max-width:760px\)'\)/);
 assert.match(js,/index===0/);
 assert.match(js,/mobile&&!isFiltering&&group\.open/);
 assert.match(js,/other\.open=false/);
 assert.match(js,/expandedGroups\.set/);
 assert.match(css, /@media \(max-width:760px\)/);
});

test('filtros mostram resultados automaticamente sem perder catálogo e ficha',()=>{
 assert.match(js,/const isFiltering=!!q/);
 assert.match(js,/group\.open=isFiltering/);
 assert.match(js,/showFav/);
 assert.match(js,/showRecent/);
 assert.match(js,/detail\(i\)/);
 assert.match(js,/kind\(i\)/);
 assert.match(js,/raf-prazo:library:intent:v1/);
 assert.match(js,/selected\.kind==='hours'/);
});

test('arquivos da biblioteca usam versões novas evitando cache antigo',()=>{
 assert.match(html,/prazos-library\.css\?v=2\.4\.2/);
 assert.match(html,/prazos-library\.js\?v=2\.4\.2/);
 assert.match(html,/prazos-library-shell\.js/);
});
