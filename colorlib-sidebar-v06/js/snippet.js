/*!
 * colorlib-sidebar-v06 - Colorlib. No jQuery, no framework.
 * Behaviours: show-sidebar
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
})();
