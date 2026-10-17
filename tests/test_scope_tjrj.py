"""Comarca e data: relacao de texto nao e confirmacao juridica."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from scope_tjrj import link_date_to_comarca

class TestComarcaEvidence(unittest.TestCase):
    def test_real_excerpt_duque_de_caxias(self):
        text = ('31/07/2026 03/08/2026 Mesquita, no dia 31 de julho de 2026 e na '
                'Comarca de Duque de Caxias, nos dias 30 e 31 de julho de 2026. '
                'Resolve suspender o expediente e os prazos processuais nos Fóruns das '
                'ATO EXECUTIVO Nº 117. Comarcas de Nova Iguaçu,')
        for day in ('2026-07-30','2026-07-31'):
            value=link_date_to_comarca(text,day)
            self.assertEqual(value['date_linked_comarcas'],['Duque de Caxias'])
            self.assertFalse(value['verified'])
            self.assertFalse(value['applies_to_deadlines'])
            self.assertEqual(value['assessment'],'textual_date_link_pending')
            self.assertIn('Comarca de Duque de Caxias',value['scope_evidence'][0]['literal_excerpt'])
    def test_other_day_not_associated(self):
        s='Comarca de Duque de Caxias, nos dias 30 e 31 de julho de 2026.'
        self.assertEqual(link_date_to_comarca(s,'2026-07-29')['date_linked_comarcas'],[])
    def test_other_comarca_not_associated(self):
        s='Comarca de Mesquita, no dia 30 de julho de 2026. Comarca de Duque de Caxias, no dia 31 de julho de 2026.'
        self.assertEqual(link_date_to_comarca(s,'2026-07-31')['date_linked_comarcas'],['Duque de Caxias'])
    def test_mention_without_explicit_date_not_linked(self):
        s='Comarca de Duque de Caxias. Suspensão 31/07/2026. Comarcas de Nova Iguaçu e Mesquita.'
        self.assertEqual(link_date_to_comarca(s,'2026-07-31')['date_linked_comarcas'],[])
    def test_no_year_not_associated(self):
        self.assertEqual(link_date_to_comarca('Comarca de Duque de Caxias, nos dias 30 e 31 de julho.','2026-07-31')['date_linked_comarcas'],[])
    def test_invalid_dates_not_linked(self):
        s='Comarca de Macaé, no dia 31 de fevereiro de 2026.'
        self.assertEqual(link_date_to_comarca(s,'2026-02-28')['date_linked_comarcas'],[])
    def test_explicit_single_day(self):
        s='Comarca de Seropédica, no dia 11 de março de 2026.'
        self.assertEqual(link_date_to_comarca(s,'2026-03-11')['date_linked_comarcas'],['Seropédica'])
    def test_no_holiday_promotion(self):
        s='Comarca de Mesquita, no dia 30 de julho de 2026. Expedição de ato.'
        value=link_date_to_comarca(s,'2026-07-30')
        self.assertEqual(value['kind'],'unresolved')
        self.assertFalse(value['verified'])
        self.assertFalse(value['applies_to_deadlines'])

if __name__=='__main__':
    unittest.main()
