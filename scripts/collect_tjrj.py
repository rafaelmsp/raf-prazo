#!/usr/bin/env python3
"""Coleta automatizada de FONTES do TJRJ. Nunca aprova prazos automaticamente."""
from __future__ import annotations
import argparse,datetime as dt,hashlib,io,json,re,sys,urllib.parse,urllib.request
from html.parser import HTMLParser
from extract_tjrj import extract_structured
from pathlib import Path
import ssl,urllib.error

# Autoridade intermediaria oficial da GlobalSign, ja autenticada/pinada na origem.
# https://support.globalsign.com/ssl/products/organizationssl/organizationssl-intermediate-certificates
INTERMEDIATE_URL='https://secure.globalsign.com/cacert/gsrsaovsslca2018.crt'
INTERMEDIATE_SHA1='dfe83023062b997682708b4eab8e819aff5d9775'
_tjrj_ssl_context=None

def trusted_tjrj_context():
 global _tjrj_ssl_context
 if _tjrj_ssl_context is not None:return _tjrj_ssl_context
 req=urllib.request.Request(INTERMEDIATE_URL,headers={'User-Agent':'Raf-Prazo/2.1 TLS verifier'})
 # A conexao com a GlobalSign usa o CA-store padrao, SEM desabilitar TLS.
 with urllib.request.urlopen(req,timeout=10) as response:
  if urllib.parse.urlsplit(response.geturl()).hostname!='secure.globalsign.com':
   raise ValueError('Redirecionamento inesperado da autoridade certificadora')
  cert=response.read(16000)
 if not cert or len(cert)>12000:raise ValueError('Certificado intermediario invalido')
 if cert.lstrip().startswith(b'-----BEGIN CERTIFICATE-----'):
  import base64
  data=b''.join(line for line in cert.splitlines() if not line.startswith(b'-----'))
  cert=base64.b64decode(data,validate=True)
 if hashlib.sha1(cert).hexdigest()!=INTERMEDIATE_SHA1:
  raise ValueError('Certificado intermediario nao corresponde a assinatura oficial da GlobalSign')
 ctx=ssl.create_default_context()
 ctx.load_verify_locations(cadata=ssl.DER_cert_to_PEM_cert(cert))
 # O intermediario identificado torna-se ancora parcial; nome do host,
 # data de validade e assinatura TLS do portal continuam obrigatorios.
 ctx.verify_flags|=ssl.VERIFY_X509_PARTIAL_CHAIN
 ctx.check_hostname=True
 ctx.verify_mode=ssl.CERT_REQUIRED
 _tjrj_ssl_context=ctx
 return ctx

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dados'/'coleta-tjrj.json'
SOURCES=(
 {'id':'consulta_2026_portaltj','url':'https://portaltj.tjrj.jus.br/documents/d/portal-conhecimento/suspensao-prazos-1a-e-2a-instancia_2026_seesc'},
 {'id':'central_portaltj','url':'https://portaltj.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/177451389'},
 {'id':'aviso_290_portaltj','url':'https://portaltj.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295'},
 {'id':'consulta_2026_www','url':'https://www.tjrj.jus.br/documents/d/portal-conhecimento/suspensao-prazos-1a-e-2a-instancia_2026_seesc'},
 {'id':'central_www','url':'https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/177451389'},
 {'id':'aviso_290_www','url':'https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406979295'},
)
TERMS=re.compile(r'(?i)suspens[ãa]o\s+(?:de\s+|dos\s+)?praz|prazos?\s+processua|feriados?\s+loca|expediente\s+forense|ponto\s+facultativo|ato\s+executivo')
DATES=re.compile(r'(?<!\d)(\d{1,2})[./-](\d{1,2})[./-](20\d{2})(?!\d)')
WORDS=re.compile(r'(?i)\bdia\s+(\d{1,2})\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(20\d{2})')
MONTHS={m:i+1 for i,m in enumerate('janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro'.split())}
MONTHS['marco']=3
MAX_BYTES=6000000

