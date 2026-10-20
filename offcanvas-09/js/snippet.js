/*!
 * offcanvas-09 - Colorlib. No jQuery, no framework.
 * Behaviours: own-script
 */
/* The page's own script, unchanged: it never needed jQuery. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  
  const lockScroll = () => {
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = gap + 'px';
  };
  const unlockScroll = () => {
    document.documentElement.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  
  const initDrawer = (dialog, openers, opts = {}) => {
    if (!dialog || typeof dialog.showModal !== 'function') return null;
    const duration = opts.duration || 340;
    let returnTo = null;
    let timer = 0;

    const setExpanded = (value) => openers.forEach((b) => b.setAttribute('aria-expanded', String(value)));
    const focusables = () => Array.from(dialog.querySelectorAll(FOCUSABLE))
      .filter((el) => el.getClientRects().length > 0);

    const open = (from) => {
      clearTimeout(timer);
      returnTo = from || document.activeElement;
      if (!dialog.open) {
        dialog.showModal();
        lockScroll();
      }
      void dialog.offsetWidth; 
      dialog.classList.add('is-open');
      setExpanded(true);
      const first = dialog.querySelector('[data-autofocus]') || focusables()[0];
      if (first) first.focus();
    };

    const finish = () => { if (dialog.open) dialog.close(); };
    const close = () => {
      if (!dialog.open || !dialog.classList.contains('is-open')) return;
      dialog.classList.remove('is-open');
      setExpanded(false);
      clearTimeout(timer);
      if (reduceMotion.matches) finish();
      else timer = setTimeout(finish, duration);
    };

    dialog.addEventListener('close', () => {
      clearTimeout(timer);
      dialog.classList.remove('is-open');
      setExpanded(false);
      unlockScroll();
      if (returnTo && document.contains(returnTo)) returnTo.focus();
    });

    
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      close();
    });

    
    dialog.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    
    const outside = (e) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (e) => { pressedOutside = e.target === dialog && outside(e); });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog && pressedOutside && outside(e)) close();
      pressedOutside = false;
    });

    openers.forEach((b) => b.addEventListener('click', () => open(b)));
    dialog.querySelectorAll('[data-drawer-close]').forEach((b) => b.addEventListener('click', close));

    return { open, close, dialog };
  };

  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const initSearch = () => {
    const root = document.querySelector('.cl-offcanvas09');
    if (!root) return;
    const dialog = root.querySelector('.cl-offcanvas09__drawer');
    const openers = Array.from(root.querySelectorAll('[data-drawer-open]'));
    const drawer = initDrawer(dialog, openers);
    if (!drawer) return;

    const form = dialog.querySelector('[data-form]');
    const input = dialog.querySelector('.cl-offcanvas09__input');
    const clearBtn = dialog.querySelector('[data-clear]');
    const idle = dialog.querySelector('[data-idle]');
    const resultsPane = dialog.querySelector('[data-results]');
    const none = dialog.querySelector('[data-none]');
    const noneTerm = dialog.querySelector('[data-none-term]');
    const count = dialog.querySelector('[data-count]');
    const recentBlock = dialog.querySelector('[data-recent-block]');
    const recentList = dialog.querySelector('[data-recent]');
    const results = Array.from(dialog.querySelectorAll('.cl-offcanvas09__result')).map((li) => ({
      li,
      title: li.querySelector('.cl-offcanvas09__hit-title'),
      text: li.textContent.toLowerCase().replace(/\s+/g, ' '),
      raw: li.dataset.title,
    }));

    const visibleHits = () => results.filter((r) => !r.li.hidden).map((r) => r.li.querySelector('a'));

    const update = () => {
      const q = input.value.trim().toLowerCase();
      clearBtn.hidden = !q;
      idle.hidden = !!q;
      resultsPane.hidden = !q;
      if (!q) {
        count.textContent = '';
        return;
      }
      const terms = q.split(/\s+/).filter(Boolean);
      const re = new RegExp(`(${terms.map(escapeRe).join('|')})`, 'gi');
      let shown = 0;
      results.forEach((r) => {
        const hit = terms.every((t) => r.text.includes(t));
        r.li.hidden = !hit;
        if (hit) {
          shown += 1;
          r.title.innerHTML = escapeHtml(r.raw).replace(re, '<mark>$1</mark>');
        }
      });
      none.hidden = shown !== 0;
      noneTerm.textContent = input.value.trim();
      count.textContent = shown
        ? `${shown} ${shown === 1 ? 'recipe matches' : 'recipes match'} “${input.value.trim()}”. Use the down arrow to browse.`
        : `No recipes match “${input.value.trim()}”.`;
    };

    const addRecent = (term) => {
      const t = term.trim();
      if (!t) return;
      recentList.querySelectorAll('[data-term]').forEach((b) => {
        if (b.dataset.term.toLowerCase() === t.toLowerCase()) b.parentElement.remove();
      });
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cl-offcanvas09__chip';
      b.dataset.term = t;
      b.textContent = t;
      li.appendChild(b);
      recentList.prepend(li);
      while (recentList.children.length > 6) recentList.lastElementChild.remove();
      recentBlock.hidden = false;
    };

    const runTerm = (term) => {
      input.value = term;
      update();
      input.focus();
    };

    input.addEventListener('input', update);
    clearBtn.addEventListener('click', () => runTerm(''));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      addRecent(q);
      const first = visibleHits()[0];
      count.textContent = first ? `Showing results for “${q}”.` : count.textContent;
      if (first) first.focus();
    });

    dialog.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-term]');
      if (chip) runTerm(chip.dataset.term);
    });
    dialog.querySelector('[data-clear-recent]').addEventListener('click', () => {
      recentList.textContent = '';
      recentBlock.hidden = true;
      count.textContent = 'Recent searches cleared.';
      input.focus();
    });

    
    dialog.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (resultsPane.hidden) return;
      const hits = visibleHits();
      if (!hits.length) return;
      const i = hits.indexOf(document.activeElement);
      if (document.activeElement === input && e.key === 'ArrowDown') {
        e.preventDefault();
        hits[0].focus();
      } else if (i >= 0) {
        e.preventDefault();
        if (e.key === 'ArrowDown') hits[Math.min(i + 1, hits.length - 1)].focus();
        else if (i === 0) input.focus();
        else hits[i - 1].focus();
      }
    });

    results.forEach((r) => r.li.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      addRecent(input.value);
      drawer.close();
    }));

    
    document.addEventListener('keydown', (e) => {
      if (dialog.open) return;
      const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]');
      const slash = e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey;
      const cmdK = (e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey);
      if (!slash && !cmdK) return;
      e.preventDefault();
      drawer.open(openers[0]);
    });

    update();
  };

  initSearch();
})();

