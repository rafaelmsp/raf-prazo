/* RAF-PRAZO | Certidões do Dia a Dia — biblioteca auxiliar e não oficial.
   Nenhum dado de processo digitado neste editor é salvo ou enviado. */
(() => {
  'use strict';
  const models = [
    { id:'arquivamento-indevido', group:'Arquivamento', title:'* Autos arquivados indevidamente', verified:true,
      text:'Certifico que os autos foram arquivados indevidamente',
      note:'Confira o histórico do processo e os registros do arquivamento antes de afirmar que ocorreu indevidamente. Não presuma a causa do erro.' },
    { id:'aud-conciliacao', group:'Pauta', title:'* Aguardando audiência de conciliação', verified:true,
      text:'Certifico que os presentes autos encontram-se aguardando audiência de conciliação designada.',
      note:'Confirme que a audiência está efetivamente designada e permanece na pauta.' },
    { id:'acordo-pauta', group:'Pauta', title:'* Acordo juntado — retirada de pauta e remessa ao Juiz Titular', verified:true,
      text:'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao MM. Juiz Titular.',
      note:'Confirme a juntada do acordo, a retirada da pauta e a efetiva remessa ao MM. Juiz Titular conforme o fluxo da unidade.' },
    { id:'acordo-pauta-juiz-leigo', group:'Pauta', title:'* Acordo juntado — retirada de pauta e remessa ao Juiz Leigo', verified:true,
      text:'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao Juiz Leigo responsável.',
      note:'Confirme a juntada do acordo, a retirada da pauta e a efetiva remessa ao Juiz Leigo responsável conforme o fluxo da unidade.' },
{ id:'aud-instrucao', group:'Audiências', title:'Aguardando audiência de instrução', verified:false,
      text:'Certifico que os presentes autos encontram-se aguardando audiência de instrução e julgamento designada para [DATA], às [HORÁRIO], conforme registro no sistema.',
      note:'Confira a pauta atual e a modalidade da audiência.' },
    { id:'pauta-diligencia-negativa-oja', group:'Pauta', title:'* Retirada de pauta — diligência negativa do OJA', verified:true,
      text:'Certifico que o feito foi retirado da pauta de audiências em face de devolução de Diligência negativa de index 317752646. Fica a parte autora intimada a se manifestar sobre certidão do OJA.',
      note:'Modelo fornecido. Confira se a diligência foi negativa, se o feito foi efetivamente retirado da pauta, o index do documento e a regularidade da intimação. O index 317752646 é específico do caso e deve ser substituído nos demais processos. Certidão do OJA não se confunde com AR postal negativo. Palavra-chave de busca: AR negativo.' },
    { id:'aud-ata', group:'Audiências', title:'Registro de ausência em audiência', verified:false,
      text:'Certifico que, conforme ata de audiência juntada sob o ID [ID DA ATA], foi registrada a ausência de [PARTE OU REPRESENTANTE] na audiência realizada em [DATA].',
      note:'Transcreva apenas o que constar expressamente da ata. Não presuma consequências processuais.' },
    { id:'acordo-juntado', group:'Acordos', title:'Instrumento de acordo juntado', verified:false,
      text:'Certifico que foi juntado aos autos instrumento de acordo sob o ID [ID DO DOCUMENTO], em [DATA], para apreciação pelo Juízo.',
      note:'Confira a juntada, a data e o encaminhamento cabível. Não confundir juntada com homologação.' },
    { id:'peticao-juntada', group:'Juntadas', title:'Petição juntada aos autos', verified:false,
      text:'Certifico que consta nos autos petição juntada sob o ID [ID DA PETIÇÃO], em [DATA], com o assunto [ASSUNTO], conforme consulta ao sistema.',
      note:'Confira o ID, a data da juntada e a descrição do pedido.' },
    { id:'procuracao-juntada', group:'Juntadas', title:'Instrumento de procuração juntado', verified:false,
      text:'Certifico que foi juntado aos autos instrumento de procuração sob o ID [ID DO DOCUMENTO], conforme consulta ao sistema.',
      note:'A juntada não equivale, por si só, à validação de representação ou poderes.' },
    { id:'adv-cadastro', group:'Habilitação', title:'Cadastro de advogado realizado', verified:false,
      text:'Certifico que foi realizado o cadastro de [NOME DO(A) ADVOGADO(A)], OAB/[UF] [NÚMERO], no sistema, conforme providência efetivamente executada nesta data.',
      note:'Somente utilize após verificar a habilitação, os documentos e a realização do cadastro.' },
    { id:'doc-nao-localizado', group:'Habilitação', title:'Documento não localizado na conferência', verified:false,
      text:'Certifico que, em consulta aos documentos disponíveis nos autos nesta data, não localizei [DOCUMENTO OU PEÇA] entre os arquivos apresentados.',
      note:'Limite a certidão ao alcance da consulta realizada; não afirme inexistência definitiva.' },
    { id:'ar-devolvido', group:'Comunicação processual', title:'Aviso de recebimento — resultado documentado', verified:false,
      text:'Certifico que o Aviso de Recebimento (AR) juntado sob o ID [ID DO AR] contém a informação [RESULTADO LITERAL DO AR], conforme documento disponível nos autos.',
      note:'Confira assinatura, destinatário, anotações e eventual recebimento por terceiro; não conclua automaticamente pela validade da citação.' },
    { id:'ar-negativo', group:'Comunicação processual', title:'Aviso de recebimento — devolução negativa', verified:false,
      text:'Certifico que o Aviso de Recebimento (AR) juntado sob o ID [ID DO AR] foi devolvido com a anotação [MOTIVO INFORMADO NO DOCUMENTO], conforme consulta aos autos.',
      note:'O motivo deve corresponder ao AR. A providência posterior depende do fluxo da serventia.' },
    { id:'mandado-juntado', group:'Comunicação processual', title:'Mandado devolvido e juntado', verified:false,
      text:'Certifico que foi juntado aos autos o mandado sob o ID [ID DO MANDADO], constando no documento o resultado [RESULTADO DESCRITO PELO OFICIAL].',
      note:'Confira exatamente a certidão do oficial de justiça, sem presumir a eficácia do ato.' },
    { id:'decurso-prazo', group:'Prazos', title:'Decurso de prazo sem manifestação localizada', verified:false,
      text:'Certifico que, após conferência dos registros de intimação e das movimentações processuais, decorreu o prazo referente a [ATO OU DETERMINAÇÃO], encerrado em [DATA], sem manifestação localizada até a presente conferência.',
      note:'Exige checagem do marco, das partes, das suspensões, da ciência e de eventuais petições. O RAF-PRAZO não certifica o decurso.' },
    { id:'manifestacao-juntada', group:'Prazos', title:'Manifestação juntada aos autos', verified:false,
      text:'Certifico que foi juntada aos autos manifestação de [PARTE], sob o ID [ID DA PETIÇÃO], em [DATA], referente a [ASSUNTO].',
      note:'Não declare tempestividade sem conferir integralmente o prazo aplicável.' },
    { id:'conclusao-efetivada', group:'Encaminhamentos', title:'Remessa à conclusão efetuada', verified:false,
      text:'Certifico que, após as conferências pertinentes, encaminhei os presentes autos à conclusão para apreciação de [ASSUNTO OU PEDIDO].',
      note:'Utilize somente quando o encaminhamento à conclusão já tiver sido executado e registrado.' }
  ];
  const $ = id => document.getElementById(id);
  const make = (tag, cls, value) => {
    const element = document.createElement(tag);
    if (cls) element.className = cls;
    if (value !== undefined) element.textContent = value;
    return element;
  };
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function init() {
    const app = $('app'), main = $('mainContent'), nav = $('navCertidoes');
    if (!app || !main || !nav) return;
    const section = make('section', 'raf-cert-view');
    section.id = 'rafCertView';
    section.hidden = true;
    section.setAttribute('aria-labelledby','rafCertHeading');
    section.innerHTML = [
      '<div class="raf-cert-hero"><div><span class="raf-cert-eyebrow">RAF-PRAZO · APOIO À SERVENTIA</span>',
      '<h1 id="rafCertHeading">Certidões do Dia a Dia</h1>',
      '<p id="rafCertIntro">Modelos pesquisáveis para adaptação e cópia, sem acesso ao PJe e sem emissão automática de certidões.</p></div>',
      '<button id="rafCertReturn" class="raf-cert-return" type="button">← Calculadora</button></div>',
      '<p class="raf-cert-warning" id="rafCertWarning"><strong>Uso responsável:</strong> confirme cada fato nos autos e observe os modelos e orientações da unidade antes de certificar. ',
      'Os cinco modelos fornecidos estão marcados com *; os demais são sugestões complementares que exigem revisão. Confira os autos antes de utilizar.</p>',
      '<div class="raf-cert-layout"><div class="raf-cert-browser">',
      '<label class="raf-cert-search-label" for="rafCertSearch">Buscar certidão</label>',
      '<input id="rafCertSearch" class="raf-cert-search" type="search" placeholder="Pesquisar modelos" autocomplete="off">',
      '<div id="rafCertCategories" class="raf-cert-categories" aria-label="Filtrar modelos por assunto"></div>',
      '<p id="rafCertCount" class="raf-cert-count" aria-live="polite"></p>',
      '<div id="rafCertList" class="raf-cert-list" aria-label="Modelos de certidão"></div></div>',
      '<div class="raf-cert-editor-panel">',
      '<div class="raf-cert-editor-heading"><div><span id="rafCertType" class="raf-cert-type"></span>',
      '<h2 id="rafCertTitle"></h2></div></div>',
      '<label class="raf-cert-search-label" for="rafCertEditor">Texto da certidão — editável</label>',
      '<textarea id="rafCertEditor" class="raf-cert-editor" rows="9" spellcheck="true" aria-describedby="rafCertNotice"></textarea>',
      '<p id="rafCertNotice" class="raf-cert-note"></p>',
      '<div class="raf-cert-actions"><button class="btn primary" type="button" id="rafCertCopy">⧉ Copiar texto revisado</button>',
      '<button class="btn" type="button" id="rafCertReset">Restaurar modelo</button></div>',
      '<p class="raf-cert-privacy">Dados digitados não são salvos nem transmitidos pelo módulo. ',
      'A cópia vai para a área de transferência do dispositivo; evite usar dados pessoais em computadores compartilhados.</p>',
      '<p id="rafCertFeedback" class="raf-cert-feedback" aria-live="polite" role="status"></p>',
      '</div></div>'
    ].join('');
    main.append(section);
    let category = 'Todas', query = '', selected = models[0];
    const categories = ['Todas', ...new Set(models.map(item => item.group))];
    const visible = () => models.filter(item =>
      (category === 'Todas' || item.group === category) &&
      (!query || norm(item.title + ' ' + item.group + ' ' + item.text + ' ' + item.note).includes(query))
    );
    function select(item) {
      selected = item;
      $('rafCertEditor').value = item.text;
      $('rafCertType').textContent = item.verified ? 'Modelo fornecido' : 'Sugestão · revisar';
      $('rafCertType').dataset.verified = String(item.verified);
      $('rafCertTitle').textContent = item.title;
      $('rafCertNotice').textContent = item.note;
      $('rafCertFeedback').textContent = '';
      renderList();
    }
    function renderCategories() {
      const root = $('rafCertCategories');
      root.replaceChildren();
      for (const cat of categories) {
        const button = make('button','raf-cert-category',cat);
        button.type = 'button';
        button.setAttribute('aria-pressed',String(category === cat));
        button.addEventListener('click', () => {
          category = cat;
          query = '';
          $('rafCertSearch').value = '';
          renderCategories();
          const first = visible()[0];
          if (first) select(first);
          else renderList();
        });
        root.append(button);
      }
    }
    function renderList() {
      const root = $('rafCertList'), filtered = visible();
      root.replaceChildren();
      $('rafCertCount').textContent = filtered.length + ' modelo(s) encontrado(s) · ' + models.length + ' cadastrado(s)';
      if (!filtered.length) {
        root.append(make('p','raf-cert-empty','Nenhum modelo encontrado para a busca ou categoria selecionada.'));
        return;
      }
      for (const item of filtered) {
        const button = make('button','raf-cert-item');
        button.type = 'button';
        button.setAttribute('aria-pressed', String(selected.id === item.id));
        button.append(make('strong','',item.title),
          make('span','raf-cert-item-meta',item.group + ' · ' + (item.verified ? 'Modelo fornecido' : 'Sugestão a conferir')));
        button.addEventListener('click', () => select(item));
        root.append(button);
      }
    }
    function show(on, updateUrl = true, preferredCategory = 'Todas') {
      if (on) window.dispatchEvent(new CustomEvent('raf-prazo:section',{detail:{name:'certidoes'}}));
      app.classList.toggle('raf-cert-active', on);
      section.hidden = !on;
      nav.classList.toggle('active', on);
      if (on) {
        category = categories.includes(preferredCategory) ? preferredCategory : 'Todas';
        query = '';
        $('rafCertSearch').value = '';
        renderCategories();
        select(visible()[0] || models[0]);
        $('navCalc')?.classList.remove('active');
        if (window.innerWidth <= 1060) {
          app.classList.remove('menu-open');
          $('menuToggle')?.setAttribute('aria-expanded','false');
        }
        window.scrollTo(0,0);
      } else if (!app.classList.contains('raf-bv-active')) {
        $('navCalc')?.classList.add('active');
      }
      if (updateUrl) history.replaceState(null,'',on ? '#certidoes' : location.pathname + location.search);
    }
    async function copyEdited() {
      const text = $('rafCertEditor').value.trim();
      if (!text) { $('rafCertFeedback').textContent = 'O texto está vazio.'; return; }
      if (/\[[^\]]+\]/.test(text) && !window.confirm('Há campos entre colchetes que ainda não foram preenchidos. Deseja copiar mesmo assim?')) return;
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); copied = true; }
      } catch (_) {}
      if (!copied) {
        const temp = make('textarea');
        temp.value = text;
        temp.style.cssText = 'position:fixed;left:-9999px;opacity:0';
        document.body.append(temp);
        temp.focus(); temp.select();
        try { copied = document.execCommand('copy'); } catch (_) {}
        temp.remove();
      }
      $('rafCertFeedback').textContent = copied
        ? 'Texto copiado. Confira a situação dos autos e a adequação do modelo antes de utilizar.'
        : 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.';
    }
    nav.addEventListener('click', () => show(true));
    $('rafCertReturn').addEventListener('click', () => show(false));
    $('rafCertSearch').addEventListener('input', e => { query = norm(e.target.value.trim()); renderList(); });
    $('rafCertReset').addEventListener('click', () => { if (selected) select(selected); });
    $('rafCertCopy').addEventListener('click', copyEdited);
    for (const id of ['navCalc','navCalendar'])
      $(id)?.addEventListener('click', () => { if (!section.hidden) show(false); }, true);
    window.addEventListener('raf-prazo:section', e => {
      if (e.detail?.name !== 'certidoes' && !section.hidden) show(false,false);
    });
    function syncLocation() {
      if (location.hash === '#pauta') {
        // Compatibilidade com links antigos: Pauta agora é um filtro de Certidões.
        show(true,true,'Pauta');
      } else if (location.hash === '#certidoes') {
        if (section.hidden) show(true,false);
      } else if (!section.hidden) {
        show(false,false);
      }
    }
    window.addEventListener('hashchange', syncLocation);
    syncLocation();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();