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
        self.assertEqual(len(events),10)
        self.assertEqual(checked,[])
        self.assertEqual(failed[0]['year'],2026)

    def test_federal_calendar_2026_includes_passion_but_not_future_unconfirmed(self):
        events,candidates,checked,failed=sync.national_events([2026,2027,2028],{},True)
        by_year={y:[x for x in events if x['type']=='NACIONAL' and x['date'].startswith(str(y))] for y in (2026,2027,2028)}
        self.assertEqual([len(by_year[y]) for y in (2026,2027,2028)],[10,9,9])
        passion=next(x for x in by_year[2026] if x['date']=='2026-04-03')
        self.assertEqual(passion['name'],'Paixão de Cristo')
        self.assertEqual(passion['authority_scope'],'administracao_publica_federal_2026')
        self.assertEqual(passion['source']['act'].split(',')[0],'Portaria MGI nº 11.460/2025')
        self.assertTrue(passion['source']['url'].startswith('https://www.in.gov.br/'))
        self.assertFalse(any(x['date']=='2026-04-03' for x in candidates))
        self.assertFalse(any(x['date'] in ('2027-03-26','2028-04-14') for x in events))

    def test_2020_does_not_apply_november_20_nationally(self):
        events,_,_,_=sync.national_events([2020],{},True)
        self.assertNotIn('2020-11-20',{e['date'] for e in events})

    def test_feriados_json_schema(self):
        data=json.loads((ROOT/'feriados.json').read_text(encoding='utf-8'))
        self.assertEqual(data['schema'],1)
        self.assertIn(2026,data['coverage']['national_years'])
        self.assertTrue(all(e['status']=='confirmed' for e in data['events']))
        self.assertFalse(any(e['type']=='SUSPENSAO_TJRJ' for e in data['events']))
        self.assertEqual(sum(e['type']=='ESTADUAL' for e in data['events']),3*len(data['coverage']['national_years']))
        self.assertEqual(sum(e['type']=='MUNICIPAL' for e in data['events']),2*len(data['coverage']['national_years']))
        self.assertTrue(all(e['scope']['uf']=='RJ' for e in data['events'] if e['type'] in ('ESTADUAL','MUNICIPAL')))
        self.assertTrue(all(e['scope']['ibge']=='3301702' for e in data['events'] if e['type']=='MUNICIPAL'))
        self.assertEqual(data['coverage']['tjrj'],'discovery_only')
        annual={year:sum(e['type']=='NACIONAL' and e['date'].startswith(str(year)) for e in data['events'])
                for year in (2026,2027,2028)}
        self.assertEqual(annual,{2026:10,2027:9,2028:9})
        holy=[e for e in data['events'] if e['type']=='NACIONAL' and e['date']=='2026-04-03']
        self.assertEqual(len(holy),1)
        self.assertEqual(holy[0]['authority_scope'],'administracao_publica_federal_2026')
        self.assertFalse(any(c['type']=='CANDIDATO' and c.get('date')=='2026-04-03' for c in data['candidates']))

    def test_html_has_embedded_base(self):
        html=(ROOT/'index.html').read_text(encoding='utf-8')
        self.assertIn('rafEmbeddedBase',html)
        self.assertIn('rafTermsDialog',html)
        self.assertIn('rafNewsDialog',html)
        self.assertIn('feriados.json',html)
        self.assertNotIn('const actRJ=',html)


if __name__=='__main__':unittest.main()
