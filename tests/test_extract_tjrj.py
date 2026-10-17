"""Testes determinísticos do extrator jurídico do TJRJ (nenhum candidato ativo)."""
import sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
import extract_tjrj as e

URL="https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295"
SHA="a"*64

class TjrjExtractionTests(unittest.TestCase):
 def report(self,body):
  return e.extract_structured(body,URL,SHA,"Ato TJRJ")
 def test_news_dates_distinguish_normal_and_suspension(self):
  body=("Publicado em 15/10/2026. A mudança prevista no Aviso nº 290/2026 ocorre neste mês. "
    "A comemoração será transferida para 30 de outubro, sexta-feira, quando haverá ponto facultativo, "
    "com suspensão das atividades e dos prazos processuais. Em 28 de outubro haverá expediente normal.")
  result=self.report(body)
  self.assertIn("aviso nº 290/2026",result["act_references"])
  mapping={x["date"]:x for x in result["occurrences"]}
  self.assertEqual(set(mapping),{"2026-10-30","2026-10-28"})
  self.assertEqual(mapping["2026-10-30"]["effect_hint"],"possible_deadline_suspension")
  self.assertEqual(mapping["2026-10-28"]["effect_hint"],"normal_expediente")
  self.assertTrue(mapping["2026-10-30"]["year_inferred"])
  self.assertTrue(all(not x["applies_to_deadlines"] and not x["verified"] for x in mapping.values()))
 def test_publishing_date_not_event(self):
  result=self.report("Publicado em 15/10/2026. Suspensão de prazos em 30/10/2026.")
  self.assertEqual([x["date"] for x in result["occurrences"]],["2026-10-30"])
 def test_optional_not_suspension(self):
  item=self.report("Aviso nº 291/2026. Em 04/11/2026 haverá ponto facultativo.")["occurrences"][0]
  self.assertEqual(item["effect_hint"],"optional_workday")
  self.assertFalse(item["applies_to_deadlines"])
 def test_ambiguous_year_not_guessed(self):
  self.assertEqual(self.report("Suspensão de prazos dia 30 de outubro.")["occurrences"],[])
  self.assertIsNone(e.document_year("Aviso nº 10/2025 e Aviso nº 11/2026"))
 def test_bad_dates_rejected(self):
  result=self.report("Aviso nº 100/2026. Suspensão de prazos em 31/02/2026 e em 30/10/2026.")
  self.assertEqual([x["date"] for x in result["occurrences"]],["2026-10-30"])
 def test_comarca_and_exception_not_promoted(self):
  body="Aviso nº 100/2026. Em 30/10/2026 haverá suspensão de prazos na Comarca de Duque de Caxias, exceto os feitos de plantão."
  x=self.report(body)["occurrences"][0]
  self.assertTrue(x["has_possible_exceptions"])
  self.assertEqual(x["scope_hint"]["kind"],"unresolved")
  self.assertIn("Duque De Caxias",x["scope_hint"]["comarcas_mentioned"])
 def test_no_date_no_event(self):
  result=self.report("Aviso nº 290/2026. Trata de suspensão de prazos.")
  self.assertTrue(result["act_references"])
  self.assertEqual(result["occurrences"],[])
 def test_navigation_noise_not_promoted_to_events(self):
  menu="Menu Informação Jornal Oficial Intranet Acesso rápido Serviços " * 18
  result=self.report(menu+"15/10/2026 e 30/10/2026. Suspensão de prazos processuais em 28/10/2026.")
  self.assertTrue(all(x["applies_to_deadlines"] is False for x in result["occurrences"]))
  self.assertNotIn("2026-10-15",[x["date"] for x in result["occurrences"]])
 def test_system_outage_is_not_automatic_extension(self):
  x=self.report("Em 30/10/2026 ocorreu indisponibilidade do sistema PJe.")["occurrences"][0]
  self.assertEqual(x["effect_hint"],"system_unavailability")
  self.assertFalse(x["applies_to_deadlines"])

if __name__=="__main__":unittest.main()
