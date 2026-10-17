"""Verificacoes de regressao da Etapa 2 — detalhes de data no Raf-Prazo."""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]

class CalendarDayDetailsTests(unittest.TestCase):
    def test_template_and_public_html_have_dialog(self):
        for name in ("index.html","src/template.html"):
            with self.subTest(name=name):
                html=(ROOT/name).read_text(encoding="utf-8")
                for element in ("id=\"rafDayDialog\"","id=\"rafDayTitle\"",
                                "id=\"rafDayFields\"","id=\"rafDayChooseStart\"",
                                "function openDayDetails(n)"):
                    self.assertIn(element,html)
                self.assertIn("btn.addEventListener('click',()=>openDayDetails(n));",html)
                self.assertIn("btn.dataset.eventKind=category",html)

    def test_information_does_not_change_start_date(self):
        html=(ROOT/"index.html").read_text(encoding="utf-8")
        self.assertIn("function openDayDetails(n){",html)
        self.assertIn("$('rafDayChooseStart').onclick=",html)
        self.assertIn("function calculate(keepMonth=false)",html)
        self.assertNotIn("btn.addEventListener('click',()=>{$('start').value=iso(n)",html)
        self.assertIn("a.rel='noopener noreferrer'",html)
        self.assertIn("dd.textContent=value",html)

if __name__=="__main__":
    unittest.main()
