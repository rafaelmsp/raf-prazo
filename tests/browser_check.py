"""Teste visual opcional: requer playwright e Chromium instalados localmente.

Executar: python tests/browser_check.py
"""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    chromium=which('chromium') or which('google-chrome')
    browser=p.chromium.launch(headless=True,executable_path=chromium,args=['--no-sandbox'] if chromium else [])
    page=browser.new_page(viewport={'width':1366,'height':768})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.route('https://raf-prazo.local/feriados.json',lambda route:route.fulfill(path=str(ROOT/'feriados.json'),content_type='application/json'))
    html=(ROOT/'index.html').read_text(encoding='utf-8').replace('<head>','<head><base href="https://raf-prazo.local/">',1)
    page.set_content(html,wait_until='domcontentloaded')
    page.wait_for_timeout(400)
    assert page.locator('#rafTermsDialog').evaluate('(el)=>el.open'),'Termo deve abrir na primeira utilização'
    assert page.locator('#rafTermsAccept').is_disabled()
    page.locator('#rafTermsCheckbox').check()
    page.locator('#rafTermsAccept').click()
    assert not page.locator('#rafTermsDialog').evaluate('(el)=>el.open')
    assert page.evaluate('window.RafPrazoData?.mode')=='online'
    page.locator('#start').fill('2026-10-27')
    page.locator('#start').dispatch_event('change')
    page.locator('#days').fill('3')
    page.locator('#days').dispatch_event('input')
    assert '03 DE NOV DE 2026' in page.locator('#due').inner_text(),page.locator('#due').inner_text()
    page.locator('#tjrj').uncheck()
    assert '30 DE OUT DE 2026' in page.locator('#due').inner_text(),page.locator('#due').inner_text()
    page.locator('#tjrj').check()
    page.locator('#rafNewsOpen').click()
    assert '30/10' not in page.locator('#rafUpdatesList').inner_text() or '2026-10-30' in page.locator('#rafUpdatesList').inner_text()
    assert 'tjrj.jus.br' in page.locator('#rafUpdatesList a').first.get_attribute('href')
    page.locator('#rafTabSources').click()
    assert page.locator('#rafSourcesList .raf-source-card').count()>=3
    page.locator('#rafTabSync').click()
    assert 'Base carregada pela rede' in page.locator('#rafSyncHeadline').inner_text()
    page.locator('[data-raf-close="rafNewsDialog"]').first.click()
    page.locator('#themeToggle').click()
    assert page.locator('html').get_attribute('data-theme')=='dark'
    page.locator('#themeToggle').click()
    page.locator('#menuToggle').click()
    page.locator('#navTutorial').click()
    assert page.locator('#rafTutorialDialog').evaluate('(el)=>el.open')
    assert 'marco inicial' in page.locator('#rafTutorialDialog').inner_text().lower()
    page.locator('[data-raf-close="rafTutorialDialog"]').first.click()
    page.screenshot(path=str(ROOT/'preview.png'),full_page=True)
    assert not errors,errors
    # Falha de rede: fallback incorporado mantém cálculo e sinaliza limitação.
    offline=browser.new_page(viewport={'width':390,'height':844})
    offline_errors=[]
    offline.on('pageerror',lambda error:offline_errors.append(str(error)))
    offline.route('https://raf-prazo.local/feriados.json',lambda route:route.abort())
    offline.set_content(html,wait_until='domcontentloaded')
    offline.wait_for_timeout(300)
    assert offline.evaluate('window.RafPrazoData?.mode')=='incorporada'
    assert offline.locator('#rafTermsDialog').evaluate('(el)=>el.open')
    offline.locator('#rafTermsCheckbox').check()
    offline.locator('#rafTermsAccept').click()
    offline.locator('#start').fill('2026-10-27')
    offline.locator('#start').dispatch_event('change')
    offline.locator('#days').fill('3')
    offline.locator('#days').dispatch_event('input')
    assert '03 DE NOV DE 2026' in offline.locator('#due').inner_text()
    assert not offline_errors,offline_errors
    offline.screenshot(path=str(ROOT/'preview_mobile.png'),full_page=True)
    offline.close()
    print('OK — termos, TJRJ 30/10, cálculo, abas, fontes, sincronização, temas e tutorial; sem erros JavaScript.')
    browser.close()
