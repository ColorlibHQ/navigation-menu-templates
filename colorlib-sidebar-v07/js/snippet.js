/*!
 * colorlib-sidebar-v07 - Colorlib. No jQuery, no framework.
 * Behaviours: show-sidebar, bootstrap-dropdown
 */
(function () {
  'use strict';

  /* Open and close the sidebar (body.show-sidebar). */
  var sbToggles = document.querySelectorAll('.js-menu-toggle');
  function sbSet(open) {
    document.body.classList.toggle('show-sidebar', open);
    sbToggles.forEach(function (t) { t.classList.toggle('cl-active', open); t.setAttribute('aria-expanded', String(open)); });
  }
  sbToggles.forEach(function (t) {
    t.setAttribute('role', 'button');
    t.setAttribute('aria-expanded', 'false');
    if (!t.getAttribute('aria-label')) t.setAttribute('aria-label', 'Toggle menu');
    t.addEventListener('click', function (e) { e.preventDefault(); sbSet(!document.body.classList.contains('show-sidebar')); });
  });
  document.querySelectorAll('.js-cart').forEach(function (c) {
    c.addEventListener('click', function (e) { e.preventDefault(); sbSet(!document.body.classList.contains('show-sidebar')); });
  });
  document.addEventListener('mouseup', function (e) {
    if (!document.body.classList.contains('show-sidebar')) return;
    if (e.target.closest('.sidebar') || e.target.closest('.js-menu-toggle') || e.target.closest('.js-cart')) return;
    sbSet(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('show-sidebar')) { sbSet(false); if (sbToggles[0]) sbToggles[0].focus(); }
  });

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
