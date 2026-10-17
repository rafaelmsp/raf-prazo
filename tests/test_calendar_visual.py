"""Verifica as classificacoes visuais do calendario (sem alterar regras de prazo)."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
KINDS = ("raf-weekend", "raf-holiday", "raf-suspension", "raf-recess", "raf-manual")

class CalendarVisualTest(unittest.TestCase):
    def test_renderers_share_event_classes(self):
        for filename in ("index.html", "src/template.html"):
            text = (ROOT / filename).read_text(encoding="utf-8")
            with self.subTest(file=filename):
                self.assertIn("btn.classList.add(category)", text)
                self.assertIn("btn.dataset.eventKind=category", text)
                for kind in KINDS:
                    self.assertIn(f".calendar .day.blocked.{kind}:not(.due)", text)
                    self.assertIn(f'marker {kind}', text)

    def test_calculation_reason_is_unchanged(self):
        text = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("let block=reason(n);if(!block)num++;", text)
        self.assertIn("const event=baseEvent(n);", text)

if __name__ == "__main__":
    unittest.main()
