// Mobile menu toggle (CSS handles responsive display; JS only toggles .is-open)
(function () {
  var trigger = document.querySelector('.menu-trigger');
  var menu = document.querySelector('.menu');
  if (!trigger || !menu) return;

  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.toggle('is-open');
  });

  // Close when clicking outside the menu
  document.addEventListener('click', function (e) {
    if (!trigger.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('is-open');
    }
  });

  // Close on resize to desktop
  var mq = window.matchMedia('(min-width: 641px)');
  var onChange = function (ev) { if (ev.matches) menu.classList.remove('is-open'); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
