/*!
 * offcanvas-02 - Colorlib. No jQuery, no framework.
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

  const FREE_SHIPPING = 75;
  const SHIPPING_FEE = 4.9;
  const money = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

  const initCart = () => {
    const root = document.querySelector('.cl-offcanvas02');
    if (!root) return;
    const dialog = root.querySelector('.cl-offcanvas02__drawer');
    const openers = Array.from(root.querySelectorAll('[data-drawer-open]'));
    const drawer = initDrawer(dialog, openers, { duration: 360 });
    if (!drawer) return;

    const list = dialog.querySelector('[data-cart-items]');
    const empty = dialog.querySelector('[data-cart-empty]');
    const status = dialog.querySelector('[data-cart-status]');
    const meter = dialog.querySelector('[role="progressbar"]');
    const fill = dialog.querySelector('[data-ship-fill]');
    const shipText = dialog.querySelector('[data-ship-text]');
    const checkout = dialog.querySelector('[data-checkout]');
    const badge = root.querySelector('[data-cart-count]');
    const badgeLabel = root.querySelector('[data-cart-count-label]');
    const titleCount = root.querySelector('[data-cart-count-title]');
    const out = (sel, text) => { const el = dialog.querySelector(sel); if (el) el.textContent = text; };

    const clampQty = (input) => {
      const min = Number(input.min) || 1;
      const max = Number(input.max) || 99;
      const v = Math.round(Number(input.value));
      input.value = String(Math.min(max, Math.max(min, Number.isFinite(v) ? v : min)));
      return Number(input.value);
    };

    const render = (announce) => {
      const items = Array.from(list.querySelectorAll('.cl-offcanvas02__item'));
      let count = 0;
      let subtotal = 0;
      items.forEach((item) => {
        const input = item.querySelector('.cl-offcanvas02__qty');
        const qty = clampQty(input);
        const line = qty * Number(item.dataset.price);
        count += qty;
        subtotal += line;
        item.querySelector('[data-line-total]').textContent = money.format(line);
        item.querySelector('[data-step="-1"]').disabled = qty <= Number(input.min);
        item.querySelector('[data-step="1"]').disabled = qty >= Number(input.max);
      });

      const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
      out('[data-subtotal]', money.format(subtotal));
      out('[data-shipping]', shipping ? money.format(shipping) : 'Free');
      out('[data-total]', money.format(subtotal + shipping));

      const reached = Math.min(subtotal, FREE_SHIPPING);
      meter.setAttribute('aria-valuenow', String(reached));
      meter.setAttribute('aria-valuetext', `${money.format(reached)} of ${money.format(FREE_SHIPPING)}`);
      fill.style.width = (reached / FREE_SHIPPING) * 100 + '%';
      if (subtotal >= FREE_SHIPPING) shipText.innerHTML = 'Nice, your order ships <strong>free</strong>';
      else shipText.innerHTML = `You are <strong>${money.format(FREE_SHIPPING - subtotal)}</strong> away from free shipping`;

      badge.textContent = String(count);
      badgeLabel.textContent = `, ${count} ${count === 1 ? 'item' : 'items'}`;
      titleCount.textContent = `(${count})`;
      list.hidden = items.length === 0;
      empty.hidden = items.length !== 0;
      checkout.disabled = items.length === 0;
      if (announce) status.textContent = announce + ` Subtotal ${money.format(subtotal)}.`;
    };

    const nameOf = (item) => item.querySelector('.cl-offcanvas02__item-name').textContent;

    list.addEventListener('click', (e) => {
      const item = e.target.closest('.cl-offcanvas02__item');
      if (!item) return;
      const step = e.target.closest('[data-step]');
      if (step) {
        const input = item.querySelector('.cl-offcanvas02__qty');
        input.value = String(Number(input.value) + Number(step.dataset.step));
        render(`${nameOf(item)}: quantity ${clampQty(input)}.`);
        if (step.disabled) input.focus();
        return;
      }
      if (e.target.closest('[data-remove]')) {
        const items = Array.from(list.querySelectorAll('.cl-offcanvas02__item'));
        const next = items[items.indexOf(item) + 1] || items[items.indexOf(item) - 1];
        const name = nameOf(item);
        const done = () => {
          item.remove();
          render(`${name} removed.`);
          const target = next ? next.querySelector('[data-remove]') : dialog.querySelector('.cl-offcanvas02__continue');
          if (target) target.focus();
        };
        if (reduceMotion.matches) { done(); return; }
        item.classList.add('is-leaving');
        setTimeout(done, 250);
      }
    });

    list.addEventListener('change', (e) => {
      const item = e.target.closest('.cl-offcanvas02__item');
      if (item && e.target.matches('.cl-offcanvas02__qty')) render(`${nameOf(item)}: quantity ${clampQty(e.target)}.`);
    });

    
    root.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = list.querySelector(`[data-id="${btn.dataset.addToCart}"]`);
        if (item) {
          const input = item.querySelector('.cl-offcanvas02__qty');
          input.value = String(Number(input.value) + 1);
          render(`${nameOf(item)} added.`);
        }
        badge.classList.remove('is-bump');
        void badge.offsetWidth;
        badge.classList.add('is-bump');
        drawer.open(btn);
      });
    });

    checkout.addEventListener('click', () => {
      status.textContent = 'Taking you to secure checkout.';
    });

    render();
  };

  initCart();
})();

