/* Raf-Prazo 2.5 — PWA online-only.
 * Sem armazenamento offline, nenhum fallback de calendário e nenhuma API externa.
 */
(() => {
  'use strict';
  const script=document.currentScript;
  const root=new URL('../',script?.src||document.baseURI);
  const statusUrl=new URL('pwa-health.json',root);
  const gate=document.getElementById('rafPwaGate');
  const retry=document.getElementById('rafPwaRetry');
  const application=document.getElementById('app')||document.getElementById('rafAppShell');
  let checking=null;
  let installEvent=null;
  let installButton=null;

  function lock(locked,verifying=false) {
    if(gate) {
      if(locked) {
        gate.hidden=false;
        // Uma dialog modal fica à frente inclusive de modais jurídicos já abertos.
        if(gate.open&&!gate.matches(':modal'))gate.close();
        if(!gate.open)gate.showModal();
      }else{
        if(gate.open)gate.close();
        gate.hidden=true;
      }
    }
    const title=document.getElementById('rafPwaStatusTitle');
    const message=document.getElementById('rafPwaStatusText');
    if(locked&&title)title.textContent=verifying?'Conectando ao Raf-Prazo':'Sem conexão com o Raf-Prazo';
    if(locked&&message)message.textContent=verifying
      ?'Verificando o acesso ao site oficial. Aguarde um instante.'
      :'Este aplicativo depende da internet e do site Raf-Prazo. Verifique a conexão e tente novamente.';
    document.documentElement.classList.toggle('raf-pwa-locked',locked);
    if(application) {
      application.inert=locked;
      if(locked)application.setAttribute('aria-hidden','true');
      else application.removeAttribute('aria-hidden');
    }
    if(locked && document.activeElement && application?.contains(document.activeElement)) {
      try{document.activeElement.blur()}catch(_){}
    }
  }

  async function check() {
    if(checking)return checking;
    checking=(async()=>{
      // Nem wifi conectado nem navigator.onLine comprovam acesso ao site.
      if(navigator.onLine===false) {
        lock(true);
        return false;
      }
      const abort=new AbortController();
      const timeout=setTimeout(()=>abort.abort(),8000);
      try {
        const probe=new URL(statusUrl.href);
        probe.searchParams.set('online',String(Date.now()));
        probe.searchParams.set('nonce',Math.random().toString(36).slice(2));
        const response=await fetch(probe.href,{
          method:'GET',cache:'no-store',credentials:'same-origin',
          redirect:'error',signal:abort.signal,
          headers:{'Accept':'application/json'}
        });
        if(!response.ok)throw Error('Site indisponível');
        const data=await response.json();
        if(data.service!=='raf-prazo'||data.online!==true)throw Error('Resposta inválida');
        lock(false);
        return true;
      }catch(_){
        lock(true);
        return false;
      }finally{
        clearTimeout(timeout);
      }
    })();
    try{return await checking}
    finally{checking=null}
  }

  function createInstallButton(){
    if(installButton)return installButton;
    const host=document.querySelector('.header-actions')||document.querySelector('.raf-header-actions');
    if(!host)return null;
    const button=document.createElement('button');
    button.type='button';
    button.className='raf-pwa-install';
    button.textContent='Instalar aplicativo';
    button.hidden=true;
    button.setAttribute('aria-label','Instalar Raf-Prazo neste dispositivo');
    button.addEventListener('click',async()=>{
      if(!installEvent)return;
      const pending=installEvent;
      installEvent=null;
      button.hidden=true;
      try{
        await pending.prompt();
        await pending.userChoice;
      }catch(_){}
    });
    host.prepend(button);
    installButton=button;
    return button;
  }

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    installEvent=event;
    if(installButton)installButton.hidden=false;
  });
  window.addEventListener('appinstalled',()=>{
    installEvent=null;
    if(installButton)installButton.hidden=true;
  });

  async function start(){
    createInstallButton();
    // Impede o acesso ao app antes do primeiro teste real do site.
    lock(true,true);
    if(retry)retry.addEventListener('click',()=>{check()});
    window.addEventListener('offline',()=>lock(true));
    window.addEventListener('online',()=>{check()});
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden){lock(true,true);check()}
    });
    window.addEventListener('pageshow',()=>{
      lock(true,true);check();
    });
    setInterval(()=>{if(!document.hidden)check()},15000);
    // Não esperar a instalação do SW para liberar a interface após a resposta real.
    const verification=check();
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register(new URL('sw.js',root).href,{scope:root.href})
        .then(reg=>reg.update().catch(()=>{}))
        .catch(()=>{});
    }
    await verification;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
