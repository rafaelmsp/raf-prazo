/* RAF-PRAZO | Manual operacional 2º JEC
 * Documento identificado como USO RESTRITO: apenas leitura local.
 * Nenhum PDF, texto, nome ou número de processo é enviado ou armazenado. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  function init(){
    const app=$('app'),main=$('mainContent'),sidebar=$('mainSidebar'),cert=$('navCertidoes');
    if(!app||!main||!sidebar||!cert||$('navManual'))return;
    const nav=document.createElement('button');
    nav.type='button';
    nav.id='navManual';
    nav.className='nav-link';
    nav.title='Manual do 2º JEC — leitura de PDF local';
    nav.setAttribute('aria-label','Manual do 2º JEC');
    nav.innerHTML='<span class="nav-icon" aria-hidden="true">▤</span><span class="nav-text">Manual do 2º JEC</span>';
    cert.after(nav);

    const section=document.createElement('section');
    section.id='rafManualView';
    section.className='raf-manual-view';
    section.hidden=true;
    section.setAttribute('aria-label','Leitor local do Manual Operacional do 2º JEC');
    section.innerHTML=[
      '<div class="raf-manual-hero"><div>',
      '<p class="raf-manual-kicker">DOCUMENTAÇÃO · 2º JEC</p>',
      '<h1>Manual Operacional do Estagiário</h1>',
      '<p>2º Juizado Especial Cível de Duque de Caxias/RJ · edição 10/11/2026 · 113 páginas</p>',
      '<span class="raf-manual-badge">Uso restrito · controle individual</span>',
      '</div><button type="button" class="raf-manual-back" id="rafManualBack">← Voltar à calculadora</button></div>',
      '<div class="raf-manual-intro"><div class="raf-manual-notice-icon" aria-hidden="true">ⓘ</div><div>',
      '<strong>Leitura privada no seu dispositivo</strong>',
      '<p>O documento foi identificado como material de uso restrito. Por isso, não está publicado neste site.',
      'Selecione o PDF no seu dispositivo para visualizá-lo ou baixar uma cópia local.',
      'O RAF-PRAZO não faz upload, sincroniza ou armazena o arquivo.</p></div></div>',
      '<div class="raf-manual-toolbar">',
      '<input id="rafManualFileInput" type="file" accept=".pdf,application/pdf" hidden>',
      '<button id="rafManualChoose" type="button" class="raf-manual-button raf-manual-primary">',
      '<span aria-hidden="true">▤</span> Selecionar PDF no dispositivo</button>',
      '<a id="rafManualOpen" class="raf-manual-button" target="_blank" rel="noopener noreferrer" hidden>',
      '↗ Abrir PDF em nova aba</a>',
      '<a id="rafManualDownload" class="raf-manual-button" download hidden>↓ Baixar PDF</a>',
      '<button id="rafManualClear" class="raf-manual-button raf-manual-clear" type="button" hidden>Remover arquivo</button>',
      '</div>',
      '<p id="rafManualFeedback" class="raf-manual-feedback" role="status" aria-live="polite">',
      'Selecione o arquivo PDF para ativar a visualização e o download.</p>',
      '<div id="rafManualEmpty" class="raf-manual-empty">',
      '<div class="raf-manual-document-icon" aria-hidden="true">▤</div>',
      '<h2>Seu manual, sem publicação na internet</h2>',
      '<p>Depois de selecionar o documento, os botões de abrir e baixar estarão disponíveis.',
      'Nenhum dado do PDF será transmitido pelo RAF-PRAZO.</p>',
      '</div>',
      '<div id="rafManualFrameBox" class="raf-manual-frame-box" hidden>',
      '<iframe id="rafManualFrame" title="Visualização local do Manual Operacional em PDF" loading="lazy"></iframe>',
      '</div>',
      '<p class="raf-manual-footnote">Material auxiliar não oficial. Não substitui normas do TJRJ,',
      'orientações da chefia ou limites de atuação e de acesso da serventia.</p>'
    ].join('');
    main.append(section);
    let objectUrl=null;
    const input=$('rafManualFileInput'),feedback=$('rafManualFeedback'),frame=$('rafManualFrame');
    function release(){
      frame.removeAttribute('src');
      if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
      input.value='';
      for(const id of ['rafManualOpen','rafManualDownload','rafManualClear'])$(id).hidden=true;
      $('rafManualFrameBox').hidden=true;
      $('rafManualEmpty').hidden=false;
      feedback.textContent='Selecione o arquivo PDF para ativar a visualização e o download.';
    }
    async function load(file){
      if(!file)return;
      if(file.size>120*1024*1024){
        feedback.textContent='O arquivo excede 120 MB. Selecione um PDF menor.';
        return;
      }
      let header='';
      try{header=new TextDecoder('ascii').decode(await file.slice(0,5).arrayBuffer());}
      catch(_){feedback.textContent='Não foi possível ler o arquivo selecionado.';return;}
      if(header!=='%PDF-'){
        feedback.textContent='O arquivo selecionado não foi identificado como PDF.';
        return;
      }
      release();
      objectUrl=URL.createObjectURL(file);
      frame.src=objectUrl+'#toolbar=1&navpanes=0&view=FitH';
      $('rafManualOpen').href=objectUrl;
      $('rafManualDownload').href=objectUrl;
      $('rafManualDownload').download=(file.name||'manual-operacional-2jec.pdf').replace(/[\\/:*?"<>|]/g,'_');
      for(const id of ['rafManualOpen','rafManualDownload','rafManualClear'])$(id).hidden=false;
      $('rafManualFrameBox').hidden=false;
      $('rafManualEmpty').hidden=true;
      feedback.textContent='Arquivo pronto: '+(file.name||'manual-operacional-2jec.pdf')+
        ' · '+(file.size/1048576).toFixed(1)+' MB · leitura exclusivamente local.';
    }
    function show(on,updateUrl=true){
      if(on)window.dispatchEvent(new CustomEvent('raf-prazo:section',{detail:{name:'manual'}}));
      app.classList.toggle('raf-manual-active',on);
      section.hidden=!on;
      nav.classList.toggle('active',on);
      if(on){
        $('navCalc')?.classList.remove('active');
        if(innerWidth<=1060){
          app.classList.remove('menu-open');
          $('menuToggle')?.setAttribute('aria-expanded','false');
        }
        window.scrollTo(0,0);
      }else if(!app.classList.contains('raf-bv-active')&&!app.classList.contains('raf-cert-active')
        &&!app.classList.contains('raf-ux-home-active')){
        $('navCalc')?.classList.add('active');
      }
      if(updateUrl)history.replaceState(history.state,'',on?'#manual':location.pathname+location.search);
    }
    $('rafManualChoose').addEventListener('click',()=>input.click());
    input.addEventListener('change',()=>load(input.files?.[0]));
    $('rafManualClear').addEventListener('click',release);
    $('rafManualBack').addEventListener('click',()=>show(false,true));
    nav.addEventListener('click',()=>show(true));
    window.addEventListener('raf-prazo:section',event=>{
      if(event.detail?.name!=='manual'&&!section.hidden)show(false,false);
    });
    sidebar.querySelectorAll('.nav-link').forEach(button=>{
      if(button!==nav)button.addEventListener('click',()=>{
        if(!section.hidden)show(false,false);
      },true);
    });
    window.addEventListener('hashchange',()=>{
      if(location.hash==='#manual')show(true,false);
      else if(!section.hidden)show(false,false);
    });
    window.addEventListener('beforeunload',release,{once:true});
    if(location.hash==='#manual')show(true,false);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
