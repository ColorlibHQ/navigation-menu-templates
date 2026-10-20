/*!
 * offcanvas-06 - Colorlib. No jQuery, no framework.
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

  const initNotifications = () => {
    const root = document.querySelector('.cl-offcanvas06');
    if (!root) return;
    const dialog = root.querySelector('.cl-offcanvas06__panel');
    const bell = root.querySelector('.cl-offcanvas06__bell');
    const drawer = initDrawer(dialog, [bell]);
    if (!drawer) return;

    const items = Array.from(dialog.querySelectorAll('.cl-offcanvas06__item'));
    const groups = Array.from(dialog.querySelectorAll('.cl-offcanvas06__group'));
    const badge = root.querySelector('[data-badge]');
    const count = dialog.querySelector('[data-count]');
    const markAll = dialog.querySelector('[data-mark-all]');
    const empty = dialog.querySelector('[data-empty]');
    const status = dialog.querySelector('[data-status]');
    const filters = Array.from(dialog.querySelectorAll('[data-filter]'));
    let filter = 'all';

    const markRead = (item) => {
      item.classList.remove('is-unread');
      const sr = item.querySelector('.cl-offcanvas06__sr');
      if (sr) sr.remove();
    };

    const render = () => {
      const unread = items.filter((i) => i.classList.contains('is-unread')).length;
      badge.hidden = unread === 0;
      badge.textContent = String(unread);
      bell.setAttribute('aria-label', unread ? `Notifications, ${unread} unread` : 'Notifications, none unread');
      count.hidden = unread === 0;
      count.textContent = `${unread} new`;
      markAll.disabled = unread === 0;

      items.forEach((i) => {
        i.hidden = (filter === 'unread' && !i.classList.contains('is-unread'))
          || (filter === 'mention' && i.dataset.kind !== 'mention');
      });
      groups.forEach((g) => { g.hidden = !g.querySelector('.cl-offcanvas06__item:not([hidden])'); });
      empty.hidden = groups.some((g) => !g.hidden);
      return unread;
    };

    markAll.addEventListener('click', () => {
      const n = items.filter((i) => i.classList.contains('is-unread')).length;
      items.forEach(markRead);
      render();
      status.textContent = `${n} notifications marked as read.`;
      
      filters.find((f) => f.getAttribute('aria-pressed') === 'true').focus();
    });

    filters.forEach((btn) => btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filters.forEach((f) => f.setAttribute('aria-pressed', String(f === btn)));
      const shown = items.filter((i) => !i.hidden).length;
      render();
      status.textContent = `Showing ${items.filter((i) => !i.hidden).length || 'no'} notifications.`;
      return shown;
    }));

    
    items.forEach((item) => {
      const link = item.querySelector('.cl-offcanvas06__link');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (!item.classList.contains('is-unread')) return;
        markRead(item);
        render();
        status.textContent = 'Marked as read.';
      });
    });

    render();
  };

  initNotifications();
})();

