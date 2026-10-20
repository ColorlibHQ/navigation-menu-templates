/*!
 * dropdown-04 - Colorlib. No jQuery, no framework.
 * Behaviours: bootstrap-dropdown
 */
(function () {
  'use strict';

  /* Bootstrap dropdowns, without Bootstrap. */
  function ddMenu(t) { var w = t.parentElement; return w && w.querySelector('.cl-dropdown-menu'); }
  function ddEvent(t, name) { t.parentElement.dispatchEvent(new CustomEvent(name + '.bs.dropdown', { bubbles: true })); }
  function ddClose(except) {
    document.querySelectorAll('[data-toggle="dropdown"][aria-expanded="true"]').forEach(function (t) {
      if (t === except) return;
      var m = ddMenu(t);
      ddEvent(t, 'hide');
      t.setAttribute('aria-expanded', 'false');
      t.parentElement.classList.remove('cl-show');
      if (m) m.classList.remove('cl-show');
      ddEvent(t, 'hidden');
    });
  }
  document.querySelectorAll('[data-toggle="dropdown"]').forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var m = ddMenu(t);
      if (!m) return;
      var open = !m.classList.contains('cl-show');
      if (!open) { ddClose(); return; }
      ddClose(t);
      ddEvent(t, 'show');
      m.classList.add('cl-show');
      t.parentElement.classList.add('cl-show');
      t.setAttribute('aria-expanded', 'true');
      ddEvent(t, 'shown');
      if (open && m.classList.contains('cl-dropdown-menu-right') === false && m.getBoundingClientRect().right > document.documentElement.clientWidth) m.style.left = 'auto', m.style.right = '0';
    });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown') return;
      e.preventDefault();
      if (t.getAttribute('aria-expanded') !== 'true') t.click();
      var first = ddMenu(t) && ddMenu(t).querySelector('.cl-dropdown-item:not(.disabled)');
      if (first) first.focus();
    });
  });
  document.querySelectorAll('.cl-dropdown-menu').forEach(function (m) {
    m.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      var items = [].slice.call(m.querySelectorAll('.cl-dropdown-item:not(.disabled)'));
      var i = items.indexOf(document.activeElement) + (e.key === 'ArrowDown' ? 1 : -1);
      if (items[i]) items[i].focus();
    });
    m.addEventListener('click', function (e) { if (e.target.closest('.cl-dropdown-item')) ddClose(); });
  });
  document.addEventListener('click', function () { ddClose(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var t = document.querySelector('[data-toggle="dropdown"][aria-expanded="true"]');
    ddClose();
    if (t) t.focus();
  });
})();
