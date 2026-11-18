"""Navegação e download de PDF local do Manual 2º JEC — sem publicar arquivo restrito."""
from __future__ import annotations
import http.server
import pathlib
import socketserver
import threading
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
SHOT=ROOT/"tests"/"screenshots-premium"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True

def fixture_pdf():
    content=b"BT /F1 15 Tf 30 550 Td (Manual PDF de teste local) Tj ET\n"
    objects=[
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 450 600] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length "+str(len(content)).encode()+b" >>\nstream\n"+content+b"endstream",
    ]
    buf=b"%PDF-1.4\n"
    offsets=[0]
    for i,obj in enumerate(objects,1):
        offsets.append(len(buf))
        buf+=str(i).encode()+b" 0 obj\n"+obj+b"\nendobj\n"
    index=len(buf)
    buf+=b"xref\n0 "+str(len(offsets)).encode()+b"\n0000000000 65535 f \n"
    for pos in offsets[1:]:buf+=f"{pos:010d} 00000 n \n".encode()
    buf+=b"trailer\n<< /Root 1 0 R /Size "+str(len(offsets)).encode()+b" >>\nstartxref\n"+str(index).encode()+b"\n%%EOF\n"
    return buf

def check(browser,base,width):
    context=browser.new_context(viewport={"width":width,"height":900},accept_downloads=True,
                                locale="pt-BR",color_scheme="light")
    page=context.new_page()
    errors=[]
    uploads=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("request",lambda req: uploads.append(req.url) if req.method in ("POST","PUT","PATCH") else None)
    page.goto(base+"/#manual",wait_until="domcontentloaded")
    page.locator("#navManual").wait_for()
    page.wait_for_function("document.querySelector('#rafManualView') && !document.querySelector('#rafManualView').hidden")
    if page.locator("#rafTermsDialog").is_visible():
        page.locator("#rafTermsCheckbox").check()
        page.locator("#rafTermsAccept").click()
    assert page.locator("#rafManualView").is_visible()
    assert page.locator("#navManual").get_attribute("aria-label")=="Manual do 2º JEC"
    assert page.locator("#rafManualDownload").is_hidden()
    assert page.locator("#rafManualOpen").is_hidden()
    assert "Uso restrito" in page.locator("#rafManualView").inner_text()
    assert page.locator("#rafManualHostedOpen").is_visible()
    assert page.locator("#rafManualHostedDownload").is_visible()
    uri="docs/Manual_Operacional_2JEC_113p_Protegido_por_Senha.pdf"
    assert page.locator("#rafManualHostedOpen").get_attribute("href")==uri
    assert page.locator("#rafManualHostedDownload").get_attribute("href")==uri
    assert page.locator("#rafManualHostedDownload").get_attribute("download").endswith(".pdf")
    assert "jec@123" not in page.content(), "Senha do PDF não deve estar na página pública"
    head=page.request.head(base+"/"+uri)
    assert head.status==200, "Documento criptografado publicado deve existir"
    assert int(head.headers.get("content-length","0"))>20_000_000, "Arquivo PDF incompleto"
    assert "application/pdf" in head.headers.get("content-type",""), "MIME PDF incorreto"

    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),"Manual deve ser responsivo"

    page.locator("#rafManualFileInput").set_input_files({
        "name":"Manual2JEC_teste.pdf","mimeType":"application/pdf","buffer":fixture_pdf()
    })
    page.locator("#rafManualDownload").wait_for(state="visible")
    assert page.locator("#rafManualOpen").is_visible()
    assert page.locator("#rafManualFrameBox").is_visible()
    assert page.locator("#rafManualFrame").get_attribute("src").startswith("blob:")
    assert page.locator("#rafManualDownload").get_attribute("href").startswith("blob:")
    assert "leitura exclusivamente local" in page.locator("#rafManualFeedback").inner_text()
    with page.expect_download() as result:
        page.locator("#rafManualDownload").click()
    assert result.value.suggested_filename=="Manual2JEC_teste.pdf"
    assert not uploads,f"O Manual nunca deve enviar o documento pela rede: {uploads}"
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),"PDF provoca overflow"
    if width==390:
        SHOT.mkdir(exist_ok=True)
        page.screenshot(path=str(SHOT/"manual-local-390.png"),full_page=True)
    page.locator("#rafManualClear").click()
    assert page.locator("#rafManualDownload").is_hidden()
    assert page.locator("#rafManualFrameBox").is_hidden()
    page.locator("#rafManualFileInput").set_input_files({
        "name":"nao_e_pdf.pdf","mimeType":"application/pdf","buffer":b"hello world"
    })
    page.wait_for_function("document.querySelector('#rafManualFeedback').textContent.includes('não foi identificado como PDF')")
    assert "não foi identificado como PDF" in page.locator("#rafManualFeedback").inner_text()
    assert page.locator("#rafManualDownload").is_hidden()
    assert page.evaluate("""() => !Object.keys(localStorage).some(k=>k.includes('manual'))""")

    page.locator("#rafManualBack").click()
    assert page.locator("#rafManualView").is_hidden()
    assert page.locator("#due").count()==1
    assert page.locator("#calendar .day").count()==42
    assert not errors,f"Erros de JavaScript: {errors}"
    print(f"MANUAL_LOCAL_OK {width}px: leitura, abertura, download, privacidade e retorno",flush=True)
    context.close()

def main():
    with Server(("127.0.0.1",0),Handler) as server:
        t=threading.Thread(target=server.serve_forever,daemon=True);t.start()
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            try:
                for width in (360,390,1366):check(browser,f"http://127.0.0.1:{server.server_address[1]}",width)
            finally:browser.close()
        server.shutdown()

if __name__=="__main__":main()
