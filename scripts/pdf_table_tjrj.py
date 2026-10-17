#!/usr/bin/env python3
"""Detects clues in TJRJ PDF table rows, without deciding legal applicability."""
from __future__ import annotations
import datetime as dt
import hashlib
import re
import unicodedata

PAGE_RE = re.compile(r'^\s*\[RAF_TJRJ_PAGE=(\d+)\]\s*$', re.I)
START_RE = re.compile(r'^\s*(?P<period>\d{1,2}[./]\d{1,2}(?:[./]20\d{2})?(?:\s*(?:(?:,|;)\s*(?:e\s+)?|\be\s+|\bat[eé]\s+|\ba\s+|[-–]\s*)\d{1,2}[./]\d{1,2}(?:[./]20\d{2})?){0,14})\s*(?P<rest>.*)$',re.I)
DATE_RE = re.compile(r'(?<!\d)(\d{1,2})[./](\d{1,2})(?:[./](20\d{2}))?(?!\d)')
ACT_RE = re.compile(r'\b(ato\s+executivo|aviso|ato\s+normativo|decreto|lei(?:\s+(?:org[aâ]nica(?:\s+do\s+munic[ií]pio)?|federal|estadual))?|portaria)\s+n[.º°o]*\s*(\d{1,3}(?:\.\d{3})+|\d{1,7})(?:[/.-](20\d{2}))?\b',re.I)
SUSP = re.compile(r'\b(?:suspens(?:ao|os|as)|suspender|suspende|suspensos?|declarar?\s+suspensos?)\b[^.]{0,90}\b(?:prazos?\s+processuais?|expediente\s+e\s+(?:os\s+)?prazos?)\b|\bprazos?\s+processuais?\s+suspens[oa]s?\b',re.I)
EXT = re.compile(r'\bprorrog(?:acao|ar?|ados?|adas?)\b',re.I)
FERIADO = re.compile(r'\bferiado\b|\bsemana\s+santa\b',re.I)
OPTIONAL = re.compile(r'\bponto\s+facultativo\b',re.I)
OUTAGE = re.compile(r'\bindisponibilid(?:ade|ades)\b|\binoperan(?:cia|te)\b',re.I)
EXCEPT = re.compile(r'\bexceto\b|\bressalvad[oa]s?\b|\bapenas\b|\bsomente\b|\bplant[aã]o\b|\bexce[cç][aã]o\b',re.I)
DESC_DATE = re.compile(r'\b(?:no\s+dia|nos\s+dias|dia|dias)\s+(?:(\d{1,2})\s+e\s+)?(\d{1,2})\s+de\s+(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(20\d{2})\b', re.I)
MONTHS = {name: i+1 for i,name in enumerate('janeiro fevereiro marco abril maio junho julho agosto setembro outubro novembro dezembro'.split())}
COMARCA = re.compile(r'\bcomarca\s+(?:de|do|da)\s+([\wÀ-ÿ][\wÀ-ÿ\s-]{2,58}?)(?=\s*[,;:()]|\s+(?:no\s+dia|nos\s+dias|em\s+|exceto\b|por\s+|com\s+)|$)',re.I)
LIMIT = 120

def _fold(value):
 return ''.join(ch for ch in unicodedata.normalize('NFKD',value) if not unicodedata.combining(ch)).lower()

def year_from_document(url, text):
 """Only a year corroborated by both filename and the PDF title region."""
 m=re.search(r'[_/-](20\d{2})(?:[_/.-]|$)',url)
 if not m:return None
 year=int(m.group(1))
 head=text[:1300]
 return year if re.search(r'(?<!\d)'+str(year)+r'(?!\d)',head) and 'SUSPENS' in _fold(head).upper() else None

def _effect(text):
 if SUSP.search(text):return 'possible_deadline_suspension'
 if EXT.search(text):return 'possible_deadline_extension'
 if OUTAGE.search(text):return 'system_unavailability'
 if FERIADO.search(text):return 'holiday_mention'
 if OPTIONAL.search(text):return 'optional_workday'
 return None

