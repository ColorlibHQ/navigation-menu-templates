/*!
 * colorlib-sidebar-v08 - Colorlib. No jQuery, no framework.
 * Behaviours: show-sidebar, bootstrap-data-api
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

  var SHOWN = 'cl-show';
  /* Bootstrap 4 collapse, without Bootstrap. */
  function afterTransition(el, fn) {
    var d = parseFloat(getComputedStyle(el).transitionDuration) * 1000 || 0;
    if (d) setTimeout(fn, d + 20); else fn();
  }
  function collapseTriggers(el) {
    return [].slice.call(document.querySelectorAll('[data-toggle="collapse"]')).filter(function (t) {
      return (t.getAttribute('data-target') || t.getAttribute('href')) === '#' + el.id;
    });
  }
  function setCollapse(el, open) {
    if (!el || el.classList.contains('cl-collapsing') || el.classList.contains(SHOWN) === open) return;
    el.dispatchEvent(new CustomEvent(open ? 'show.bs.collapse' : 'hide.bs.collapse', { bubbles: true }));
    if (open) {
      var parent = el.getAttribute('data-parent') || el._parent;
      if (parent) document.querySelectorAll(parent + ' .cl-collapse.' + SHOWN).forEach(function (o) {
        if (o !== el && !o.contains(el)) setCollapse(o, false);
      });
      el.classList.remove('cl-collapse');
      el.classList.add('cl-collapsing');
      el.style.height = '0px';
      el.offsetHeight;
      el.style.height = el.scrollHeight + 'px';
    } else {
      el.style.height = el.getBoundingClientRect().height + 'px';
      el.offsetHeight;
      el.classList.add('cl-collapsing');
      el.classList.remove('cl-collapse', SHOWN);
      el.style.height = '';
    }
    collapseTriggers(el).forEach(function (t) {
      t.classList.toggle('cl-collapsed', !open);
      t.setAttribute('aria-expanded', String(open));
    });
    afterTransition(el, function () {
      el.classList.remove('cl-collapsing');
      el.classList.add('cl-collapse');
      if (open) el.classList.add(SHOWN);
      el.style.height = '';
      el.dispatchEvent(new CustomEvent(open ? 'shown.bs.collapse' : 'hidden.bs.collapse', { bubbles: true }));
    });
  }
  document.querySelectorAll('[data-toggle="collapse"], [data-toggle="panel-collapse"]').forEach(function (t) {
    var el = document.querySelector(t.getAttribute('data-target') || t.getAttribute('href'));
    if (!el) return;
    if (t.getAttribute('data-parent')) el._parent = t.getAttribute('data-parent');
    if (t.getAttribute('data-toggle') !== 'collapse') return;   // a typo'd toggle bootstrap.js never bound
    t.setAttribute('aria-controls', el.id);
    t.setAttribute('aria-expanded', String(el.classList.contains(SHOWN)));
    t.addEventListener('click', function (e) {
      e.preventDefault();
      setCollapse(el, !el.classList.contains(SHOWN));
    });
  });
})();
