#!/usr/bin/env python3
"""Raf-Prazo Sync: fonte nacional gratuita + atos curados, sem promover pontos facultativos.

Uso: python scripts/sync.py [--offline] [--check]
Sem dependências externas. Falhas na API preservam a última base nacional validada.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import re
import sys
import urllib.error
import urllib.request
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'feriados.json'
TODAY = dt.date.today()
# O conjunto fixo corresponde a feriados nacionais previstos em lei.
FIXED = {
    '01-01': 'Confraternização Universal',
    '04-21': 'Tiradentes',
    '05-01': 'Dia do Trabalho',
    '09-07': 'Independência do Brasil',
    '10-12': 'Nossa Senhora Aparecida',
    '11-02': 'Finados',
    '11-15': 'Proclamação da República',
    '11-20': 'Dia Nacional de Zumbi e da Consciência Negra',
    '12-25': 'Natal',
}
NATIONAL_SOURCE = {
    'title': 'Legislação federal sobre feriados nacionais',
    'act': 'Lei nº 10.607/2002 (alterações da Lei nº 662/1949)',
    'url': 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10607.htm',
}
API_ROOT = 'https://brasilapi.com.br/api/feriados/v1/'
URL_RE = re.compile(r'^https://[^\s<>"\']+$')
ALLOWED_TYPES = {'NACIONAL', 'ESTADUAL', 'MUNICIPAL', 'SUSPENSAO_TJRJ'}
ALLOWED_KINDS = {'national', 'state', 'municipal', 'tjrj'}


def read_json(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except FileNotFoundError:
        return default


def date_valid(value):
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
        return False
    try:
        dt.date.fromisoformat(value)
        return True
    except ValueError:
        return False


def verify_event(event):
    if not isinstance(event, dict):
        raise ValueError('Evento deve ser objeto')
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{2,110}', str(event.get('id', ''))):
        raise ValueError(f"ID inválido: {event.get('id')!r}")
    if not date_valid(event.get('date')):
        raise ValueError(f"Data inválida: {event.get('date')!r}")
    if event.get('type') not in ALLOWED_TYPES:
        raise ValueError('Tipo não reconhecido')
    if event.get('status') != 'confirmed' or event.get('applies_to_deadlines') is not True:
        raise ValueError('Evento ativo requer confirmação e aplicação explícita')
    scope = event.get('scope', {})
    if scope.get('kind') not in ALLOWED_KINDS:
        raise ValueError('Abrangência inválida')
    if scope['kind'] in {'state', 'municipal', 'tjrj'} and not re.fullmatch(r'[A-Z]{2}', str(scope.get('uf', ''))):
        raise ValueError('UF obrigatória')
    if scope['kind'] == 'municipal' and not re.fullmatch(r'\d{7}', str(scope.get('ibge', ''))):
        raise ValueError('Código IBGE obrigatório')
    expected_kind = {'NACIONAL': 'national', 'ESTADUAL': 'state', 'MUNICIPAL': 'municipal', 'SUSPENSAO_TJRJ': 'tjrj'}[event['type']]
    if scope['kind'] != expected_kind:
        raise ValueError('Tipo e abrangência incompatíveis')
    source = event.get('source', {})
    if not URL_RE.match(str(source.get('url', ''))):
        raise ValueError('Evento confirmado requer URL HTTPS de fonte')
    if scope['kind'] == 'tjrj':
        host = urllib.parse.urlparse(source['url']).hostname or ''
        if host != 'tjrj.jus.br' and not host.endswith('.tjrj.jus.br'):
            raise ValueError('Ato TJRJ exige fonte hospedada no domínio oficial tjrj.jus.br')
    if not str(source.get('title', '')).strip() or not str(event.get('name', '')).strip():
        raise ValueError('Fonte e nome obrigatórios')
    if not date_valid(event.get('verified_at')):
        raise ValueError('Data de validação obrigatória')
    return event


def fetch_national(year):
    req = urllib.request.Request(API_ROOT + str(year), headers={
        'User-Agent': 'Raf-Prazo-Sync/1.0 (calendario judicial; projeto gratuito)',
        'Accept': 'application/json',
    })
    with urllib.request.urlopen(req, timeout=12) as resp:
        if resp.status != 200:
            raise RuntimeError(f'BrasilAPI HTTP {resp.status}')
        body = resp.read(400_000)
    data = json.loads(body)
    if not isinstance(data, list) or not 5 <= len(data) <= 60:
        raise ValueError('Resposta da BrasilAPI incompleta ou inesperada')
    return data


def national_events(years, previous, offline):
    events = []
    candidates = []
    checked = []
    failed = []
    previous_by_date = {e['date']: e for e in previous.get('events', []) if e.get('type') == 'NACIONAL'}
    for year in years:
        received = None
        if not offline:
            try:
                received = fetch_national(year)
                checked.append(year)
            except (urllib.error.URLError, TimeoutError, ValueError, RuntimeError, json.JSONDecodeError) as err:
                failed.append({'year': year, 'reason': type(err).__name__})
        observed = {item.get('date'): item for item in received or [] if isinstance(item, dict)}
        for mmdd, name in FIXED.items():
            day = f'{year}-{mmdd}'
            if not date_valid(day) or (mmdd == '11-20' and year < 2024):
                continue
            origin = 'brasilapi+lei' if day in observed else 'lei-federal'
            # Mesmo sem rede, a data fixa legal continua válida. Não é cobertura local.
            event = {
                'id': f'nacional-{day}', 'date': day, 'name': name,
                'type': 'NACIONAL', 'scope': {'kind': 'national'},
                'status': 'confirmed', 'applies_to_deadlines': True,
                'source': ({'title':'Lei nº 14.759/2023 — Consciência Negra', 'act':'Lei nº 14.759/2023', 'url':'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14759.htm'} if mmdd=='11-20' else {'title':'Lei nº 6.802/1980 — Nossa Senhora Aparecida','act':'Lei nº 6.802/1980','url':'https://www.planalto.gov.br/ccivil_03/leis/l6802.htm'} if mmdd=='10-12' else NATIONAL_SOURCE),
                'verified_at': previous_by_date.get(day, {}).get('verified_at', '2026-10-16'),
                'origin': origin,
            }
            verify_event(event)
            events.append(event)
        for day, item in observed.items():
            if not date_valid(day) or not day.startswith(f'{year}-'):
                continue
            if day[5:] not in FIXED:
                candidates.append({
                    'id': f'api-candidato-{day}', 'date': day,
                    'name': str(item.get('name', 'Data adicional'))[:140],
                    'type': 'CANDIDATO', 'scope': {'kind': 'national'},
                    'status': 'pending', 'applies_to_deadlines': False,
                    'source': {'title': 'BrasilAPI — registro não promovido automaticamente', 'url': API_ROOT + str(year)},
                    'reason': 'A API pode incluir Carnaval, Corpus Christi ou pontos facultativos sem suspensão forense comprovada.',
                })
    return events, candidates, checked, failed


def event_key(event):
    return (event['date'], event['id'])


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--offline', action='store_true', help='Gera base inicial sem acesso à rede')
    parser.add_argument('--check', action='store_true', help='Valida entradas e não altera arquivo')
    parser.add_argument('--years', nargs='*', type=int, help='Anos cobertos; padrão: 2026 a 2028')
    args = parser.parse_args(argv)
    years = sorted(set(args.years or [2026, 2027, 2028]))
    if any(not 2020 <= y <= 2100 for y in years):
        parser.error('Anos permitidos: 2020 a 2100')
    previous = read_json(OUT, {}) or {}
    curated = []
    for filename in ('atos-tjrj.json', 'feriados-locais.json'):
        obj = read_json(ROOT / 'dados' / filename)
        if not isinstance(obj, dict) or not isinstance(obj.get('events'), list):
            raise ValueError(f'{filename}: estrutura inválida')
        for e in obj['events']:
            curated.append(verify_event(e))
    national, candidates, checked, failed = national_events(years, previous, args.offline or args.check)
    # O arquivo manual não pode sobrescrever IDs nacionais.
    events = national + curated
    if len({e['id'] for e in events}) != len(events):
        raise ValueError('IDs duplicados')
    events.sort(key=event_key)
    previous_events = {e['id']: e for e in previous.get('events', [])}
    now_events = {e['id']: e for e in events}
    def fingerprint(e):
        return json.dumps({k:v for k,v in e.items() if k not in ('verified_at', 'origin')}, sort_keys=True, ensure_ascii=False)
    changed = []
    for id_, event in now_events.items():
        if id_ not in previous_events:
            kind = 'added'
        elif fingerprint(event) != fingerprint(previous_events[id_]):
            kind = 'modified'
        else:
            continue
        changed.append({'id': f'{kind}:{id_}', 'kind': kind, 'event_id': id_,
                        'date': event['date'], 'name': event['name'],
                        'scope': event['scope'], 'status': event['status'],
                        'source_url': event['source']['url'], 'applied': True,
                        'detected_at': TODAY.isoformat()})
    for id_, old in previous_events.items():
        if id_ not in now_events:
            changed.append({'id': f'removed:{id_}', 'kind': 'removed', 'event_id': id_,
                            'date': old['date'], 'name': old['name'], 'scope': old['scope'],
                            'status': 'removed', 'source_url': old.get('source', {}).get('url', ''),
                            'applied': False, 'detected_at': TODAY.isoformat()})
    prior_changes = previous.get('changes', [])
    changes_by_id = {c['id']: c for c in prior_changes if isinstance(c, dict) and 'id' in c}
    for c in changed:
        changes_by_id[c['id']] = c
    # Não publicar centenas de notificações no primeiro bootstrap.
    if not previous_events or args.offline:
        changes_by_id = {c['id']: c for c in changed if c['event_id'].startswith('tjrj-')}
        # Registro inicial do ato pontual conferido: não confundir com coleta automática.
        if args.offline:
            for e in curated:
                if e['type'] == 'SUSPENSAO_TJRJ':
                    change_id = 'added:' + e['id']
                    changes_by_id[change_id] = {'id': change_id, 'kind':'added', 'event_id':e['id'],
                        'date':e['date'], 'name':e['name'], 'scope':e['scope'],
                        'status':'confirmed', 'source_url':e['source']['url'],
                        'applied':True, 'detected_at':e['verified_at']}
    changes = sorted(changes_by_id.values(), key=lambda c: (c['detected_at'], c['date'], c['id']), reverse=True)[:120]
    digest = hashlib.sha256(json.dumps([fingerprint(e) for e in events], sort_keys=True).encode()).hexdigest()[:12]
    status = 'offline_seed' if args.offline or args.check else ('ok' if not failed else 'partial')
    sources = [
        {'id':'federal','label':'Legislação federal — feriados nacionais','url':NATIONAL_SOURCE['url'], 'kind':'official','status':'curated', 'checked_at':None,'note':'Datas fixas previstas em lei; não cobre feriados forenses locais.'},
        {'id':'brasilapi','label':'BrasilAPI — feriados nacionais','url':'https://brasilapi.com.br/docs','kind':'community','status':'ok' if checked and not failed else 'unavailable','checked_at': TODAY.isoformat() if checked else None,'note':'Somente feriados fixos legalmente reconhecidos são promovidos; outros registros ficam pendentes.'},
        {'id':'tjrj','label':'TJRJ — atos e avisos oficiais','url':'https://www.tjrj.jus.br/','kind':'official','status':'manual','checked_at':None,'note':'Curadoria manual por ato; sem varredura automática de publicações.'},
        {'id':'ibge','label':'IBGE — municípios','url':'https://servicodados.ibge.gov.br/api/docs/localidades','kind':'official','status':'client','checked_at':None,'note':'Consulta de nomes e códigos municipais, não certifica feriados.'},
    ]
    output = {
        'schema': 1, 'version': digest, 'generated_at': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'),
        'last_checked_at': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds') if not args.offline and not args.check else None,
        'coverage': {'national_years':years, 'national':'fixed_law', 'state':'curated_only', 'municipal':'curated_only', 'tjrj':'curated_only'},
        'sync': {'status':status, 'brasilapi_years_checked':checked, 'failed':failed,
                 'tjrj':'manual_verification_required', 'local':'manual_verification_required'},
        'events': events, 'candidates': candidates, 'changes': changes, 'sources': sources,
    }
    if args.check:
        print(f'OK: {len(events)} eventos ativos, {len(candidates)} candidatos, {len(changes)} alterações; sem escrita')
        return 0
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Raf-Prazo Sync: {status}; {len(events)} eventos; {len(candidates)} pendentes; versão {digest}')
    if failed:
        print(f'Atenção: falha de consulta nos anos {[x["year"] for x in failed]}; dados legais fixos mantidos.', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
