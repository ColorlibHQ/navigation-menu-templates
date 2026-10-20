/*!
 * sidebar-07 - Colorlib. No jQuery, no framework.
 * Behaviours: sidebar-toggle, bootstrap-data-api
 */
(function () {
  'use strict';

  /* Collapse / expand the sidebar. */
  var sidebarBtn = document.getElementById('sidebarCollapse');
  var sidebar = document.getElementById('sidebar');
  if (sidebarBtn && sidebar) {
    sidebarBtn.setAttribute('aria-controls', 'sidebar');
    sidebarBtn.setAttribute('aria-expanded', String(!sidebar.classList.contains('cl-active')));
    sidebarBtn.addEventListener('click', function () {
      var collapsed = sidebar.classList.toggle('cl-active');
      sidebarBtn.setAttribute('aria-expanded', String(!collapsed));
    });
  }

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
