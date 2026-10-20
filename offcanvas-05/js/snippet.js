/*!
 * offcanvas-05 - Colorlib. No jQuery, no framework.
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

  const DEFAULTS = { theme: 'light', size: 'm', wordcount: true, focus: false, wide: false, sync: true };
  const SIZE_NAMES = { s: 'Small', m: 'Default', l: 'Large' };

  const initSettings = () => {
    const root = document.querySelector('.cl-offcanvas05');
    if (!root) return;
    const dialog = root.querySelector('.cl-offcanvas05__drawer');
    const openers = Array.from(root.querySelectorAll('[data-drawer-open]'));
    const drawer = initDrawer(dialog, openers);
    if (!drawer) return;

    const status = dialog.querySelector('[data-status]');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    let themeChoice = DEFAULTS.theme;
    const say = (text) => { status.textContent = text; };

    const applyTheme = () => {
      const dark = themeChoice === 'dark' || (themeChoice === 'system' && prefersDark.matches);
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
    };
    prefersDark.addEventListener('change', applyTheme);

    const setTheme = (value, announce) => {
      themeChoice = value;
      const radio = dialog.querySelector(`input[name="cl-offcanvas05-theme"][value="${value}"]`);
      if (radio) radio.checked = true;
      applyTheme();
      if (announce) say(value === 'system' ? `Theme follows your system (${root.dataset.theme}).` : `${value[0].toUpperCase() + value.slice(1)} theme on.`);
    };

    const setSize = (value, announce) => {
      root.setAttribute('data-size', value);
      const radio = dialog.querySelector(`input[name="cl-offcanvas05-size"][value="${value}"]`);
      if (radio) radio.checked = true;
      if (announce) say(`Text size: ${SIZE_NAMES[value]}.`);
    };

    
    const effects = {
      wordcount: (on) => root.classList.toggle('is-no-count', !on),
      focus: (on) => root.classList.toggle('is-focus', on),
      wide: (on) => root.classList.toggle('is-wide', on),
      sync: () => {},
    };
    const setSwitch = (btn, on, announce) => {
      btn.setAttribute('aria-checked', String(on));
      const fx = effects[btn.dataset.setting];
      if (fx) fx(on);
      if (announce) {
        const name = document.getElementById(btn.getAttribute('aria-labelledby')).textContent;
        say(`${name} ${on ? 'on' : 'off'}.`);
      }
    };

    dialog.querySelectorAll('input[name="cl-offcanvas05-theme"]').forEach((r) => r.addEventListener('change', () => setTheme(r.value, true)));
    dialog.querySelectorAll('input[name="cl-offcanvas05-size"]').forEach((r) => r.addEventListener('change', () => setSize(r.value, true)));
    const switches = Array.from(dialog.querySelectorAll('[role="switch"]'));
    switches.forEach((btn) => btn.addEventListener('click', () => setSwitch(btn, btn.getAttribute('aria-checked') !== 'true', true)));

    dialog.querySelector('[data-reset]').addEventListener('click', () => {
      setTheme(DEFAULTS.theme);
      setSize(DEFAULTS.size);
      switches.forEach((btn) => setSwitch(btn, DEFAULTS[btn.dataset.setting]));
      say('Settings reset to defaults.');
    });

    
    const doc = root.querySelector('.cl-offcanvas05__doc');
    doc.addEventListener('click', (e) => {
      const p = e.target.closest('p:not([class])');
      if (!p || !root.classList.contains('is-focus')) return;
      doc.querySelectorAll('p:not([class])').forEach((x) => { x.style.opacity = x === p ? '1' : ''; });
    });

    
    const count = root.querySelector('[data-wordcount]');
    if (count) {
      const words = Array.from(doc.querySelectorAll('p:not([class])')).reduce((n, p) => n + p.textContent.trim().split(/\s+/).length, 0);
      count.textContent = `${words} words`;
    }

    setTheme(DEFAULTS.theme);
    switches.forEach((btn) => setSwitch(btn, btn.getAttribute('aria-checked') === 'true'));
  };

  initSettings();
})();

