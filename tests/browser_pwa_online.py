"""Testa PWA Raf-Prazo 2.5 conectado, desconectado e reconectado.
Sem dependência de serviços externos; Chromium usa a origem local como site.
"""
import http.server
import pathlib
import socketserver
import threading
import urllib.parse

from playwright.sync_api import Error, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
class Handler(http.server.SimpleHTTPRequestHandler):
    health_down=False
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        if urllib.parse.urlparse(self.path).path.endswith('/pwa-health.json') and type(self).health_down:
            self.send_response(503)
            self.send_header('Cache-Control','no-store')
            self.send_header('Content-Type','application/json')
            self.end_headers()
            self.wfile.write(b'{"service":"raf-prazo","online":false}')
            return
        return super().do_GET()
    def log_message(self,*args): pass
class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True

def check_page(browser,base,page_path,width):
    context=browser.new_context(viewport={'width':width,'height':844},locale='pt-BR',service_workers='allow')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda err: errors.append(str(err)))
    page.goto(base+page_path,wait_until='domcontentloaded')
    gate=page.locator('#rafPwaGate')
    gate.wait_for(state='hidden',timeout=15000)
    assert page.locator('#rafPwaStatusTitle').count()==1
    assert page.locator('#rafPwaRetry').count()==1
    assert page.locator('link[rel="manifest"]').count()==1
    assert page.locator('meta[name="theme-color"]').count()==1
    assert page.locator('html').evaluate('(el)=>el.classList.contains("raf-pwa-locked")') is False
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
    app='#rafAppShell' if '/prazos/' in page_path else '#app'
    assert page.locator(app).evaluate('e => !e.inert')
    if page_path=='/prazos/':
        assert page.locator('#groups .card').count()==32
    else:
        assert page.locator('#due').count()==1
        # Primeira visita à calculadora exibe o termo legal obrigatório.
        terms=page.locator('#rafTermsDialog')
        if terms.count() and terms.evaluate('dialog=>dialog.open'):
            page.locator('#rafTermsCheckbox').check()
            page.locator('#rafTermsAccept').click()
            terms.wait_for(state='hidden',timeout=4000)

    # Service Worker tem escopo local correto, não grava assets para offline.
    page.wait_for_function("navigator.serviceWorker && !!navigator.serviceWorker.controller",timeout=15000)
    reg=page.evaluate("""async()=>{
      const registration=await navigator.serviceWorker.ready;
      return {scope:registration.scope,controlled:!!navigator.serviceWorker.controller,caches:await caches.keys()};
    }""")
    assert reg['controlled'] and reg['scope']==base+'/',reg
    assert not [key for key in reg['caches'] if key.startswith('raf-prazo-pwa-')],reg

    # Testar instalação sem prompt nativo obrigatório no navegador emulado.
    page.evaluate("""()=>{
      const event=new Event('beforeinstallprompt',{cancelable:true});
      event.prompt=()=>Promise.resolve();
      event.userChoice=Promise.resolve({outcome:'accepted'});
      window.dispatchEvent(event);
    }""")
    install=page.locator('.raf-pwa-install')
    install.wait_for(state='visible',timeout=3000)
    install.click()
    install.wait_for(state='hidden',timeout=3000)

    # Internet desligada: bloqueio de todas as ferramentas.
    context.set_offline(True)
    gate.wait_for(state='visible',timeout=4000)
    assert page.locator(app).evaluate('e=>e.inert')
    assert 'Sem conexão' in page.locator('#rafPwaStatusTitle').inner_text()
    assert gate.evaluate('e=>e.matches(":modal")'),"Gate precisa ser modal acima de outros diálogos"
    page.locator('#rafPwaRetry').click()
    assert gate.is_visible(),"Retry não pode liberar a calculadora sem internet"

    # Retomar internet: o app precisa de uma resposta HTTP real do site.
    context.set_offline(False)
    gate.wait_for(state='hidden',timeout=12000)
    assert page.locator(app).evaluate('e=>!e.inert')

    # O servidor fica indisponível embora o navegador ainda esteja online.
    Handler.health_down=True
    try:
        page.evaluate("window.dispatchEvent(new Event('online'))")
        gate.wait_for(state='visible',timeout=12000)
        assert page.locator(app).evaluate('e=>e.inert')
    finally:
        Handler.health_down=False
    page.locator('#rafPwaRetry').click()
    gate.wait_for(state='hidden',timeout=12000)

    # Nenhuma cópia offline permite abrir a app depois de instalada/ativada.
    context.set_offline(True)
    try:
        page.reload(wait_until='domcontentloaded',timeout=5000)
        # Se alguma plataforma recarregar página antiga, o bloqueio precisa permanecer.
        assert gate.is_visible(),"O app nunca pode funcionar offline"
    except Error:
        pass  # Com SW network-only, falha de navegação é a resposta esperada.
    context.set_offline(False)
    page.goto(base+page_path,wait_until='domcontentloaded')
    page.locator('#rafPwaGate').wait_for(state='hidden',timeout=12000)
    assert not errors,errors
    print(f'PWA_ONLINE_ONLY_OK {page_path} {width}px: install, gate, site-down, offline, reconnect',flush=True)
    context.close()

def main():
    with Server(('127.0.0.1',0),Handler) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        base=f'http://127.0.0.1:{server.server_address[1]}'
        try:
            with sync_playwright() as playwright:
                browser=playwright.chromium.launch(headless=True)
                try:
                    check_page(browser,base,'/',390)
                    check_page(browser,base,'/prazos/',390)
                    check_page(browser,base,'/',1366)
                finally:
                    browser.close()
        finally:
            server.shutdown()

if __name__=='__main__':
    main()
