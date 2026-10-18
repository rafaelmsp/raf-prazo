/* Raf-Prazo 2.4.1 — menu da Biblioteca e tema compartilhado com a calculadora. */
(() => {
  'use strict';
  const app=document.getElementById('rafAppShell');
  const toggle=document.getElementById('menuToggle');
  const sidebar=document.getElementById('mainSidebar');
  const backdrop=document.getElementById('menuBackdrop');
  const theme=document.getElementById('themeToggle');
  if(!app || !toggle || !sidebar || !backdrop || !theme) return;
  const isMobile=()=>window.matchMedia('(max-width:1060px)').matches;

  function setOpen(open) {
    const value=!!open;
    app.classList.toggle('menu-open',value);
    toggle.setAttribute('aria-expanded',String(value));
    toggle.setAttribute('aria-label',value?'Fechar menu de navegação':'Abrir menu de navegação');
    toggle.setAttribute('title',value?'Fechar menu':'Abrir menu');
    toggle.textContent=value?'✕':'☰';
    sidebar.inert=isMobile()&&!value;
    sidebar.setAttribute('aria-hidden',String(isMobile()&&!value));
    backdrop.inert=!value;
    backdrop.setAttribute('aria-hidden',String(!value));
  }
  function syncTheme() {
    const dark=document.documentElement.dataset.theme==='dark';
    theme.setAttribute('aria-pressed',String(dark));
    document.getElementById('themeEmoji').textContent=dark?'☾':'☼';
    document.getElementById('themeLabel').textContent=dark?'Modo escuro':'Modo claro';
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content='#1261A0';
  }
  toggle.addEventListener('click',()=>setOpen(!app.classList.contains('menu-open')));
  backdrop.addEventListener('click',()=>{setOpen(false);toggle.focus()});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&app.classList.contains('menu-open')){
      setOpen(false);toggle.focus();event.preventDefault();
    }
  });
  sidebar.querySelectorAll('.raf-nav-link').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
  window.addEventListener('resize',()=>setOpen(false),{passive:true});
  theme.addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem('raf-prazo:theme',next)}catch(_){}
    syncTheme();
  });
  setOpen(false);
  syncTheme();
})();
