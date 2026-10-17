"""Associacao textual conservadora de comarca e data em ementas do TJRJ.

Nao valida competencia, abrangencia forense, vigencia nem suspende prazos.
"""
from __future__ import annotations
import datetime as dt
import re
import unicodedata

MONTHS = {name: i + 1 for i, name in enumerate('janeiro fevereiro marco abril maio junho julho agosto setembro outubro novembro dezembro'.split())}
COMARCA_DATED = re.compile(
    r'\b(?:na\s+|no\s+|da\s+)?comarca\s+de\s+'
    r'(?P<comarca>[\wÀ-ÿ][\wÀ-ÿ .\-]{2,70}?)'
    r'\s*,?\s*(?:no\s+dia|nos\s+dias)\s+'
    r'(?P<days>\d{1,2}(?:\s*(?:,|e)\s*\d{1,2}){0,9})'
    r'\s+de\s+(?P<month>janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)'
    r'\s+de\s+(?P<year>20\d{2})\b', re.I)
COMARCA_MENTION = re.compile(
    r'\bcomarca\s+de\s+([\wÀ-ÿ][\wÀ-ÿ .\-]{2,70}?)'
    r'(?=\s*[,;:()]|\s+(?:no\s+dia|nos\s+dias|em\s+|por\s+|onde\b|exceto\b)|$)', re.I)

def _fold(value: str) -> str:
    return ''.join(ch for ch in unicodedata.normalize('NFKD', value) if not unicodedata.combining(ch)).lower()

def link_date_to_comarca(text: str, target_date: str) -> dict:
    """Keep only a literal named comarca with an explicitly dated phrase.

    Even a link is not verified and NEVER automatically decides process scope.
    """
    result = {
        'kind': 'unresolved',
        'comarcas_mentioned': [],
        'date_linked_comarcas': [],
        'scope_evidence': [],
        'assessment': 'unresolved',
        'verified': False,
        'applies_to_deadlines': False,
    }
    try:
        target = dt.date.fromisoformat(target_date)
    except (TypeError, ValueError):
        return result
    text = (text or '')[:2200]
    for match in COMARCA_MENTION.finditer(text):
        comarca = re.sub(r'\s+', ' ', match.group(1)).strip(' .,')
        if comarca and comarca not in result['comarcas_mentioned']:
            result['comarcas_mentioned'].append(comarca)
        if len(result['comarcas_mentioned']) >= 8:
            break
    for match in COMARCA_DATED.finditer(text):
        comarca = re.sub(r'\s+', ' ', match.group('comarca')).strip(' .,')
        if not comarca or len(comarca) > 65 or _fold(comarca).startswith(('comarca ', 'forum ', 'foro ')):
            continue
        month = MONTHS.get(_fold(match.group('month')))
        dates = set()
        for num in re.findall(r'\b\d{1,2}\b', match.group('days')):
            try:
                day = dt.date(int(match.group('year')), month, int(num)).isoformat()
                dates.add(day)
            except (TypeError, ValueError):
                continue
        if target.isoformat() not in dates:
            continue
        # A locucao temporal e um INDICIO, nao certificacao de comarca competente.
        if comarca not in result['date_linked_comarcas']:
            result['date_linked_comarcas'].append(comarca)
            result['scope_evidence'].append({
                'comarca': comarca,
                'date': target.isoformat(),
                'literal_excerpt': re.sub(r'\s+', ' ', match.group(0)).strip()[:220],
                'relation': 'explicit_comarca_date_mention',
                'verified': False,
            })
        if len(result['date_linked_comarcas']) >= 5:
            break
    if result['date_linked_comarcas']:
        result['assessment'] = 'textual_date_link_pending'
    return result
