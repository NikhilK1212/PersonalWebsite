/* Landing page: a sketched underline under the name, a drafting
   dimension line beside the portrait, and a staggered entrance. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = getComputedStyle(document.documentElement);
  var red = css.getPropertyValue('--accent-line').trim();
  var faint = css.getPropertyValue('--ink-faint').trim();

  function drawUnderline() {
    var svg = document.getElementById('heroUnderline');
    if (!svg || !window.rough) return;
    var rc = rough.svg(svg);
    var g = rc.curve([[6, 14], [140, 9], [300, 12], [512, 7]], { stroke: red, strokeWidth: 2.4, roughness: 1.4, bowing: 1.2, seed: 7 });
    var g2 = rc.curve([[40, 19], [220, 15], [470, 14]], { stroke: red, strokeWidth: 1.3, roughness: 1.2, seed: 11 });
    svg.appendChild(g);
    svg.appendChild(g2);
    return svg;
  }

  function drawDimension() {
    var svg = document.getElementById('portraitDim');
    if (!svg || !window.rough) return;
    var rc = rough.svg(svg);
    var o = { stroke: faint, strokeWidth: 1.2, roughness: 0.6, seed: 3 };
    svg.appendChild(rc.line(20, 4, 20, 396, o));
    svg.appendChild(rc.line(8, 4, 32, 4, o));
    svg.appendChild(rc.line(8, 396, 32, 396, o));
    svg.appendChild(rc.line(20, 4, 14, 20, o));
    svg.appendChild(rc.line(20, 4, 26, 20, o));
    svg.appendChild(rc.line(20, 396, 14, 380, o));
    svg.appendChild(rc.line(20, 396, 26, 380, o));
    return svg;
  }

  function drawOn(svg, duration, delay) {
    if (!svg || reduceMotion || !window.anime || !anime.createDrawable) return;
    var paths = svg.querySelectorAll('path');
    if (!paths.length) return;
    anime.animate(anime.createDrawable(paths), {
      draw: ['0 0', '0 1'],
      duration: duration,
      delay: anime.stagger(120, { start: delay }),
      ease: 'inOutQuad'
    });
  }

  function entrance() {
    var M = window.Motion;
    if (!M || reduceMotion) return;
    var ease = [0.22, 1, 0.36, 1];
    var items = document.querySelectorAll('.hero-text > *:not(.hero-underline)');
    items.forEach(function (el) { el.style.opacity = '0'; });
    M.animate(items, { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
      { duration: 0.7, delay: M.stagger(0.08), easing: ease });
    var p = document.querySelector('.portrait');
    if (p) {
      p.style.opacity = '0';
      M.animate(p, { opacity: [0, 1], transform: ['translateX(24px)', 'translateX(0px)'] },
        { duration: 0.9, delay: 0.25, easing: ease });
    }
  }

  function init() {
    entrance();
    drawOn(drawUnderline(), 900, 450);
    drawOn(drawDimension(), 700, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
