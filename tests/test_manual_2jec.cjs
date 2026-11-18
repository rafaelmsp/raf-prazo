/* Testes de integridade do leitor privado do Manual 2º JEC */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('index.html'),template=read('src/template.html');
const code=read('assets/manual-2jec.js'),css=read('assets/manual-2jec.css');
const premium=read('assets/ux-premium.js');

test('Leitor do manual integrado a arquivos HTML sincronizados',()=>{
  assert.equal(html,template);
  for(const url of ['assets/manual-2jec.css?v=1','assets/manual-2jec.js?v=1'])
    assert.ok(html.includes(url),url);
  assert.ok(html.indexOf('assets/manual-2jec.js?v=1')<html.indexOf('assets/ux-premium.js'),
    'O menu deve existir antes da inicialização de ícones e atalhos.');
  cp.execFileSync(process.execPath,['--check',path.join(root,'assets/manual-2jec.js')]);
});

test('Manual restrito: PDF local e nenhuma transmissão',()=>{
  for(const value of ['Uso restrito · controle individual','113 páginas','edição 10/11/2026',
    'leitura exclusivamente local','Selecionar PDF no dispositivo','Baixar PDF','Abrir PDF em nova aba'])
    assert.ok(code.includes(value),value);
  assert.ok(code.includes('file.slice(0,5)'), 'Validar assinatura PDF localmente');
  assert.ok(code.includes("header!=='%PDF-'"),'Recusar arquivo que não seja PDF');
  assert.ok(code.includes('URL.createObjectURL(file)'),'Usar URL local');
  assert.ok(code.includes('URL.revokeObjectURL(objectUrl)'),'Liberar URL local ao remover');
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|\.send\s*\(|localStorage|sessionStorage/.test(code),
    'Leitor não deve usar rede ou armazenamento');
  for(const folder of ['assets','docs','public']) {
    const dir=path.join(root,folder);
    if(!fs.existsSync(dir))continue;
    const pdf=fs.readdirSync(dir).filter(f=>/manual.*2jec.*\.pdf|2jec.*manual.*\.pdf/i.test(f));
    assert.deepEqual(pdf,[], 'PDF não pode ser publicado em '+folder);
  }
});

test('Manual aparece na navegação e na pesquisa UX Premium',()=>{
  for(const term of ["id='navManual'","id='rafManualView'","id='rafManualDownload'",
    "id='rafManualFileInput'","name:'manual'","raf-manual-active"])
    assert.ok(code.includes(term),term);
  for(const term of ["[$('navManual'),'book']","manual:'navManual'",
    "label:'Manual do 2º JEC'"])
    assert.ok(premium.includes(term),term);
  assert.ok(css.includes('.app.raf-manual-active #mainContent>:not(#rafManualView)'));
  assert.ok(css.includes('@media(max-width:430px)'));
  assert.ok(css.includes('.raf-manual-frame-box iframe'));
});
