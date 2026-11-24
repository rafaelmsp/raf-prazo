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
    # Identidade visual: o menu não pode ocupar 246 px sem mostrar as legendas.
    assert page.locator("#rafUxHomeNav .nav-icon svg").count()==1, "Ícone Início não pode estar duplicado"
    header=page.evaluate("""() => {
      const color = selector => getComputedStyle(document.querySelector(selector)).color;
      const bg = selector => getComputedStyle(document.querySelector(selector)).backgroundColor;
      return {logo:bg('.header .logo'),search:color('#rafUxSearchOpen'),
        theme:color('#themeToggle'),news:color('#rafNewsOpen')};
    }""")
    assert header["logo"]=="rgb(16, 46, 76)",f"Logotipo precisa ser contrastante: {header}"
    assert header["search"]!="rgb(255, 255, 255)",f"Busca ilegível: {header}"
    assert header["theme"]!="rgb(255, 255, 255)",f"Tema ilegível: {header}"
    assert header["news"]!="rgb(255, 255, 255)",f"Atualizações ilegíveis: {header}"
    if width>=1450:
        assert page.locator("#app").evaluate("e => e.classList.contains('menu-open')")
        assert page.locator("#rafUxHomeNav .nav-text").is_visible(), "Legendas visíveis no desktop amplo"
        page.wait_for_function("document.querySelector('#mainSidebar').getBoundingClientRect().width >= 239")
        sidebar_w=page.locator("#mainSidebar").evaluate("e => e.getBoundingClientRect().width")
        assert 236<=sidebar_w<=253,f"Sidebar do desktop deve ter ~246 px, não um painel vazio: {sidebar_w}"
        page.locator("#menuToggle").click()
        assert page.locator("#menuToggle").get_attribute("aria-expanded")=="false"
        assert page.locator("#rafUxHomeNav .nav-text").is_hidden()
        page.wait_for_function("document.querySelector('#mainSidebar').getBoundingClientRect().width <= 80")
        assert page.locator("#mainSidebar").evaluate("e => e.getBoundingClientRect().width")<=80
        page.locator("#menuToggle").click()
        assert page.locator("#rafUxHomeNav .nav-text").is_visible()
    elif width>1060:
        page.wait_for_function("document.querySelector('#mainSidebar').getBoundingClientRect().width <= 80")
        assert page.locator("#mainSidebar").evaluate("e => e.getBoundingClientRect().width")<=80
        page.locator("#menuToggle").click()
        assert page.locator("#menuToggle").get_attribute("aria-expanded")=="true"
        assert page.locator("#rafUxHomeNav .nav-text").is_visible()
        page.locator("#menuToggle").click()
        assert page.locator("#rafUxHomeNav .nav-text").is_hidden()
    else:
        assert page.locator("#menuToggle").is_visible()
        assert page.locator("#mainSidebar").evaluate("e => e.getBoundingClientRect().right <= 1")
        page.locator("#menuToggle").click()
        assert page.locator("#rafUxHomeNav .nav-text").is_visible()
    page.locator("#rafUxHomeNav").click()
    assert page.locator("#rafUxHome").is_visible()
    assert page.locator(".raf-ux-tile").count()==7
    assert page.locator('[data-ux-action="manual"]').count()==1
    assert page.locator("#rafUxHomeNav").get_attribute("aria-current")=="page"
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),"Home overflow"
    if width in (390,1366,1752):
        SHOTS.mkdir(exist_ok=True)
        page.screenshot(path=str(SHOTS/f"home-{width}.png"),full_page=True)
    page.locator("#rafUxSearchOpen").click()
    assert page.locator("#rafUxSearchDialog").is_visible()
    page.locator("#rafUxSearchInput").fill("AR negativo")
    assert page.locator("#rafUxSearchResults button").count()>=2
    page.locator("#rafUxSearchResults button").filter(has_text="Retirada de pauta — diligência negativa do OJA").click()
    assert page.locator("#rafCertView").is_visible()
    cat=page.locator("#rafCertCategories button.raf-cert-category",has_text="Pauta")
    cat.click()
    assert cat.get_attribute("aria-pressed")=="true"
    assert page.locator("#rafCertList .raf-cert-item").count()==12
    assert page.locator("#rafCertCount").inner_text().startswith("12 modelo")
    assert page.evaluate("window.RafPrazoCertidoes.models().length")==26
    ids=page.evaluate("""() => window.RafPrazoCertidoes.models()
      .filter(m=>m.group==='Pauta'&&m.title.startsWith('* ')).map(m=>m.id)""")
    assert len(ids)==12 and len(set(ids))==12
    assert page.evaluate("window.RafPrazoCertidoes.open({id:'pauta-ar-assinado-terceiro'})")
    assert page.locator("#rafCertEditor").input_value()=="Certifico que o AR de id.XXXXX foi assinado por terceiros."
    with page.expect_event("dialog") as pending:
        page.locator("#rafCertCopy").click()
    assert "campos" in pending.value.message
    pending.value.dismiss()
    assert "copiado" not in page.locator("#rafCertFeedback").inner_text().lower()
    assert page.evaluate("window.RafPrazoCertidoes.open({id:'pauta-desentranhamento-cumprido'})")
    assert page.locator("#rafCertEditor").input_value().endswith("conforme despacho de index")
    assert page.evaluate("window.RafPrazoCertidoes.open({category:'Pauta'})")
    page.locator("#rafCertSearch").fill("AR negativo")
    assert page.locator("#rafCertList .raf-cert-item").count()>=2
    page.locator("#rafCertList .raf-cert-item").filter(has_text="Retirada de pauta — diligência negativa do OJA").click()
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
    assert page.locator("#rafUxTotalModels").inner_text()=="26"
    assert page.locator("#rafUxPautaModels").inner_text()=="12"
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
    print(f"UX_PREMIUM_OK {width}px · home, busca, Pauta(12), OJA e cálculo preservado",flush=True)
    context.close()

def main():
    with Server(("127.0.0.1",0),Handler) as server:
        thread=threading.Thread(target=server.serve_forever,daemon=True)
        thread.start()
        base=f"http://127.0.0.1:{server.server_address[1]}"
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            try:
                for width in (360,390,430,1024,1366,1752):visit(browser,base,width)
            finally:browser.close()
        server.shutdown()

if __name__=="__main__":main()
