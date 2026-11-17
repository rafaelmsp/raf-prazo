/* RAF-PRAZO — biblioteca: ícones e navegação premium; dados e lógica inalterados. */
(() => {
  'use strict';
  const svg = paths => '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths+'</svg>';
  const shapes = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    calculator:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8v3H8zM8 13h2m4 0h2M8 17h2m4 0h2"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zm0 0A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    messages:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5A8.5 8.5 0 1 1 21 11.5z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
    history:'<path d="M3 12a9 9 0 1 0 2.4-6.1L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>'
  };
  function init(){
    const sidebar=document.getElementById('mainSidebar');
    if(!sidebar)return;
    const first=sidebar.querySelector('.raf-nav-link');
    const newLinks=[
      ['Visão geral','../index.html#inicio','home'],
      ['Certidões do Dia a Dia','../index.html#certidoes','file'],
      ['Balcão Virtual','../index.html#balcao-virtual','messages']
    ];
    for(const [label,href,icon] of newLinks){
      if(sidebar.querySelector('a[href="'+href+'"]'))continue;
      const link=document.createElement('a');
      link.className='raf-nav-link';link.href=href;link.title=label;
      link.innerHTML='<span class="raf-nav-icon" aria-hidden="true">'+svg(shapes[icon])+'</span><span class="raf-nav-text"></span>';
      link.querySelector('.raf-nav-text').textContent=label;
      if(icon==='home')first?.before(link);else sidebar.querySelector('a[href="./"]')?.after(link);
    }
    const links=sidebar.querySelectorAll('.raf-nav-link');
    for(const a of links){
      const href=a.getAttribute('href')||'';
      let key='info';
      if(href.includes('#inicio'))key='home';
      else if(href.includes('#certidoes'))key='file';
      else if(href.includes('#balcao'))key='messages';
      else if(href==='../index.html')key='calculator';
      else if(href==='./')key='book';
      else if(href.includes('#calendario'))key='calendar';
      else if(href.includes('#historico'))key='history';
      else if(href.includes('#configuracoes'))key='settings';
      const icon=a.querySelector('.raf-nav-icon');
      if(icon)icon.innerHTML=svg(shapes[key]);
    }
    const logo=document.querySelector('.raf-logo');
    if(logo)logo.innerHTML=svg('<path d="M12 3v18M6 7l6-3 6 3M3 21h18M6 7 3 13h6L6 7zm12 0-3 6h6l-3-6z"/>');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();