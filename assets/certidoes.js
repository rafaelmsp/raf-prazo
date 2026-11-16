/* RAF-PRAZO | Certidões do Dia a Dia — biblioteca auxiliar e não oficial.
   Nenhum dado de processo digitado neste editor é salvo ou enviado. */
(() => {
  'use strict';
  const models = [
    { id:'arquivamento-indevido', group:'Arquivamento', section:'certidoes', title:'* Autos arquivados indevidamente', verified:true,
      text:'Certifico que os autos foram arquivados indevidamente',
      note:'Confira o histórico do processo e os registros do arquivamento antes de afirmar que ocorreu indevidamente. Não presuma a causa do erro.' },
    { id:'aud-conciliacao', group:'Audiências', section:'pauta', title:'* Aguardando audiência de conciliação', verified:true,
      text:'Certifico que os presentes autos encontram-se aguardando audiência de conciliação designada.',
      note:'Confirme que a audiência está efetivamente designada e permanece na pauta.' },
    { id:'acordo-pauta', group:'Acordos', section:'pauta', title:'* Acordo juntado — retirada de pauta e remessa ao Juiz Titular', verified:true,
      text:'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao MM. Juiz Titular.',
      note:'Confirme a juntada do acordo, a retirada da pauta e a efetiva remessa ao MM. Juiz Titular conforme o fluxo da unidade.' },
    { id:'acordo-pauta-juiz-leigo', group:'Acordos', section:'pauta', title:'* Acordo juntado — retirada de pauta e remessa ao Juiz Leigo', verified:true,
      text:'Certifico que, considerando o acordo juntado, retiro o feito da pauta de audiências e remeto ao Juiz Leigo responsável.',
      note:'Confirme a juntada do acordo, a retirada da pauta e a efetiva remessa ao Juiz Leigo responsável conforme o fluxo da unidade.' }
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
    const app = $('app'), main = $('mainContent'), nav = $('navCertidoes'), navPauta = $('navPauta');
    if (!app || !main || !nav || !navPauta) return;
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
      'Este catálogo reúne quatro redações fornecidas para a rotina da serventia. Confirme a situação dos autos e a adequação do texto antes de usar.</p>',
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
    let category = 'Todas', query = '', selected = models[0], mode = null;
    const forMode = () => models.filter(item => item.section === mode);
    const visible = () => forMode().filter(item =>
      (category === 'Todas' || item.group === category) &&
      (!query || norm(item.title + ' ' + item.group + ' ' + item.text).includes(query))
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
      const categories = ['Todas', ...new Set(forMode().map(item => item.group))];
      for (const cat of categories) {
        const button = make('button','raf-cert-category',cat);
        button.type = 'button';
        button.setAttribute('aria-pressed',String(category === cat));
        button.addEventListener('click', () => {
          category = cat;
          renderCategories();
          renderList();
        });
        root.append(button);
      }
    }
    function renderList() {
      const root = $('rafCertList'), filtered = visible();
      root.replaceChildren();
      $('rafCertCount').textContent = filtered.length + ' modelo(s) encontrado(s) · ' + forMode().length + ' cadastrado(s)';
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
    function show(nextMode, updateUrl = true) {
      const on = nextMode === 'certidoes' || nextMode === 'pauta';
      if (on) window.dispatchEvent(new CustomEvent('raf-prazo:section',{detail:{name:'certidoes'}}));
      app.classList.toggle('raf-cert-active', on);
      section.hidden = !on;
      nav.classList.toggle('active', on && nextMode === 'certidoes');
      navPauta.classList.toggle('active', on && nextMode === 'pauta');
      if (on) {
        const changed = mode !== nextMode;
        mode = nextMode;
        if (changed) {
          category = 'Todas';
          query = '';
          $('rafCertSearch').value = '';
          $('rafCertHeading').textContent = mode === 'pauta' ? 'Pauta — Certidões' : 'Certidões do Dia a Dia';
          $('rafCertIntro').textContent = mode === 'pauta'
            ? 'Certidões para conferência e movimentação da pauta de audiências.'
            : 'Certidões da rotina cartorária, organizadas por assunto.';
          $('rafCertSearch').placeholder = mode === 'pauta'
            ? 'Ex.: conciliação, acordo, Juiz Leigo'
            : 'Ex.: arquivamento';
          renderCategories();
          select(forMode()[0]);
        } else {
          renderList();
        }
        $('navCalc')?.classList.remove('active');
        if (window.innerWidth <= 1060) {
          app.classList.remove('menu-open');
          $('menuToggle')?.setAttribute('aria-expanded','false');
        }
        window.scrollTo(0,0);
      } else {
        mode = null;
        if (!app.classList.contains('raf-bv-active')) $('navCalc')?.classList.add('active');
      }
      if (updateUrl) history.replaceState(null,'',on ? '#' + nextMode : location.pathname + location.search);
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
    nav.addEventListener('click', () => show('certidoes'));
    navPauta.addEventListener('click', () => show('pauta'));
    $('rafCertReturn').addEventListener('click', () => show(null));
    $('rafCertSearch').addEventListener('input', e => { query = norm(e.target.value.trim()); renderList(); });
    $('rafCertReset').addEventListener('click', () => { if (selected) select(selected); });
    $('rafCertCopy').addEventListener('click', copyEdited);
    for (const id of ['navCalc','navCalendar'])
      $(id)?.addEventListener('click', () => { if (!section.hidden) show(null); }, true);
    window.addEventListener('raf-prazo:section', e => {
      if (e.detail?.name !== 'certidoes' && !section.hidden) show(null,false);
    });
    window.addEventListener('hashchange', () => {
      const next = location.hash === '#pauta' ? 'pauta' : location.hash === '#certidoes' ? 'certidoes' : null;
      if (next !== mode) show(next, false);
    });
    const initial = location.hash === '#pauta' ? 'pauta' : location.hash === '#certidoes' ? 'certidoes' : null;
    if (initial) show(initial,false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();