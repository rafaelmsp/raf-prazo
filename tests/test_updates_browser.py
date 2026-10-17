"""Teste real do painel Atualizações em Chromium 360, 390, 430 px e desktop."""
from __future__ import annotations

import http.server
import pathlib
import socketserver
import threading

from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):
        pass

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True

def open_updates(page):
    page.wait_for_function("document.getElementById('rafNewsDialog') && window.RafPrazoData?.base")
    page.wait_for_timeout(120)
    page.evaluate("""() => {
      for(const d of document.querySelectorAll('dialog[open]'))d.close();
      const gate=document.querySelector('.raf-access-gate');
      if(gate)gate.hidden=true;
      document.getElementById('rafNewsDialog').showModal();
    }""")
    assert page.locator("#rafNewsDialog").evaluate("(el)=>el.open")

def check_width(browser,url,width):
    context=browser.new_context(viewport={"width":width,"height":780},locale="pt-BR",color_scheme="light")
    page=context.new_page()
    exceptions=[]
    page.on("pageerror",lambda error: exceptions.append(str(error)))
    page.goto(url,wait_until="domcontentloaded")
    open_updates(page)
    assert page.locator("#rafNewsDialog").evaluate(
        "(el)=>{const r=el.getBoundingClientRect();return r.left>=-2&&r.right<=innerWidth+2}"
    ),f"Modal fora do viewport {width}"
    expected=[("News","Calendário"),("Tjrj","TJRJ"),("Pending","Pendências"),
              ("Sources","Fontes"),("Sync","Sincronização")]
    for key,label in expected:
        tab=page.locator("#rafTab"+key)
        tab.click()
        assert tab.get_attribute("aria-selected")=="true",f"Falhou aba {label} em {width}px"
        assert page.locator("#rafPanel"+key).is_visible(),f"Painel {label} oculto em {width}px"
    page.locator("#rafTabNews").click()
    page.locator("#rafTabNews").press("ArrowRight")
    assert page.locator("#rafTabTjrj").get_attribute("aria-selected")=="true"
    page.locator("#rafTabPending").click()
    initial=page.locator("#rafCandidatesList article.raf-event").count()
    assert initial>0,"Base pública/embutida deveria possuir candidatos não validados"
    keys=("raf-prazo:tjrj-exclusions-user:v1","raf-prazo:exclusoes-individuais:v1")
    user_before=page.evaluate("(keys)=>keys.map(k=>localStorage.getItem(k))",list(keys))
    page.once("dialog",lambda dialog:dialog.dismiss())
    page.locator("#rafClearPending").click()
    assert page.locator("#rafCandidatesList article.raf-event").count()==initial,"Cancelar limpeza não pode ocultar nada"
    page.once("dialog",lambda dialog:dialog.accept())
    page.locator("#rafClearPending").click()
    after=page.locator("#rafCandidatesList article.raf-event").count()
    assert after<initial,"Limpar lista deve ocultar candidatos da aba atual"
    assert "Ocultar" not in page.locator("#rafPendingCount").inner_text(),"Somente estado, sem destruir fonte"
    page.locator("#rafTabNews").click()
    assert page.locator("#rafUpdatesList .raf-event").count()>0,"Limpar Pendências não pode limpar Calendário"
    saved=page.evaluate("localStorage.getItem('raf-prazo:updates-pending-hidden:v1')")
    assert saved and saved!="[]","Ocultos devem persistir no navegador"
    page.reload(wait_until="domcontentloaded")
    open_updates(page)
    page.locator("#rafTabPending").evaluate("(el)=>el.click()")
    assert page.locator("#rafPanelPending").is_visible(),"Painel Pendências não ficou visível após reload"
    assert page.evaluate("localStorage.getItem('raf-prazo:updates-pending-hidden:v1')")==saved,"Ocultação perdida após reload"
    page.locator("#rafRestorePending").click(timeout=6000)
    assert page.locator("#rafCandidatesList article.raf-event").count()==initial,"Restaurar não recuperou lista"
    assert page.evaluate("localStorage.getItem('raf-prazo:updates-pending-hidden:v1')")=="[]"
    assert page.evaluate("(keys)=>keys.map(k=>localStorage.getItem(k))",list(keys))==user_before,"Exclusões pessoais foram afetadas"
    original=page.evaluate("getComputedStyle(document.body).color")
    page.evaluate("document.documentElement.dataset.theme='dark'")
    changed=page.evaluate("getComputedStyle(document.body).color")
    assert changed!=original,"Tema escuro não alterou a paleta"
    assert not exceptions,repr(exceptions)
    print(f"MOBILE_BROWSER_OK {width}px · 5 abas, teclado, cancelar/limpar/restaurar, reload, isolamento e tema")
    context.close()

def main():
    with Server(("127.0.0.1",0),Handler) as server:
        thread=threading.Thread(target=server.serve_forever,daemon=True)
        thread.start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as play:
            browser=play.chromium.launch(headless=True)
            try:
                for width in (360,390,430,1366):
                    check_width(browser,url,width)
            finally:
                browser.close()
        server.shutdown()

if __name__=="__main__":
    main()
