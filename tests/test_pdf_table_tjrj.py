"""Testes: periodos em tabelas do informativo, sem exclusoes automaticas."""
import sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import pdf_table_tjrj as m
URL='https://www.tjrj.jus.br/documents/d/portal-conhecimento/suspensao-prazos-1a-e-2a-instancia_2026_seesc'
SHA='a'*64
HEAD='SUSPENSÃO DE PRAZOS E DE EXPEDIENTE FORENSE\nCALENDÁRIO DE FERIADOS\n2026\nConsulta por Comarca\nPeríodo     Ato     Publicação     Ementa\n'

class TableTests(unittest.TestCase):
 def report(self,body):return m.extract_pdf_table(HEAD+body,URL,SHA)
 def test_real_comarca_link_from_pdf_row(self):
  row=('31/07/2026 03/08/2026 Mesquita, no dia 31 de julho de 2026 e na '
       'Comarca de Duque de Caxias, nos dias 30 e 31 de julho de 2026. '
       'Resolve suspender o expediente e os prazos processuais nos Fóruns das '
       'ATO EXECUTIVO Nº 117, DE DJERJ, ADM, n. 218, p. 2. Comarcas de Nova Iguaçu,')
  data=self.report('[RAF_TJRJ_PAGE=33]\\n'+row+'\\n')
  self.assertEqual([o['date'] for o in data['occurrences']],['2026-07-31'])
  scope=data['occurrences'][0]['scope_hint']
  self.assertEqual(scope['date_linked_comarcas'],['Duque de Caxias'])
  self.assertEqual(scope['assessment'],'textual_date_link_pending')
  self.assertEqual(scope['kind'],'unresolved')
  self.assertFalse(scope['verified'])
  self.assertFalse(scope['applies_to_deadlines'])
  self.assertNotIn('Mesquita',scope['date_linked_comarcas'])
  self.assertNotIn('Nova Iguaçu',scope['date_linked_comarcas'])
 def test_period_date_vs_publication_date(self):
  body='[RAF_TJRJ_PAGE=7]\n01/04/2026  ATO EXECUTIVO Nº 76, DE 06/05/2026   DJERJ 07/05/2026  Resolve declarar suspensos os prazos processuais na Comarca de São José do Vale do Rio Preto, no dia 01 de abril de 2026.\n'
  r=self.report(body);self.assertEqual([x['date'] for x in r['occurrences']],['2026-04-01']);self.assertEqual(r['occurrences'][0]['document_page'],7);self.assertEqual(r['occurrences'][0]['scope_hint']['kind'],'unresolved');self.assertFalse(r['occurrences'][0]['applies_to_deadlines'])
 def test_multiple_date_cells(self):
  body='13/02, 16/02, 17/02, e 18/02  ATO EXECUTIVO Nº 20, DE 03/02/2026   Resolve suspender o expediente e os prazos processuais nos dias 13, 16, 17 e 18 de fevereiro de 2026 em todas as unidades.\n'
  r=self.report(body);self.assertEqual([x['date'] for x in r['occurrences']],['2026-02-13','2026-02-16','2026-02-17','2026-02-18']);self.assertTrue(all(x['year_inferred'] for x in r['occurrences']))
 def test_multiline_table_row(self):
  body='11/03/2026\nATO EXECUTIVO Nº 68, DE 12/03/2026\nDJERJ, ADM, 16/03/2026\nResolve suspender os prazos processuais na Comarca de Seropédica, no dia 11 de março de 2026.\n'
  r=self.report(body);self.assertEqual([x['date'] for x in r['occurrences']],['2026-03-11']);self.assertEqual(r['occurrences'][0]['effect_hint'],'possible_deadline_suspension')
 def test_feriado_is_only_holiday_mention(self):
  body='20/01/2026  LEI ORGÂNICA DO MUNICÍPIO Nº 12/2026   Feriado de São Sebastião no Município do Rio de Janeiro\n'
  r=self.report(body);self.assertEqual(r['occurrences'][0]['effect_hint'],'holiday_mention');self.assertFalse(r['occurrences'][0]['verified'])
 def test_rejects_date_crossed_with_other_comarca(self):
  line='02/02/2026 03/07/2026 Comarca de São João da Barra, no dia 30 de junho de 2026. Resolve suspender o expediente e os prazos ATO EXECUTIVO Nº 93, DE DJERJ, ADM, n.178, p.7. processuais no Fórum da Comarca.'
  self.assertEqual(self.report(line)['occurrences'],[])
 def test_rejects_reference_without_explicit_act_number(self):
  line='03/09/2026 04/09/2026 11:00h e encerrar-se-á às 15:00h, ficando suspensos os prazos processuais. DECRETO 03/09/2026 públicas estaduais.'
  self.assertEqual(self.report(line)['occurrences'],[])
 def test_comarca_name_is_not_automatically_a_feriado(self):
  line='26/03/2026  ATO EXECUTIVO Nº 25, DE 06/02/2026  Prazos processuais na Comarca de São Sebastião do Alto, no dia 27 de março de 2026.'
  self.assertEqual(self.report(line)['occurrences'],[])
 def test_publication_date_cannot_become_period(self):
  body='07/05/2026  DJERJ  Ato para mera ciência, sem ementa de suspensão.\n'
  self.assertEqual(self.report(body)['occurrences'],[])
 def test_no_year_context_no_fabrication(self):
  r=m.extract_pdf_table('Período Ato Publicação Ementa\n13/02  ATO EXECUTIVO Nº 20/2026 suspender os prazos processuais',URL,SHA)
  self.assertEqual(r['occurrences'],[])
 def test_law_number_must_not_be_a_publication_date(self):
  line='05/06/2026 Art. 83, Inc. II, da DORJ-I, p. 1. Lei Estadual nº 19/12/2024 Art. ponto facultativo.'
  self.assertEqual(self.report(line)['occurrences'],[])
 def test_truncated_results_never_auto_apply(self):
  body=''.join(f'{day:02d}/01/2026 ATO EXECUTIVO Nº {day}/2026 suspender os prazos processuais.\n' for day in range(1,20))
  r=m.extract_pdf_table(HEAD+body,URL,SHA,limit=5);self.assertTrue(r['truncated']);self.assertEqual(len(r['occurrences']),5);self.assertTrue(all(x['status']=='pending_review' and x['applies_to_deadlines'] is False for x in r['occurrences']))
if __name__=='__main__':unittest.main()
