import copy
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import sync


class TestRafPrazoSync(unittest.TestCase):
    def test_curated_official_acts_are_archived(self):
        data=json.loads((ROOT/'dados'/'atos-tjrj.json').read_text(encoding='utf-8'))
        self.assertEqual(data['events'],[])
        self.assertFalse(data['applied_to_deadlines'])

    def test_invalid_or_unconfirmed_event_rejected(self):
        e={'id':'tjrj-example-check','date':'2026-10-30','name':'Teste de validador',
           'type':'SUSPENSAO_TJRJ','scope':{'kind':'tjrj','uf':'RJ'},
           'status':'confirmed','applies_to_deadlines':True,'verified_at':'2026-10-16',
           'source':{'title':'Documento oficial para TESTE','url':'https://www.tjrj.jus.br/documents/d/portal-conhecimento/teste'}}
        for k,v in [('status','pending'),('date','2026-02-30'),('applies_to_deadlines',False)]:
            bad=copy.deepcopy(e);bad[k]=v
            with self.subTest(field=k),self.assertRaises(ValueError):
                sync.verify_event(bad)

    def test_carnival_never_promoted_to_holiday(self):
        api=[{'date':f'2026-{mmdd}','name':name,'type':'national'} for mmdd,name in sync.FIXED.items()]
        api.extend([{'date':'2026-02-16','name':'Carnaval','type':'national'},
                    {'date':'2026-02-17','name':'Carnaval','type':'national'},
                    {'date':'2026-06-04','name':'Corpus Christi','type':'national'}])
        with patch.object(sync,'fetch_national',return_value=api):
            events,candidates,checked,failed=sync.national_events([2026],{},False)
        dates={e['date'] for e in events}
        self.assertNotIn('2026-02-16',dates)
        self.assertNotIn('2026-02-17',dates)
        self.assertNotIn('2026-06-04',dates)
        self.assertEqual({c['date'] for c in candidates},{'2026-02-16','2026-02-17','2026-06-04'})
        self.assertEqual(checked,[2026]);self.assertEqual(failed,[])

    def test_network_error_preserves_fixed_law_dates(self):
        from urllib.error import URLError
        with patch.object(sync,'fetch_national',side_effect=URLError('sem conexão')):
            events,candidates,checked,failed=sync.national_events([2026],{},False)
        self.assertEqual(len(events),9)
        self.assertEqual(checked,[])
        self.assertEqual(failed[0]['year'],2026)

    def test_2020_does_not_apply_november_20_nationally(self):
        events,_,_,_=sync.national_events([2020],{},True)
        self.assertNotIn('2020-11-20',{e['date'] for e in events})

    def test_feriados_json_schema(self):
        data=json.loads((ROOT/'feriados.json').read_text(encoding='utf-8'))
        self.assertEqual(data['schema'],1)
        self.assertIn(2026,data['coverage']['national_years'])
        self.assertTrue(all(e['status']=='confirmed' for e in data['events']))
        self.assertFalse(any(e['type']=='SUSPENSAO_TJRJ' for e in data['events']))
        self.assertFalse(any(e.get('type') in ('ESTADUAL','MUNICIPAL') for e in data['events']))
        self.assertEqual(data['coverage']['tjrj'],'discovery_only')

    def test_html_has_embedded_base(self):
        html=(ROOT/'index.html').read_text(encoding='utf-8')
        self.assertIn('rafEmbeddedBase',html)
        self.assertIn('rafTermsDialog',html)
        self.assertIn('rafNewsDialog',html)
        self.assertIn('feriados.json',html)
        self.assertNotIn('const actRJ=',html)


if __name__=='__main__':unittest.main()