def timestamp():
 return dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')

def valid_url(url):
 try:
  q=urllib.parse.urlsplit(url)
  return q.scheme=='https' and q.hostname in {'www.tjrj.jus.br','portaltj.tjrj.jus.br'} and q.username is None and q.password is None and q.port in (None,443) and q.path.startswith(('/documents/','/web/portal-conhecimento/'))
 except (ValueError,TypeError):
  return False

def normalize(url):
 q=urllib.parse.urlsplit(url)
 return urllib.parse.urlunsplit((q.scheme,q.netloc.lower(),q.path.rstrip('/'),'',''))

class Page(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.skip=0;self.intitle=False;self.inlink=False;self.href=''
  self.parts=[];self.titles=[];self.linkparts=[];self.links=[]
 def handle_starttag(self,tag,attrs):
  if tag in ('script','style','noscript','svg'):self.skip+=1
  if tag=='title':self.intitle=True
  if tag=='a' and not self.skip:
   self.inlink=True;self.href=dict(attrs).get('href','');self.linkparts=[]
 def handle_endtag(self,tag):
  if tag in ('script','style','noscript','svg') and self.skip:self.skip-=1
  if tag=='title':self.intitle=False
  if tag=='a' and self.inlink:
   self.links.append((self.href,' '.join(self.linkparts)));self.inlink=False
 def handle_data(self,data):
  if self.skip:return
  value=data.strip()
  if not value:return
  self.parts.append(value)
  if self.intitle:self.titles.append(value)
  if self.inlink:self.linkparts.append(value)

def mentioned_dates(text):
 result=set()
 def add(d,m,y):
  try:result.add(dt.date(int(y),int(m),int(d)).isoformat())
  except ValueError:pass
 for d,m,y in DATES.findall(text):add(d,m,y)
 for d,m,y in WORDS.findall(text):add(d,MONTHS[m.lower()],y)
 return sorted(result)[:35]

def fetch_source(url):
 if not valid_url(url):raise ValueError('URL não oficial')
 req=urllib.request.Request(url,headers={'User-Agent':'Raf-Prazo/2.1 (coleta informativa nao oficial)','Accept':'text/html,application/pdf;q=0.9'})
 try:
  response=urllib.request.urlopen(req,timeout=14)
 except urllib.error.URLError as exc:
  if not isinstance(getattr(exc,'reason',None),ssl.SSLCertVerificationError):
   raise
  # Recupera cadeia intermediaria AUSENTE, sem aceitar TLS inseguro.
  response=urllib.request.urlopen(req,timeout=14,context=trusted_tjrj_context())
 with response:
  redirect=response.geturl()
  if not valid_url(redirect):raise ValueError('Redirecionamento externo bloqueado')
  if response.status!=200:raise RuntimeError('HTTP '+str(response.status))
  kind=response.headers.get('Content-Type','').split(';')[0].strip().lower()
  if kind not in ('text/html','application/xhtml+xml','application/pdf','application/octet-stream'):raise ValueError('Formato inesperado: '+kind)
  blob=response.read(MAX_BYTES+1)
 if not blob or len(blob)>MAX_BYTES:raise ValueError('Fonte vazia ou grande demais')
 return blob,kind,redirect

def parse_source(blob,kind):
 if kind=='application/pdf' or blob.startswith(b'%PDF-'):
  from pypdf import PdfReader
  pdf=PdfReader(io.BytesIO(blob),strict=False)
  text='\n'.join((p.extract_text() or '') for p in pdf.pages[:min(len(pdf.pages),24)])[:85000]
  return 'Informativo de suspensão de prazos do TJRJ',text,[]
 page=Page()
 try:page.feed(blob.decode('utf-8'))
 except UnicodeDecodeError:page.feed(blob.decode('latin-1',errors='replace'))
 return (' '.join(page.titles).strip() or 'Publicação oficial TJRJ')[:240],' '.join(page.parts)[:85000],page.links

def make_candidate(url,title,body,digest,when,previous=None):
 url=normalize(url);previous=previous or {}
 hit=TERMS.search(body)
 excerpt=re.sub(r'\s+',' ',body[max(hit.start()-70,0):hit.end()+320] if hit else body[:320]).strip()[:430]
 return {
  'id':'tjrj-source-'+hashlib.sha256(url.encode()).hexdigest()[:18],
  'name':title[:240],'date':None,'origin':'tjrj_automatic_discovery',
  'status':'pending_review','verified':False,'applies_to_deadlines':False,
  'date_mentions':mentioned_dates(body),'source_url':url,
  'source_hash_sha256':digest,'excerpt':excerpt,
  'first_seen_at':previous.get('first_seen_at') or when,'last_seen_at':when,'stale':False
 }

def collect(previous,fetch=fetch_source,seeds=SOURCES,max_discovered=8):
 when=timestamp()
 prior={c['id']:c for c in previous.get('candidates',[]) if isinstance(c,dict) and c.get('id')}
 queue=[(s['url'],s['id']) for s in seeds]
 seen=set();candidates={};checked=[];discovered=0
 while queue and len(seen)<len(seeds)+max_discovered:
  url,label=queue.pop(0)
  if not valid_url(url):continue
  url=normalize(url)
  if url in seen:continue
  seen.add(url)
  item={'id':label,'url':url,'checked_at':when}
  try:
   blob,kind,destination=fetch(url)
   destination=normalize(destination)
   if not valid_url(destination):raise ValueError('Redirecionamento não oficial')
   title,body,links=parse_source(blob,kind)
   digest=hashlib.sha256(blob).hexdigest()
   item.update({'result':'ok','content_type':kind,'sha256':digest,'title':title})
   if TERMS.search(body) or 'suspens' in destination or 'feriad' in destination:
    record_id='tjrj-source-'+hashlib.sha256(destination.encode()).hexdigest()[:18]
    c=make_candidate(destination,title,body,digest,when,prior.get(record_id))
    c['structured']=extract_structured(body,destination,digest,title)
    c['extracted_count']=len(c['structured']['occurrences'])
    candidates[c['id']]=c
   for href,anchor in links:
    if discovered>=max_discovered:break
    dest=normalize(urllib.parse.urljoin(destination,href))
    if (valid_url(dest) and TERMS.search(anchor) and dest not in seen
        and dest not in {x[0] for x in queue}):
     queue.append((dest,'link_descoberto'));discovered+=1
  except Exception as exc:
   item.update({'result':'failed','error':str(exc)[:180]})
  checked.append(item)
 success=sum(c['result']=='ok' for c in checked)
 for key,item in prior.items():
  if key not in candidates:
   candidates[key]={**item,'stale':True,'verified':False,
                    'status':'pending_review','applies_to_deadlines':False}
 return {
  'schema':1,'service':'TJRJ','status':('ok' if checked and success==len(checked)
     else 'partial' if success else 'unavailable'),
  'collected_at':when,'source_count':len(checked),'source_success':success,
  'source_statuses':checked,'candidates':sorted(candidates.values(),key=lambda c:c['id'])[:60],
  'automatically_applies_events':False,
  'coverage':'Fontes apenas de descoberta; sem confirmação jurídica de vigência, suspensão ou comarca.'
 }

def main(argv=None):
 parser=argparse.ArgumentParser()
 parser.add_argument('--check',action='store_true')
 args=parser.parse_args(argv)
 try:previous=json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else {}
 except (OSError,ValueError):previous={}
 if args.check:
  if any(c.get('applies_to_deadlines') is not False for c in previous.get('candidates',[])):raise ValueError('Candidato indevidamente ativo')
  print('TJRJ: '+previous.get('status','not_run')+'; pendentes='+str(len(previous.get('candidates',[]))))
  return 0
 data=collect(previous)
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print('TJRJ: '+data['status']+'; fontes '+str(data['source_success'])+'/'+str(data['source_count'])+'; sem ativar eventos')
 return 0

if __name__=='__main__':sys.exit(main())
