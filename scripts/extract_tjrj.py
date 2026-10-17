#!/usr/bin/env python3
"""Extrator de indícios de atos do TJRJ: nunca aplica suspensões automaticamente."""
from __future__ import annotations
import datetime as dt
import hashlib
import re
import unicodedata

MONTHS={m:i+1 for i,m in enumerate("janeiro fevereiro marco abril maio junho julho agosto setembro outubro novembro dezembro".split())}
NUMERIC_DATE=re.compile(r"(?<!\d)(\d{1,2})[/.-](\d{1,2})[/.-](20\d{2})(?!\d)")
WRITTEN_DATE=re.compile(r"\b(?:dia\s+)?(\d{1,2})\s+de\s+(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de\s+(20\d{2}))?\b")
REFERENCE=re.compile(r"\b(aviso|ato\s+normativo(?:\s+conjunto)?|ato\s+executivo|resolucao|portaria|decreto|lei)\s*(?:n[.º°o]*\s*)?(\d{1,7}(?:[./-]\d{4})?)\b")
SUSPENSION=re.compile(r"\bsuspensao\s+(?:das?\s+atividades\s+e\s+dos\s+prazos?|do\s+expediente\s+e\s+dos\s+prazos?)\b|\bsuspensao\s+(?:de\s+|dos\s+|da\s+|do\s+)?(?:prazos?|contagem)|\bprazos?\s+(?:processuais?\s+)?suspens[oa]s?\b")
EXTENSION=re.compile(r"\bprorroga(?:cao|dos?|das?|r[ao])\b|\bprorrogad[oa]s?\b")
SERVICE=re.compile(r"\bexpediente\s+(?:forense|normal|suspenso|judiciario)\b|\bsuspensao\s+(?:das?\s+)?atividades\b")
UNAVAILABILITY=re.compile(r"\bindisponibilid(?:ade|ades)\b|\binoperan(?:cia|te)\b")
OPTIONAL=re.compile(r"\bponto\s+facultativo\b")
NORMAL=re.compile(r"\bexpediente\s+normal\b|\bfuncionamento\s+normal\b|\bnao\s+havera\s+suspensao\b")
RESTRICTION=re.compile(r"\bexceto\b|\bexcecao\b|\bressalvad[oa]s?\b|\bsomente\b|\bapenas\b|\bexclusivamente\b|\bplantao\b|\bnao\s+se\s+aplica\b|\bprimeira\s+instancia\b|\bsegunda\s+instancia\b|\b1[aoª]\s+instancia\b|\b2[aoª]\s+instancia\b")
COMARCA=re.compile(r"\bcomarca\s+(?:de|do|da)\s+([a-z][a-z\s-]{2,52}?)(?=\s*[,;:()]|\s+(?:em|no|na|por|e\s+no|sera|tera|com\s+|onde\b)|$)")
SPLIT=re.compile(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕ0-9])|[\r\n]+")
MAX_TEXT=85000
MAX_OCCURRENCES=30
MAX_REFS=30

def fold(s):
    return "".join(c for c in unicodedata.normalize("NFKD",s) if not unicodedata.combining(c)).lower()

def document_year(body):
    years={int(y) for y in re.findall(r"\b(?:aviso|decreto|portaria|ato\s+executivo)\s*(?:n[.º°o]*\s*)?\d{1,7}[/.-](20\d{2})\b",fold(body),re.I)}
    return next(iter(years)) if len(years)==1 else None

def dates_in_clause(original,year_hint):
    normalized=fold(original)
    dates=[]
    for m in NUMERIC_DATE.finditer(normalized):
        try: date=dt.date(int(m.group(3)),int(m.group(2)),int(m.group(1))).isoformat()
        except ValueError:continue
        dates.append({"date":date,"text":original[m.start():m.end()],"year_inferred":False,"position":m.start()})
    for m in WRITTEN_DATE.finditer(normalized):
        year=int(m.group(3)) if m.group(3) else year_hint
        if year is None:continue
        try: date=dt.date(year,MONTHS[m.group(2)],int(m.group(1))).isoformat()
        except ValueError:continue
        dates.append({"date":date,"text":original[m.start():m.end()],"year_inferred":m.group(3) is None,"position":m.start()})
    return dates

def effect_hint(fragment):
    value=fold(fragment)
    if NORMAL.search(value):return "normal_expediente"
    if SUSPENSION.search(value):return "possible_deadline_suspension"
    if EXTENSION.search(value):return "possible_deadline_extension"
    if UNAVAILABILITY.search(value):return "system_unavailability"
    if SERVICE.search(value):return "service_interruption"
    if OPTIONAL.search(value):return "optional_workday"
    return None

def extract_structured(body,source_url,document_hash,title=""):
    """Identifica indícios na mesma oração. Não determina vigência ou efeito jurídico."""
    body=(body or "")[:MAX_TEXT]
    year_hint=document_year(body)
    refs=[]
    for m in REFERENCE.finditer(fold(body)):
        ref=f"{m.group(1)} nº {m.group(2)}"
        if ref not in refs:refs.append(ref)
        if len(refs)>=MAX_REFS:break
    occurrences=[]
    seen=set()
    for clause in SPLIT.split(body):
        clause=clause.strip()
        if len(clause)<12 or len(clause)>650:continue
        effect=effect_hint(clause)
        if effect is None:continue
        hints=dates_in_clause(clause,year_hint)
        if not hints:continue
        text=fold(clause)
        exceptions=bool(RESTRICTION.search(text))
        places=[re.sub(r"\s+"," ",p).strip().title() for p in COMARCA.findall(text)][:3]
        for hint in hints:
            # Proximidade entre data e efeito: evita vincular datas do menu
            # ou da publicacao a uma suspensao distante no documento.
            pos=hint["position"]
            nearby=clause[max(0,pos-65):min(len(clause),pos+160)]
            actual_effect=effect_hint(nearby)
            if actual_effect is None:continue
            effect=actual_effect
            clause_hash=hashlib.sha256(clause.encode("utf-8")).hexdigest()[:12]
            key=(hint["date"],effect,clause_hash)
            if key in seen:continue
            seen.add(key)
            occurrences.append({
                "id":"tjrj-extract-"+hashlib.sha256((source_url+"|"+"|".join(key)).encode()).hexdigest()[:18],
                "date":hint["date"],"date_expression":hint["text"],
                "year_inferred":hint["year_inferred"],"effect_hint":effect,
                "scope_hint":{"kind":"unresolved","comarcas_mentioned":places},
                "has_possible_exceptions":exceptions,
                "evidence_excerpt":re.sub(r"\s+"," ",clause)[:450],
                "source_url":source_url,"source_hash_sha256":document_hash,
                "status":"pending_review","verified":False,"applies_to_deadlines":False,
                "review_reasons":["Verificar vigência, abrangência, exceções e efeito jurídico.",
                  "Ano inferido de referência do documento." if hint["year_inferred"] else "Data mencionada: conferir contexto."]
            })
            if len(occurrences)>=MAX_OCCURRENCES:break
        if len(occurrences)>=MAX_OCCURRENCES:break
    return {"schema":1,"source_url":source_url,"source_hash_sha256":document_hash,
        "source_title":title[:240],"document_year_hint":year_hint,
        "act_references":refs,"occurrences":occurrences,
        "truncated":len(body)>=MAX_TEXT or len(occurrences)>=MAX_OCCURRENCES,
        "status":"pending_review","automatically_applies_events":False,
        "warning":"Extração mecânica informativa; dados não conferidos e nunca aplicados automaticamente."}
