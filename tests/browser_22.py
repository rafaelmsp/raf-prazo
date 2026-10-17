"""Raf-Prazo 2.2: smoke Chromium em resoluções reais, layout e jornadas jurídicas."""
from __future__ import annotations
import http.server
import pathlib
import socketserver
import threading
ROOT=pathlib.Path(__file__).resolve().parents[1]
SHOTS=ROOT/"tests"/"screenshots-22"
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw): super().__init__(*args,directory=str(ROOT),**kw)
    def log_message(self,*args): pass
class Server(socketserver.ThreadingTCPServer): allow_reuse_address=True
def check(browser,url,width):
    ctx=browser.new_context(viewport={"width":width,"height":820},locale="pt-BR",color_scheme="light")
    page=ctx.new_page()
    errors=[]
    page.on("pageerror",lambda err:errors.append(str(err)))
    page.goto(url,wait_until="domcontentloaded")
    page.wait_for_function("window.RafPrazoLegal22?.getCurrent()")
    # Consentimento verdadeiro pela interface, não por manipulação de estado.
    if page.locator("#rafTermsDialog").is_visible():
        page.locator("#rafTermsCheckbox").check()
        page.locator("#rafTermsAccept").click()
    assert page.locator("#rafRegime").is_visible()
    assert page.locator("#rafRegime").input_value()=="jec"
    assert page.locator("#rafAct").input_value()=="custom"
    assert page.locator("#rafContextResult").inner_text().startswith("JEC")
    if width <= 430:
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),f"Overflow horizontal global em {width}px"
    for sel in ("#rafRegime","#rafAct","#rafRuleBox","#start","#days","#calendar","#due"):
        box=page.locator(sel).bounding_box()
        assert box and box["width"]>30 and box["x"]>=-2 and box["x"]+box["width"]<=width+2, f"{sel} fora da tela {width}px: {box}"
    SHOTS.mkdir(exist_ok=True)
    page.screenshot(path=str(SHOTS/f"raf-prazo-22-{width}-light.png"),full_page=True)
    page.locator("#rafAct").select_option("jec_recurso")
    assert page.locator("#days").input_value()=="10"
    assert "10 dias úteis" in page.locator("#rafRuleSummary").inner_text()
    assert page.locator("#rafActBasis").inner_text().endswith("42, caput")
    page.locator("#rafAct").select_option("jec_embargos")
    assert page.locator("#days").input_value()=="5"
    page.locator("#days").fill("7")
    assert page.locator("#rafAct").input_value()=="custom"
    # Comunicação é informativa; o marco utilizado não muda automaticamente.
    original=page.locator("#start").input_value()
    page.locator("#rafCommunicationDetails summary").click()
    page.locator("#rafOrigin").select_option("pessoal")
    page.locator("#rafCommunicationDate").fill("2026-10-18")
    assert page.locator("#start").input_value()==original
    assert page.evaluate("window.RafPrazo22Current.communication_date")=="2026-10-18"
    page.locator("#rafRegime").select_option("cpc")
    assert page.locator("#rafAct").input_value()=="custom"
    page.locator("#rafAct").select_option("cpc_apelacao")
    assert page.locator("#days").input_value()=="15"
    assert page.locator("#rafContextResult").inner_text().startswith("CPC")
    page.reload(wait_until="domcontentloaded")
    page.wait_for_function("window.RafPrazoLegal22?.getCurrent()")
    assert page.locator("#rafRegime").input_value()=="cpc"
    assert page.locator("#rafAct").input_value()=="cpc_apelacao"
    assert page.locator("#days").input_value()=="15"
    assert page.locator("#rafContextResult").inner_text().startswith("CPC")
    # Os termos já foram aceitos antes do reload.
    page.locator("#memoryOpen").click()
    assert page.locator("#memoryDialog").is_visible()
    assert "Processo Civil" in page.locator("#memorySource").inner_text()
    page.locator('[data-close="memoryDialog"]').click()
    page.locator("#themeToggle").click()
    assert page.locator("html").get_attribute("data-theme")=="dark"
    page.screenshot(path=str(SHOTS/f"raf-prazo-22-{width}-dark.png"),full_page=True)
    assert not errors,f"JavaScript errors: {errors}"
    print(f"PREMIUM_BROWSER_OK {width}px · JEC/CPC, presets, comunicação, memória, tema e persistência",flush=True)
    ctx.close()
def main():
    from playwright.sync_api import sync_playwright
    with Server(("127.0.0.1",0),Handler) as server:
        server_thread=threading.Thread(target=server.serve_forever,daemon=True)
        server_thread.start()
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            try:
                for width in (360,390,430,1366):check(browser,f"http://127.0.0.1:{server.server_address[1]}/",width)
            finally:browser.close()
        server.shutdown()
if __name__=="__main__":main()
