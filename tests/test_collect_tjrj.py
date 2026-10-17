"""Testes sem rede: a coleta TJRJ nunca autoriza dias excluidos."""
import sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import collect_tjrj as c

HTML=b"""<html><head><title>Fonte TJRJ de teste</title></head>
<body><h1>Suspensao de prazos processuais</h1>
<p>Publicacao em 15/10/2026, com mencao a dia 30 de outubro de 2026.</p>
<a href="/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295">Suspensao de prazos processuais</a>
<a href="https://tjrj.jus.br.attacker.example/documento">Suspensao de prazos processuais</a>
<script>dia 09/09/2026</script></body></html>"""
OTHER=b"<html><title>Segunda fonte</title><p>Suspensao de prazos processuais 30/10/2026</p></html>"

class TestCollector(unittest.TestCase):
 def test_rejects_redirects_and_lookalike_hosts(self):
  for url in ["http://www.tjrj.jus.br/documents/d/x",
              "https://www.tjrj.jus.br.attacker.test/documents/d/x",
              "https://attacker@www.tjrj.jus.br/documents/d/x",
              "https://evil.test/web/portal-conhecimento/x",
              "https://www.tjrj.jus.br/other/endpoint"]:
   self.assertFalse(c.valid_url(url),url)
  self.assertTrue(c.valid_url("https://www.tjrj.jus.br/documents/d/portal-conhecimento/2026"))

 def test_collect_official_documents_never_applicable(self):
  seed="https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/177451389"
  target="https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295"
  calls=[]
  def offline(url):
   calls.append(url)
   return (HTML if url==seed else OTHER),"text/html",url
  result=c.collect({},fetch=offline,seeds=({"url":seed,"id":"test"},),max_discovered=2)
  self.assertEqual(result["status"],"ok")
  self.assertEqual(result["source_success"],2)
  self.assertEqual(set(calls),{seed,target})
  for row in result["candidates"]:
   self.assertEqual(row["status"],"pending_review")
   self.assertFalse(row["verified"])
   self.assertFalse(row["applies_to_deadlines"])
   self.assertTrue(c.valid_url(row["source_url"]))
   self.assertIn("2026-10-30",row["date_mentions"])
  self.assertFalse(result["automatically_applies_events"])

 def test_source_failure_retains_old_candidates_as_stale(self):
  old=c.make_candidate("https://www.tjrj.jus.br/documents/d/portal-conhecimento/2026","Ato antigo","Suspensao de prazos 30/10/2026","abc","2026-10-01T00:00:00+00:00")
  def offline(url):raise TimeoutError("sem acesso")
  report=c.collect({"candidates":[old]},fetch=offline,seeds=c.SOURCES)
  self.assertEqual(report["status"],"unavailable")
  self.assertEqual(report["source_success"],0)
  self.assertEqual(len(report["candidates"]),1)
  self.assertTrue(report["candidates"][0]["stale"])
  self.assertFalse(report["candidates"][0]["applies_to_deadlines"])

 def test_dates_are_mentions_only(self):
  self.assertEqual(c.mentioned_dates("Em 30/10/2026 e dia 2 de novembro de 2026; 31/02/2026 invalida"),
                   ["2026-10-30","2026-11-02"])
  title,body,links=c.parse_source(HTML,"text/html")
  self.assertNotIn("09/09/2026",body)
  self.assertEqual(len(links),2)

if __name__=="__main__":unittest.main()
