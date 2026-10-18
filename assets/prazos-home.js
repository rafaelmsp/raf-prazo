/* Raf-Prazo 2.4: navegação da biblioteca e transferência conservadora de atos. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const INTENT_KEY = 'raf-prazo:library:intent:v1';
  const RETURN_KEY = 'raf-prazo:library:return:v1';
  const event = type => new Event(type, { bubbles: true });
  const getSession = key => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (_) { return null; } };
  const takeSession = key => { const value = getSession(key); try { sessionStorage.removeItem(key); } catch (_) {} return value; };
  const putSession = (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };

  function preserve() {
    const city = $('city');
    putSession(RETURN_KEY, {
      schema: 1,
      start: $('start')?.value || '',
      days: $('days')?.value || '',
      uf: $('uf')?.value || '',
      city: city?.value || '',
      cityName: city?.selectedOptions?.[0]?.textContent || '',
      useLocal: !!$('useLocal')?.checked,
      recess: !!$('recess')?.checked,
      timestamp: Date.now()
    });
  }

  function restore() {
    const old = takeSession(RETURN_KEY);
    if (!old || old.schema !== 1 || !Number.isSafeInteger(old.timestamp) ||
        Date.now() - old.timestamp > 15 * 60 * 1000 ||
        old.timestamp - Date.now() > 60 * 1000) return;
    // UF/municipio ja sao persistidos pelo proprio motor em raf-prazo:place.
    // A biblioteca nao altera essa preferencia.
    const start = $('start');
    if (start && /^\d{4}-\d{2}-\d{2}$/.test(old.start || '')) {
      start.value = old.start;
      start.dispatchEvent(event('change')); // valida inclusive marco de fim de semana
    }
    const days = $('days');
    if (days && (old.days === '' || (/^\d{1,3}$/.test(old.days) &&
        Number(old.days) >= 1 && Number(old.days) <= 365))) {
      days.value = old.days;
      days.dispatchEvent(event('input'));
    }
    for (const key of ['recess', 'useLocal']) {
      const input = $(key);
      if (input && !input.disabled && typeof old[key] === 'boolean') {
        input.checked = old[key];
        input.dispatchEvent(event('change'));
      }
    }
  }

  function consumeIntent() {
    const intent = takeSession(INTENT_KEY);
    if (!intent || intent.schema !== 1 || !Number.isSafeInteger(intent.timestamp) ||
        Date.now() - intent.timestamp > 15 * 60 * 1000 ||
        intent.timestamp - Date.now() > 60 * 1000) return;
    const catalog = window.RafPrazoLegal22?.configurations;
    const profile = catalog?.[intent.regime];
    const item = profile?.presets?.find(x => x.id === intent.preset);
    if (!item || item.kind === 'hours' || item.kind === 'manual' || item.kind === 'procedural') return;
    const fixed = Number.isSafeInteger(item.days) && item.days >= 1 && item.days <= 365;
    const conditional = item.kind === 'conditional' &&
      Number.isSafeInteger(item.referenceDays) && item.referenceDays >= 1 &&
      item.referenceDays <= 365 && intent.conditionalConfirmed === true;
    if (!fixed && !conditional) return;
    const regime = $('rafRegime'), act = $('rafAct');
    if (!regime || !act) return;
    if (regime.value !== intent.regime) {
      regime.value = intent.regime;
      regime.dispatchEvent(event('change'));
    }
    act.value = item.id;
    if (act.value !== item.id) return;
    act.dispatchEvent(event('change'));
    if (conditional) {
      const accept = $('rafConditionalApply');
      if (!accept || accept.disabled || accept.hidden) return;
      accept.click(); // confirma referencia ja aceita explicitamente na biblioteca
    }
  }

  function init() {
    const nav = $('navCalc');
    if (nav && !$('rafLibraryNavLink')) {
      const a = document.createElement('a');
      a.id = 'rafLibraryNavLink';
      a.className = 'nav-link';
      a.href = 'prazos/';
      a.setAttribute('aria-label', 'Prazos judiciais: consultar biblioteca');
      const icon = document.createElement('span');
      icon.className = 'nav-icon';
      icon.textContent = '📖';
      const label = document.createElement('span');
      label.className = 'nav-text';
      label.textContent = 'Prazos judiciais';
      a.append(icon, label);
      nav.after(a);
    }
    const days = $('days');
    if (days && !$('rafLibraryHelpLink')) {
      const help = document.createElement('a');
      help.id = 'rafLibraryHelpLink';
      help.className = 'raf-24-help-link';
      help.href = 'prazos/';
      help.textContent = 'Não sabe o prazo? Consultar biblioteca →';
      (days.closest('.raf-22-date-grid') || days).insertAdjacentElement('afterend', help);
    }
    document.querySelectorAll('a[href="prazos/"]').forEach(link =>
      link.addEventListener('click', preserve));
    restore();
    consumeIntent();
  }
  // O modulo de perfil juridico registra seu listener de DOMContentLoaded ANTES
  // deste arquivo; por isso a aplicacao ocorre quando o catalogo ja esta pronto.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else init();
})();
