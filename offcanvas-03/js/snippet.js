/*!
 * offcanvas-03 - Colorlib. No jQuery, no framework.
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

  
  const initDragToClose = (sheet, grip, drawer) => {
    if (!grip) return;
    let startY = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    let dragging = false;
    let pointerId = null;

    grip.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      dragging = true;
      pointerId = e.pointerId;
      startY = lastY = e.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      grip.setPointerCapture(pointerId);
      sheet.classList.add('is-dragging');
    });

    grip.addEventListener('pointermove', (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dy = e.clientY - startY;
      const offset = dy > 0 ? dy : dy / 6; 
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = (e.clientY - lastY) / dt;
      lastY = e.clientY;
      lastT = e.timeStamp;
      sheet.style.transform = `translateY(${offset}px)`;
    });

    const end = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      if (grip.hasPointerCapture(pointerId)) grip.releasePointerCapture(pointerId);
      const dy = e.clientY - startY;
      const shouldClose = dy > sheet.offsetHeight / 3 || (dy > 40 && velocity > 0.6);
      sheet.classList.remove('is-dragging');
      sheet.style.transform = '';
      if (shouldClose) drawer.close();
    };
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);
  };

  const initShareSheet = () => {
    const root = document.querySelector('.cl-offcanvas03');
    if (!root) return;
    const sheet = root.querySelector('.cl-offcanvas03__sheet');
    const openers = Array.from(root.querySelectorAll('[data-drawer-open]'));
    const drawer = initDrawer(sheet, openers, { duration: 380 });
    if (!drawer) return;
    initDragToClose(sheet, sheet.querySelector('[data-drag]'), drawer);

    const status = sheet.querySelector('[data-status]');
    const say = (text) => {
      status.textContent = '';
      window.setTimeout(() => { status.textContent = text; }, 30);
    };

    const copyBtn = sheet.querySelector('[data-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const url = copyBtn.dataset.copy;
        try {
          await navigator.clipboard.writeText(url);
        } catch (err) {
          
        }
        copyBtn.classList.add('is-done');
        copyBtn.querySelector('[data-copy-label]').textContent = 'Copied';
        say(`Link copied: ${url}`);
      });
    }

    sheet.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', () => say(`Opening ${btn.dataset.share}…`));
    });

    sheet.querySelectorAll('[data-send]').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.classList.add('is-sent');
        say(`Sent to ${btn.dataset.send}.`);
      });
    });

    const save = root.querySelector('[data-save]');
    if (save) {
      save.addEventListener('click', () => {
        const on = save.getAttribute('aria-pressed') !== 'true';
        save.setAttribute('aria-pressed', String(on));
        save.querySelector('[data-save-label]').textContent = on ? 'Saved' : 'Save';
      });
    }
  };

  initShareSheet();
})();

