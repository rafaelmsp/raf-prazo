"""Regressoes da Etapa 3: ocorrencias extraordinarias sao apenas informativas."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "index.html"
SOURCE = ROOT / "src" / "template.html"


class ExtraordinaryOccurrenceTests(unittest.TestCase):
    def test_public_and_template_have_complete_feature(self):
        markers = [
            'id="rafExtraDialog"', 'id="rafExtraOpen"',
            'id="rafExtraDay"', 'id="rafExtraSave"',
            'id="rafExtraStart"', 'id="rafExtraEnd"',
            'id="rafExtraEffect"', 'id="rafExtraScope"',
            "const EXTRA_KEY='raf-prazo:extraordinary:v1'",
            "function extraAt(n)", "function saveExtra()",
            "btn.classList.add('raf-extra-flag')",
            "btn.addEventListener('click',()=>openDayDetails(n));",
        ]
        for name in (PUBLIC, SOURCE):
            html = name.read_text(encoding="utf-8")
            with self.subTest(file=name.name):
                for marker in markers:
                    self.assertIn(marker, html)

    def test_user_report_does_not_enter_deadline_engine(self):
        html = PUBLIC.read_text(encoding="utf-8")
        reason = html.split("const reason=n=>{", 1)[1].split("function spanYears(", 1)[0]
        self.assertNotIn("extraAt(", reason)
        self.assertNotIn("EXTRA_KEY", reason)
        self.assertIn("const event=baseEvent(n)", reason)
        self.assertIn("if(!block)num++", html)
        self.assertIn("applies_to_deadlines:false", html)
        self.assertIn("status:'pending'", html)

    def test_time_window_and_source_checks_exist(self):
        html = PUBLIC.read_text(encoding="utf-8")
        self.assertIn("Date.parse(start)>Date.parse(end)", html)
        self.assertIn("Date.parse(end)-Date.parse(start)>31*MS", html)
        self.assertIn("parsed.protocol!=='https:'", html)
        self.assertIn("a.rel='noopener noreferrer'", html)
        self.assertIn("title.textContent=e.title", html)
        self.assertIn("Nenhum prazo foi alterado.", html)

    def test_all_scope_and_effect_kinds_are_declared(self):
        html = PUBLIC.read_text(encoding="utf-8")
        for kind in ("tribunal", "comarca", "unidade", "processo"):
            self.assertIn(f'<option value="{kind}">', html)
        for effect in ("informativo", "suspensao_potencial", "prorrogacao_potencial"):
            self.assertIn(f'<option value="{effect}">', html)


if __name__ == "__main__":
    unittest.main()
