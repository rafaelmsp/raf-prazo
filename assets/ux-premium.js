/* RAF-PRAZO · UX Premium: shell visual sem alterar o motor jurídico ou dados do processo. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const glyphs = Object.freeze({
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    calculator:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8v3H8zM8 13h2m4 0h2M8 17h2m4 0h2"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zm0 0A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    messages:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5A8.5 8.5 0 1 1 21 11.5z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
    history:'<path d="M3 12a9 9 0 1 0 2.4-6.1L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="m19.4 15 .8 1.5-1.8 2.1-1.7-.5a8 8 0 0 1-1.5.9l-.4 1.8h-2.8l-.4-1.8a8 8 0 0 1-1.5-.9l-1.7.5-1.8-2.1.8-1.5a8 8 0 0 1 0-1.9l-.8-1.5 1.8-2.1 1.7.5a8 8 0 0 1 1.5-.9l.4-1.8h2.8l.4 1.8a8 8 0 0 1 1.5.9l1.7-.5 1.8 2.1-.8 1.5a8 8 0 0 1 0 1.9z" transform="translate(-1 -2)"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4m.1 4h.01"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
    scale:'<path d="M12 3v18M6 7l6-3 6 3M3 21h18M6 7 3 13h6L6 7zm12 0-3 6h6l-3-6z"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'
  });
  const svg = (name, cls='') => {
    const el = document.createElementNS('http://www.w3.org/2000/svg','svg');
    el.setAttribute('viewBox','0 0 24 24');
    el.setAttribute('fill','none');
    el.setAttribute('stroke','currentColor');
    el.setAttribute('stroke-width','1.9');
    el.setAttribute('stroke-linecap','round');
    el.setAttribute('stroke-linejoin','round');
    el.setAttribute('aria-hidden','true');
    if (cls) el.setAttribute('class',cls);
    el.innerHTML = glyphs[name] || glyphs.info;
    return el;
  };
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function init() {
    const app = $('app'), main = $('mainContent'), sidebar = $('mainSidebar'), calc = $('navCalc');
    if (!app || !main || !sidebar || !calc || $('rafUxHomeNav')) return;
    app.classList.add('raf-ux-premium');
    const brand = document.querySelector('.header .logo');
    if (brand) brand.replaceChildren(svg('scale'));
    const navHome = document.createElement('button');
    navHome.type = 'button';
    navHome.id = 'rafUxHomeNav';
    navHome.className = 'nav-link';
    navHome.title = 'Visão geral';
    navHome.setAttribute('aria-label','Visão geral');
    navHome.innerHTML = '<span class="nav-icon"></span><span class="nav-text">Visão geral</span>';
    calc.before(navHome);
    const navIcons = [
      [navHome,'home'],[calc,'calculator'],[$('navCalendar'),'calendar'],
      [$('rafLibraryNavLink'),'book'],[$('navBalcaoVirtual'),'messages'],
      [$('navCertidoes'),'file'],[$('navManual'),'book'],[$('navHistory'),'history'],
      [$('navSettings'),'settings'],[$('navTutorial'),'help'],
      [$('navAbout'),'info'],[$('navTerms'),'shield']
    ];
    for (const [item,name] of navIcons) {
      const wrapper = item?.querySelector('.nav-icon');
      if (wrapper) wrapper.replaceChildren(svg(name));
    }
    const headerActions = document.querySelector('.header-actions');
    const searchButton = document.createElement('button');
    searchButton.type = 'button';
    searchButton.id = 'rafUxSearchOpen';
    searchButton.className = 'raf-ux-search-trigger';
    searchButton.setAttribute('aria-label','Pesquisar ferramentas (Ctrl+K)');
    searchButton.append(svg('search'));
    const searchLabel = document.createElement('span');
    searchLabel.textContent = 'Buscar ferramentas...';
    searchButton.append(searchLabel);
    const hint = document.createElement('kbd');hint.textContent = 'Ctrl K';searchButton.append(hint);
    headerActions?.prepend(searchButton);
    const home = document.createElement('section');
    home.id = 'rafUxHome';
    home.className = 'raf-ux-home';
    home.hidden = true;
    home.setAttribute('aria-label','Visão geral do RAF-PRAZO');
    home.innerHTML = [
      '<div class="raf-ux-hero"><span class="raf-ux-overline">RAF-PRAZO · FERRAMENTAS JURÍDICAS</span>',
      '<h1>Seu espaço de trabalho jurídico, mais simples.</h1>',
      '<p>Calcule prazos, consulte modelos de certidões e encontre as ferramentas de apoio à rotina em um único lugar.</p>',
      '<div class="raf-ux-hero-stats"><span><strong id="rafUxTotalModels">27</strong> modelos de certidões</span>',
      '<span><strong id="rafUxPautaModels">13</strong> modelos em Pauta</span></div></div>',
      '<div class="raf-ux-section-head"><div><h2>Ferramentas de trabalho</h2><p>Selecione a atividade que deseja realizar.</p></div></div>',
      '<div class="raf-ux-home-grid" id="rafUxHomeGrid"></div>',
      '<div class="raf-ux-activity-grid">',
      '<section class="raf-ux-activity-card" aria-labelledby="rafUxFavoritesTitle">',
      '<div class="raf-ux-activity-head"><div><h2 id="rafUxFavoritesTitle">★ Certidões favoritas</h2>',
      '<p>Seus modelos preferidos, sem armazenar textos editados.</p></div>',
      '<button type="button" id="rafUxAllFavorites">Ver favoritos</button></div>',
      '<div id="rafUxFavoritesList" class="raf-ux-shortcut-list"></div></section>',
      '<section class="raf-ux-activity-card" aria-labelledby="rafUxRecentsTitle">',
      '<div class="raf-ux-activity-head"><div><h2 id="rafUxRecentsTitle">↶ Usadas nesta sessão</h2>',
      '<p>Modelos que você copiou recentemente.</p></div>',
      '<button type="button" id="rafUxAllRecent">Ver recentes</button></div>',
      '<div id="rafUxRecentsList" class="raf-ux-shortcut-list"></div></section></div>',
      '<div class="raf-ux-guidance" id="rafUxGuidance"><div id="rafUxShield"></div><div>',
      '<strong>Ferramenta independente de apoio</strong>',
      '<p>O RAF-PRAZO não é um sistema oficial do Judiciário. Prazos, fontes e minutas exigem conferência conforme o caso concreto. Nenhum texto digitado no editor de certidões é enviado pelo módulo.</p>',
      '</div></div>'
    ].join('');
    main.append(home);
    const destinations = [
      {label:'Calculadora de prazos',detail:'Informe o marco e confira o vencimento estimado.',icon:'calculator',action:'calc',keys:'contagem prazo dias úteis jec cpc'},
      {label:'Certidões do Dia a Dia',detail:'Modelos organizados por categoria, incluindo Pauta.',icon:'file',action:'certidoes',keys:'certidões modelos favoritos cartório pauta'},
      {label:'Manual do 2º JEC',detail:'Consultar e baixar seu PDF local, sem envio pela internet.',icon:'book',action:'manual',keys:'manual operacional pdf estagiário serventia 2jec restrito download baixar'},
      {label:'Balcão Virtual',detail:'Mensagens de atendimento para conferir e copiar.',icon:'messages',action:'balcao',keys:'atendimento frases teams'},
      {label:'Biblioteca de prazos',detail:'Consulte atos e fundamentos antes de calcular.',icon:'book',action:'library',keys:'atos fundamentos jec cpc'},
      {label:'Calendário judicial',detail:'Visualize dias contados e excluídos do cálculo.',icon:'calendar',action:'calendar',keys:'feriados datas recesso'},
      {label:'Fontes e atualizações',detail:'Confira origens, abrangência e avisos pendentes.',icon:'shield',action:'sources',keys:'tjrj informacoes fontes pendentes'}
    ];
    const certidoes = window.RafPrazoCertidoes;
    function catalog() { return certidoes?.models?.() || []; }
    function openModel(id) {
      certidoes?.open({id});
    }
    function openModelFilter(mode) {
      certidoes?.open({mode});
    }
    function renderCollections() {
      if (!certidoes) return;
      const summary = certidoes.summary();
      const models = catalog(), byId = new Map(models.map(model=>[model.id,model]));
      $('rafUxTotalModels').textContent = String(summary.total);
      $('rafUxPautaModels').textContent = String(models.filter(item=>item.group==='Pauta').length);
      function renderInto(rootId, ids, empty) {
        const root = $(rootId);
        root.replaceChildren();
        const found = ids.map(id=>byId.get(id)).filter(Boolean).slice(0,4);
        if (!found.length) {
          const message = document.createElement('p');
          message.className='raf-ux-activity-empty';
          message.textContent=empty;
          root.append(message);
          return;
        }
        for (const model of found) {
          const btn=document.createElement('button');
          btn.type='button';btn.className='raf-ux-model-shortcut';
          const label=document.createElement('span');
          label.className='raf-ux-shortcut-title';
          label.textContent=model.title;
          const group=document.createElement('small');
          group.textContent=model.group;
          const arrow=svg('arrow');
          btn.append(label,group,arrow);
          btn.addEventListener('click',()=>openModel(model.id));
          root.append(btn);
        }
      }
      renderInto('rafUxFavoritesList',summary.favorites,
        'Nenhum favorito ainda. Abra Certidões e marque ☆ nos modelos que usa com frequência.');
      renderInto('rafUxRecentsList',summary.recent,
        'Sua lista aparecerá aqui quando você copiar uma certidão nesta sessão.');
    }
    function action(key) {
      if (key === 'library') { window.location.assign('prazos/'); return; }
      const target = {
        calc:'navCalc',certidoes:'navCertidoes',balcao:'navBalcaoVirtual',manual:'navManual',
        calendar:'navCalendar',sources:'rafNewsOpen'
      }[key];
      const item = target && $(target);
      if (item) item.click();
    }
    function closeHome(updateUrl = false) {
      if (home.hidden) return;
      home.hidden = true;
      app.classList.remove('raf-ux-home-active');
      navHome.classList.remove('active');
      navHome.removeAttribute('aria-current');
      if (updateUrl && location.hash === '#inicio')
        history.replaceState(history.state,'',location.pathname+location.search);
    }
    function showHome(updateUrl=true) {
      window.dispatchEvent(new CustomEvent('raf-prazo:section',{detail:{name:'home'}}));
      home.hidden = false;
      app.classList.add('raf-ux-home-active');
      sidebar.querySelectorAll('.nav-link.active').forEach(n=>n.classList.remove('active'));
      navHome.classList.add('active');
      navHome.setAttribute('aria-current','page');
      if (window.innerWidth <= 1060) {
        app.classList.remove('menu-open');
        $('menuToggle')?.setAttribute('aria-expanded','false');
      }
      if (updateUrl) history.replaceState(history.state,'','#inicio');
      window.scrollTo(0,0);
    }
    navHome.addEventListener('click',()=>showHome());
    for (const d of destinations) {
      const button=document.createElement('button');
      button.type='button';button.className='raf-ux-tile';button.dataset.uxAction=d.action;
      const box=document.createElement('span');box.className='raf-ux-tile-icon';box.append(svg(d.icon));
      const title=document.createElement('strong');title.textContent=d.label;
      const subtitle=document.createElement('small');subtitle.textContent=d.detail;
      button.append(box,title,subtitle,svg('arrow','raf-ux-tile-arrow'));
      button.addEventListener('click',()=>action(d.action));
      $('rafUxHomeGrid').append(button);
    }
    $('rafUxShield')?.append(svg('shield'));
    $('rafUxAllFavorites').addEventListener('click',()=>openModelFilter('favorites'));
    $('rafUxAllRecent').addEventListener('click',()=>openModelFilter('recent'));
    window.addEventListener('raf-prazo:certidoes-change',renderCollections);
    renderCollections();
    const dialog=document.createElement('dialog');
    dialog.id='rafUxSearchDialog';dialog.className='raf-ux-modal';
    dialog.setAttribute('aria-label','Pesquisa de ferramentas');
    dialog.innerHTML = '<div class="raf-ux-modal-header"><h2>Encontrar ferramenta</h2><button type="button" id="rafUxSearchClose" aria-label="Fechar pesquisa">×</button></div>'+
      '<label for="rafUxSearchInput" class="raf-cert-search-label">Busque por nome ou rotina</label>'+
      '<input type="search" id="rafUxSearchInput" placeholder="Ex.: certidão, pauta, prazo, balcão" autocomplete="off">'+
      '<div class="raf-ux-search-list" id="rafUxSearchResults" role="list"></div>'+
      '<p class="raf-ux-shortcut-note">Pesquise e pressione Enter para abrir o primeiro resultado. Esc fecha a pesquisa.</p>';
    document.body.append(dialog);
    const field=$('rafUxSearchInput'),result=$('rafUxSearchResults');
    function renderSearch() {
      const q=normalize(field.value.trim());
      const entries = catalog().map(model=>({
        label:model.title,
        detail:'Certidões · ' + model.group,
        keys:model.group + ' ' + model.id + (model.id==='pauta-diligencia-negativa-oja' ? ' AR negativo OJA diligência negativa' : ''),
        icon:'file',
        modelId:model.id
      }));
      const found=[...destinations,...entries].filter(d=>normalize(d.label+' '+d.detail+' '+d.keys).includes(q));
      result.replaceChildren();
      if(!found.length){const p=document.createElement('p');p.className='raf-ux-shortcut-note';p.textContent='Nenhuma ferramenta ou certidão encontrada.';result.append(p);return;}
      for(const item of found.slice(0,35)){
        const b=document.createElement('button');b.type='button';b.append(svg(item.icon));
        const caption=document.createElement('span');
        const label=document.createElement('strong');label.textContent=item.label;
        const descr=document.createElement('small');descr.textContent=item.detail;
        caption.append(label,descr);b.append(caption);
        b.addEventListener('click',()=>{
          dialog.close();
          if(item.modelId) openModel(item.modelId);
          else action(item.action);
        });
        result.append(b);
      }
    }
    function openSearch(){if(dialog.open)return;field.value='';renderSearch();dialog.showModal();field.focus();}
    searchButton.addEventListener('click',openSearch);
    $('rafUxSearchClose').addEventListener('click',()=>dialog.close());
    field.addEventListener('input',renderSearch);
    field.addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      const first=result.querySelector('button');
      if(first){e.preventDefault();first.click();}
    });
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();if(dialog.open)dialog.close();else openSearch();
      }
    });
    for(const id of ['navCalc','navCalendar','navHistory','navSettings','navTutorial','navAbout','navTerms','sourcesTop','rafNewsOpen']){
      $(id)?.addEventListener('click',()=>closeHome(true));
    }
    window.addEventListener('raf-prazo:section',e=>{
      if(e.detail?.name!=='home')closeHome(false);
    });
    function syncHash(){
      if(location.hash==='#inicio')showHome(false);
      else if(!home.hidden)closeHome(false);
    }
    // O menu da calculadora usa a classe "menu-open". A UX Premium mantém o
    // mesmo estado no grid e nas legendas, tanto no desktop como no celular.
    const menuToggle = $('menuToggle');
    function syncMenuButton() {
      if (!menuToggle) return;
      const expanded = app.classList.contains('menu-open');
      const mobile = window.innerWidth <= 1060;
      menuToggle.setAttribute('aria-expanded',String(expanded));
      menuToggle.setAttribute('aria-label',expanded
        ? (mobile ? 'Fechar menu de navegação' : 'Recolher menu de navegação')
        : (mobile ? 'Abrir menu de navegação' : 'Expandir menu de navegação'));
      menuToggle.title = expanded ? (mobile ? 'Fechar menu' : 'Recolher menu') : (mobile ? 'Abrir menu' : 'Expandir menu');
      menuToggle.textContent = expanded ? '✕' : '☰';
    }
    if (menuToggle) {
      const observer = new MutationObserver(syncMenuButton);
      observer.observe(app,{attributes:true,attributeFilter:['class']});
      // Em telas largas, legendas visíveis por padrão. Em telas médias,
      // o menu inicia como trilho compacto e abre pelo botão existente.
      if (window.innerWidth >= 1450 && !app.classList.contains('menu-open'))
        menuToggle.click();
      syncMenuButton();
      const desktop = window.matchMedia('(min-width: 1061px)');
      desktop.addEventListener?.('change', e => {
        if (!e.matches && app.classList.contains('menu-open')) menuToggle.click();
        else if (e.matches && window.innerWidth >= 1450 && !app.classList.contains('menu-open'))
          menuToggle.click();
        syncMenuButton();
      });
    }
    window.addEventListener('hashchange',syncHash);
    syncHash();
  }
  if (document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();