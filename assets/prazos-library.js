(()=>{'use strict';const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],catalog=()=>window.RafPrazoLegal22?.configurations||{};let selected=null;const memory={};const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return memory[k]||null}},write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){memory[k]=v}};const kind=i=>i.kind==='hours'?'48 horas · motor não calcula':i.kind==='conditional'?`${i.referenceDays} dias · condicionado`:i.kind==='procedural'?'Conferir rito/audiência':i.kind==='manual'?'Prazo nos autos':i.days==null?'Informar duração':`${i.days} dias úteis`;const safe=t=>String(t||'').toLocaleLowerCase('pt-BR');const items=()=>Object.entries(catalog()).flatMap(([regime,c])=>c.presets.filter(i=>i.kind!=='custom').map(i=>({...i,regime,regimeLabel:c.short})));function favoriteKey(i){return `${i.regime}:${i.id}`}function favs(){return read('raf-prazo:library:favorites')||[]}// Memoriza quais categorias o usuario abriu ou fechou nesta visita.
const expandedGroups=new Map();
function render(){
 renderCategories();
 const q=safe($('#search').value);
 const regime=$('#regime').value, category=$('#category').value;
 const showFav=$('#favorites').checked,showRecent=$('#recent').checked;
 const recent=read('raf-prazo:library:recent')||[];
 const favorites=showFav?favs():[];
 const found=items().filter(i=>
   (regime==='all'||i.regime===regime)&&
   (category==='all'||i.category===category)&&
   (!showFav||favorites.includes(favoriteKey(i)))&&
   (!showRecent||recent.includes(favoriteKey(i)))&&
   safe(`${i.label} ${i.description} ${i.basis}`).includes(q)
 ).sort((a,b)=>showRecent?recent.indexOf(favoriteKey(a))-recent.indexOf(favoriteKey(b)):0);
 $('#count').textContent=`${found.length} ato(s) encontrado(s)`;
 const root=$('#groups');
 root.replaceChildren();
 if(!found.length){
  const empty=document.createElement('p');
  empty.className='empty';
  empty.textContent='Nenhum ato encontrado. Ajuste a busca ou os filtros.';
  root.append(empty);
  return;
 }
 const grouped=Object.entries(found.reduce((groups,i)=>{
   const key=`${i.regimeLabel} · ${i.category}`;
   (groups[key]??=[]).push(i);
   return groups;
 },{}));
 const mobile=window.matchMedia('(max-width:760px)').matches;
 // Resultados filtrados ficam abertos para que o leigo veja os atos encontrados.
 const isFiltering=!!q||regime!=='all'||category!=='all'||showFav||showRecent;
 for(const [index,[name,rows]] of grouped.entries()){
  const group=document.createElement('details');
  group.className='group';
  group.dataset.groupKey=name;
  const remembered=expandedGroups.get(name);
  group.open=isFiltering||(remembered===undefined?(!mobile||index===0):remembered);
  const heading=document.createElement('summary');
  heading.className='group-header';
  heading.title='Toque para abrir ou fechar esta categoria';
  const label=document.createElement('span');
  label.className='group-label';
  label.textContent=name;
  const actions=document.createElement('span');
  actions.className='group-header-actions';
  const count=document.createElement('span');
  count.className='group-count';
  count.textContent=String(rows.length);
  count.setAttribute('aria-label',`${rows.length} atos`);
  const chevron=document.createElement('span');
  chevron.className='group-chevron';
  chevron.textContent='⌄';
  chevron.setAttribute('aria-hidden','true');
  actions.append(count,chevron);
  heading.append(label,actions);
  const cards=document.createElement('div');
  cards.className='cards';
  for(const i of rows){
   const button=document.createElement('button');
   button.className='card';
   button.type='button';
   const copy=document.createElement('span');
   const title=document.createElement('strong');
   const basis=document.createElement('small');
   title.textContent=i.label;
   basis.textContent=i.basis;
   copy.append(title,basis);
   const tag=document.createElement('span');
   tag.className='tag';
   tag.textContent=kind(i);
   button.append(copy,tag);
   button.onclick=()=>detail(i);
   cards.append(button);
  }
  group.append(heading,cards);
  root.append(group);
  group.addEventListener('toggle',()=>{
   if(!group.isConnected)return;
   expandedGroups.set(name,group.open);
   // No celular, somente uma categoria aberta por vez: menos rolagem.
   if(mobile&&!isFiltering&&group.open){
    root.querySelectorAll('details.group[open]').forEach(other=>{
     if(other===group)return;
     other.open=false;
     expandedGroups.set(other.dataset.groupKey,false);
    });
   }
  });
 }
}
function renderCategories(){
 const root=$('#categoryNav');if(!root)return;
 const regime=$('#regime').value,chosen=$('#category').value;
 const rows=items().filter(i=>regime==='all'||i.regime===regime);
 const counts=new Map();for(const i of rows)counts.set(i.category,(counts.get(i.category)||0)+1);
 root.replaceChildren();
 const entries=[['all','Todos os atos',rows.length],...[...counts.entries()].sort((a,b)=>a[0].localeCompare(b[0],'pt-BR')).map(([a,b])=>[a,a,b])];
 for(const [key,label,count] of entries){
  const btn=document.createElement('button');btn.type='button';btn.className='category-link';
  btn.setAttribute('aria-pressed',String(chosen===key));
  const title=document.createElement('span');title.textContent=label;
  const qty=document.createElement('span');qty.textContent=String(count);
  btn.append(title,qty);btn.onclick=()=>{$('#category').value=key;render()};root.append(btn);
 }
}
function renderPreview(i){
 const root=$('#preview');if(!root)return;
 root.replaceChildren();
 const title=document.createElement('h2');title.textContent=i.label;
 const badge=document.createElement('p');badge.className='meta';badge.textContent=i.regimeLabel+' · '+i.category+' · '+kind(i);
 const desc=document.createElement('p');desc.textContent=i.description||'Conferir os autos e a regra aplicável.';
 const basis=document.createElement('p');basis.textContent='Fundamento: '+(i.basis||'Conferir');
 root.append(title,badge,desc,basis);
 if(i.url){const link=document.createElement('a');link.href=i.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Consultar fonte ↗';root.append(link)}
 if(i.kind==='conditional'){const warn=document.createElement('p');warn.className='notice';warn.textContent='Prazo condicionado: confira o enquadramento, o marco inicial e os autos antes de aplicar.';root.append(warn)}
 if(i.kind==='hours'){const warn=document.createElement('p');warn.className='notice';warn.textContent='Este motor não conta horas. A consulta é apenas informativa.';root.append(warn)}
 const button=document.createElement('button');button.type='button';button.className='button primary preview-action';button.textContent='Conferir condições e aplicar';
 button.onclick=()=>{if(!$('#dialog').open)$('#dialog').showModal()};root.append(button);
}
function detail(i){selected=i;$('#detailTitle').textContent=i.label;$('#detailMeta').textContent=`${i.regimeLabel} · ${i.category} · ${kind(i)}`;$('#detailText').textContent=i.description;$('#detailBasis').textContent=i.basis;const link=$('#detailLink');link.href=i.url;link.hidden=!i.url;const fav=$('#favorite');fav.textContent=favs().includes(favoriteKey(i))?'Remover favorito':'Favoritar';const eligible=Number.isSafeInteger(i.days)&&i.days>0||i.kind==='conditional'&&Number.isSafeInteger(i.referenceDays);$('#confirmWrap').hidden=!eligible;$('#confirm').checked=false;$('#apply').hidden=!eligible;$('#manualNote').hidden=eligible;$('#manualNote').textContent=i.kind==='hours'?'Este prazo é de 48 horas e não será convertido em dias úteis. Leia os autos e a regra aplicável.':'Este ato depende dos autos, rito ou decisão. A biblioteca é informativa e não preenche a calculadora.';if(window.matchMedia('(min-width:1121px)').matches){renderPreview(i)}else if(!$('#dialog').open)$('#dialog').showModal()}function apply(){if(!selected||!$('#confirm').checked)return;const days=selected.days??selected.referenceDays;if(!Number.isSafeInteger(days)||days<1||selected.kind==='hours')return;const payload={schema:1,regime:selected.regime,preset:selected.id,timestamp:Date.now(),conditionalConfirmed:selected.kind==='conditional'};try{sessionStorage.setItem('raf-prazo:library:intent:v1',JSON.stringify(payload))}catch(_){return}const recent=read('raf-prazo:library:recent')||[];write('raf-prazo:library:recent',[favoriteKey(selected),...recent.filter(x=>x!==favoriteKey(selected))].slice(0,8));location.href='../index.html'}function init(){const c=catalog();if(!Object.keys(c).length){$('#count').textContent='Catálogo indisponível nesta página.';return}const categories=[...new Set(items().map(i=>i.category))].sort((a,b)=>a.localeCompare(b,'pt-BR'));$('#category').append(...categories.map(x=>new Option(x,x)));all('#search,#regime,#category,#favorites,#recent').forEach(e=>e.addEventListener(e.id==='search'?'input':'change',render));$('#close').onclick=()=>$('#dialog').close();$('#apply').onclick=apply;$('#confirm').onchange=()=>$('#apply').disabled=!$('#confirm').checked;$('#favorite').onclick=()=>{if(!selected)return;const k=favoriteKey(selected),next=favs().includes(k)?favs().filter(x=>x!==k):[...favs(),k];write('raf-prazo:library:favorites',next);detail(selected);render()};render()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init()})();
