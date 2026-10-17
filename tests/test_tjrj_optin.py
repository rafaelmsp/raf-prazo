"""Regressao: opt-in TJRJ local, optativo e com rastreabilidade."""
from pathlib import Path
import json
import unittest

ROOT=Path(__file__).resolve().parents[1]

class TjrjUserChoiceTests(unittest.TestCase):
    def test_integracao_e_avisos_nos_htmls(self):
        for path in ('index.html','src/template.html'):
            with self.subTest(path=path):
                html=(ROOT/path).read_text(encoding='utf-8')
                self.assertIn('<script src="assets/tjrj-markers.js"></script>',html)
                self.assertIn('<script src="assets/tjrj-optin.js"></script>',html)
                self.assertIn('window.RafPrazoTjrjSelection?.resolve(s,sel())',html)
                self.assertIn("type:'ESCOLHA_USUARIO_TJRJ'",html)
                self.assertIn('user_tjrj_exclusions:',html)
                self.assertIn("hasUserTjrj?'SIMULAÇÃO DO USUÁRIO",html)
                self.assertIn('window.RafPrazoTjrjAudit=',html)
                self.assertIn('window.RafPrazoRefreshDay=',html)
                self.assertIn("window.RafPrazoRecalculate=",html)

    def test_perfil_livre_e_nao_homologado(self):
        src=(ROOT/'assets/tjrj-optin.js').read_text(encoding='utf-8')
        self.assertIn("localStorage.setItem(KEY",src)
        self.assertIn("status:'user_selected_unverified'",src)
        self.assertIn("selectedForPlace:allForPlace",src)
        self.assertIn('source_hash_sha256',src)
        self.assertIn("resolve:(date,p)=>",src)
        self.assertIn('NÃO foi validado juridicamente',src)
        self.assertIn('rafTjrjOptInNews',src)
        self.assertIn('updateDayControls',src)
        self.assertNotIn('adminToken',src)
        self.assertNotIn('roleRequired',src)

    def test_eventos_oficiais_continuam_intocados(self):
        base=json.loads((ROOT/'feriados.json').read_text(encoding='utf-8'))
        self.assertFalse(any(e.get('type')=='SUSPENSAO_TJRJ' for e in base.get('events',[])))
        self.assertTrue(all(c.get('applies_to_deadlines') is False for c in base.get('candidates',[])))

if __name__=='__main__':
    unittest.main()
