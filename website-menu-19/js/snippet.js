/*!
 * website-menu-19 - Colorlib. No jQuery, no framework.
 * Behaviours: burger-menu
 */
(function () {
  'use strict';

  /* Burger menu: <body> carries the open class. */
  var BM = {"cls":"offcanvas","outside":"#colorlib-aside, .js-colorlib-nav-toggle","onScroll":true,"later":null}, bmTimer;
  function bmSet(open) {
    document.body.classList.toggle(BM.cls, open);
    document.querySelectorAll('.js-colorlib-nav-toggle').forEach(function (t) {
      t.setAttribute('aria-expanded', String(open));
      if (!BM.later) t.classList.toggle('cl-active', open);
    });
    clearTimeout(bmTimer);
    if (BM.later) {
      if (open) bmTimer = setTimeout(function () { document.querySelectorAll(BM.later.sel).forEach(function (x) { x.classList.add(BM.later.cls); }); }, BM.later.ms);
      else document.querySelectorAll(BM.later.sel).forEach(function (x) { x.classList.remove(BM.later.cls); });
    }
  }
  document.querySelectorAll('.js-colorlib-nav-toggle').forEach(function (t) {
    t.setAttribute('aria-label', 'Menu');
    t.setAttribute('aria-expanded', 'false');
    t.addEventListener('click', function (e) { e.preventDefault(); bmSet(!document.body.classList.contains(BM.cls)); });
  });
  if (BM.outside) document.addEventListener('click', function (e) {
    if (document.body.classList.contains(BM.cls) && !e.target.closest(BM.outside)) bmSet(false);
  });
  if (BM.onScroll) window.addEventListener('scroll', function () { if (document.body.classList.contains(BM.cls)) bmSet(false); }, { passive: true });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains(BM.cls)) bmSet(false); });
})();
