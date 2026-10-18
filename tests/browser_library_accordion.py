"""E2E da Biblioteca com categorias retráteis, filtros e prazo condicionado."""
from __future__ import annotations
import http.server
import pathlib
import socketserver
import threading
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
SHOTS=ROOT/"tests"/"screenshots-library"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):
        pass

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True

def page_test(browser,base,width):
    context=browser.new_context(viewport={"width":width,"height":844},locale="pt-BR")
    page=context.new_page()
    errors=[]
    page.on("pageerror",lambda err:errors.append(str(err)))
    page.goto(base+"/prazos/",wait_until="domcontentloaded")
    groups=page.locator("#groups details.group")
    page.wait_for_function("document.querySelectorAll('#groups details.group').length >= 4")
    assert page.locator("#groups .card").count()==32
    assert page.locator("#count").inner_text().startswith("32")
    assert groups.count()>=7
    first=groups.nth(0)
    second=groups.nth(1)
    assert first.locator("summary").count()==1
    assert first.locator(".group-count").inner_text()=="4"
    assert first.get_attribute("open") is not None, "Primeira categoria deve iniciar aberta"
    if width<=760:
        assert second.get_attribute("open") is None,"Segunda categoria deve iniciar fechada no celular"
    else:
        assert second.get_attribute("open") is not None,"Desktop inicia com categorias abertas"

    # Recolher a primeira e reabri-la pela própria faixa de título.
    first.locator("summary").click()
    assert first.get_attribute("open") is None
    first.locator("summary").click()
    assert first.get_attribute("open") is not None
    # No desktop, a segunda ja comeca aberta; verifica fechamento e reabertura.
    if width>760:
        second.locator("summary").click()
        assert second.get_attribute("open") is None
    second.locator("summary").click()
    assert second.get_attribute("open") is not None
    if width<=760:
        page.wait_for_function(
            "document.querySelectorAll('#groups details.group[open]').length === 1"
        )
        assert first.get_attribute("open") is None, "Accordion mobile permite uma categoria aberta"
    else:
        assert first.get_attribute("open") is not None,"Desktop permite grupos independentes"

    if width in (390,1366):
        SHOTS.mkdir(exist_ok=True)
        page.screenshot(path=str(SHOTS/f"accordion-{width}.png"),full_page=False)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2")

    # Busca deve mostrar os resultados sem obrigar a abrir a categoria.
    page.locator("#search").fill("recurso inominado")
    page.wait_for_function("document.querySelectorAll('#groups .card').length === 1")
    assert groups.first.get_attribute("open") is not None
    assert "Recurso inominado" in groups.first.inner_text()
    page.locator("#search").fill("")
    page.wait_for_function("document.querySelectorAll('#groups .card').length === 32")

    # A seleção do ato continua funcional e a ficha jurídica é conservadora.
    act=page.get_by_role("button",name="Recurso inominado")
    if width<=760:
        act.first.click()
        assert page.locator("#dialog").evaluate("e => e.open")
        assert page.locator("#apply").is_disabled()
        page.locator("#close").click()
    else:
        first.locator("summary").click() if first.get_attribute("open") is None else None
        act.first.click()
        assert "Recurso inominado" in page.locator("#preview").inner_text()
    assert not errors,errors
    print(f"ACCORDION_OK {width}px · native summary, filtros, UX e ficha",flush=True)
    context.close()

def main():
    with Server(("127.0.0.1",0),Handler) as http:
        thread=threading.Thread(target=http.serve_forever,daemon=True)
        thread.start()
        url=f"http://127.0.0.1:{http.server_address[1]}"
        try:
            with sync_playwright() as playwright:
                browser=playwright.chromium.launch(headless=True)
                try:
                    for width in (360,390,430,1366):
                        page_test(browser,url,width)
                finally:
                    browser.close()
        finally:
            http.shutdown()

if __name__=="__main__":
    main()
