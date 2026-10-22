"""Teste real de limpeza integral e isolamento da Central de Atualizações no Chrome."""
from __future__ import annotations

import os
import pathlib
import threading

from test_updates_browser import Handler, Server, open_updates

ROOT = pathlib.Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "docs" / "evidencias"


def inject_many(page):
    page.evaluate("""() => {
      const base = window.RafPrazoData.base;
      base.changes = Array.from({length:65}, (_,i)=>({
        id:'teste-auditoria-evento-'+i, date:'2026-11-'+String(i%28+1).padStart(2,'0'),
        name:'Evento de auditoria '+i, kind:'added', status:'confirmed', applied:false,
        scope:{kind:'national'}, source_url:'https://www.planalto.gov.br/'
      }));
      const other = Array.from({length:75}, (_,i)=>({
        id:'teste-auditoria-pendente-'+i, type:'CANDIDATO_GENERICO',
        date:'2026-11-'+String(i%28+1).padStart(2,'0'),
        name:'Pendente de auditoria '+i, status:'pending_review',
        reason:'Validação documental incompleta', verified:false,
        applies_to_deadlines:false, first_seen_at:'2026-10-22T10:00:00Z'
      }));
      const tjrj = Array.from({length:55}, (_,i)=>{
        const url='https://www.tjrj.jus.br/documents/1234/aviso-'+i+'.pdf';
        const hash=i.toString(16).padStart(64,'0');
        const occurrence={
          date:'2026-11-'+String(i%28+1).padStart(2,'0'),
          effect_hint:'possible_deadline_suspension',
          evidence_excerpt:'Comunicação de possível alteração ainda não validada número '+i,
          scope_hint:{comarcas_mentioned:['BuscaUnica'],date_linked_comarcas:[]},
          status:'pending_review', verified:false, applies_to_deadlines:false,
          source_url:url, source_hash_sha256:hash
        };
        return {id:'teste-auditoria-tjrj-'+i, name:'Aviso TJRJ '+i,
          type:'CANDIDATO_TJRJ', status:'pending_review',
          verified:false, applies_to_deadlines:false, stale:false,
          first_seen_at:'2026-10-22T10:00:00Z', source_url:url,
          source_hash_sha256:hash, structured:{occurrences:[occurrence]}};
      });
      base.candidates=[...other,...tjrj];
      window.dispatchEvent(new Event('raf-prazo:sync'));
    }""")


