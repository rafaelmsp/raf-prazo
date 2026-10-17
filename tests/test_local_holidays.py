"""Feriados legais do RJ e de Duque de Caxias, com âmbito e opt-in."""
import sys
import unittest
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from local_holidays import legal_local_events,easter

class TestRjCaxiasHolidays(unittest.TestCase):
    def setUp(self):
        self.rows=legal_local_events([2026,2027,2028])
    def by_date(self,date_):
        return [e for e in self.rows if e['date']==date_]
    def test_easter_and_movable_dates(self):
        for y,pascoa,carnaval,paixao,corpus in (
            (2026,'2026-04-05','2026-02-17','2026-04-03','2026-06-04'),
            (2027,'2027-03-28','2027-02-09','2027-03-26','2027-05-27'),
            (2028,'2028-04-16','2028-02-29','2028-04-14','2028-06-15'),
        ):
            with self.subTest(year=y):
                self.assertEqual(easter(y).isoformat(),pascoa)
                self.assertEqual(self.by_date(carnaval)[0]['type'],'ESTADUAL')
                self.assertEqual(self.by_date(paixao)[0]['type'],'MUNICIPAL')
                self.assertEqual(self.by_date(corpus)[0]['type'],'ESTADUAL')
    def test_state_and_caxias_only(self):
        self.assertEqual(len(self.rows),15)
        for e in self.rows:
            with self.subTest(id=e['id']):
                self.assertIn(e['type'],('ESTADUAL','MUNICIPAL'))
                self.assertEqual(e['status'],'confirmed')
                self.assertTrue(e['applies_to_deadlines'])
                self.assertEqual(e['scope']['uf'],'RJ')
                self.assertTrue(e['source']['url'].startswith('https://'))
                if e['type']=='MUNICIPAL':
                    self.assertEqual(e['scope'],{'kind':'municipal','uf':'RJ','ibge':'3301702'})
                else:
                    self.assertEqual(e['scope'],{'kind':'state','uf':'RJ'})
    def test_sao_jorge_santo_antonio_and_facultative(self):
        for year in (2026,2027,2028):
            self.assertEqual(self.by_date(f'{year}-04-23')[0]['name'],'Dia de São Jorge')
            self.assertEqual(self.by_date(f'{year}-06-13')[0]['name'],'Santo Antônio — Padroeiro de Duque de Caxias')
            self.assertFalse(self.by_date(f'{year}-08-25'),'25 de agosto é ponto facultativo municipal')
            self.assertFalse(self.by_date(f'{year}-10-28'),'28 de outubro é ponto facultativo municipal')
            self.assertFalse(self.by_date(f'{year}-12-31'),'31 de dezembro não consta na lei como feriado municipal')
    def test_no_duplicate_corpus(self):
        for year in (2026,2027,2028):
            corpus=[e for e in self.rows if e['name']=='Corpus Christi' and e['date'].startswith(str(year))]
            self.assertEqual(len(corpus),1)
            self.assertEqual(corpus[0]['type'],'ESTADUAL')
    def test_previous_verification_preserved(self):
        previous={'events':[dict(self.rows[0],verified_at='2026-10-15')]}
        new=legal_local_events([2026],previous)
        self.assertEqual(new[0]['verified_at'],'2026-10-15')

if __name__=='__main__':unittest.main()
