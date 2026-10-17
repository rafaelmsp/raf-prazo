"""Comprova a proveniência dos indícios TJRJ exibidos no calendário."""
import json
import re
import unittest
from pathlib import Path
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[1]
ALLOWED={'www.tjrj.jus.br','portaltj.tjrj.jus.br'}


class TestTjrjCalendarEvidence(unittest.TestCase):
    def test_calendar_imports_evidence_renderer(self):
        asset=(ROOT/'assets/tjrj-markers.js').read_text(encoding='utf-8')
        for page in ('index.html','src/template.html'):
            html=(ROOT/page).read_text(encoding='utf-8')
            with self.subTest(page=page):
                self.assertIn('<script src="assets/tjrj-markers.js"></script>',html)
                self.assertIn('id="calendar"',html)
                self.assertIn('id="rafDayDialog"',html)
        for token in ("CANDIDATO_TJRJ","pending_review","applies_to_deadlines!==false",
                      "source_hash_sha256","raf-official-pending-day",
                      "rafTjrjOfficialDay","raf-prazo:sync","officialHosts",
                      "NÃO altera a contagem","new MutationObserver(decorate)"):
            self.assertIn(token,asset)
        self.assertNotIn('reason(',asset)
        self.assertNotIn('calculate(',asset)

    def test_source_document_and_published_json_agree(self):
        collection=json.loads((ROOT/'dados/coleta-tjrj.json').read_text(encoding='utf-8'))
        calendar=json.loads((ROOT/'feriados.json').read_text(encoding='utf-8'))
        originals={c['id']:c for c in collection.get('candidates',[])}
        exposed=[c for c in calendar.get('candidates',[]) if c.get('type')=='CANDIDATO_TJRJ']
        self.assertEqual(len(originals),len(exposed))
        for c in exposed:
            with self.subTest(source=c['id']):
                original=originals[c['id']]
                self.assertEqual(c['source_url'],original['source_url'])
                self.assertEqual(c['source_hash_sha256'],original['source_hash_sha256'])
                self.assertIn(urlparse(c['source_url']).hostname,ALLOWED)
                self.assertTrue(re.fullmatch('[0-9a-f]{64}',c['source_hash_sha256']))
                self.assertFalse(c['applies_to_deadlines'])
                self.assertFalse(c['verified'])
                self.assertEqual(c['status'],'pending_review')
                published=c.get('structured',{}).get('occurrences',[])
                underlying=original.get('structured',{}).get('occurrences',[])
                for e in published:
                    self.assertIn(e,underlying)
                    self.assertEqual(e['source_url'],c['source_url'])
                    self.assertEqual(e['source_hash_sha256'],c['source_hash_sha256'])
                    self.assertFalse(e['applies_to_deadlines'])
                    self.assertFalse(e['verified'])
                    self.assertEqual(e['status'],'pending_review')

    def test_pending_tjrj_document_does_not_create_active_holidays(self):
        calendar=json.loads((ROOT/'feriados.json').read_text(encoding='utf-8'))
        self.assertFalse(any(e.get('type')=='SUSPENSAO_TJRJ' for e in calendar.get('events',[])))
        self.assertFalse(any(e.get('scope',{}).get('kind')=='tjrj' for e in calendar.get('events',[])))


if __name__=='__main__':
    unittest.main()
