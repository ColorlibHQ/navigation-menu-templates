/*!
 * offcanvas-07 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  
  const initPushSidebar = () => {
    const root = document.querySelector('.cl-offcanvas07');
    if (!root) return;
    const sidebar = root.querySelector('.cl-offcanvas07__sidebar');
    const toggle = root.querySelector('[data-sidebar-toggle]');
    const shift = root.querySelector('.cl-offcanvas07__shift');
    if (!sidebar || !toggle) return;
    const narrow = window.matchMedia('(max-width: 899px)');

    const isOpen = () => root.classList.contains('is-open');

    const open = () => {
      sidebar.inert = false;
      root.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      const current = sidebar.querySelector('[aria-current="page"]') || sidebar.querySelector('a, button, input');
      if (current) current.focus({ preventScroll: true });
    };

    const close = () => {
      if (!isOpen()) return;
      const hadFocus = sidebar.contains(document.activeElement);
      root.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      sidebar.inert = true;
      if (hadFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => (isOpen() ? close() : open()));
    sidebar.querySelectorAll('[data-sidebar-close]').forEach((b) => b.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        close();
      }
    });

    
    shift.addEventListener('click', (e) => {
      if (isOpen() && narrow.matches && !toggle.contains(e.target)) close();
    });

    
    const filter = sidebar.querySelector('[data-filter]');
    const nomatch = sidebar.querySelector('[data-nomatch]');
    if (filter) {
      filter.addEventListener('input', () => {
        const q = filter.value.trim().toLowerCase();
        let total = 0;
        sidebar.querySelectorAll('.cl-offcanvas07__links').forEach((list) => {
          let shown = 0;
          list.querySelectorAll('li').forEach((li) => {
            const hit = !q || li.textContent.toLowerCase().includes(q);
            li.hidden = !hit;
            if (hit) shown += 1;
          });
          const heading = list.previousElementSibling;
          if (heading && heading.classList.contains('cl-offcanvas07__section')) heading.hidden = shown === 0;
          total += shown;
        });
        nomatch.hidden = total !== 0;
      });
    }

    sidebar.querySelectorAll('.cl-offcanvas07__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (link.getAttribute('href') !== '#') return;
        e.preventDefault();
        sidebar.querySelectorAll('[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
        link.setAttribute('aria-current', 'page');
        if (narrow.matches) close();
      });
    });
  };

  initPushSidebar();
})();

