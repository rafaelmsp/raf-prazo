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
    { id:'pauta-oja-negativa-modelo', group:'Pauta', title:'* Diligência negativa do OJA — index editável', verified:true,
      text:'Certifico que o feito foi retirado da pauta de audiências em face de devolução de Diligência negativa de index XXXXX. Fica a parte autora intimada a se manifestar sobre certidão do OJA.',
      note:'Modelo fornecido. Substitua XXXXX pelo index correto; confira a certidão do OJA, a retirada efetiva da pauta e a intimação da parte autora. A diligência do OJA não é o AR postal.' },
    { id:'pauta-ar-assinado-terceiro', group:'Pauta', title:'* AR assinado por terceiros', verified:true,
      text:'Certifico que o AR de id.XXXXX foi assinado por terceiros.',
      note:'Modelo fornecido. Substitua XXXXX pelo ID do AR e confira a assinatura no documento. A assinatura de terceiro não determina, por si só, a validade ou invalidade da citação.' },
    { id:'pauta-pedido-desentranhamento', group:'Pauta', title:'* Petição com pedido de desentranhamento', verified:true,
      text:'Certifico que, na petição de index XXXXXXX consta pedido de desentranhamento da petição de index XXXXXXX',
      note:'Modelo fornecido. Preencha os dois indexes conforme as peças dos autos. Trata-se de pedido, não de desentranhamento já cumprido.' },
    { id:'pauta-sem-tempo-despacho', group:'Pauta', title:'* Sem tempo hábil para cumprimento do despacho', verified:true,
      text:'Certifico que, não há tempo hábil para cumprimento do despacho de id.XXXXX, tendo em vista que a audiência está designada para o dia XX/XX/XXXX',
      note:'Modelo fornecido. Substitua o ID e a data; confira a pauta, os prazos e o despacho antes de afirmar impossibilidade de cumprimento.' },
    { id:'pauta-ar-negativo-retirada', group:'Pauta', title:'* AR negativo — retirada da pauta', verified:true,
      text:'Certifico que o feito foi retirado da pauta de audiências em face do AR negativo de index XXXX. Fica a parte autora intimada a se manifestar sobre o AR negativo.',
      note:'Modelo fornecido. Substitua XXXX pelo index do AR; confira o resultado negativo, a retirada da pauta e a regularidade da intimação.' },
    { id:'pauta-siscor-erro-ar', group:'Pauta', title:'* SISCOR — erro na expedição do AR', verified:true,
      text:'Certifico que compulsando o sistema SISCOR, verifiquei que houve erro na expedição da citação por AR. Sendo assim, remeto o processo para conclusão.',
      note:'Modelo fornecido. Confira o erro no SISCOR e utilize somente após a efetiva remessa à conclusão, de acordo com o fluxo da unidade.' },
    { id:'pauta-desentranhamento-cumprido', group:'Pauta', title:'* Determinação de desentranhamento cumprida', verified:true,
      text:'Certifico que foi cumprida a determinação de desentranhamento, conforme despacho de index',
      note:'Modelo fornecido com a referência incompleta ao final. Preencha o index do despacho antes da cópia; confira se o desentranhamento foi efetivamente cumprido.' },
    { id:'pauta-mandado-erro-material', group:'Pauta', title:'* Erro material na digitação do mandado', verified:true,
      text:'Certifico que houve erro material na digitação do mandado de id.XXXXX. Dessa forma, não haverá tempo hábil para a devida citação da parte ré.',
      note:'Modelo fornecido. Substitua XXXXX pelo ID; confirme o erro material, a data da audiência e a inexistência de tempo hábil para a citação.' },
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
  // Privacidade: favoritos e recentes persistem apenas IDs de modelos estáticos.
  // Nenhum texto digitado, index processual editado ou dado de processo é armazenado.
  const FAVORITES_KEY = 'raf-prazo:certidoes:favorites:v1';
  const RECENTS_KEY = 'raf-prazo:certidoes:recent:v1';
  const knownIds = new Set(models.map(item => item.id));
  function getStorage(kind) {
    try { return kind === 'local' ? window.localStorage : window.sessionStorage; }
    catch (_) { return null; }
  }
  function readIds(kind, key) {
    try {
      const raw = getStorage(kind)?.getItem(key);
      if (!raw || raw.length > 2048) return [];
      const value = JSON.parse(raw);
      return Array.isArray(value)
        ? [...new Set(value.filter(id => typeof id === 'string' && knownIds.has(id)))].slice(0, 18)
        : [];
    } catch (_) { return []; }
  }
  function writeIds(kind, key, ids) {
    try {
      const storage = getStorage(kind);
      if (!storage) return false;
      storage.setItem(key, JSON.stringify(ids));
      return true;
    } catch (_) { return false; }
  }
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
      'Os treze modelos fornecidos estão marcados com *; os demais são sugestões complementares que exigem revisão. Confira os autos antes de utilizar.</p>',
      '<div class="raf-cert-layout"><div class="raf-cert-browser">',
      '<label class="raf-cert-search-label" for="rafCertSearch">Buscar certidão</label>',
      '<input id="rafCertSearch" class="raf-cert-search" type="search" placeholder="Pesquisar modelos" autocomplete="off">',
      '<div class="raf-cert-smart-toolbar" role="group" aria-label="Acesso aos modelos">',
      '<button id="rafCertTabAll" class="raf-cert-smart-tab" type="button">Todos <span id="rafCertAllNumber">26</span></button>',
      '<button id="rafCertTabFavorites" class="raf-cert-smart-tab" type="button">☆ Favoritos <span id="rafCertFavoriteNumber">0</span></button>',
      '<button id="rafCertTabRecent" class="raf-cert-smart-tab" type="button">↶ Recentes <span id="rafCertRecentNumber">0</span></button>',
      '</div>',
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
      '<button class="btn" type="button" id="rafCertReset">Restaurar modelo</button>',
      '<button class="btn raf-cert-favorite-action" type="button" id="rafCertFavorite" aria-pressed="false">☆ Favoritar modelo</button></div>',
      '<p class="raf-cert-privacy">Dados digitados não são salvos nem transmitidos pelo módulo. ',
      'Somente os IDs dos modelos favoritos são guardados neste navegador; os IDs recentes duram apenas a sessão. A cópia vai para a área de transferência do dispositivo; evite computadores compartilhados.</p>',
      '<p id="rafCertFeedback" class="raf-cert-feedback" aria-live="polite" role="status"></p>',
      '</div></div>'
    ].join('');
    main.append(section);
    let category = 'Todas', query = '', selected = models[0], mode = 'all';
    let favorites = readIds('local', FAVORITES_KEY);
    let recents = readIds('session', RECENTS_KEY);
    const categories = ['Todas', ...new Set(models.map(item => item.group))];
    const visible = () => models.filter(item =>
      (category === 'Todas' || item.group === category) &&
      (mode === 'all' || (mode === 'favorites' && favorites.includes(item.id)) ||
        (mode === 'recent' && recents.includes(item.id))) &&
      (!query || norm(item.title + ' ' + item.group + ' ' + item.text + ' ' + item.note).includes(query))
    ).sort((a,b) => mode === 'recent' ? recents.indexOf(a.id) - recents.indexOf(b.id) : 0);
    function syncFavoriteButton() {
      const isFavorite = favorites.includes(selected.id);
      const button = $('rafCertFavorite');
      button.setAttribute('aria-pressed', String(isFavorite));
      button.textContent = isFavorite ? '★ Remover favorito' : '☆ Favoritar modelo';
    }
    function renderModes() {
      const buttons = {all:'rafCertTabAll', favorites:'rafCertTabFavorites', recent:'rafCertTabRecent'};
      for (const [key,id] of Object.entries(buttons))
        $(id).setAttribute('aria-pressed',String(key === mode));
      $('rafCertAllNumber').textContent = String(models.length);
      $('rafCertFavoriteNumber').textContent = String(favorites.length);
      $('rafCertRecentNumber').textContent = String(recents.length);
    }
    function fireChange(type) {
      window.dispatchEvent(new CustomEvent('raf-prazo:certidoes-change',{detail:{type}}));
    }
    function toggleFavorite(item) {
      const enabled = favorites.includes(item.id);
      favorites = enabled ? favorites.filter(id => id !== item.id) : [...favorites,item.id];
      const persisted = writeIds('local',FAVORITES_KEY,favorites);
      renderModes();
      syncFavoriteButton();
      renderList();
      $('rafCertFeedback').textContent = persisted
        ? (enabled ? 'Modelo removido dos favoritos.' : 'Modelo adicionado aos favoritos neste navegador.')
        : 'Favorito alterado nesta visita; o navegador não permitiu salvar a preferência.';
      fireChange('favorites');
    }
    function markRecent(item) {
      recents = [item.id,...recents.filter(id=>id!==item.id)].slice(0,8);
      writeIds('session',RECENTS_KEY,recents);
      renderModes();
      renderList();
      fireChange('recent');
    }
    function select(item) {
      selected = item;
      $('rafCertEditor').value = item.text;
      $('rafCertType').textContent = item.verified ? 'Modelo fornecido' : 'Sugestão · revisar';
      $('rafCertType').dataset.verified = String(item.verified);
      $('rafCertTitle').textContent = item.title;
      $('rafCertNotice').textContent = item.note;
      $('rafCertFeedback').textContent = '';
      syncFavoriteButton();
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
        const message = mode === 'favorites'
          ? 'Nenhum favorito nesta categoria. Marque um modelo com ☆ para encontrá-lo aqui.'
          : mode === 'recent'
          ? 'Nenhum modelo copiado nesta sessão.'
          : 'Nenhum modelo encontrado para a busca ou categoria selecionada.';
        root.append(make('p','raf-cert-empty',message));
        return;
      }
      for (const item of filtered) {
        const row = make('div','raf-cert-row');
        const button = make('button','raf-cert-item');
        button.type = 'button';
        button.setAttribute('aria-pressed', String(selected.id === item.id));
        button.append(make('strong','',item.title),
          make('span','raf-cert-item-meta',item.group + ' · ' + (item.verified ? 'Modelo fornecido' : 'Sugestão a conferir')));
        button.addEventListener('click', () => select(item));
        const favorite = make('button','raf-cert-pin',favorites.includes(item.id) ? '★' : '☆');
        favorite.type = 'button';
        favorite.setAttribute('aria-pressed',String(favorites.includes(item.id)));
        favorite.setAttribute('aria-label',(favorites.includes(item.id) ? 'Remover dos favoritos: ' : 'Adicionar aos favoritos: ') + item.title);
        favorite.title = favorites.includes(item.id) ? 'Remover dos favoritos' : 'Favoritar modelo';
        favorite.addEventListener('click',()=>toggleFavorite(item));
        row.append(button,favorite);
        root.append(row);
      }
    }
    function chooseMode(next) {
      mode = next;
      renderModes();
      const first = visible()[0];
      if (first) select(first);
      else renderList();
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
        mode = 'all';
        renderModes();
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
      if ((/\[[^\]]+\]|\bX{3,}\b|\bXX\/XX\/XXXX\b|\bindex\s*$/i.test(text)) && !window.confirm('Há campos, referências ou índices que podem não estar preenchidos. Revise o modelo. Deseja copiar mesmo assim?')) return;
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
      if (copied) markRecent(selected);
      $('rafCertFeedback').textContent = copied
        ? 'Texto copiado. Confira a situação dos autos e a adequação do modelo antes de utilizar.'
        : 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.';
    }
    nav.addEventListener('click', () => show(true));
    $('rafCertReturn').addEventListener('click', () => show(false));
    $('rafCertSearch').addEventListener('input', e => { query = norm(e.target.value.trim()); renderList(); });
    $('rafCertReset').addEventListener('click', () => { if (selected) select(selected); });
    $('rafCertCopy').addEventListener('click', copyEdited);
    $('rafCertFavorite').addEventListener('click',() => toggleFavorite(selected));
    for (const [key,id] of Object.entries({all:'rafCertTabAll',favorites:'rafCertTabFavorites',recent:'rafCertTabRecent'}))
      $(id).addEventListener('click',() => chooseMode(key));
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
    // Interface de navegação sem exposição de conteúdo editado ou dados processuais.
    window.RafPrazoCertidoes = Object.freeze({
      models: () => models.map(item=>({id:item.id,title:item.title,group:item.group,verified:item.verified})),
      summary: () => ({total:models.length,favorites:[...favorites],recent:[...recents]}),
      open: (options={}) => {
        const item = typeof options.id === 'string' ? models.find(m=>m.id===options.id) : null;
        const requestedMode = ['all','favorites','recent'].includes(options.mode) ? options.mode : 'all';
        const requestedCategory = item?.group || (categories.includes(options.category) ? options.category : 'Todas');
        show(true,true,requestedCategory);
        mode = requestedMode;
        renderModes();
        if (item) select(item);
        else {
          const first = visible()[0];
          if (first) select(first);
          else renderList();
        }
        return true;
      }
    });
    window.addEventListener('hashchange', syncLocation);
    syncLocation();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();