#!/usr/bin/env python3
"""Feriados ESTADUAIS RJ e MUNICIPAIS Duque de Caxias, baseados em normas públicas.

Não é um calendário forense completo: o usuário deve ativar separadamente a
consideração das datas locais, mantendo distintas as suspensões do TJRJ.
"""
from __future__ import annotations
import datetime as dt

IBGE_CAXIAS = "3301702"
REVIEW_DATE = "2026-10-17"
OFFICIAL_ALERJ_CARNAVAL = "https://alerjln1.alerj.rj.gov.br/contlei.nsf/351902c88b9f0cde03256bcf00607a5b/063f7c027766eab48325744a007a4ab0"
OFFICIAL_ALERJ_SAO_JORGE = "https://alerjln1.alerj.rj.gov.br/scpro0711.nsf/3372bd49984790dd83257258006f0719/094e2cd7679638b2832572a7006ee116"
OFFICIAL_ALERJ_CORPUS = "https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L2NvbnRsZWkubnNmL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmLzQ2ODM3ZTRkMjJiMDFmMzUwMzI1OGQyYzAwNDhhYmRhP09wZW5Eb2N1bWVudA%3D%3D"
OFFICIAL_STF_CORPUS = "https://noticias.stf.jus.br/postsnoticias/stf-valida-criacao-de-feriado-de-corpus-christi-no-estado-do-rio-de-janeiro/"
OFFICIAL_CAMARA_CAXIAS = "https://www.cmdc.rj.gov.br/?page_id=7592"

def easter(year: int) -> dt.date:
    """Computus gregoriano Meeus/Jones/Butcher (sem requisição externa)."""
    a=year%19; b=year//100; c=year%100; d=b//4; e=b%4
    f=(b+8)//25; g=(b-f+1)//3; h=(19*a+b-d-g+15)%30
    i=c//4; k=c%4; l=(32+2*e+2*i-h-k)%7
    m=(a+11*h+22*l)//451
    n=h+l-7*m+114
    return dt.date(year,n//31,n%31+1)

def legal_local_events(years, previous=None):
    """Devolve eventos de legislação RJ/Caxias, separados por âmbito jurídico."""
    previous=previous or {}
    previous_dates={e['id']:e for e in previous.get('events',[]) if e.get('type') in ('ESTADUAL','MUNICIPAL')}
    rows=[]
    for year in years:
        pascoa=easter(year)
        items=[
            (pascoa-dt.timedelta(days=47),'Terça-feira de Carnaval','ESTADUAL',{'kind':'state','uf':'RJ'},
             'Lei estadual nº 5.243/2008',
             'ALERJ — Lei estadual nº 5.243/2008, em vigor',OFFICIAL_ALERJ_CARNAVAL),
            (dt.date(year,4,23),'Dia de São Jorge','ESTADUAL',{'kind':'state','uf':'RJ'},
             'Lei estadual nº 5.198/2008',
             'ALERJ — PL 339/2007 convertido na Lei estadual nº 5.198/2008',OFFICIAL_ALERJ_SAO_JORGE),
            (pascoa+dt.timedelta(days=60),'Corpus Christi','ESTADUAL',{'kind':'state','uf':'RJ'},
             'Lei estadual nº 11.002/2025; STF, ADI 7898',
             'ALERJ — Lei estadual nº 11.002/2025, validada pelo STF',OFFICIAL_ALERJ_CORPUS),
            (pascoa-dt.timedelta(days=2),'Sexta-feira da Paixão','MUNICIPAL',
             {'kind':'municipal','uf':'RJ','ibge':IBGE_CAXIAS},
             'Deliberação municipal nº 1.543/1970, art. 1º',
             'Câmara Municipal de Duque de Caxias — Deliberação nº 1.543/1970',OFFICIAL_CAMARA_CAXIAS),
            (dt.date(year,6,13),'Santo Antônio — Padroeiro de Duque de Caxias','MUNICIPAL',
             {'kind':'municipal','uf':'RJ','ibge':IBGE_CAXIAS},
             'Deliberação municipal nº 1.543/1970, art. 1º',
             'Câmara Municipal de Duque de Caxias — Deliberação nº 1.543/1970',OFFICIAL_CAMARA_CAXIAS),
        ]
        for date,name,kind,scope,act,title,url in items:
            ident=('rj' if kind=='ESTADUAL' else 'caxias')+'-'+date.isoformat()
            rows.append({
                'id':ident,'date':date.isoformat(),'name':name,'type':kind,
                'scope':scope,'status':'confirmed','applies_to_deadlines':True,
                'source':{'title':title,'act':act,'url':url},
                'verified_at':previous_dates.get(ident,{}).get('verified_at',REVIEW_DATE),
                'origin':'legislacao-estadual-municipal-curada',
                'review_note':'Feriado civil comprovado por lei. A aplicação ao prazo processual exige opção expressa e conferência do expediente forense.',
            })
    return rows
