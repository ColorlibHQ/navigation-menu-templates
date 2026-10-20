/*!
 * website-menu-04 - Colorlib. No jQuery, no framework.
 * Behaviours: sticky-header, site-mobile-menu
 */
(function () {
  'use strict';

  /* Sticky header (jquery.sticky's wrapper and classes). */
  document.querySelectorAll(".js-sticky-header").forEach(function (el) {
    var wrap = document.createElement('div');
    wrap.className = 'sticky-wrapper';
    if (el.id) wrap.id = el.id + '-sticky-wrapper';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
    var top = 0, stuck = false;
    function update() {
      wrap.style.height = el.offsetHeight + 'px';
      var should = window.scrollY > wrap.getBoundingClientRect().top + window.scrollY - top;
      if (should === stuck) { if (stuck) el.style.width = wrap.offsetWidth + 'px'; return; }
      stuck = should;
      wrap.classList.toggle('is-sticky', stuck);
      el.style.position = stuck ? 'fixed' : '';
      el.style.top = stuck ? top + 'px' : '';
      el.style.width = stuck ? wrap.offsetWidth + 'px' : '';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* Off-canvas mobile menu, built from the desktop nav. */
  var mobileBody = document.querySelector('.site-mobile-menu-body');
  if (mobileBody) document.querySelectorAll('.js-clone-nav').forEach(function (nav) {
    var copy = nav.cloneNode(true);
    copy.className = 'site-nav-wrap';
    copy.removeAttribute('id');
    mobileBody.appendChild(copy);
  });
  document.querySelectorAll('.site-mobile-menu .has-children').forEach(function (li, k) {
    var sub = li.querySelector(':scope > ul');
    if (!sub) return;
    var arrow = document.createElement('span');
    arrow.className = 'arrow-collapse cl-collapsed';
    arrow.setAttribute('role', 'button');
    arrow.setAttribute('aria-label', 'Show submenu');
    arrow.setAttribute('aria-expanded', 'false');
    li.insertBefore(arrow, li.firstChild);
    sub.className = 'cl-collapse';
    sub.id = 'collapseItem' + k;
    arrow.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !sub.classList.contains('cl-show');
      sub.classList.toggle('cl-show', open);
      arrow.classList.toggle('cl-active', open);
      arrow.classList.toggle('cl-collapsed', !open);
      arrow.setAttribute('aria-expanded', String(open));
    });
  });
  function mobileClose() {
    document.body.classList.remove('offcanvas-menu');
    document.querySelectorAll('.js-menu-toggle').forEach(function (t) { t.classList.remove('cl-active'); t.setAttribute('aria-expanded', 'false'); });
  }
  document.querySelectorAll('.js-menu-toggle').forEach(function (t) {
    t.setAttribute('aria-expanded', 'false');
    t.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !document.body.classList.contains('offcanvas-menu');
      if (!open) return mobileClose();
      document.body.classList.add('offcanvas-menu');
      document.querySelectorAll('.js-menu-toggle').forEach(function (x) { x.classList.add('cl-active'); x.setAttribute('aria-expanded', 'true'); });
    });
  });
  document.addEventListener('mouseup', function (e) {
    var panel = document.querySelector('.site-mobile-menu');
    if (panel && !panel.contains(e.target) && !e.target.closest('.js-menu-toggle')) mobileClose();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') mobileClose(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 768) mobileClose(); });
})();
