"""UX Premium: E2E no app real, com certidão de diligência negativa e navegação."""
from __future__ import annotations
import http.server
import pathlib
import socketserver
import threading
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
SHOTS = ROOT / "tests" / "screenshots-premium"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True

def visit(browser,base,width):
    context=browser.new_context(viewport={"width":width,"height":880},locale="pt-BR",color_scheme="light",
                                permissions=["clipboard-read","clipboard-write"])
    page=context.new_page()
    exceptions=[]
    page.on("pageerror",lambda e:exceptions.append(str(e)))
    page.goto(base+"/",wait_until="domcontentloaded")
    page.locator("#rafUxHomeNav").wait_for()
    page.wait_for_function("window.RafPrazoLegal22?.getCurrent()")
    if page.locator("#rafTermsDialog").is_visible():
        page.locator("#rafTermsCheckbox").check()
        page.locator("#rafTermsAccept").click()
    assert page.locator(".app.raf-ux-premium").count()==1
    assert page.locator("#calendar .day").count()==42,"Calendário original preservado"
    if width<=1060:page.locator("#menuToggle").click()
    page.locator("#rafUxHomeNav").click()
    assert page.locator("#rafUxHome").is_visible()
    assert page.locator(".raf-ux-tile").count()==6
    assert page.locator("#rafUxHomeNav").get_attribute("aria-current")=="page"
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),"Home overflow"
    if width in (390,1366):
        SHOTS.mkdir(exist_ok=True)
        page.screenshot(path=str(SHOTS/f"home-{width}.png"),full_page=True)
    page.locator("#rafUxSearchOpen").click()
    assert page.locator("#rafUxSearchDialog").is_visible()
    page.locator("#rafUxSearchInput").fill("AR negativo")
    assert page.locator("#rafUxSearchResults button").count()==1
    page.locator("#rafUxSearchResults button").first.click()
    assert page.locator("#rafCertView").is_visible()
    cat=page.locator("#rafCertCategories button.raf-cert-category",has_text="Pauta")
    cat.click()
    assert cat.get_attribute("aria-pressed")=="true"
    assert page.locator("#rafCertList .raf-cert-item").count()==4
    assert page.locator("#rafCertCount").inner_text().startswith("4 modelo")
    page.locator("#rafCertSearch").fill("AR negativo")
    assert page.locator("#rafCertList .raf-cert-item").count()==1
    page.locator("#rafCertList .raf-cert-item").first.click()
    text=page.locator("#rafCertEditor").input_value()
    assert "317752646" in text and "certidão do OJA" in text
    assert page.locator("#rafCertTitle").inner_text().startswith("* ")
    assert "substituído" in page.locator("#rafCertNotice").inner_text()
    page.locator("#rafCertCopy").click()
    page.wait_for_function("document.querySelector('#rafCertFeedback').textContent.length>0")
    assert "copiado" in page.locator("#rafCertFeedback").inner_text().lower()
    # Favoritar guarda exclusivamente o ID do modelo, nunca a redação digitada.
    page.locator("#rafCertFavorite").click()
    assert page.locator("#rafCertFavorite").get_attribute("aria-pressed")=="true"
    model_id="pauta-diligencia-negativa-oja"
    stored=page.evaluate("""() => ({
      favorite:localStorage.getItem('raf-prazo:certidoes:favorites:v1'),
      recent:sessionStorage.getItem('raf-prazo:certidoes:recent:v1')
    })""")
    assert stored["favorite"] and model_id in stored["favorite"]
    assert stored["recent"] and model_id in stored["recent"]
    assert "317752646" not in stored["favorite"]+stored["recent"],"Index processual jamais deve persistir"
    page.locator("#rafCertTabFavorites").click()
    assert page.locator("#rafCertTabFavorites").get_attribute("aria-pressed")=="true"
    assert page.locator("#rafCertList .raf-cert-item").count()==1
    page.locator("#rafCertTabRecent").click()
    assert page.locator("#rafCertTabRecent").get_attribute("aria-pressed")=="true"
    assert page.locator("#rafCertList .raf-cert-item").count()==1
    if width<=1060:page.locator("#menuToggle").click()
    page.locator("#rafUxHomeNav").click()
    assert page.locator("#rafUxHome").is_visible()
    assert page.locator("#rafUxFavoritesList .raf-ux-model-shortcut").count()==1
    assert page.locator("#rafUxRecentsList .raf-ux-model-shortcut").count()==1
    assert page.locator("#rafUxTotalModels").inner_text()=="18"
    assert page.locator("#rafUxPautaModels").inner_text()=="4"
    page.locator("#rafUxAllFavorites").click()
    assert page.locator("#rafCertView").is_visible()
    assert page.locator("#rafCertTabFavorites").get_attribute("aria-pressed")=="true"
    assert page.locator("#rafCertList .raf-cert-item").count()==1
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),"Favoritos overflow"
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),"Certidões overflow"
    if width in (390,1366):page.screenshot(path=str(SHOTS/f"certidoes-{width}.png"),full_page=True)
    # Nenhum estado jurídico da calculadora foi substituído.
    assert page.locator("#due").count()==1
    assert page.locator("#calendar .day").count()==42
    assert not exceptions,f"Exceções JavaScript: {exceptions}"
    print(f"UX_PREMIUM_OK {width}px · home, busca, Pauta(4), OJA e cálculo preservado",flush=True)
    context.close()

def main():
    with Server(("127.0.0.1",0),Handler) as server:
        thread=threading.Thread(target=server.serve_forever,daemon=True)
        thread.start()
        base=f"http://127.0.0.1:{server.server_address[1]}"
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            try:
                for width in (360,390,430,1024,1366):visit(browser,base,width)
            finally:browser.close()
        server.shutdown()

if __name__=="__main__":main()
