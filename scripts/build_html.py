#!/usr/bin/env python3
"""Atualiza o calendario incorporado no HTML publicado, sem alterar a interface."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / 'feriados.json'
targets = (root / 'index.html', root / 'src' / 'template.html')
base = json.loads(source.read_text(encoding='utf-8'))
if base.get('schema') != 1 or not isinstance(base.get('events'), list):
    raise ValueError('Base de feriados invalida')
embedded = json.dumps(base, ensure_ascii=False, separators=(',', ':'))
embedded = embedded.replace('<', r'\u003c').replace('>', r'\u003e').replace('&', r'\u0026')
pattern = r'(<script id="rafEmbeddedBase" type="application/json">)(.*?)(</script>)'
for target in targets:
    html = target.read_text(encoding='utf-8')
    updated, total = re.subn(pattern, lambda m: m.group(1) + embedded + m.group(3), html, count=1, flags=re.S)
    if total != 1:
        raise RuntimeError(f'Marcador rafEmbeddedBase nao encontrado exatamente uma vez em {target}')
    if updated != html:
        target.write_text(updated, encoding='utf-8')
print('Calendario HTML incorporado atualizado; versao:', base.get('version', 'sem versao'))
