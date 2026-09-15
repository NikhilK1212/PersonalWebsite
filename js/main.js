(function () {
  'use strict';

  var M = window.Motion;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!M || reduceMotion) return;

  var easing = [0.22, 1, 0.36, 1];

  function reveal(el, rise) {
    rise = rise || 20;
    el.style.opacity = '0';
    el.style.transform = 'translateY(' + rise + 'px)';
    var stop = M.inView(el, function () {
      M.animate(
        el,
        { opacity: [0, 1], transform: ['translateY(' + rise + 'px)', 'translateY(0px)'] },
        { duration: 0.65, easing: easing }
      );
      if (stop) stop();
    }, { margin: '0px 0px -12% 0px' });
  }

  document.querySelectorAll('.copy, .fact-block').forEach(function (el) {
    reveal(el);
  });

  var bulletList = document.querySelector('.copy ul');
  if (bulletList) {
    var items = bulletList.querySelectorAll('li');
    items.forEach(function (li) {
      li.style.opacity = '0';
      li.style.transform = 'translateX(-10px)';
    });
    var stopList = M.inView(bulletList, function () {
      M.animate(
        items,
        { opacity: [0, 1], transform: ['translateX(-10px)', 'translateX(0px)'] },
        { duration: 0.5, delay: M.stagger(0.09), easing: easing }
      );
      if (stopList) stopList();
    }, { margin: '0px 0px -12% 0px' });
  }
})();