def main():
    from playwright.sync_api import sync_playwright
    stage = os.environ.get("RAF_AUDIT_SCREENSHOTS")
    with Server(("127.0.0.1", 0), Handler) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as play:
            browser=play.chromium.launch(headless=True,channel=os.environ.get('RAF_BROWSER_CHANNEL','chrome'))
            try:
                if stage:
                    EVIDENCE.mkdir(parents=True,exist_ok=True)
                    for width in (360,390):
                        context=browser.new_context(viewport={"width":width,"height":780},locale="pt-BR")
                        page=context.new_page()
                        page.goto(url,wait_until="domcontentloaded")
                        open_updates(page)
                        dst=EVIDENCE / f"central-{stage}-{width}.png"
                        page.locator("#rafNewsDialog").screenshot(path=str(dst))
                        print("CAPTURA",str(dst))
                        context.close()
                    server.shutdown()
                    return
                context=browser.new_context(viewport={"width":390,"height":780},locale="pt-BR")
                page=context.new_page()
                page.goto(url,wait_until="domcontentloaded")
                open_updates(page)
                inject_many(page)
                results={}
                exclusions=['raf-prazo:tjrj-exclusions-user:v1','raf-prazo:exclusoes-individuais:v1']
                page.evaluate("(keys)=>keys.forEach(k=>localStorage.setItem(k,'AUDITORIA_SENTINELA'))",exclusions)

                page.locator("#rafTabNews").click()
                page.locator("#rafHolidayYear").select_option("all")
                first=page.locator("#rafUpdatesList .raf-event").count()
                page.once("dialog", lambda d:d.accept())
                page.locator("#rafClearHolidays").click()
                after=page.locator("#rafUpdatesList .raf-event").count()
                results['calendario_65']=(after==0, f"visíveis antes={first}, depois={after}")

                page.locator("#rafTabPending").click()
                first=page.locator("#rafCandidatesList .raf-event").count()
                page.once("dialog", lambda d:d.accept())
                page.locator("#rafClearPending").click()
                after=page.locator("#rafCandidatesList .raf-event").count()
                results['pendencias_130']=(after==0,f"visíveis antes={first}, depois={after}")

                page.locator("#rafTabTjrj").click()
                page.locator("#rafTjrjNewsQuery").fill("BuscaUnica")
                first=page.locator("#rafTjrjNewsList .raf-tjrj-item").count()
                page.once("dialog", lambda d:d.accept())
                page.locator("#rafTjrjClearList").click()
                after=page.locator("#rafTjrjNewsList .raf-tjrj-item").count()
                results['tjrj_pesquisa_55']=(first>0 and after==0, f"visíveis antes={first}, depois={after}")

                page.evaluate("""() => {
                  const doc=window.RafPrazoData.base.candidates.find(x=>x.type==='CANDIDATO_TJRJ');
                  doc.source_hash_sha256='f'.repeat(64);
                  doc.structured.occurrences[0].source_hash_sha256=doc.source_hash_sha256;
                  doc.content_changed_at='2026-10-22T20:00:00Z';
                  window.dispatchEvent(new Event('raf-prazo:sync'));
                }""")
                changed=page.locator("#rafTjrjNewsList .raf-tjrj-item").count()
                results['nova_versao_visivel']=(changed==1,f"notícias novas após limpar={changed}")
                unread_before=page.evaluate("window.RafPrazoTjrjNewsUnread()")
                page.locator("#rafTjrjMarkSeen").click()
                unread_after=page.evaluate("window.RafPrazoTjrjNewsUnread()")
                results['marcar_visto_sem_ocultar']=(unread_before==1 and unread_after==0 and
                  page.locator("#rafTjrjNewsList .raf-tjrj-item").count()==1,
                  f"não vistas antes={unread_before}, depois={unread_after}")
                page.evaluate("""() => {
                  window._auditSetItem=Storage.prototype.setItem;
                  Storage.prototype.setItem=function(){throw Error('Storage blocked')};
                }""")
                alerts=[]
                page.once("dialog",lambda d:(alerts.append(d.message),d.accept()))
                page.locator("#rafTjrjNewsList .raf-tjrj-dismiss").first.click()
                count_after_error=page.locator("#rafTjrjNewsList .raf-tjrj-item").count()
                results['falha_localstorage_explicita']=(bool(alerts) and
                  'Não foi possível salvar' in alerts[0] and count_after_error==1,
                  f"aviso={alerts}, cards preservados={count_after_error}")
                page.evaluate("() => {Storage.prototype.setItem=window._auditSetItem; return true;}")

                actual=page.evaluate("(keys)=>keys.map(k=>localStorage.getItem(k))", exclusions)
                results['escolhas_preservadas']=(actual==['AUDITORIA_SENTINELA']*2,str(actual))

                page.locator("#rafTabNews").click()
                page.locator("#rafRestoreHolidays").click()
                page.evaluate("localStorage.removeItem('raf-prazo:updates-seen:v1'); window.dispatchEvent(new Event('raf-prazo:sync'))")
                page.locator("#rafNewsDialog").evaluate("(d)=>d.close()")
                before=page.evaluate("document.getElementById('rafNewsDot').textContent")
                page.locator("#rafNewsOpen").click()
                after=page.evaluate("document.getElementById('rafNewsDot').textContent")
                results['vistas_por_aba']=(before==after, f"sino antes={before}, depois={after}")

                for name,(passed,info) in results.items():
                    print(("PASS" if passed else "FAIL"),name,info)
                passed=all(v[0] for v in results.values())
                context.close()
            finally:
                browser.close()
        server.shutdown()
        assert passed, "Falhas reais de limpeza/isolamento"


if __name__=="__main__":
    main()
