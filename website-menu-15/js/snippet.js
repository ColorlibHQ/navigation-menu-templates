/*!
 * website-menu-15 - Colorlib. No jQuery, no framework.
 * Behaviours: hover-dropdown, bootstrap-data-api, bootstrap-dropdown
 */
(function () {
  'use strict';

  /* Dropdowns that open on hover. */
  document.querySelectorAll("nav .cl-dropdown").forEach(function (d) {
    function set(open) {
      d.classList.toggle('cl-show', open);
      var a = d.querySelector(':scope > a, :scope > [data-toggle]');
      if (a) a.setAttribute('aria-expanded', String(open));
      var m = d.querySelector('.cl-dropdown-menu');
      if (m) m.classList.toggle('cl-show', open);
    }
    d.addEventListener('mouseenter', function () { set(true); });
    d.addEventListener('mouseleave', function () { set(false); });
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
