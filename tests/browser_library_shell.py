"""Verifica no Chromium o cabeçalho/menu da Biblioteca, sem backend nem dados jurídicos novos."""
from __future__ import annotations

import http.server
import pathlib
import socketserver
import threading
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
SHOTS = ROOT / "tests" / "screenshots-library"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


def verify(browser, base: str, width: int) -> None:
    mobile = width <= 1060
    context = browser.new_context(
        viewport={"width": width, "height": 844},
        locale="pt-BR",
        color_scheme="light",
    )
    page = context.new_page()
    exceptions: list[str] = []
    page.on("pageerror", lambda error: exceptions.append(str(error)))
    page.goto(f"{base}/prazos/", wait_until="domcontentloaded")
    page.locator("#groups .card").first.wait_for()

    assert page.locator("#groups .card").count() == 32
    assert page.locator(".raf-header").evaluate(
        "(element) => getComputedStyle(element).backgroundColor"
    ) == "rgb(18, 97, 160)"
    assert page.locator(".raf-brand-link strong").inner_text() == "Raf-Prazo"
    assert page.locator(".raf-nav-link.active").get_attribute("aria-current") == "page"
    assert page.locator("#menuToggle").get_attribute("aria-expanded") == "false"
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2")
    assert page.locator(".raf-news-trigger").is_visible()
    assert page.locator("#themeToggle").is_visible()

    page.locator("#menuToggle").click()
    assert page.locator("#menuToggle").get_attribute("aria-expanded") == "true"
    assert page.locator("#mainSidebar").evaluate("element => !element.inert")
    assert page.locator('.raf-nav-link[href="../index.html"]').is_visible()
    assert page.locator('.raf-nav-link[href="../index.html#calendario"]').is_visible()
    if mobile:
        assert page.locator("#menuBackdrop").is_visible()
    else:
        assert page.locator("#menuBackdrop").is_hidden()
    if width in (390, 1366):
        SHOTS.mkdir(exist_ok=True)
        page.screenshot(path=str(SHOTS / f"menu-{width}.png"), full_page=False)

    page.keyboard.press("Escape")
    assert page.locator("#menuToggle").get_attribute("aria-expanded") == "false"
    if mobile:
        assert page.locator("#mainSidebar").evaluate("element => element.inert")

    page.locator("#themeToggle").click()
    assert page.locator("html").get_attribute("data-theme") == "dark"
    assert page.locator("#themeToggle").get_attribute("aria-pressed") == "true"
    page.reload(wait_until="domcontentloaded")
    assert page.locator("html").get_attribute("data-theme") == "dark"
    assert page.locator("#groups .card").count() == 32
    page.locator("#themeToggle").click()
    assert page.locator("html").get_attribute("data-theme") == "light"

    # A biblioteca continua pesquisável com o menu novo.
    page.locator("#search").fill("recurso inominado")
    assert page.locator("#groups .card").count() >= 1
    assert "Recurso inominado" in page.locator("#groups").inner_text()
    assert not exceptions, f"Erros JavaScript: {exceptions}"
    print(f"LIBRARY_SHELL_OK {width}px · menu, cabeçalho, tema, pesquisa, teclado", flush=True)
    context.close()


def verify_cross_page_menu(browser, base: str) -> None:
    context = browser.new_context(viewport={"width": 390, "height": 844}, locale="pt-BR")
    page = context.new_page()
    page.goto(f"{base}/prazos/", wait_until="domcontentloaded")
    page.locator("#menuToggle").click()
    page.locator('.raf-nav-link[href="../index.html#calendario"]').click()
    page.wait_for_url("**/index.html*")
    page.wait_for_function("location.hash === '' && !!document.querySelector('.raf-22-calendar')")
    assert page.locator(".raf-22-calendar").count() == 1
    assert page.locator(".raf-22-results").count() == 1
    print("LIBRARY_TO_CALENDAR_OK · navegação para a calculadora", flush=True)
    context.close()


def main() -> None:
    with Server(("127.0.0.1", 0), Handler) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        url = f"http://127.0.0.1:{server.server_address[1]}"
        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                try:
                    for width in (360, 390, 430, 1024, 1366):
                        verify(browser, url, width)
                    verify_cross_page_menu(browser, url)
                finally:
                    browser.close()
        finally:
            server.shutdown()


if __name__ == "__main__":
    main()
