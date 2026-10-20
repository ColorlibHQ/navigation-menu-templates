/*!
 * offcanvas-10 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const STORAGE_KEY = 'cl-offcanvas10-rail';

  
  const store = {
    get() {
      try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    },
    set(value) {
      try { window.localStorage.setItem(STORAGE_KEY, value); } catch (e) {  }
    },
  };

  
  const initRail = () => {
    const root = document.querySelector('.cl-offcanvas10');
    if (!root) return;
    const rail = root.querySelector('.cl-offcanvas10__rail');
    const toggle = root.querySelector('[data-rail-toggle]');
    const scrim = root.querySelector('[data-rail-scrim]');
    if (!rail || !toggle) return;
    const phone = window.matchMedia('(max-width: 720px)');

    const isExpanded = () => root.classList.contains('is-expanded');

    const set = (expanded, { save = true, restoreFocus = false } = {}) => {
      root.classList.toggle('is-expanded', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      if (scrim) scrim.hidden = !expanded;
      if (save) store.set(expanded ? 'expanded' : 'collapsed');
      if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => set(!isExpanded()));

    
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !isExpanded()) return;
      if (!rail.contains(document.activeElement) && !phone.matches) return;
      e.preventDefault();
      set(false, { restoreFocus: rail.contains(document.activeElement) || phone.matches });
    });

    if (scrim) scrim.addEventListener('click', () => set(false));

    
    rail.querySelectorAll('.cl-offcanvas10__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (link.getAttribute('href') !== '#') return;
        e.preventDefault();
        rail.querySelectorAll('.cl-offcanvas10__link[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'page');
        if (phone.matches && isExpanded()) set(false);
      });
    });

    
    const saved = store.get();
    if (saved === 'expanded') {
      root.style.setProperty('--cl-offcanvas10-speed', '0ms');
      set(true, { save: false });
      requestAnimationFrame(() => requestAnimationFrame(() => root.style.removeProperty('--cl-offcanvas10-speed')));
    } else {
      set(false, { save: false });
    }
  };

  initRail();
})();

