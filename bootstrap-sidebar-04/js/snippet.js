/*!
 * sidebar-04 - Colorlib. No jQuery, no framework.
 * Behaviours: sidebar-toggle
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
})();
