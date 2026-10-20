/*!
 * offcanvas-04 - Colorlib. No jQuery, no framework.
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

  const GROUPS = ['light', 'size', 'care'];

  const initFilters = () => {
    const root = document.querySelector('.cl-offcanvas04');
    if (!root) return;
    const dialog = root.querySelector('.cl-offcanvas04__drawer');
    const openers = Array.from(root.querySelectorAll('[data-drawer-open]'));
    const drawer = initDrawer(dialog, openers);
    if (!drawer) return;

    const form = dialog.querySelector('[data-form]');
    const applyBtn = dialog.querySelector('[data-apply]');
    const products = Array.from(root.querySelectorAll('.cl-offcanvas04__product'));
    const results = root.querySelector('[data-results]');
    const none = root.querySelector('[data-none]');
    const chips = root.querySelector('[data-chips]');
    const badge = root.querySelector('[data-active-count]');
    let applied = null;

    const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));

    const read = () => {
      const f = { pet: form.elements.pet.checked, min: num(form.elements.min.value), max: num(form.elements.max.value) };
      GROUPS.forEach((g) => {
        f[g] = Array.from(form.querySelectorAll(`input[name="${g}"]:checked`)).map((i) => i.value);
      });
      if (f.min != null && f.max != null && f.min > f.max) [f.min, f.max] = [f.max, f.min];
      return f;
    };

    const write = (f) => {
      GROUPS.forEach((g) => form.querySelectorAll(`input[name="${g}"]`).forEach((i) => { i.checked = f[g].includes(i.value); }));
      form.elements.pet.checked = f.pet;
      form.elements.min.value = f.min == null ? '' : f.min;
      form.elements.max.value = f.max == null ? '' : f.max;
    };

    const matches = (p, f) => {
      const d = p.dataset;
      const price = Number(d.price);
      return GROUPS.every((g) => !f[g].length || f[g].includes(d[g]))
        && (!f.pet || d.pet === 'yes')
        && (f.min == null || price >= f.min)
        && (f.max == null || price <= f.max);
    };

    const count = (f) => products.filter((p) => matches(p, f)).length;
    const plural = (n) => `${n} ${n === 1 ? 'plant' : 'plants'}`;

    const preview = () => {
      const n = count(read());
      applyBtn.textContent = n ? `Show ${plural(n)}` : 'No matches';
    };

    
    const labelFor = (name, value) => {
      const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
      const label = input && input.closest('label');
      const text = label ? (label.querySelector('span:not(.cl-offcanvas04__box):not(.cl-offcanvas04__num)') || label) : null;
      return text ? text.textContent.replace(/\s*\d+$/, '').trim() : value;
    };
    const activeList = (f) => {
      const list = [];
      GROUPS.forEach((g) => f[g].forEach((v) => list.push({ text: labelFor(g, v), remove: (s) => { s[g] = s[g].filter((x) => x !== v); } })));
      if (f.pet) list.push({ text: 'Pet-safe', remove: (s) => { s.pet = false; } });
      if (f.min != null || f.max != null) {
        list.push({ text: `€${f.min == null ? 0 : f.min}–€${f.max == null ? 100 : f.max}`, remove: (s) => { s.min = null; s.max = null; } });
      }
      return list;
    };

    const apply = (f) => {
      applied = f;
      let shown = 0;
      products.forEach((p) => {
        const ok = matches(p, f);
        p.hidden = !ok;
        if (ok) shown += 1;
      });
      results.innerHTML = `<strong>${shown}</strong> ${shown === 1 ? 'plant' : 'plants'}`;
      none.hidden = shown !== 0;

      const active = activeList(f);
      badge.hidden = !active.length;
      badge.textContent = String(active.length);
      chips.textContent = '';
      active.forEach((a) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Remove filter: ${a.text}`);
        b.innerHTML = '<span></span><svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
        b.firstChild.textContent = a.text;
        b.addEventListener('click', () => {
          const next = JSON.parse(JSON.stringify(applied));
          a.remove(next);
          apply(next);
          const first = chips.querySelector('button');
          (first || openers[0]).focus();
        });
        li.appendChild(b);
        chips.appendChild(li);
      });
    };

    form.addEventListener('input', preview);
    form.addEventListener('change', preview);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      apply(read());
      drawer.close();
    });
    dialog.querySelector('[data-clear]').addEventListener('click', () => {
      form.reset();
      preview();
    });

    
    openers.forEach((b) => b.addEventListener('click', () => {
      if (applied) write(applied);
      preview();
    }));

    apply(read());
    preview();
  };

  initFilters();
})();

