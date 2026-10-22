/* Raf-Prazo | Balcão Virtual — Atendimento
   Biblioteca de modelos, sem integração com sistemas do tribunal. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const phrases=[
 ['Abertura','Boas-vindas e regras completas','Boa tarde, Dr.(a)!\n\nInformamos que, conforme o Ato Normativo Conjunto TJ/CGJ nº 15/2026, que regulamenta o Balcão Virtual, deverão ser observadas as seguintes regras durante o atendimento:\n\n• É obrigatória a identificação do advogado(a) mediante apresentação da carteira da OAB, bem como a utilização da câmera durante o atendimento;\n• O atendimento possui duração máxima de 10 (dez) minutos;\n• Cada atendimento está limitado a 3 (três) processos por usuário.\n\nSolicitamos, por gentileza, que a câmera seja ativada e a carteira da OAB apresentada no início do atendimento, bem como que sejam observados os limites estabelecidos, a fim de possibilitar o atendimento adequado de todos os usuários.\n\nAgradecemos a compreensão.','base'],
 ['Abertura','Saudação de boas-vindas — manhã','Bom dia, Dr.(a)! Seja bem-vindo(a) ao Balcão Virtual do 2º Juizado Especial Cível de Duque de Caxias. Por gentileza, informe o número do processo e o motivo do atendimento.','modelo'],
 ['Abertura','Saudação de boas-vindas — tarde','Boa tarde, Dr.(a)! Seja bem-vindo(a) ao Balcão Virtual do 2º Juizado Especial Cível de Duque de Caxias. Por gentileza, informe o número do processo e o motivo do atendimento.','modelo'],
 ['Abertura','Regulamento — orientação breve','Dr.(a), lembramos que o atendimento pelo Balcão Virtual exige apresentação da carteira da OAB e câmera ligada, respeitando o limite de 10 minutos e de até 3 processos por atendimento, conforme as regras informadas.','modelo'],
 ['Identificação','Apresentar carteira da OAB','Dr.(a), por gentileza, apresente a carteira da OAB à câmera para que possamos conferir a identificação e dar continuidade ao atendimento.','modelo'],
 ['Identificação','Ativar a câmera','Dr.(a), por gentileza, ative a câmera durante o atendimento para prosseguirmos com a identificação.','modelo'],
 ['Identificação','Câmera e OAB','Para darmos continuidade ao atendimento, solicitamos que mantenha a câmera ligada e apresente sua carteira da OAB. Agradecemos a colaboração.','modelo'],
 ['Identificação','Informar o número do processo','Por gentileza, informe o número completo do processo, no padrão CNJ, e a finalidade da solicitação.','modelo'],
 ['Identificação','Limite de três processos','Dr.(a), o atendimento contempla até 3 (três) processos por acesso. Para consultar outros processos, solicitamos um novo atendimento.','modelo'],
 ['Consulta','Processando sua solicitação','Só um instante, pois estou processando sua solicitação.','base'],
 ['Consulta','Consultando o sistema','Peço apenas um momento enquanto faço a consulta.','base'],
 ['Consulta','Consulta no PJe','Peço apenas um momento enquanto faço a consulta no PJe.','modelo'],
 ['Consulta','Conferência dos autos','Por gentileza, aguarde um momento enquanto confiro os documentos e as movimentações constantes dos autos.','modelo'],
 ['Consulta','Alta demanda de processos','Devido à nossa alta demanda processual, peço que aguarde um momento para concluirmos sua solicitação.','base'],
 ['Consulta','Agradecimento pela espera','Agradeço por aguardar, Dr.(a). Estou conferindo as informações para lhe dar uma resposta precisa.','modelo'],
 ['Consulta','Consulta com mais de um processo','Dr.(a), estou verificando os processos informados. Por gentileza, aguarde enquanto concluo a conferência de cada um.','modelo'],
 ['Consulta','Informação ainda não localizada','Dr.(a), ainda não localizei a informação solicitada. Vou conferir a situação dos autos e, se necessário, orientar o encaminhamento ao setor responsável.','modelo'],
 ['Consulta','Consulta do prazo processual','Peço um momento, Dr.(a), para conferir a certidão de intimação e os registros de prazo no sistema.','modelo'],
 ['Andamentos','Acompanhar movimentação','Dr.(a), por gentileza, acompanhe as próximas movimentações do processo diretamente pelo PJe.','modelo'],
 ['Andamentos','Verificar pedido de conclusão','Dr.(a), vou verificar se o processo está apto para conclusão, conforme a situação dos autos e o fluxo da serventia.','modelo'],
 ['Andamentos','Pedido de conclusão recebido','A solicitação de conclusão será encaminhada à conferência da serventia. O atendimento não significa conclusão imediata nem previsão de decisão judicial.','modelo'],
 ['Andamentos','Multa não paga — pedido de conclusão','Dr.(a), vou conferir a decisão, o prazo para pagamento da multa e as movimentações processuais para verificar o encaminhamento do pedido de conclusão.','modelo'],
 ['Andamentos','Petição juntada','Dr.(a), vou verificar se a petição foi juntada aos autos e qual encaminhamento é cabível no andamento atual.','modelo'],
 ['Andamentos','Contestação apresentada','Dr.(a), vou conferir a contestação e a fase processual antes de informar a movimentação ou encaminhamento pertinente.','modelo'],
 ['Andamentos','Certidão pendente','Dr.(a), vou verificar os documentos e os registros necessários à certidão. A conclusão dessa providência depende da conferência dos autos.','modelo'],
 ['Andamentos','Encaminhamento ao setor','Sua solicitação será submetida à conferência da serventia ou do setor responsável. Pedimos que acompanhe as movimentações do processo.','modelo'],
 ['Andamentos','Sem previsão de decisão','Dr.(a), não é possível informar uma data para apreciação judicial. Pedimos que acompanhe as movimentações oficiais do processo.','modelo'],
 ['Recursos','Contrarrazões apresentadas','As seguintes partes apresentaram contrarrazões dentro do prazo: [PARTES].','base'],
 ['Recursos','Contrarrazões — conferência','Dr.(a), vou conferir o decurso dos prazos e as contrarrazões eventualmente juntadas antes de informar a situação do recurso.','modelo'],
 ['Recursos','Envio à Turma Recursal','Dr.(a), vou verificar se os autos estão aptos ao encaminhamento à Turma Recursal, observados os registros de intimação e as contrarrazões.','modelo'],
 ['Recursos','Recurso pendente','Dr.(a), a movimentação recursal está sujeita à conferência dos autos. Vou verificar a fase atual do processo.','modelo'],
 ['Audiências','Verificar pauta da audiência','Dr.(a), vou consultar a pauta e conferir os registros do processo para verificar a data e a modalidade da audiência.','modelo'],
 ['Audiências','Link de audiência','Dr.(a), por gentileza, confira a designação da audiência e o link disponível nos autos. Se necessário, a solicitação será encaminhada à conferência da unidade.','modelo'],
 ['Audiências','Pauta em conferência','A pauta de audiências será conferida com os registros oficiais do PJe. Pedimos que acompanhe as publicações e intimações do processo.','modelo'],
 ['Execução','Pedido de bloqueio/penhora','Dr.(a), vou verificar a decisão e a situação processual antes de encaminhar o pedido de bloqueio ou penhora ao setor responsável.','modelo'],
 ['Execução','Pedido de desbloqueio','Dr.(a), vou conferir os autos para verificar a solicitação de desbloqueio. A liberação de valores depende da análise e das determinações judiciais pertinentes.','modelo'],
 ['Execução','Mandado de pagamento','Dr.(a), vou consultar a situação do mandado de pagamento. Eventual expedição depende da conferência dos autos e das determinações judiciais.','modelo'],
 ['Execução','Mandado devolvido','Dr.(a), vou conferir a devolução do mandado e a movimentação correspondente antes de orientar o encaminhamento.','modelo'],
 ['Atendimento','Providência ainda não executada','Dr.(a), a solicitação foi recebida para verificação. Só será possível confirmar a providência após o respectivo registro no sistema.','modelo'],
 ['Atendimento','Informação processual, não orientação jurídica','O Balcão Virtual presta informações sobre o andamento processual e os procedimentos da serventia, mas não substitui orientação jurídica nem antecipa decisão do juízo.','modelo'],
 ['Atendimento','Aguardar análise da serventia','Dr.(a), o pedido depende de conferência interna. Por gentileza, acompanhe a movimentação pelo sistema.','modelo'],
 ['Atendimento','Solicitação de urgência','Dr.(a), vou verificar se consta pedido de urgência nos autos e qual é o encaminhamento previsto para a situação processual.','modelo'],
 ['Encerramento','Encerramento do atendimento — manhã','Dr.(a), agradecemos o contato com o Balcão Virtual do 2º Juizado Especial Cível de Duque de Caxias. Tenha um bom dia!','modelo'],
 ['Encerramento','Encerramento do atendimento — tarde','Dr.(a), agradecemos o contato com o Balcão Virtual do 2º Juizado Especial Cível de Duque de Caxias. Tenha uma boa tarde!','modelo'],
 ['Encerramento','Limite de dez minutos','Informamos que foi atingido o limite de 10 (dez) minutos para este atendimento. Caso necessite de informações adicionais, solicitamos novo acesso ao Balcão Virtual. Agradecemos a compreensão.','modelo'],
 ['Encerramento','Limite de três processos alcançado','Dr.(a), o limite de 3 (três) processos deste atendimento foi atingido. Para outros processos, solicitamos novo acesso ao Balcão Virtual. Agradecemos a compreensão.','modelo'],
 ['Encerramento','Mais alguma solicitação?','Dr.(a), há mais alguma informação processual que possamos verificar dentro do tempo disponível para este atendimento?','modelo']
];
const categories=['Todas',...new Set(phrases.map(p=>p[0]))],state={category:'Todas',query:''};
const create=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e};
function init(){
 const main=document.getElementById('mainContent'),nav=document.getElementById('navBalcaoVirtual');
 if(!main||!nav)return;
 const section=create('section','raf-bv-view');section.id='rafBalcaoView';section.hidden=true;
 section.innerHTML='<div class="raf-bv-hero"><div><span class="raf-bv-eyebrow">FERRAMENTAS JURÍDICAS · 2º JEC</span><h1>Balcão Virtual — Atendimento</h1><p>Frases prontas para copiar e utilizar no Teams. Organizadas por etapa do atendimento.</p></div><button type="button" id="rafBvReturn" class="raf-bv-return">← Calculadora</button></div><div class="raf-bv-warning"><strong>Antes de enviar:</strong> confira o número do processo, a situação dos autos e as regras vigentes do Balcão Virtual. Os modelos não confirmam providências nem enviam mensagens automaticamente.</div><div class="raf-bv-filters"><label>Buscar mensagem<input type="search" id="rafBvSearch" placeholder="Ex.: câmera, contrarrazões, conclusão, bloqueio" autocomplete="off"></label><label>Número do processo (opcional)<input type="text" id="rafBvProcess" placeholder="0000000-00.0000.8.19.0000" autocomplete="off"></label></div><div class="raf-bv-category-tabs" id="rafBvCategories" aria-label="Filtrar por assunto"></div><div class="raf-bv-count" id="rafBvCount"></div><div class="raf-bv-list" id="rafBvList"></div><p class="raf-bv-feedback" role="status" aria-live="polite" id="rafBvFeedback"></p>';
 main.append(section);
 const $=id=>document.getElementById(id);
 const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const interpolated=text=>text.replaceAll('[NÚMERO DO PROCESSO]',$('rafBvProcess').value.trim()||'[NÚMERO DO PROCESSO]');
 async function copy(text,btn){
  let ok=false;
  try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);ok=true}}catch(_){}
  if(!ok){
   const tmp=create('textarea');tmp.value=text;tmp.style.cssText='position:fixed;left:-9999px;opacity:0';document.body.append(tmp);tmp.focus();tmp.select();
   try{ok=document.execCommand('copy')}catch(_){}
   tmp.remove();
  }
  if(ok){btn.textContent='✓ Copiado';btn.classList.add('is-copied');$('rafBvFeedback').textContent='Frase copiada. Confira os dados antes de enviar.'}
  else{$('rafBvFeedback').textContent='Não foi possível copiar automaticamente. Selecione a frase para copiá-la.'}
 }
 function renderCats(){
  const root=$('rafBvCategories');root.replaceChildren();
  for(const category of categories){
   const button=create('button','raf-bv-category',category);button.type='button';button.setAttribute('aria-pressed',String(state.category===category));
   button.addEventListener('click',()=>{state.category=category;renderCats();render()});root.append(button);
  }
 }
 function render(){
  const query=normal(state.query.trim()),filtered=phrases.filter(p=>(state.category==='Todas'||p[0]===state.category)&&(!query||normal(p.join(' ')).includes(query)));
  const root=$('rafBvList');root.replaceChildren();$('rafBvCount').textContent=filtered.length+' mensagens disponíveis';
  if(!filtered.length){root.append(create('p','raf-bv-empty','Nenhuma frase encontrada. Tente outra pesquisa.'));return}
  for(const p of filtered){
   const card=create('article','raf-bv-card'),info=create('div','raf-bv-card-body'),head=create('div','raf-bv-card-meta');
   head.append(create('span','raf-bv-category-tag',p[0]),create('span','raf-bv-model-tag',p[3]==='base'?'Texto-base recuperado':'Modelo complementar'));
   info.append(head,create('h2','',p[1]),create('p','raf-bv-phrase',interpolated(p[2])));
   const btn=create('button','raf-bv-copy','Copiar');btn.type='button';btn.setAttribute('aria-label','Copiar frase: '+p[1]);
   btn.addEventListener('click',()=>copy(interpolated(p[2]),btn));
   card.append(info,btn);root.append(card);
  }
 }
 const app=$('app');
 function show(on,updateUrl){
  app.classList.toggle('raf-bv-active',on);section.hidden=!on;
  nav.classList.toggle('active',on);$('navCalc')?.classList.toggle('active',!on);
  if(on){render();window.scrollTo(0,0)}
  if(updateUrl){const newUrl=on?'#balcao-virtual':location.pathname+location.search;history.replaceState(null,'',newUrl)}
 }
 nav.addEventListener('click',()=>show(true,true));
 $('rafBvReturn').addEventListener('click',()=>show(false,true));
 for(const id of ['navCalc','navCalendar'])$(id)?.addEventListener('click',()=>{if(!section.hidden)show(false,true)},true);
 $('rafBvSearch').addEventListener('input',e=>{state.query=e.target.value;render()});
 $('rafBvProcess').addEventListener('input',render);
 window.addEventListener('hashchange',()=>show(location.hash==='#balcao-virtual',false));
 renderCats();render();if(location.hash==='#balcao-virtual')show(true,false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
