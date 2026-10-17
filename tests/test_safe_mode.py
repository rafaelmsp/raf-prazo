"""Garantias do modo conservador: nenhuma entrada local/TJRJ afeta prazos."""
import json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

class SafeModeTests(unittest.TestCase):
 def test_bases_do_not_contain_active_tjrj_or_local_event(self):
  data=json.loads((ROOT/'feriados.json').read_text(encoding='utf-8'))
  self.assertTrue(data['events'])
  self.assertEqual({e['type'] for e in data['events']},{'NACIONAL'})
  self.assertEqual(data['coverage']['tjrj'],'discovery_only')
  self.assertTrue(all(c.get('applies_to_deadlines') is False for c in data.get('candidates',[])))
  collector=json.loads((ROOT/'dados'/'coleta-tjrj.json').read_text(encoding='utf-8'))
  self.assertFalse(collector['automatically_applies_events'])
  self.assertTrue(all(c.get('applies_to_deadlines') is False for c in collector.get('candidates',[])))
  legacy=json.loads((ROOT/'dados'/'atos-tjrj.json').read_text(encoding='utf-8'))
  self.assertEqual(legacy['events'],[])

 def test_browser_ignores_legacy_cache_and_manual_dates(self):
  for name in ('index.html','src/template.html'):
   with self.subTest(filename=name):
    html=(ROOT/name).read_text(encoding='utf-8')
    self.assertIn("if(scope.kind==='tjrj')continue",html)
    self.assertIn("if(scope.kind==='state')continue",html)
    self.assertIn("if(scope.kind==='municipal')continue",html)
    self.assertNotIn("if(manual()[s])return",html)
    self.assertIn('id="tjrj" disabled',html)
    self.assertIn('id="customOpen" hidden disabled',html)
    self.assertIn('id="rafExtraOpen" hidden disabled',html)
    self.assertIn('id="rafTjrjCollectorStatus"',html)
    start=html.index('<script id="rafEmbeddedBase" type="application/json">')
    end=html.index('</script>',start)
    base=json.loads(html[html.index('>',start)+1:end])
    self.assertEqual({e['type'] for e in base['events']},{'NACIONAL'})

if __name__=='__main__':unittest.main()