def _described_dates(text):
 found=set()
 for first,second,month,year in DESC_DATE.findall(_fold(text)):
  for day in (first,second):
   if not day:continue
   try:found.add(dt.date(int(year),MONTHS[month],int(day)).isoformat())
   except ValueError:pass
 return found

def _dates(period, year):
 found=[]
 for d,m,y in DATE_RE.findall(period):
  actual_year=int(y) if y else year
  if actual_year is None:continue
  try:value=dt.date(actual_year,int(m),int(d)).isoformat()
  except ValueError:continue
  if value not in [v['date'] for v in found]:found.append({'date':value,'year_inferred':not bool(y)})
 return found

def extract_pdf_table(text,url,digest,limit=LIMIT):
 """Extract only date cells next to table ementas. All signals remain unverified."""
 text=(text or '')[:400000]
 year=year_from_document(url,text)
 lines=text.splitlines()
 if not re.search(r'per[ií]odo',text,re.I) or not re.search(r'ementa',text,re.I):
  return {'occurrences':[],'year_hint':year,'truncated':len(text)>=400000,'table_rows_checked':0}
 rows=[];active=None;page=1
 for line in lines:
  marker=PAGE_RE.fullmatch(line)
  if marker:
   if active:rows.append(active);active=None
   page=int(marker.group(1));continue
  match=START_RE.match(line)
  if match and _dates(match.group('period'),year):
   if active:rows.append(active)
   active={'period':match.group('period'),'lines':[match.group('rest')],'page':page}
  elif active:
   # A table row is bounded by the next date cell, page or an upper length limit.
   if len(active['lines'])<8 and sum(len(x) for x in active['lines'])<1600:
    active['lines'].append(line.strip())
   else:
    rows.append(active);active=None
 if active:rows.append(active)
 results=[];seen=set()
 for row in rows:
  period=row['period'];dates=_dates(period,year)
  content=' '.join(x.strip() for x in row['lines'] if x.strip())[:1700]
  if not content:continue
  # Require a normative act + an ementa effect in the same isolated row.
  acts=ACT_RE.findall(content)
  if not acts:continue
  effect=_effect(content)
  if not effect:continue
  described=_described_dates(content)
  if described:
   dates=[d for d in dates if d['date'] in described]
   if not dates:continue
  exception=bool(EXCEPT.search(content))
  places=[re.sub(r'\s+',' ',x).strip().title() for x in COMARCA.findall(content)][:3]
  row_text=re.sub(r'\s+',' ',period+' '+content).strip()
  for entry in dates:
   key=(entry['date'],effect,row_text)
   if key in seen:continue
   seen.add(key)
   suffix=hashlib.sha256((url+'|'+str(row['page'])+'|'+str(key)).encode('utf-8')).hexdigest()[:18]
   results.append({
    'id':'tjrj-extract-'+suffix,'date':entry['date'],'date_expression':period,
    'year_inferred':entry['year_inferred'],'effect_hint':effect,
    'scope_hint':{'kind':'unresolved','comarcas_mentioned':places},
    'has_possible_exceptions':exception,
    'evidence_excerpt':row_text[:450], 'source_url':url, 'source_hash_sha256':digest,
    'document_page':row['page'],'extraction_method':'pdf_table_row',
    'act_references':[f'{kind} nº {number}'+('/'+yearpart if yearpart else '') for kind,number,yearpart in acts[:3]],
    'status':'pending_review','verified':False,'applies_to_deadlines':False,
    'review_reasons':['Linha de tabela extraída mecanicamente; verificar ato, publicação, vigência, abrangência, exceções e efeito jurídico.',
       'Ano inferido de título e URL do informativo anual.' if entry['year_inferred'] else 'Conferir data, abrangência e ato.']
   })
   if len(results)>=limit:
    return {'occurrences':results,'year_hint':year,'table_rows_checked':len(rows),'truncated':True}
 return {'occurrences':results,'year_hint':year,'table_rows_checked':len(rows),'truncated':len(text)>=400000}
