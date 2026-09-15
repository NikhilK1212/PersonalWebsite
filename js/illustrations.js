(function () {
  'use strict';

  if (!window.rough) return;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var XLINKNS = 'http://www.w3.org/1999/xlink';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = getComputedStyle(document.documentElement);
  var COLOR = {
    bg: css.getPropertyValue('--bg').trim(),
    bgDeep: css.getPropertyValue('--bg-deep').trim(),
    ink: css.getPropertyValue('--ink').trim(),
    inkSoft: css.getPropertyValue('--ink-soft').trim(),
    inkFaint: css.getPropertyValue('--ink-faint').trim(),
    accentLine: css.getPropertyValue('--accent-line').trim()
  };

  /* ---------------- CubeSat ---------------- */

  function buildCubesat() {
    var svg = document.getElementById('satSvg');
    var mount = document.getElementById('satMount');
    if (!svg || !mount) return;
    var rc = rough.svg(svg);

    var faceOpts = { roughness: 1.9, bowing: 1.1, stroke: COLOR.inkFaint, strokeWidth: 1.5, fill: COLOR.bgDeep, fillStyle: 'solid', seed: 41 };
    var faceOpts2 = { roughness: 1.9, bowing: 1.1, stroke: COLOR.inkFaint, strokeWidth: 1.5, fill: COLOR.bg, fillStyle: 'solid', seed: 42 };
    var faceOpts3 = { roughness: 1.9, bowing: 1.1, stroke: COLOR.inkFaint, strokeWidth: 1.5, fill: COLOR.bg, fillStyle: 'solid', seed: 43 };

    mount.appendChild(rc.polygon([[100, 42], [148, 66], [100, 90], [52, 66]], faceOpts));
    mount.appendChild(rc.polygon([[52, 66], [100, 90], [100, 148], [52, 124]], faceOpts2));
    mount.appendChild(rc.polygon([[100, 90], [148, 66], [148, 124], [100, 148]], faceOpts3));

    var railOpts = { roughness: 1.4, strokeWidth: 2.4, stroke: COLOR.inkFaint, seed: 44 };
    mount.appendChild(rc.line(52, 66, 52, 124, railOpts));
    mount.appendChild(rc.line(100, 90, 100, 148, railOpts));
    mount.appendChild(rc.line(148, 66, 148, 124, railOpts));

    var boltOpts = { roughness: 1.6, fill: COLOR.inkFaint, fillStyle: 'solid', stroke: COLOR.inkFaint, seed: 45 };
    [[52, 66], [52, 124], [148, 66], [148, 124], [100, 90], [100, 148]].forEach(function (p, i) {
      mount.appendChild(rc.circle(p[0], p[1], 4.5, Object.assign({}, boltOpts, { seed: 45 + i })));
    });

    var panelOpts = { roughness: 1.3, strokeWidth: 1, stroke: COLOR.accentLine, seed: 46 };
    mount.appendChild(rc.line(76, 78, 76, 136, panelOpts));
    mount.appendChild(rc.line(124, 78, 124, 136, Object.assign({}, panelOpts, { seed: 47 })));
    mount.appendChild(rc.linearPath([[52, 95], [100, 119], [148, 95]], Object.assign({}, panelOpts, { seed: 48 })));

    var antennaOpts = { roughness: 1.5, strokeWidth: 1.5, stroke: COLOR.inkFaint, seed: 49 };
    mount.appendChild(rc.line(100, 60, 78, 22, antennaOpts));
    mount.appendChild(rc.rectangle(94, 55, 10, 7, { roughness: 1.4, stroke: COLOR.inkFaint, fill: COLOR.bgDeep, fillStyle: 'solid', seed: 50 }));
    mount.appendChild(rc.circle(78, 22, 5, { roughness: 1.5, fill: COLOR.accentLine, fillStyle: 'solid', stroke: COLOR.accentLine, seed: 51 }));
  }

  /* ---------------- Car ---------------- */

  function buildCar() {
    var svg = document.getElementById('carSvg');
    var mount = document.getElementById('carMount');
    if (!svg || !mount) return;
    var rc = rough.svg(svg);

    var bodyOpts = {
      roughness: 2, bowing: 1.4, stroke: COLOR.inkFaint, strokeWidth: 1.9,
      fill: 'rgba(199, 220, 239, 0.4)', fillStyle: 'hachure', hachureGap: 7, seed: 61
    };
    mount.appendChild(rc.path(
      'M8,84 C10,75 16,70 26,69 L44,67 C54,50 70,39 90,37 L104,37 C110,37 114,40 116,45 ' +
      'C118,50 122,52 128,52 L144,54 C154,56 160,60 162,66 L162,80 C162,86 158,90 150,90 ' +
      'L20,90 C12,90 8,88 8,84 Z',
      bodyOpts
    ));

    var lineOpts = { roughness: 1.6, strokeWidth: 1.5, stroke: COLOR.inkFaint, seed: 62 };
    mount.appendChild(rc.path('M96,37 C96,25 110,25 110,37', lineOpts));
    mount.appendChild(rc.path('M46,67 L88,59', Object.assign({}, lineOpts, { seed: 63 })));
    mount.appendChild(rc.ellipse(84, 48, 18, 10, {
      roughness: 1.6, stroke: COLOR.inkFaint, strokeWidth: 1.2, fill: COLOR.bgDeep, fillStyle: 'solid', seed: 64
    }));

    var plateOpts = { roughness: 1.5, stroke: COLOR.accentLine, strokeWidth: 1.25, fill: COLOR.bg, fillStyle: 'solid', seed: 65 };
    mount.appendChild(rc.path('M0,84 L26,84 L26,80 L4,78 Z', Object.assign({}, lineOpts, { seed: 66 })));
    mount.appendChild(rc.rectangle(0, 76, 3, 10, Object.assign({}, plateOpts, { seed: 67 })));

    mount.appendChild(rc.line(148, 57, 148, 28, Object.assign({}, lineOpts, { seed: 68 })));
    mount.appendChild(rc.line(161, 65, 161, 28, Object.assign({}, lineOpts, { seed: 69 })));
    mount.appendChild(rc.rectangle(140, 22, 44, 7, {
      roughness: 1.6, stroke: COLOR.accentLine, strokeWidth: 1.5, fill: COLOR.bg, fillStyle: 'solid', seed: 70
    }));
    mount.appendChild(rc.rectangle(137, 18, 3, 18, Object.assign({}, plateOpts, { seed: 71 })));
    mount.appendChild(rc.rectangle(181, 18, 3, 18, Object.assign({}, plateOpts, { seed: 72 })));
    mount.appendChild(rc.line(150, 88, 162, 80, Object.assign({}, lineOpts, { seed: 73 })));

    buildWheel(document.getElementById('carWheelFront'), 14, 74);
    buildWheel(document.getElementById('carWheelRear'), 18, 75);
  }

  function buildWheel(wrap, r, seed) {
    if (!wrap) return;
    var spin = wrap.querySelector('.car-wheel-spin');
    if (!spin) return;
    var svg = spin.closest('svg');
    var rc = rough.svg(svg);
    var tireOpts = {
      roughness: 1.8, stroke: COLOR.inkFaint, strokeWidth: 1.8, fill: COLOR.bgDeep, fillStyle: 'solid', seed: seed
    };
    spin.appendChild(rc.circle(0, 0, r * 2, tireOpts));
    var spokeOpts = { roughness: 1.5, stroke: COLOR.inkFaint, strokeWidth: 1.4, seed: seed + 1 };
    var k = r * 0.72;
    var d = r * 0.5;
    spin.appendChild(rc.line(0, -k, 0, k, spokeOpts));
    spin.appendChild(rc.line(-k, 0, k, 0, Object.assign({}, spokeOpts, { seed: seed + 2 })));
    spin.appendChild(rc.line(-d, -d, d, d, Object.assign({}, spokeOpts, { seed: seed + 3 })));
    spin.appendChild(rc.line(-d, d, d, -d, Object.assign({}, spokeOpts, { seed: seed + 4 })));
  }

  /* ---------------- Space debris ---------------- */

  var FRAGS = [
    { shape: 'rect', w: 7, h: 6, dur: 11, begin: 0, orbit: 'orbitA' },
    { shape: 'rect', w: 4.5, h: 4.5, dur: 8, begin: -3, orbit: 'orbitA' },
    { shape: 'diamond', size: 5, dur: 6.5, begin: -1, orbit: 'orbitB' },
    { shape: 'rect', w: 3.5, h: 3, dur: 10, begin: -5, orbit: 'orbitB' }
  ];

  function shapeEl(f) {
    if (f.shape === 'diamond') {
      var p = document.createElementNS(SVGNS, 'path');
      var s = f.size;
      p.setAttribute('d', 'M' + (-s) + ',0 L0,' + (-s) + ' L' + s + ',0 L0,' + s + ' Z');
      return p;
    }
    var r = document.createElementNS(SVGNS, 'rect');
    r.setAttribute('x', -f.w / 2);
    r.setAttribute('y', -f.h / 2);
    r.setAttribute('width', f.w);
    r.setAttribute('height', f.h);
    return r;
  }

  function attachMotion(g, f, beginSeconds) {
    var am = document.createElementNS(SVGNS, 'animateMotion');
    am.setAttribute('dur', f.dur + 's');
    am.setAttribute('repeatCount', 'indefinite');
    am.setAttribute('rotate', 'auto');
    am.setAttribute('begin', beginSeconds + 's');
    var mp = document.createElementNS(SVGNS, 'mpath');
    mp.setAttributeNS(XLINKNS, 'href', '#' + f.orbit);
    mp.setAttribute('href', '#' + f.orbit);
    am.appendChild(mp);
    g.appendChild(am);
  }

  function staticPointOnOrbit(f, container) {
    var path = document.getElementById(f.orbit);
    if (!path) return;
    var len = path.getTotalLength();
    var pt = path.getPointAtLength(0);
    var g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('class', 'debris-frag');
    g.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
    g.appendChild(shapeEl(f));
    container.appendChild(g);
  }

  function buildDebris() {
    var svg = document.getElementById('debrisSvg');
    var mount = document.getElementById('debrisMount');
    var fragsHost = document.getElementById('debrisFrags');
    if (!svg || !mount) return;
    var rc = rough.svg(svg);

    mount.appendChild(rc.circle(110, 232, 220, {
      roughness: 1.7, stroke: COLOR.inkFaint, strokeWidth: 1.5,
      fill: 'rgba(199, 220, 239, 0.4)', fillStyle: 'hachure', hachureGap: 6, seed: 81
    }));

    var crossOpts = { roughness: 1.3, strokeWidth: 1.2, stroke: COLOR.accentLine, seed: 82 };
    mount.appendChild(rc.line(60, 42, 60, 50, crossOpts));
    mount.appendChild(rc.line(56, 46, 64, 46, Object.assign({}, crossOpts, { seed: 83 })));
    mount.appendChild(rc.line(168, 72, 168, 80, Object.assign({}, crossOpts, { seed: 84 })));
    mount.appendChild(rc.line(164, 76, 172, 76, Object.assign({}, crossOpts, { seed: 85 })));

    if (!fragsHost) return;

    if (reduceMotion) {
      FRAGS.forEach(function (f) { staticPointOnOrbit(f, fragsHost); });
      return;
    }

    FRAGS.forEach(function (f) {
      [{ delay: 0.7, opacity: 0.16 }, { delay: 0.35, opacity: 0.32 }].forEach(function (ghost) {
        var g = document.createElementNS(SVGNS, 'g');
        g.setAttribute('class', 'debris-frag-ghost');
        g.style.opacity = ghost.opacity;
        g.appendChild(shapeEl(f));
        attachMotion(g, f, f.begin + ghost.delay);
        fragsHost.appendChild(g);
      });
      var main = document.createElementNS(SVGNS, 'g');
      main.setAttribute('class', 'debris-frag');
      main.appendChild(shapeEl(f));
      attachMotion(main, f, f.begin);
      fragsHost.appendChild(main);
    });
  }

  /* ---------------- Margin doodles (generic, decorative only) ---------------- */

  function drawGearIcon(rc, mount, seed) {
    var lineOpts = { roughness: 1.8, stroke: COLOR.inkFaint, strokeWidth: 1.4, fill: 'none', seed: seed };
    mount.appendChild(rc.circle(30, 30, 32, lineOpts));
    mount.appendChild(rc.circle(30, 30, 11, Object.assign({}, lineOpts, { seed: seed + 1 })));
    for (var i = 0; i < 8; i++) {
      var g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('transform', 'rotate(' + (i * 45) + ' 30 30)');
      g.appendChild(rc.rectangle(27, 7, 6, 8, Object.assign({}, lineOpts, { seed: seed + 2 + i })));
      mount.appendChild(g);
    }
  }

  function drawRocketIcon(rc, mount, seed) {
    var lineOpts = { roughness: 1.8, stroke: COLOR.inkFaint, strokeWidth: 1.4, fill: 'none', seed: seed };
    mount.appendChild(rc.path('M24,22 L30,6 L36,22 Z', lineOpts));
    mount.appendChild(rc.rectangle(24, 22, 12, 24, Object.assign({}, lineOpts, { seed: seed + 1 })));
    mount.appendChild(rc.path('M24,38 L15,50 L24,45 Z', Object.assign({}, lineOpts, { seed: seed + 2 })));
    mount.appendChild(rc.path('M36,38 L45,50 L36,45 Z', Object.assign({}, lineOpts, { seed: seed + 3 })));
    mount.appendChild(rc.circle(30, 28, 6, Object.assign({}, lineOpts, { seed: seed + 4 })));
  }

  function drawWrenchIcon(rc, mount, seed) {
    var lineOpts = { roughness: 1.8, stroke: COLOR.inkFaint, strokeWidth: 1.5, fill: 'none', seed: seed };
    mount.appendChild(rc.line(16, 46, 42, 18, lineOpts));
    mount.appendChild(rc.circle(13, 49, 15, Object.assign({}, lineOpts, { seed: seed + 1 })));
    mount.appendChild(rc.circle(46, 14, 11, Object.assign({}, lineOpts, { seed: seed + 2 })));
  }

  function drawBoltIcon(rc, mount, seed) {
    var lineOpts = { roughness: 1.8, stroke: COLOR.inkFaint, strokeWidth: 1.4, fill: 'none', seed: seed };
    mount.appendChild(rc.polygon([[46, 30], [38, 44], [22, 44], [14, 30], [22, 16], [38, 16]], lineOpts));
    mount.appendChild(rc.circle(30, 30, 15, Object.assign({}, lineOpts, { seed: seed + 1 })));
  }

  var DOODLE_KINDS = [drawGearIcon, drawRocketIcon, drawWrenchIcon, drawBoltIcon];

  function buildSideDoodles() {
    var ids = ['doodleL1', 'doodleL2', 'doodleL3', 'doodleL4', 'doodleR1', 'doodleR2', 'doodleR3', 'doodleR4'];
    ids.forEach(function (id, i) {
      var svg = document.getElementById(id);
      if (!svg) return;
      var rc = rough.svg(svg);
      DOODLE_KINDS[i % DOODLE_KINDS.length](rc, svg, 100 + i * 10);
      drawOn(id, id);
    });
  }

  /* ---------------- Hand-drawn line reveal (anime.js) ---------------- */

  function drawOn(svgId, mountId) {
    if (!window.anime || reduceMotion) return;
    var svg = document.getElementById(svgId);
    var mount = document.getElementById(mountId);
    if (!svg || !mount) return;
    var drawables = anime.createDrawable('#' + mountId + ' path');
    if (!drawables || !drawables.length) return;
    anime.animate(drawables, {
      draw: ['0 0', '0 1'],
      duration: 1500,
      delay: anime.stagger(45),
      ease: 'inOutQuad',
      autoplay: anime.onScroll({ target: svg, enter: 'bottom-=10% top', repeat: false })
    });
  }

  function init() {
    buildCubesat();
    buildCar();
    buildDebris();
    buildSideDoodles();
    drawOn('satSvg', 'satMount');
    drawOn('carSvg', 'carMount');
    drawOn('debrisSvg', 'debrisMount');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
