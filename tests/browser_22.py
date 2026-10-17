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
    assert page.locator("#rafProfileOpen").is_visible()
    assert not page.locator("#rafProfileDialog").is_visible()
    assert page.locator("#rafRegime").input_value()=="jec"
    assert page.locator("#rafAct").input_value()=="custom"
    assert page.locator("#rafContextResult").inner_text().startswith("JEC")
    assert page.locator(".raf-22-parameters #rafRegime").count()==0, "O seletor deve estar fora do painel esquerdo"
    # Fluxo evidente: resultado primeiro e parâmetros imediatamente abaixo.
    due_panel=page.locator(".raf-22-results").bounding_box()
    params=page.locator(".raf-22-parameters").bounding_box()
    date_input=page.locator("#start").bounding_box()
    calendar_panel=page.locator(".raf-22-calendar").bounding_box()
    assert due_panel and params and date_input and calendar_panel
    assert params["y"]>=due_panel["y"]+due_panel["height"]-3, f"Parâmetros devem ficar abaixo do vencimento em {width}px"
    if width>=1061:
        assert due_panel["x"]<calendar_panel["x"], f"Vencimento deve ficar à esquerda em desktop {width}px"
        assert params["x"]<calendar_panel["x"], f"Parâmetros devem ficar à esquerda em desktop {width}px"
        assert calendar_panel["x"]>=params["x"]+params["width"]-3, f"Colunas sobrepostas em {width}px"
        assert abs(due_panel["x"]-params["x"])<3, f"Vencimento e parâmetros desalinhados em {width}px"
    elif width>740:
        assert calendar_panel["x"]<due_panel["x"], f"Tablet deve preservar o layout em {width}px"
    else:
        assert calendar_panel["y"]>=params["y"]+params["height"]-3, f"Celular deve manter calendário após parâmetros em {width}px"
    assert date_input["height"]>=52, f"Campo de data pouco evidente em {width}px"
    assert page.locator("#start").evaluate("(el)=>getComputedStyle(el).borderTopWidth")=="2px"
    days_boxes=page.locator("#calendar button.day")
    assert days_boxes.count()==42
    cells=days_boxes.evaluate_all("(els)=>els.map(el=>{const box=el.getBoundingClientRect();return [box.width,box.height]})")
    assert all(abs(w-h)<4 for w,h in cells), f"Casas do calendário esticadas em {width}px: {cells[:4]}"
    assert max(h for w,h in cells)<=66, f"Casas muito grandes em {width}px"
    assert page.locator("#rafCalendarSettings").get_attribute("open") is None
    assert page.locator(".raf-22-parameters #rafRuleBox").count()==0, "Fundamentos devem aparecer apenas no drawer"
    old_calendar_y=page.locator(".raf-22-calendar").evaluate("(el)=>el.getBoundingClientRect().top + scrollY")
    if width <= 430:
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),f"Overflow horizontal global em {width}px"
    for sel in ("#rafProfileOpen","#start","#days","#calendar","#due"):
        box=page.locator(sel).bounding_box()
        assert box and box["width"]>30 and box["x"]>=-2 and box["x"]+box["width"]<=width+2, f"{sel} fora da tela {width}px: {box}"
    SHOTS.mkdir(exist_ok=True)
    page.screenshot(path=str(SHOTS/f"raf-prazo-22-{width}-light.png"),full_page=True)
    before=page.locator(".raf-22-calendar").evaluate("(el)=>el.getBoundingClientRect().top+scrollY")
    page.locator("#rafCalendarSettings summary").click()
    assert page.locator("#rafCalendarSettings").get_attribute("open") is not None
    after=page.locator(".raf-22-calendar").evaluate("(el)=>el.getBoundingClientRect().top+scrollY")
    if width>740: assert abs(before-after)<3, f"Abrir feriados deslocou calendário em {width}px"
    page.locator("#rafCalendarSettings summary").click()
    assert page.locator("#rafCalendarSettings").get_attribute("open") is None
    page.locator("#rafProfileOpen").click()
    assert page.locator("#rafProfileDialog").is_visible()
    assert page.locator("#rafRegime").is_visible()
    assert page.locator("#rafAct").is_hidden(), "O seletor nativo não deve aparecer no celular"
    assert page.locator("#rafActSearch").count()==0, "A lista deve estar pronta, sem pesquisa"
    assert page.locator("#rafActFilters").count()==0, "Nenhuma categoria deve esconder os atos"
    assert page.locator("#rafActList button.raf-library-item").count()==13
    assert page.locator("#rafActCount").inner_text()=="13 opções · JEC"
    assert page.locator("#rafActList .raf-library-group").count()>=4
    assert page.locator('#rafActList button[data-preset="jec_recurso"]').is_visible()
    assert page.locator('#rafActList button[data-preset="jec_preparo"]').count()==1
    assert page.locator('#rafActList button[data-preset="jec_embargos_titulo_judicial"]').count()==1
    assert page.locator('#rafActList button[data-preset="jec_embargos_titulo_extrajudicial"]').count()==1
    assert page.locator('#rafActList button[data-preset="jec_cumprimento_pagar"]').count()==1
    assert page.locator(".raf-library-legend").is_visible()
    assert page.locator('#rafActList button[data-preset="custom"]').count()==1
    assert page.locator("#rafRuleBox").is_visible()
    # Drawer ocupa camada independente e não aumenta a altura do calendário.
    new_calendar_y=page.locator(".raf-22-calendar").evaluate("(el)=>el.getBoundingClientRect().top + scrollY")
    assert abs(new_calendar_y-old_calendar_y)<2, f"Calendário deslocado pelo drawer ({width}px)"
    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),"Drawer provocou overflow horizontal"
    page.screenshot(path=str(SHOTS/f"raf-prazo-22-{width}-drawer-light.png"),full_page=True)
    page.locator('#rafActList button[data-preset="jec_recurso"]').click()
    assert page.locator("#days").input_value()=="10"
    assert "10 dias úteis" in page.locator("#rafRuleSummary").inner_text()
    assert page.locator("#rafActBasis").inner_text().endswith("42, caput")
    page.locator('#rafActList button[data-preset="jec_embargos"]').click()
    assert page.locator("#days").input_value()=="5"
    # Hora não é dia útil: seleção deve invalidar o resultado, sem converter 48 h em 2 dias.
    page.locator('#rafActList button[data-preset="jec_preparo"]').click()
    assert page.locator("#days").input_value()==""
    assert page.locator("#days").is_disabled()
    assert page.locator("#rafActAlert").is_visible()
    assert page.evaluate("window.RafPrazo22Current.count_mode")=="hours_unsupported"
    page.locator('#rafActList button[data-preset="jec_embargos_titulo_judicial"]').click()
    assert page.locator("#days").input_value()=="","A hipótese de 15 dias não pode ser imposta automaticamente"
    assert page.locator("#due").inner_text()=="—"
    assert page.evaluate("window.RafPrazo22Current.reference_days")==15
    assert not page.evaluate("window.RafPrazo22Current.reference_accepted")
    assert page.locator("#rafConditionalApply").is_visible()
    assert "penhora" in page.locator("#rafActDescription").inner_text()
    page.locator("#rafConditionalApply").click()
    assert page.locator("#days").input_value()=="15"
    assert page.evaluate("window.RafPrazo22Current.reference_accepted")
    assert page.locator("#rafConditionalApply").is_hidden()
    assert page.locator("#due").inner_text()!="—"
    page.locator('#rafActList button[data-preset="jec_embargos_titulo_extrajudicial"]').click()
    assert page.locator("#days").input_value()==""
    assert page.locator("#rafConditionalApply").is_hidden()
    assert "audiência" in page.locator("#rafActDescription").inner_text()
    page.locator('#rafActList button[data-preset="jec_cumprimento_pagar"]').click()
    assert page.locator("#days").input_value()==""
    assert page.locator("#rafConditionalApply").is_visible()
    assert "CPC, art. 523" in page.locator("#rafActBasis").inner_text()
    page.locator('#rafActList button[data-preset="jec_cumprimento_fazer"]').click()
    assert page.locator("#days").input_value()==""
    assert page.locator("#rafConditionalApply").is_hidden()
    page.locator('#rafActList button[data-preset="jec_contestacao"]').click()
    assert page.locator("#days").input_value()==""
    assert not page.locator("#days").is_disabled()
    assert page.evaluate("window.RafPrazo22Current.requires_manual_review")
    page.locator('#rafActList button[data-preset="jec_embargos"]').click()
    assert page.locator("#days").input_value()=="5"
    page.locator("#rafProfileDone").click()
    assert not page.locator("#rafProfileDialog").is_visible()
    page.locator("#days").fill("7")
    assert page.locator("#rafAct").input_value()=="custom"
    assert "Prazo personalizado" in page.locator("#rafProfileShort").inner_text()
    page.locator("#rafProfileOpen").click()
    assert page.locator("#rafProfileDialog").is_visible()
    # Comunicação é informativa; o marco utilizado não muda automaticamente.
    original=page.locator("#start").input_value()
    page.locator("#rafCommunicationDetails summary").click()
    page.locator("#rafOrigin").select_option("pessoal")
    page.locator("#rafCommunicationDate").fill("2026-10-18")
    assert page.locator("#start").input_value()==original
    assert page.evaluate("window.RafPrazo22Current.communication_date")=="2026-10-18"
    page.locator("#rafRegime").select_option("cpc")
    assert page.locator("#rafAct").input_value()=="custom"
    assert page.locator("#rafActList button.raf-library-item").count()==21
    assert page.locator("#rafActCount").inner_text()=="21 opções · CPC"
    assert page.locator('#rafActList button[data-preset="cpc_pagamento_523"]').count()==1
    page.locator('#rafActList button[data-preset="cpc_apelacao"]').click()
    assert page.locator("#days").input_value()=="15"
    assert page.locator("#rafContextResult").inner_text().startswith("CPC")
    page.locator("#rafProfileDone").click()
    assert not page.locator("#rafProfileDialog").is_visible()
    assert page.locator("#rafProfileOpen").is_visible()
    assert page.locator("#rafProfileShort").inner_text().startswith("CPC")
    page.reload(wait_until="domcontentloaded")
    page.wait_for_function("window.RafPrazoLegal22?.getCurrent()")
    assert page.locator("#rafRegime").input_value()=="cpc"
    assert page.locator("#rafAct").input_value()=="cpc_apelacao"
    assert page.locator("#days").input_value()=="15"
    assert page.locator("#rafContextResult").inner_text().startswith("CPC")
    assert not page.locator("#rafProfileDialog").is_visible()
    # Os termos já foram aceitos antes do reload.
    page.locator("#memoryOpen").click()
    assert page.locator("#memoryDialog").is_visible()
    assert "Processo Civil" in page.locator("#memorySource").inner_text()
    page.locator('[data-close="memoryDialog"]').click()
    page.locator("#themeToggle").click()
    assert page.locator("html").get_attribute("data-theme")=="dark"
    page.screenshot(path=str(SHOTS/f"raf-prazo-22-{width}-dark.png"),full_page=True)
    page.locator("#rafProfileOpen").click()
    assert page.locator("#rafProfileDialog").is_visible()
    page.screenshot(path=str(SHOTS/f"raf-prazo-22-{width}-drawer-dark.png"),full_page=True)
    page.locator("#rafProfileDone").click()
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
                for width in (360,390,430,1024,1366):check(browser,f"http://127.0.0.1:{server.server_address[1]}/",width)
            finally:browser.close()
        server.shutdown()
if __name__=="__main__":main()
