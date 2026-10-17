"""Etapa 4 — invariantes de auditoria local e memoria de calculo."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class AuditTrackingTests(unittest.TestCase):
    def test_user_interface_and_source_are_synchronized(self):
        for name in ("index.html", "src/template.html"):
            with self.subTest(file=name):
                html = (ROOT / name).read_text(encoding="utf-8")
                for marker in (
                    'id="rafAuditDialog"',
                    'id="rafAuditList"',
                    'id="rafAuditOfficialList"',
                    'id="rafAuditExport"',
                    'id="rafSnapshotDialog"',
                    'id="rafSnapshotContent"',
                    "function logLocalChange(",
                    "function calculationSnapshot(",
                    "function openSavedSnapshot(",
                    "function editExtra(",
                    "function downloadAudit(",
                ):
                    self.assertIn(marker, html)
                self.assertEqual(html.count('id="rafAuditDialog"'), 1)

    def test_snapshot_freezes_legal_inputs_and_calendar_version(self):
        source = (ROOT / "index.html").read_text(encoding="utf-8")
        for field in (
            "base_version:baseData.version",
            "base_generated_at:baseData.generated_at",
            "base_mode:syncMode",
            "user_manual_dates:{...manual()}",
            "extraordinary_notes:extraordinary()",
            "rows:c.rows.map(",
            "snapshot:calculationSnapshot(calc)",
            "item.snapshot?",
        ):
            self.assertIn(field, source)

    def test_audit_never_promotes_unreviewed_extraordinary_events(self):
        source = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("applies_to_deadlines:false", source)
        self.assertIn("function extraAt(n)", source)
        self.assertIn("function reason=n=>", source) if "function reason=n=>" in source else self.assertIn("const reason=n=>", source)
        self.assertIn("logLocalChange(prior?'ALTERACAO':'INCLUSAO'", source)
        self.assertIn("logLocalChange('EXCLUSAO','ocorrencia:'", source)

    def test_local_storage_limits_and_non_certification(self):
        source = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("slice(-200)", source)
        self.assertIn("não são autenticados", source)
        self.assertIn("não protegidos contra edição", source)
        self.assertIn("raf-prazo:audit-events:v1", source)


if __name__ == "__main__":
    unittest.main()
