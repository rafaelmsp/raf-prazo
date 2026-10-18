/* Raf-Prazo 2.5 — Service Worker sem cache.
 * PWA dependente do site: sem instalação de conteúdo offline.
 * Se uma requisição de rede falhar, a navegação deve falhar;
 * nunca responder com cópia anterior da calculadora.
 */
'use strict';
self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    // Nunca manter CacheStorage criado por versões anteriores deste PWA.
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('raf-prazo-pwa-'))
      .map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  const scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  // Inclusive navegação, JS, CSS, iconografia e arquivo de calendário:
  // rede obrigatória, sem cache nem resposta alternativa.
  event.respondWith(fetch(req,{cache:'no-store'}));
});
