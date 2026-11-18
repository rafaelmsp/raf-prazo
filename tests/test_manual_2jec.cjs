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
  for(const url of ['assets/manual-2jec.css?v=2','assets/manual-2jec.js?v=2'])
    assert.ok(html.includes(url),url);
  assert.ok(html.indexOf('assets/manual-2jec.js?v=2')<html.indexOf('assets/ux-premium.js'),
    'O menu deve existir antes da inicialização de ícones e atalhos.');
  cp.execFileSync(process.execPath,['--check',path.join(root,'assets/manual-2jec.js')]);
});

test('Manual: publicação da cópia criptografada e leitor local sem transmissão',()=>{
  for(const value of ['Uso restrito · controle individual','113 páginas','edição 10/11/2026',
    'leitura exclusivamente local','Selecionar PDF no dispositivo','Baixar PDF','Abrir PDF em nova aba',
    'Manual protegido por senha','rafManualHostedOpen','rafManualHostedDownload'])
    assert.ok(code.includes(value),value);
  assert.ok(code.includes('file.slice(0,5)'), 'Validar assinatura PDF localmente');
  assert.ok(code.includes("header!=='%PDF-'"),'Recusar arquivo que não seja PDF');
  assert.ok(code.includes('URL.createObjectURL(file)'),'Usar URL local');
  assert.ok(code.includes('URL.revokeObjectURL(objectUrl)'),'Liberar URL local ao remover');
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|\.send\s*\(|localStorage|sessionStorage/.test(code),
    'Leitor não deve usar rede ou armazenamento');
  const pdf='docs/Manual_Operacional_2JEC_113p_Protegido_por_Senha.pdf';
  const stat=fs.statSync(path.join(root,pdf));
  assert.ok(stat.size>20_000_000&&stat.size<100_000_000,'Cópia protegida, com limite do GitHub');
  const file=fs.openSync(path.join(root,pdf),'r');
  const header=Buffer.alloc(5);
  fs.readSync(file,header,0,5,0);fs.closeSync(file);
  assert.equal(header.toString('ascii'),'%PDF-');
  const verify=cp.spawnSync('python',['-c',
    'from pypdf import PdfReader; import sys; r=PdfReader(sys.argv[1]); assert r.is_encrypted; e=r.trailer["/Encrypt"].get_object(); assert int(e["/V"])==5 and int(e["/R"])==6',
    path.join(root,pdf)],{encoding:'utf8'});
  assert.equal(verify.status,0,verify.stderr);
  assert.ok(code.includes('href="docs/Manual_Operacional_2JEC_113p_Protegido_por_Senha.pdf"'));
  assert.ok(!code.includes('jec@123'),'Senha nunca deve constar do código público');
});

test('Manual aparece na navegação e na pesquisa UX Premium',()=>{
  for(const term of ["id='navManual'","id='rafManualView'","id=\"rafManualDownload\"",
    "id=\"rafManualFileInput\"","name:'manual'","raf-manual-active"])
    assert.ok(code.includes(term),term);
  for(const term of ["[$('navManual'),'book']","manual:'navManual'",
    "label:'Manual do 2º JEC'"])
    assert.ok(premium.includes(term),term);
  assert.ok(css.includes('.app.raf-manual-active #mainContent>:not(#rafManualView)'));
  assert.ok(css.includes('@media(max-width:430px)'));
  assert.ok(css.includes('.raf-manual-frame-box iframe'));
});
