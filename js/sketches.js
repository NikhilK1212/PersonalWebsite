/* ---------------------------------------------------------
   Project sketches.
   Every drawing here is redrawn by hand, in rough.js, from a
   real figure in the matching project: the free body diagram,
   pedal lever and balance bar from the PER brake calcs, the
   detection output and ablation diagram from the debris paper,
   the dependency graph from RIPPLE, and so on. Figures adapted
   from someone else's work are credited in their captions.

   Usage: <svg data-sketch="name" viewBox="0 0 W H"></svg>
   Add data-thumb to drop labels for small card thumbnails.
--------------------------------------------------------- */
(function () {
  'use strict';

  if (!window.rough) return;

  var NS = 'http://www.w3.org/2000/svg';
  var XLINK = 'http://www.w3.org/1999/xlink';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = getComputedStyle(document.documentElement);
  function v(name) { return css.getPropertyValue(name).trim(); }
  var C = {
    ink: v('--ink'), soft: v('--ink-soft'), faint: v('--ink-faint'),
    red: v('--accent-line'), coral: v('--accent'),
    bg: v('--bg'), bgDeep: v('--bg-deep'),
    wash: 'rgba(199, 220, 239, 0.32)', redWash: 'rgba(226, 72, 58, 0.45)'
  };
  var HAND = "'Architects Daughter', cursive";
  var uid = 0;

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function hash(s) {
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003;
    return h + 11;
  }

  /* ---------------- Drawing context ---------------- */

  function Ctx(svg) {
    var vb = svg.viewBox.baseVal;
    this.svg = svg;
    this.W = vb.width;
    this.H = vb.height;
    var w = svg.getBoundingClientRect().width;
    // k converts screen pixels to viewBox units, so line weight stays even
    // whether a sketch is a small card thumbnail or a full width figure.
    this.k = w ? Math.min(3, Math.max(0.35, this.W / w)) : 1;
    this.thumb = svg.hasAttribute('data-thumb');
    this.name = svg.getAttribute('data-sketch');
    this.rc = rough.svg(svg);
    this.seed = hash(this.name);
    this.draw = el('g', { 'class': 'sk-draw' }, svg);
    this.fx = el('g', { 'class': 'sk-fx' }, svg);
    this.lab = el('g', { 'class': 'sk-labels' }, svg);
  }

  var COL = { soft: 'soft', faint: 'faint', red: 'red', ink: 'ink' };

  Ctx.prototype.o = function (e) {
    e = e || {};
    this.seed = (this.seed * 48271) % 2147483647;
    var o = {
      roughness: e.rough != null ? e.rough : 1.35,
      bowing: e.bow != null ? e.bow : 0.9,
      stroke: C[e.c || 'soft'],
      strokeWidth: (e.w || 1.7) * this.k,
      seed: (this.seed % 90000) + 1
    };
    if (e.fill) {
      o.fill = e.fill === 'wash' ? C.wash : e.fill === 'redwash' ? C.redWash : e.fill;
      o.fillStyle = e.style || 'hachure';
      o.hachureGap = (e.gap || 6) * this.k;
      o.hachureAngle = e.angle != null ? e.angle : -41;
      o.fillWeight = (e.fw || 1) * this.k;
    }
    if (e.nomulti) o.disableMultiStroke = true;
    return o;
  };

  Ctx.prototype.put = function (node, into) { (into || this.draw).appendChild(node); return node; };
  Ctx.prototype.line = function (x1, y1, x2, y2, e, into) { return this.put(this.rc.line(x1, y1, x2, y2, this.o(e)), into); };
  Ctx.prototype.rect = function (x, y, w, h, e, into) { return this.put(this.rc.rectangle(x, y, w, h, this.o(e)), into); };
  Ctx.prototype.circ = function (cx, cy, d, e, into) { return this.put(this.rc.circle(cx, cy, d, this.o(e)), into); };
  Ctx.prototype.ell = function (cx, cy, w, h, e, into) { return this.put(this.rc.ellipse(cx, cy, w, h, this.o(e)), into); };
  Ctx.prototype.poly = function (pts, e, into) { return this.put(this.rc.polygon(pts, this.o(e)), into); };
  Ctx.prototype.path = function (d, e, into) { return this.put(this.rc.path(d, this.o(e)), into); };
  Ctx.prototype.curve = function (pts, e, into) { return this.put(this.rc.curve(pts, this.o(e)), into); };

  Ctx.prototype.arrow = function (x1, y1, x2, y2, e, into) {
    e = e || {};
    this.line(x1, y1, x2, y2, e, into);
    var a = Math.atan2(y2 - y1, x2 - x1), h = e.head || 8, s = 0.42;
    var he = Object.assign({}, e, { rough: 0.8 });
    this.line(x2, y2, x2 - h * Math.cos(a - s), y2 - h * Math.sin(a - s), he, into);
    this.line(x2, y2, x2 - h * Math.cos(a + s), y2 - h * Math.sin(a + s), he, into);
  };

  // Drafting dimension: a line with end ticks and its value written beside it.
  Ctx.prototype.dim = function (x1, y1, x2, y2, label, e) {
    e = e || {};
    var off = e.off || 10;
    var a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
    var de = { c: 'faint', w: 1.2, rough: 0.9 };
    this.line(x1, y1, x2, y2, de);
    this.line(x1 - nx * 4, y1 - ny * 4, x1 + nx * 4, y1 + ny * 4, de);
    this.line(x2 - nx * 4, y2 - ny * 4, x2 + nx * 4, y2 + ny * 4, de);
    if (label) {
      this.text((x1 + x2) / 2 + nx * off, (y1 + y2) / 2 + ny * off + 4, label,
        { size: e.size || 12, color: e.color || 'soft', anchor: 'middle' });
    }
  };

  Ctx.prototype.text = function (x, y, str, opt) {
    if (this.thumb) return null;
    opt = opt || {};
    var t = el('text', {
      x: x, y: y,
      'font-size': opt.size || 12,
      'text-anchor': opt.anchor || 'start',
      fill: opt.color === 'coral' ? C.coral : opt.color === 'faint' ? C.faint : C.soft
    }, this.lab);
    t.style.fontFamily = HAND;
    if (opt.rot) t.setAttribute('transform', 'rotate(' + opt.rot + ' ' + x + ' ' + y + ')');
    t.textContent = str;
    return t;
  };

  // A plain (non rough) path in the effects layer. Used for flowing dashes,
  // since dash animation reads better on a smooth line than a sketchy one.
  Ctx.prototype.flow = function (d, opt) {
    opt = opt || {};
    var p = el('path', {
      d: d, fill: 'none',
      stroke: C[opt.c || 'faint'],
      'stroke-width': (opt.w || 1.4) * this.k,
      'stroke-linecap': 'round',
      'stroke-dasharray': opt.dash || '6 7'
    }, opt.into || this.fx);
    if (!opt.still) p.setAttribute('class', opt.cls || 'sk-flow');
    if (opt.opacity) p.setAttribute('opacity', opt.opacity);
    return p;
  };

  Ctx.prototype.motionPath = function (d) {
    var id = 'skm' + (++uid);
    el('path', { id: id, d: d, fill: 'none', stroke: 'none' }, this.fx);
    return id;
  };

  // Moves a group along a path forever. Skipped under reduced motion, where
  // the group is parked at the start of the path instead.
  Ctx.prototype.mover = function (g, pathId, dur, begin, extra) {
    if (reduceMotion) {
      var p = document.getElementById(pathId);
      var pt = p.getPointAtLength(p.getTotalLength() * ((extra && extra.park) || 0));
      g.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
      return;
    }
    var am = el('animateMotion', { dur: dur + 's', repeatCount: 'indefinite', begin: (begin || 0) + 's' }, g);
    if (extra && extra.keyPoints) {
      am.setAttribute('keyPoints', extra.keyPoints);
      am.setAttribute('keyTimes', extra.keyTimes);
      am.setAttribute('calcMode', 'linear');
    }
    if (extra && extra.rotate) am.setAttribute('rotate', 'auto');
    var mp = el('mpath', {}, am);
    mp.setAttributeNS(XLINK, 'href', '#' + pathId);
    mp.setAttribute('href', '#' + pathId);
  };

  Ctx.prototype.spin = function (g, cx, cy, dur, ccw) {
    if (reduceMotion) return;
    el('animateTransform', {
      attributeName: 'transform', type: 'rotate',
      from: '0 ' + cx + ' ' + cy, to: (ccw ? -360 : 360) + ' ' + cx + ' ' + cy,
      dur: dur + 's', repeatCount: 'indefinite'
    }, g);
  };

  Ctx.prototype.rock = function (g, cx, cy, deg, dur) {
    if (reduceMotion) return;
    el('animateTransform', {
      attributeName: 'transform', type: 'rotate',
      values: '0 ' + cx + ' ' + cy + ';' + deg + ' ' + cx + ' ' + cy + ';0 ' + cx + ' ' + cy,
      dur: dur + 's', repeatCount: 'indefinite', calcMode: 'spline',
      keyTimes: '0;0.5;1', keySplines: '0.45 0 0.55 1;0.45 0 0.55 1'
    }, g);
  };

  Ctx.prototype.group = function (parent, attrs) { return el('g', attrs || {}, parent || this.draw); };

  /* ---------------- Reusable glyphs ---------------- */

  Ctx.prototype.stars = function (n, x0, y0, x1, y1) {
    var s = this.seed;
    for (var i = 0; i < n; i++) {
      s = (s * 16807) % 2147483647;
      var x = x0 + (s % 1000) / 1000 * (x1 - x0);
      s = (s * 16807) % 2147483647;
      var y = y0 + (s % 1000) / 1000 * (y1 - y0);
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (0.9 + (i % 3) * 0.35) * this.k, fill: C.faint, opacity: 0.8 }, this.fx);
    }
  };

  Ctx.prototype.satellite = function (x, y, s, rot, e, into) {
    e = e || {};
    var g = this.group(into, { transform: 'translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')' });
    var w = { w: (e.w || 1.6) / s, c: e.c || 'soft' };
    this.rect(-9, -7, 18, 14, Object.assign({ fill: 'wash', gap: 4 / s }, w), g);
    this.rect(-37, -5, 24, 10, w, g);
    this.rect(13, -5, 24, 10, w, g);
    this.line(-31, -5, -31, 5, Object.assign({}, w, { w: w.w * 0.6 }), g);
    this.line(-25, -5, -25, 5, Object.assign({}, w, { w: w.w * 0.6 }), g);
    this.line(-19, -5, -19, 5, Object.assign({}, w, { w: w.w * 0.6 }), g);
    this.line(19, -5, 19, 5, Object.assign({}, w, { w: w.w * 0.6 }), g);
    this.line(25, -5, 25, 5, Object.assign({}, w, { w: w.w * 0.6 }), g);
    this.line(31, -5, 31, 5, Object.assign({}, w, { w: w.w * 0.6 }), g);
    this.line(-13, 0, -9, 0, w, g);
    this.line(9, 0, 13, 0, w, g);
    this.line(0, -7, 0, -15, w, g);
    this.path('M-5,-15 Q0,-21 5,-15', w, g);
    return g;
  };

  Ctx.prototype.factory = function (x, y, e) {
    e = e || {};
    var c = { c: e.c || 'soft', w: e.w || 1.6 };
    this.rect(x, y + 14, 50, 30, Object.assign({ fill: e.fill || 'wash', gap: 5 }, c));
    this.path('M' + x + ',' + (y + 14) + ' L' + (x + 12) + ',' + (y + 4) + ' L' + (x + 12) + ',' + (y + 14) +
      ' L' + (x + 24) + ',' + (y + 4) + ' L' + (x + 24) + ',' + (y + 14) + ' L' + (x + 36) + ',' + (y + 4) +
      ' L' + (x + 36) + ',' + (y + 14), c);
    this.rect(x + 40, y - 8, 7, 22, c);
    this.rect(x + 8, y + 30, 9, 14, Object.assign({}, c, { w: 1.2 }));
  };

  Ctx.prototype.tree = function (x, y) {
    var e = { c: 'soft', w: 1.3 };
    var n = [[x, y - 14], [x - 11, y - 2], [x + 11, y - 2], [x - 16, y + 10], [x - 6, y + 10], [x + 6, y + 10], [x + 16, y + 10]];
    this.line(n[0][0], n[0][1], n[1][0], n[1][1], e);
    this.line(n[0][0], n[0][1], n[2][0], n[2][1], e);
    this.line(n[1][0], n[1][1], n[3][0], n[3][1], e);
    this.line(n[1][0], n[1][1], n[4][0], n[4][1], e);
    this.line(n[2][0], n[2][1], n[5][0], n[5][1], e);
    this.line(n[2][0], n[2][1], n[6][0], n[6][1], e);
    for (var i = 0; i < n.length; i++) {
      this.circ(n[i][0], n[i][1], i === 0 ? 7 : 5, Object.assign({}, e, { fill: 'wash', gap: 2.5 }));
    }
  };

  Ctx.prototype.wheel = function (cx, cy, d, spinDur, ccw) {
    var g = this.group();
    this.circ(cx, cy, d, { c: 'soft', w: 1.8 }, g);
    this.circ(cx, cy, d * 0.55, { c: 'faint', w: 1.1 }, g);
    var r = d * 0.26;
    this.line(cx - r, cy, cx + r, cy, { c: 'faint', w: 1.1 }, g);
    this.line(cx, cy - r, cx, cy + r, { c: 'faint', w: 1.1 }, g);
    if (spinDur) this.spin(g, cx, cy, spinDur, ccw);
    return g;
  };

  Ctx.prototype.ground = function (x0, x1, y, step) {
    this.line(x0, y, x1, y, { c: 'faint', w: 1.4 });
    for (var x = x0 + 6; x < x1; x += (step || 14)) this.line(x, y, x - 7, y + 7, { c: 'faint', w: 1, rough: 0.7 });
  };

  Ctx.prototype.wave = function (x, y, len, dir, opt) {
    // Short wavy heat or radiation line, drawn with a plain path so it can rise.
    var d = 'M' + x + ',' + y;
    var steps = 4, dx = Math.cos(dir), dy = Math.sin(dir), px = -dy, py = dx;
    for (var i = 1; i <= steps; i++) {
      var t = len * i / steps, amp = (i % 2 ? 3.2 : -3.2);
      var mx = x + dx * (t - len / steps / 2) + px * amp, my = y + dy * (t - len / steps / 2) + py * amp;
      d += ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + (x + dx * t).toFixed(1) + ',' + (y + dy * t).toFixed(1);
    }
    return this.flow(d, Object.assign({ dash: 'none', still: true }, opt || {}));
  };

  /* ---------------- Sketches ---------------- */

  var SK = {};

  /* Space debris: fragments circling low Earth orbit. */
  SK['debris-field'] = function (S) {
    S.stars(26, 6, 6, S.W - 6, 120);
    S.circ(S.W / 2, 460, 560, { c: 'soft', w: 1.8, fill: 'wash', gap: 7 });
    S.flow('M20,172 Q' + (S.W / 2) + ',150 ' + (S.W - 20) + ',172', { c: 'faint', dash: '2 6', still: true, opacity: 0.8 });
    var orbits = [
      { id: null, d: 'M 22,118 A 148,44 0 1,0 318,118 A 148,44 0 1,0 22,118', frags: [[7, 6, 13, 0], [4.5, 4.5, 13, -5], [5, 3.5, 13, -9]] },
      { id: null, d: 'M 52,92 A 118,30 0 1,0 288,92 A 118,30 0 1,0 52,92', frags: [[5, 5, 9.5, -2], [3.5, 3, 9.5, -6.5]] }
    ];
    var tilt = S.group(S.fx, { transform: 'rotate(-7 170 105)' });
    orbits.forEach(function (o) {
      o.id = S.motionPath(o.d);
      tilt.appendChild(document.getElementById(o.id));
      S.flow(o.d, { c: 'faint', dash: '3 5', still: true, into: tilt, opacity: 0.9 });
      o.frags.forEach(function (f, i) {
        [{ lag: 0.5, op: 0.18 }, { lag: 0.25, op: 0.38 }, { lag: 0, op: 1 }].forEach(function (gh) {
          var g = S.group(tilt, { opacity: gh.op });
          S.rect(-f[0] / 2, -f[1] / 2, f[0], f[1], { c: 'red', w: 1.5, fill: C.redWash, style: 'solid', rough: 1.1 }, g);
          S.mover(g, o.id, f[2], f[3] + gh.lag, { park: (i * 0.29 + 0.1) % 1 });
        });
      });
    });
    var sat = S.group(tilt);
    S.satellite(0, 0, 0.55, 0, { w: 1.5 }, sat);
    S.mover(sat, orbits[0].id, 20, -4, { park: 0.62 });
    S.text(14, 30, 'low Earth orbit', { color: 'faint' });
    S.text(S.W - 12, 30, 'fragments', { color: 'coral', anchor: 'end' });
  };

  /* Debris paper, detection output: a box drawn around a satellite with its label and confidence. */
  SK['debris-detect'] = function (S) {
    S.stars(30, 6, 6, S.W - 6, S.H - 6);
    S.satellite(160, 104, 1.45, -16, { w: 1.7 });
    S.rect(84, 56, 154, 96, { c: 'red', w: 2.1, rough: 0.9, nomulti: true });
    S.rect(84, 40, 92, 16, { c: 'red', w: 1.5, fill: C.redWash, style: 'solid', rough: 0.7, nomulti: true });
    S.text(90, 52, 'proba_2  0.95', { color: 'coral', size: 11.5 });
    var scan = el('line', { x1: 86, x2: 236, y1: 60, y2: 60, stroke: C.red, 'stroke-width': 1.2 * S.k, opacity: 0.7 }, S.fx);
    if (!reduceMotion) { scan.setAttribute('class', 'sk-scan'); scan.style.setProperty('--scan', '88px'); }
    S.text(S.W - 10, S.H - 12, 'detected, classified', { color: 'faint', anchor: 'end' });
  };

  /* Debris paper, orbital parameters: the ellipse the trajectory model is held to. */
  SK['debris-orbit'] = function (S) {
    S.stars(14, 6, 6, S.W - 6, S.H - 6);
    var cx = 170, cy = 118, a = 118, b = 86, f = Math.sqrt(a * a - b * b);
    S.ell(cx, cy, a * 2, b * 2, { c: 'soft', w: 1.7 });
    S.circ(cx - f, cy, 32, { c: 'soft', w: 1.8, fill: 'wash', gap: 5 });
    S.line(cx - 4, cy, cx + 4, cy, { c: 'faint', w: 1 });
    S.line(cx, cy - 4, cx, cy + 4, { c: 'faint', w: 1 });
    S.dim(cx, cy, cx + a, cy, 'a', { off: -9, color: 'coral', size: 14 });
    S.circ(cx - a, cy, 5, { c: 'red', w: 1.4 });
    S.circ(cx + a, cy, 5, { c: 'red', w: 1.4 });
    S.text(cx - a - 8, cy + 5, 'perigee', { anchor: 'end', color: 'faint', size: 12 });
    S.text(cx + a + 8, cy + 5, 'apogee', { color: 'faint', size: 12 });
    S.text(cx - f, cy - 24, 'Earth', { anchor: 'middle', color: 'faint' });
    var id = S.motionPath('M ' + (cx - a) + ',' + cy + ' A ' + a + ',' + b + ' 0 1,1 ' + (cx + a) + ',' + cy +
      ' A ' + a + ',' + b + ' 0 1,1 ' + (cx - a) + ',' + cy);
    var frag = S.group(S.fx);
    S.rect(-4, -3.5, 8, 7, { c: 'red', w: 1.5, fill: C.redWash, style: 'solid', rough: 1 }, frag);
    // Faster through perigee and slower at apogee, the way a real orbit moves.
    S.mover(frag, id, 9, 0, { keyPoints: '0;0.12;0.5;0.88;1', keyTimes: '0;0.05;0.5;0.95;1', park: 0.3 });
    S.text(16, 22, "held to Kepler's third law", { color: 'coral', size: 12 });
  };

  /* Debris paper, random forest: inputs fan out to many trees, answers averaged. */
  SK['debris-forest'] = function (S) {
    S.rect(12, 78, 70, 38, { c: 'soft', w: 1.6 });
    S.text(47, 101, 'inputs', { anchor: 'middle' });
    var ys = [28, 70, 124, 166];
    ys.forEach(function (y) {
      S.arrow(84, 97, 148, y, { c: 'faint', w: 1.2, head: 6 });
      S.tree(170, y);
      S.arrow(192, y, 252, 97, { c: 'faint', w: 1.2, head: 6 });
    });
    S.text(170, 102, '⋮', { anchor: 'middle', size: 18, color: 'faint' });
    S.rect(254, 78, 54, 38, { c: 'red', w: 1.8 });
    S.text(281, 101, 'mean', { anchor: 'middle', color: 'coral' });
    S.arrow(310, 97, 348, 97, { c: 'red', w: 1.6, head: 7 });
    S.text(350, 88, 'risk', { color: 'coral', anchor: 'end' });
    S.text(170, 194, '100 trees', { anchor: 'middle', color: 'faint' });
  };

  /* Debris paper, laser ablation: a retrograde push lowers the orbit ahead. */
  SK['debris-laser'] = function (S) {
    S.stars(18, 6, 6, S.W - 6, 110);
    S.circ(S.W / 2, 560, 780, { c: 'faint', w: 1.5, fill: 'wash', gap: 8 });
    S.curve([[8, 76], [120, 56], [230, 52], [352, 70]], { c: 'soft', w: 1.6 });
    S.flow('M150,55 Q260,62 352,138', { c: 'coral', w: 1.6, dash: '5 6' });
    S.poly([[140, 50], [152, 46], [160, 53], [156, 63], [144, 64], [138, 57]], { c: 'soft', w: 1.8, fill: 'wash', gap: 3 });
    S.satellite(300, 140, 0.75, 8, { w: 1.5 });
    var beam = S.flow('M286,132 L163,62', { c: 'red', w: 2.4, dash: '14 6', cls: 'sk-flow sk-beam' });
    beam.setAttribute('opacity', '0.95');
    [[-0.2, 16], [0.15, 18], [0.5, 14], [-0.55, 12]].forEach(function (r) {
      var a = Math.atan2(132 - 62, 286 - 163) + r[0];
      S.line(162, 60, 162 + Math.cos(a) * r[1], 60 + Math.sin(a) * r[1], { c: 'red', w: 1.2, rough: 1.4 });
    });
    S.arrow(136, 56, 92, 60, { c: 'coral', w: 1.8, head: 7 });
    S.text(88, 50, 'Δv', { color: 'coral', size: 14, anchor: 'end' });
    S.text(236, 82, 'laser', { color: 'coral' });
    S.text(170, 36, 'plume', { color: 'faint' });
    S.text(16, 96, 'initial orbit', { color: 'faint' });
    S.text(334, 172, 'lower orbit', { color: 'coral', anchor: 'end' });
  };

  /* CubeSat paper: sunlight in, chip heat out, nowhere for either to go. */
  SK['cubesat-heat'] = function (S) {
    S.circ(46, 42, 34, { c: 'red', w: 1.8, fill: C.redWash, style: 'hachure', gap: 4 });
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      S.line(46 + Math.cos(a) * 23, 42 + Math.sin(a) * 23, 46 + Math.cos(a) * 31, 42 + Math.sin(a) * 31, { c: 'red', w: 1.3 });
    }
    [[70, 58, 168, 96], [62, 72, 150, 112], [78, 50, 196, 86]].forEach(function (r) {
      S.flow('M' + r[0] + ',' + r[1] + ' L' + r[2] + ',' + r[3], { c: 'red', w: 1.4, dash: '5 6' });
    });
    var top = [[196, 78], [248, 104], [196, 130], [144, 104]];
    S.poly(top, { c: 'soft', w: 1.8, fill: 'wash', gap: 6 });
    S.poly([[144, 104], [196, 130], [196, 190], [144, 164]], { c: 'soft', w: 1.8 });
    S.poly([[196, 130], [248, 104], [248, 164], [196, 190]], { c: 'soft', w: 1.8, fill: 'wash', gap: 7, angle: 50 });
    S.line(170, 117, 170, 177, { c: 'red', w: 1.1 });
    S.line(222, 117, 222, 177, { c: 'red', w: 1.1 });
    S.line(196, 104, 176, 64, { c: 'faint', w: 1.4 });
    S.circ(176, 62, 5, { c: 'red', w: 1.4 });
    S.poly([[152, 136], [164, 142], [164, 156], [152, 150]], { c: 'coral', w: 1.6, fill: C.redWash, style: 'solid' });
    for (var j = 0; j < 3; j++) {
      var w = S.wave(140 - j * 2, 150 - j * 9, 34, Math.PI * 1.08, { c: 'coral', w: 1.5 });
      if (!reduceMotion) { w.setAttribute('class', 'sk-rise'); w.style.animationDelay = (j * 0.7) + 's'; }
    }
    S.text(30, 90, 'sunlight', { color: 'coral' });
    S.text(20, 168, 'chip heat', { color: 'coral' });
    S.text(262, 150, '1U', { color: 'faint' });
  };

  /* After Cui (2022): a single bit flipped by a charged particle. */
  SK['bitflip'] = function (S) {
    var bits = ['1', '0', '1', '1', '0', '1'], x0 = 76, cw = 36;
    [['before', 44], ['after', 112]].forEach(function (row, r) {
      S.text(14, row[1] + 20, row[0], { color: 'faint' });
      bits.forEach(function (b, i) {
        var hit = r === 1 && i === 3;
        S.rect(x0 + i * cw, row[1], cw - 4, 30, hit ? { c: 'red', w: 2.2, fill: C.redWash, style: 'solid' } : { c: 'soft', w: 1.5 });
        S.text(x0 + i * cw + (cw - 4) / 2, row[1] + 21, hit ? '0' : b, { anchor: 'middle', size: 16, color: hit ? 'coral' : 'soft' });
      });
    });
    S.path('M338,16 L296,62 L308,70 L222,116', { c: 'red', w: 2 });
    S.arrow(236, 108, 220, 117, { c: 'red', w: 2, head: 7 });
    var id = S.motionPath('M338,16 L296,62 L308,70 L222,116');
    var p = S.group(S.fx);
    el('circle', { r: 3.2 * S.k, fill: C.coral }, p);
    S.mover(p, id, 1.8, 0, { park: 0.9 });
    S.text(150, 26, 'charged particle', { color: 'coral' });
  };

  /* After Shi et al. (2015): light enters the triangular hair and bounces back out. */
  SK['tir-prism'] = function (S) {
    S.poly([[160, 36], [58, 196], [262, 196]], { c: 'soft', w: 1.9, fill: 'wash', gap: 7 });
    var ray = 'M28,50 L109,116 L168,196 L217,124 L300,64';
    S.path('M28,50 L109,116', { c: 'red', w: 1.8 });
    S.path('M109,116 L168,196 L217,124', { c: 'red', w: 1.6 });
    S.arrow(217, 124, 300, 64, { c: 'red', w: 1.8, head: 8 });
    S.arrow(60, 76, 84, 96, { c: 'red', w: 1.8, head: 7 });
    var id = S.motionPath(ray);
    var p = S.group(S.fx);
    el('circle', { r: 3 * S.k, fill: C.coral }, p);
    S.mover(p, id, 2.6, 0, { park: 0.5 });
    [[250, 180, -0.35], [262, 150, -0.2], [70, 180, Math.PI + 0.35]].forEach(function (w, i) {
      var wv = S.wave(w[0], w[1], 36, w[2], { c: 'faint', w: 1.5 });
      if (!reduceMotion) { wv.setAttribute('class', 'sk-pulse'); wv.style.animationDelay = (i * 0.5) + 's'; }
    });
    S.text(22, 40, 'sunlight in', { color: 'coral' });
    S.text(304, 58, 'reflected', { color: 'coral', anchor: 'end' });
    S.text(168, 214, 'total internal reflection', { color: 'faint', anchor: 'middle' });
    S.text(308, 176, 'mid-IR out', { color: 'faint', anchor: 'end' });
  };

  /* After Jung et al. (2023): a structured film reflects sunlight and lets heat escape. */
  SK['film-layer'] = function (S) {
    S.text(14, 24, 'space, about 3 K', { color: 'faint' });
    S.rect(16, 164, S.W - 32, 34, { c: 'faint', w: 1.5, fill: 'wash', gap: 8 });
    S.text(S.W / 2, 186, 'satellite face', { anchor: 'middle', color: 'faint' });
    S.rect(16, 146, S.W - 32, 18, { c: 'soft', w: 1.7 });
    var d = 'M16,146';
    for (var x = 16; x < S.W - 16; x += 16) d += ' L' + (x + 8) + ',136 L' + (x + 16) + ',146';
    S.path(d, { c: 'soft', w: 1.4 });
    [70, 118, 166].forEach(function (x, i) {
      S.arrow(x - 44, 40, x, 134, { c: 'red', w: 1.6, head: 7 });
      S.arrow(x, 134, x + 40, 52 - i * 2, { c: 'red', w: 1.4, head: 7 });
    });
    [236, 276, 316].forEach(function (x, i) {
      var w = S.wave(x, 130, 72, -Math.PI / 2, { c: 'coral', w: 1.6 });
      if (!reduceMotion) { w.setAttribute('class', 'sk-rise'); w.style.animationDelay = (i * 0.6) + 's'; }
    });
    S.text(24, 64, 'sunlight', { color: 'coral' });
    S.text(170, 36, 'reflected', { color: 'coral' });
    S.text(S.W - 16, 40, 'heat radiated out', { color: 'coral', anchor: 'end' });
    S.text(S.W - 18, 132, 'film', { color: 'soft', anchor: 'end' });
  };

  /* PER brake calcs, force path: foot to pedal to balance bar to two circuits. */
  SK['per-forcepath'] = function (S) {
    var box = function (x, y, w, h, t, red) {
      S.rect(x, y, w, h, { c: red ? 'red' : 'soft', w: 1.6 });
      S.text(x + w / 2, y + h / 2 + 5, t, { anchor: 'middle', color: red ? 'coral' : 'soft' });
    };
    S.text(8, 58, 'foot', { color: 'coral' });
    S.arrow(8, 66, 44, 66, { c: 'red', w: 1.8, head: 7 });
    box(48, 48, 66, 36, 'pedal');
    S.arrow(116, 66, 138, 66, { c: 'faint', w: 1.4, head: 6 });
    box(140, 48, 72, 36, 'pushrod');
    S.arrow(214, 66, 236, 66, { c: 'faint', w: 1.4, head: 6 });
    box(238, 48, 104, 36, 'balance bar', true);
    S.arrow(272, 86, 206, 128, { c: 'soft', w: 1.5, head: 7 });
    S.arrow(310, 86, 306, 128, { c: 'soft', w: 1.5, head: 7 });
    S.text(270, 114, '3 : 1', { color: 'coral', size: 14, anchor: 'middle' });
    box(160, 130, 92, 34, 'front MC');
    box(266, 130, 84, 34, 'rear MC');
    S.arrow(206, 166, 206, 196, { c: 'faint', w: 1.3, head: 6 });
    S.arrow(308, 166, 308, 196, { c: 'faint', w: 1.3, head: 6 });
    S.text(206, 214, 'front, 1200 psi', { anchor: 'middle' });
    S.text(308, 214, 'rear, 400 psi', { anchor: 'middle' });
    S.text(16, 150, 'two separate', { color: 'faint' });
    S.text(16, 166, 'circuits', { color: 'faint' });
  };

  /* PER brake calcs, free body diagram of the car under braking. */
  SK['per-fbd'] = function (S) {
    S.ground(14, S.W - 14, 172);
    S.path('M44,146 L44,112 L118,106 L146,86 L204,84 L230,104 L318,110 L322,146 Z', { c: 'soft', w: 1.7, fill: 'wash', gap: 8 });
    S.wheel(92, 152, 40, 0);
    S.wheel(272, 152, 40, 0);
    S.circ(182, 118, 13, { c: 'ink', w: 1.6 });
    S.line(175, 118, 189, 118, { c: 'ink', w: 1.1 });
    S.line(182, 111, 182, 125, { c: 'ink', w: 1.1 });
    S.arrow(182, 126, 182, 166, { c: 'red', w: 2, head: 8 });
    S.text(190, 162, 'W', { color: 'coral', size: 14 });
    S.arrow(190, 118, 250, 118, { c: 'red', w: 2, head: 8 });
    S.text(226, 138, 'm·a', { color: 'coral', size: 14, anchor: 'middle' });
    S.arrow(92, 172, 92, 128, { c: 'red', w: 1.8, head: 7 });
    S.text(92, 98, 'N rear', { color: 'coral', anchor: 'middle' });
    S.arrow(272, 172, 272, 92, { c: 'red', w: 2.4, head: 9 });
    S.text(284, 92, 'N front', { color: 'coral' });
    S.dim(150, 172, 150, 118, 'h', { off: -10, size: 13 });
    S.dim(92, 194, 272, 194, 'L', { off: 12, size: 13 });
    S.arrow(S.W - 60, 30, S.W - 18, 30, { c: 'faint', w: 1.3, head: 6 });
    S.text(S.W - 64, 34, 'travel', { color: 'faint', anchor: 'end' });
  };

  /* PER brake calcs, pedal moment balance about the floor pivot. */
  SK['per-pedal'] = function (S) {
    S.ground(16, S.W - 16, 202);
    S.poly([[72, 186], [58, 202], [86, 202]], { c: 'soft', w: 1.6, fill: 'wash', gap: 4 });
    var rig = S.group();
    var px = 72, py = 186, ex = 220, ey = 62;
    var L = Math.hypot(ex - px, ey - py), ux = (ex - px) / L, uy = (ey - py) / L, nx = -uy, ny = ux;
    var t = 3.4;
    S.poly([[px - nx * t, py - ny * t], [ex - nx * t, ey - ny * t], [ex + nx * t, ey + ny * t], [px + nx * t, py + ny * t]], { c: 'soft', w: 1.7 }, rig);
    S.poly([[ex - nx * 15, ey - ny * 15], [ex + nx * 15, ey + ny * 15], [ex + nx * 15 + ux * 6, ey + ny * 15 + uy * 6], [ex - nx * 15 + ux * 6, ey - ny * 15 + uy * 6]], { c: 'soft', w: 1.8, fill: 'wash', gap: 3 }, rig);
    S.circ(px, py, 9, { c: 'ink', w: 1.5 }, rig);
    var ax = px + (ex - px) / 6, ay = py + (ey - py) / 6;
    S.circ(ax, ay, 6, { c: 'soft', w: 1.4 }, rig);
    S.arrow(ex - nx * 46, ey - ny * 46, ex - nx * 8, ey - ny * 8, { c: 'red', w: 2.2, head: 9 }, rig);
    S.arrow(ax, ay, ax + nx * 28, ay + ny * 28, { c: 'red', w: 1.9, head: 8 }, rig);
    S.rock(rig, px, py, -3.5, 3.2);
    S.dim(px + nx * 14, py + ny * 14, ex + nx * 14, ey + ny * 14, 'L pedal', { off: 12 });
    S.dim(px - nx * 18, py - ny * 18, ax - nx * 18, ay - ny * 18, '', {});
    S.text(10, 140, 'L pushrod', { color: 'soft' });
    S.text(ex - nx * 50 - 6, ey - ny * 50 - 4, 'F foot', { color: 'coral', anchor: 'end' });
    S.text(ax + nx * 28 + 8, ay + ny * 28 + 2, 'F pushrod', { color: 'coral' });
    S.text(30, 40, '6 : 1', { color: 'coral', size: 22 });
    S.text(30, 58, 'pedal ratio', { color: 'faint' });
  };

  /* PER brake calcs, balance bar pivoted a quarter of the way from the front. */
  SK['per-balancebar'] = function (S) {
    var x0 = 40, x1 = 320, p = x0 + (x1 - x0) / 4;
    S.rect(x0, 98, x1 - x0, 12, { c: 'soft', w: 1.8, fill: 'wash', gap: 4 });
    S.circ(p, 104, 9, { c: 'ink', w: 1.5 });
    var push = S.group();
    S.arrow(p, 34, p, 94, { c: 'red', w: 2.2, head: 9 }, push);
    if (!reduceMotion) push.setAttribute('class', 'sk-nudge');
    S.text(p + 8, 42, 'F pushrod', { color: 'coral' });
    S.dim(x0, 80, p, 80, 'L/4', { off: -8 });
    S.dim(p, 80, x1, 80, '3L/4', { off: -8 });
    S.line(x0, 110, x0, 128, { c: 'soft', w: 1.6 });
    S.line(x1, 110, x1, 128, { c: 'soft', w: 1.6 });
    S.rect(x0 - 26, 128, 52, 50, { c: 'soft', w: 1.7 });
    S.rect(x1 - 26, 128, 52, 50, { c: 'soft', w: 1.7 });
    S.text(x0, 150, 'front', { anchor: 'middle' });
    S.text(x0, 166, 'MC', { anchor: 'middle' });
    S.text(x1, 150, 'rear', { anchor: 'middle' });
    S.text(x1, 166, 'MC', { anchor: 'middle' });
    S.text(x0, 198, '315 lbf', { anchor: 'middle', color: 'coral' });
    S.text(x1, 198, '105 lbf', { anchor: 'middle', color: 'coral' });
    S.text(180, 150, 'one bore size', { anchor: 'middle', color: 'faint' });
    S.text(180, 166, 'for both circuits', { anchor: 'middle', color: 'faint' });
  };

  /* PER brake calcs, the two structural checks: arm bending and pushrod buckling. */
  SK['per-structure'] = function (S) {
    S.text(24, 40, 'arm cross section', { color: 'faint' });
    S.rect(30, 78, 120, 34, { c: 'soft', w: 1.8, fill: 'wash', style: 'cross-hatch', gap: 7 });
    S.dim(30, 130, 150, 130, 'b = 2 in', { off: 14 });
    S.dim(166, 78, 166, 112, 't = 0.625 in', { off: -44 });
    var x = 256;
    S.circ(x, 44, 11, { c: 'ink', w: 1.5 });
    S.circ(x, 184, 11, { c: 'ink', w: 1.5 });
    S.line(x, 50, x, 178, { c: 'soft', w: 2.4 });
    var bow = el('path', { d: 'M' + x + ',50 Q' + (x + 40) + ',114 ' + x + ',178', fill: 'none', stroke: C.coral, 'stroke-width': 1.6 * S.k, 'stroke-dasharray': '5 5' }, S.fx);
    if (!reduceMotion) {
      el('animate', {
        attributeName: 'd', dur: '3.4s', repeatCount: 'indefinite',
        values: 'M' + x + ',50 Q' + x + ',114 ' + x + ',178;M' + x + ',50 Q' + (x + 40) + ',114 ' + x + ',178;M' + x + ',50 Q' + x + ',114 ' + x + ',178'
      }, bow);
    }
    S.arrow(x, 6, x, 30, { c: 'red', w: 2, head: 8 });
    S.arrow(x, S.H - 4, x, 198, { c: 'red', w: 2, head: 8 });
    S.text(x + 10, 20, 'F', { color: 'coral', size: 14 });
    S.text(x + 26, 120, 'buckles', { color: 'coral' });
    S.text(x - 14, 120, 'pushrod', { color: 'faint', anchor: 'end' });
  };

  /* PER K&C rig: a lateral load at the contact patch steers the tire (toe change). */
  SK['kc-compliance'] = function (S) {
    var cx = 150, cy = 110;
    S.flow('M' + cx + ',22 L' + cx + ',198', { c: 'faint', dash: '4 6', still: true });
    S.rect(cx - 28, cy - 66, 56, 132, { c: 'faint', w: 1.1, rough: 0.8 });
    var tire = S.group();
    S.rect(cx - 28, cy - 66, 56, 132, { c: 'soft', w: 1.9, fill: 'wash', gap: 7 }, tire);
    S.line(cx, cy - 76, cx, cy + 76, { c: 'coral', w: 1.2, rough: 0.6 }, tire);
    S.circ(cx + 32, cy - 40, 8, { c: 'ink', w: 1.4 }, tire);
    S.circ(cx + 32, cy + 40, 8, { c: 'ink', w: 1.4 }, tire);
    S.rock(tire, cx, cy, -5, 3.4);
    S.line(cx + 34, cy - 40, 300, cy - 52, { c: 'soft', w: 2.2 });
    S.line(cx + 34, cy + 40, 300, cy + 52, { c: 'soft', w: 2.2 });
    S.circ(302, cy - 52, 9, { c: 'soft', w: 1.5 });
    S.circ(302, cy + 52, 9, { c: 'soft', w: 1.5 });
    S.line(316, 30, 316, 190, { c: 'faint', w: 1.3 });
    for (var y = 36; y < 190; y += 14) S.line(316, y, 324, y - 7, { c: 'faint', w: 1, rough: 0.7 });
    var push = S.group();
    S.arrow(30, cy, 112, cy, { c: 'red', w: 2.4, head: 10 }, push);
    if (!reduceMotion) push.setAttribute('class', 'sk-nudge');
    S.text(30, cy - 14, 'lateral load', { color: 'coral' });
    S.text(cx + 10, 18, 'toe change', { color: 'coral' });
    S.text(300, 208, 'chassis', { color: 'faint', anchor: 'middle' });
  };

  /* PER REV12 front ARB jig: notched plates seat on the frame tubes and hold both tabs. */
  SK['arb-jig'] = function (S) {
    S.rect(14, 122, S.W - 28, 22, { c: 'soft', w: 1.8, fill: 'wash', gap: 6 });
    S.path('M14,196 L' + (S.W - 14) + ',176 L' + (S.W - 14) + ',192 L14,212 Z', { c: 'soft', w: 1.6, fill: 'wash', gap: 6 });
    S.text(24, 116, 'frame tubes', { color: 'faint' });
    [150, 198].forEach(function (tx) {
      S.rect(tx, 80, 16, 42, { c: 'soft', w: 1.7, fill: 'wash', gap: 3.5 });
      S.circ(tx + 8, 94, 7, { c: 'ink', w: 1.3 });
    });
    var jig = S.group();
    S.rect(98, 60, 164, 14, { c: 'red', w: 1.8 }, jig);
    S.path('M104,74 L104,118 A16,16 0 0,0 104,148 L104,182 L120,180 L120,148 A16,16 0 0,0 120,118 L120,74', { c: 'red', w: 1.7 }, jig);
    S.path('M240,74 L240,118 A16,16 0 0,1 240,148 L240,170 L256,168 L256,148 A16,16 0 0,1 256,118 L256,74', { c: 'red', w: 1.7 }, jig);
    S.rect(98, 150, 164, 7, { c: 'red', w: 1.5 }, jig);
    if (!reduceMotion) jig.setAttribute('class', 'sk-seat');
    S.text(180, 40, 'jig, laser cut MDF', { color: 'coral', anchor: 'middle' });
    S.arrow(300, 78, 220, 92, { c: 'faint', w: 1.2, head: 6 });
    S.text(304, 82, 'ARB tabs', { color: 'soft' });
  };

  /* PER control arm tab: FEA boundary conditions, fixed at the weld, bolt load at the hole. */
  SK['tab-fea'] = function (S) {
    S.line(70, 40, 70, 180, { c: 'faint', w: 1.4 });
    for (var y = 46; y < 182; y += 12) S.line(70, y, 60, y + 8, { c: 'faint', w: 1, rough: 0.7 });
    S.path('M74,52 L282,52 L282,68 L90,68 L90,152 L282,152 L282,168 L74,168 Z', { c: 'soft', w: 1.9, fill: 'wash', gap: 7 });
    S.flow('M222,36 L222,184', { c: 'faint', dash: '3 5', still: true });
    var bow = el('path', { d: 'M90,52 Q186,52 282,52', fill: 'none', stroke: C.coral, 'stroke-width': 1.6 * S.k, 'stroke-dasharray': '5 5' }, S.fx);
    if (!reduceMotion) {
      el('animate', {
        attributeName: 'd', dur: '3.2s', repeatCount: 'indefinite',
        values: 'M90,52 Q186,52 282,52;M90,52 Q200,56 282,72;M90,52 Q186,52 282,52'
      }, bow);
    }
    [206, 222, 238].forEach(function (x) {
      S.arrow(x, 8, x, 46, { c: 'red', w: 1.8, head: 7 });
      S.arrow(x, 116, x, 148, { c: 'red', w: 1.6, head: 6 });
    });
    S.text(250, 28, 'bolt load', { color: 'coral' });
    S.text(24, 202, 'fixed along the weld', { color: 'faint' });
    S.text(292, 92, 'deflection,', { color: 'coral', size: 11 });
    S.text(292, 106, 'exaggerated', { color: 'coral', size: 11 });
  };

  /* PER control arm tab: a square edge clashes with the tube, a coped edge sits on it. */
  SK['tab-cope'] = function (S) {
    var r = 46;
    [[86, 'square edge clashes', 'coral'], [258, 'coped to the tube', 'soft']].forEach(function (p, i) {
      var cx = p[0], cy = 136, x0 = cx + 10, x1 = cx + 28;
      var yA = cy - Math.sqrt(r * r - 100), yB = cy - Math.sqrt(r * r - 28 * 28);
      S.circ(cx, cy, r * 2, { c: 'soft', w: 1.8, fill: 'wash', gap: 7 });
      S.circ(cx, cy, r * 2 - 16, { c: 'faint', w: 1.1 });
      if (i === 0) {
        S.rect(x0, 34, x1 - x0, 70, { c: 'soft', w: 1.8 });
        S.poly([[x0, yA], [x1, yB], [x1, 104], [x0, 104]], { c: 'red', w: 1.4, fill: C.redWash, style: 'solid', rough: 0.7 });
      } else {
        var g = S.group();
        S.path('M' + x0 + ',34 L' + x1 + ',34 L' + x1 + ',' + yB.toFixed(1) + ' A' + r + ',' + r + ' 0 0,0 ' + x0 + ',' + yA.toFixed(1) + ' Z', { c: 'soft', w: 1.8 }, g);
        if (!reduceMotion) g.setAttribute('class', 'sk-seat');
      }
      S.text(cx, 206, p[1], { color: p[2], anchor: 'middle' });
    });
  };

  /* ---------------- Isometric engine ----------------
     Solids are extruded profiles (plates, boxes, tubes) in 3D, projected
     isometrically and drawn back to front with rough.js. Faces get a solid
     tone from a fixed light, shadow faces get a sketchy hachure on top. */

  function v3add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function v3sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function v3mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function v3dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function v3cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function v3norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  var VIEW = [1, 1, 1];
  var LIGHT = v3norm([-0.5, 0.35, 1]);
  var TONE = {
    blue: { dark: [21, 52, 84], light: [78, 132, 178], stroke: 'soft' },
    red: { dark: [74, 40, 60], light: [190, 84, 78], stroke: 'red' },
    steel: { dark: [34, 62, 92], light: [120, 160, 196], stroke: 'ink' }
  };
  function arcPts(cx, cy, r, a0, a1, n) {
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
      out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
    return out;
  }

  function Iso(S, opt) {
    this.S = S; this.items = []; opt = opt || {};
    this.pad = opt.pad != null ? opt.pad : 16;
    this.padTop = opt.padTop != null ? opt.padTop : this.pad;
    this.padBottom = opt.padBottom != null ? opt.padBottom : this.pad;
  }
  Iso.prototype.raw = function (p) { return [(p[0] - p[1]) * 0.8660254, (p[0] + p[1]) * 0.5 - p[2]]; };

  // A flat profile in the (u, v) plane at o, extruded along u x v by depth.
  Iso.prototype.prism = function (o, u, v, profile, depth, opts) {
    opts = opts || {};
    u = v3norm(u); v = v3norm(v);
    var w = v3cross(u, v), n = profile.length, area = 0, i;
    for (i = 0; i < n; i++) { var a = profile[i], b = profile[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    var pr = area < 0 ? profile.slice().reverse() : profile;
    var P0 = pr.map(function (p) { return v3add(o, v3add(v3mul(u, p[0]), v3mul(v, p[1]))); });
    var P1 = P0.map(function (p) { return v3add(p, v3mul(w, depth)); });
    var faces = [{ pts: P0.slice().reverse(), n: v3mul(w, -1), cap: 0 }, { pts: P1, n: w, cap: 1 }];
    for (i = 0; i < n; i++) {
      var j = (i + 1) % n;
      faces.push({ pts: [P0[i], P0[j], P1[j], P1[i]], n: v3norm(v3cross(v3sub(P0[j], P0[i]), w)), side: i });
    }
    this.items.push({ kind: 'solid', faces: faces, opts: opts, P0: P0, P1: P1, o: o, u: u, v: v, w: w, depth: depth });
    return this;
  };
  Iso.prototype.box = function (p, d, opts) {
    return this.prism(p, [1, 0, 0], [0, 1, 0], [[0, 0], [d[0], 0], [d[0], d[1]], [0, d[1]]], d[2], opts);
  };
  Iso.prototype.tube = function (p0, p1, r, opts) {
    var w = v3norm(v3sub(p1, p0));
    var ref = Math.abs(w[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    var u = v3norm(v3cross(w, ref)), v = v3cross(w, u);
    var len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
    var prof = arcPts(0, 0, r, 0, 360, (opts && opts.seg) || 22).slice(0, -1);
    return this.prism(p0, u, v, prof, len, Object.assign({ smooth: true }, opts || {}));
  };
  // A disc drawn flat on a face: hole (dark) or ring (outline only).
  Iso.prototype.disc = function (c, a, b, r, opts) {
    var pts = arcPts(0, 0, r, 0, 360, 28).slice(0, -1).map(function (q) {
      return v3add(c, v3add(v3mul(a, q[0]), v3mul(b, q[1])));
    });
    this.items.push({ kind: 'disc', pts: pts, opts: opts || {} });
    return this;
  };
  Iso.prototype.patch = function (pts, opts) { this.items.push({ kind: 'patch', pts: pts, opts: opts || {} }); return this; };
  // Box edges only, for big context parts that would hide the detail behind them.
  Iso.prototype.wire = function (p, d, e) {
    var x = [p[0], p[0] + d[0]], y = [p[1], p[1] + d[1]], z = [p[2], p[2] + d[2]], self = this;
    e = e || { c: 'faint', w: 1.2, rough: 1 };
    [0, 1].forEach(function (i) { [0, 1].forEach(function (j) {
      self.line([x[0], y[i], z[j]], [x[1], y[i], z[j]], e);
      self.line([x[i], y[0], z[j]], [x[i], y[1], z[j]], e);
      self.line([x[i], y[j], z[0]], [x[i], y[j], z[1]], e);
    }); });
    return this;
  };
  Iso.prototype.line = function (p0, p1, e) { this.items.push({ kind: 'line', pts: [p0, p1], e: e }); return this; };
  Iso.prototype.arrow = function (p0, p1, e) { this.items.push({ kind: 'arrow', pts: [p0, p1], e: e }); return this; };
  Iso.prototype.dashed = function (pts, opt) { this.items.push({ kind: 'dashed', pts: pts, e: opt || {} }); return this; };
  Iso.prototype.ticks = function (p0, p1, n, e) { this.items.push({ kind: 'ticks', pts: [p0, p1], n: n, e: e || {} }); return this; };
  Iso.prototype.text = function (p, str, opt) { this.items.push({ kind: 'text', pts: [p], str: str, e: opt || {}, nofit: true }); return this; };
  Iso.prototype.ring = function (p, r, opt) { this.items.push({ kind: 'ring', pts: [p], r: r, e: opt || {}, nofit: true }); return this; };

  Iso.prototype.render = function () {
    var S = this.S, self = this;
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    this.items.forEach(function (it) {
      if (it.nofit) return;
      var pts = it.kind === 'solid' ? it.P0.concat(it.P1) : it.pts;
      pts.forEach(function (p) {
        var q = self.raw(p);
        x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]);
      });
    });
    var s = Math.min((S.W - 2 * this.pad) / (x1 - x0), (S.H - this.padTop - this.padBottom) / (y1 - y0));
    var ox = (S.W - (x1 - x0) * s) / 2 - x0 * s;
    var oy = this.padTop + ((S.H - this.padTop - this.padBottom) - (y1 - y0) * s) / 2 - y0 * s;
    var P = this.P = function (p) { var q = self.raw(p); return [ox + q[0] * s, oy + q[1] * s]; };
    this.scale = s;

    function faceOpts(fill, stroke, w, rough) {
      var o = S.o({ w: w, rough: rough });
      o.stroke = stroke; o.fill = fill; o.fillStyle = 'solid';
      return o;
    }
    function shade(name, n) {
      var T = TONE[name] || TONE.blue;
      var t = Math.max(0, Math.min(1, (v3dot(n, LIGHT) + 1) / 2));
      var c = T.dark.map(function (d, i) { return Math.round(d + (T.light[i] - d) * t); });
      return { col: 'rgb(' + c.join(',') + ')', t: t, stroke: C[T.stroke] };
    }
    function hatch(pts2) {
      var o = S.o({ w: 1, rough: 1.1 });
      o.stroke = 'none'; o.fill = 'rgba(199, 220, 239, 0.26)'; o.fillStyle = 'hachure';
      o.hachureGap = 5.5 * S.k; o.hachureAngle = -41; o.fillWeight = 0.85 * S.k;
      S.put(S.rc.polygon(pts2, o));
    }

    this.items.forEach(function (it) {
      var e = it.e || {};
      if (it.kind === 'solid') {
        var op = it.opts, tone = op.tone || 'blue';
        var into = op.alpha ? S.group(S.draw, { opacity: op.alpha }) : S.draw;
        var vis = it.faces.map(function (f) { return v3dot(f.n, VIEW) > 1e-6; });
        var list = it.faces.filter(function (f, i) { return vis[i]; });
        list.forEach(function (f) {
          f.key = f.pts.reduce(function (acc, p) { return acc + v3dot(p, VIEW); }, 0) / f.pts.length;
        });
        list.sort(function (a, b) { return a.key - b.key; });
        list.forEach(function (f) {
          var pts2 = f.pts.map(P), sh = shade(tone, f.n);
          if (op.smooth && f.side != null) {
            S.put(S.rc.polygon(pts2, faceOpts(sh.col, sh.col, 1.3, 0.2)), into);
          } else {
            S.put(S.rc.polygon(pts2, faceOpts(sh.col, sh.stroke, op.w || 1.5, op.rough != null ? op.rough : 0.85)), into);
          }
          if (!op.nohatch && sh.t < 0.5 && !(op.smooth && f.side != null)) hatch(pts2);
          if (f.cap != null && op.holes) {
            op.holes.forEach(function (h) {
              var c = v3add(it.o, v3add(v3mul(it.u, h[0]), v3mul(it.v, h[1])));
              if (f.cap === 1) c = v3add(c, v3mul(it.w, it.depth));
              var pts = arcPts(0, 0, h[2], 0, 360, 26).slice(0, -1).map(function (q) {
                return P(v3add(c, v3add(v3mul(it.u, q[0]), v3mul(it.v, q[1]))));
              });
              S.put(S.rc.polygon(pts, faceOpts(C.bgDeep, sh.stroke, 1.2, 0.5)));
            });
          }
        });
        if (op.smooth) {
          var n = it.P0.length, sideVis = [];
          for (var i = 0; i < n; i++) sideVis.push(vis[i + 2]);
          var T = TONE[tone] || TONE.blue;
          for (i = 0; i < n; i++) {
            if (sideVis[i] !== sideVis[(i - 1 + n) % n]) {
              var a = P(it.P0[i]), b = P(it.P1[i]);
              S.line(a[0], a[1], b[0], b[1], { c: T.stroke, w: op.w || 1.5, rough: 0.7 }, into);
            }
          }
        }
      } else if (it.kind === 'disc' || it.kind === 'patch') {
        var o2 = it.opts, pts2 = it.pts.map(P), fo;
        if (o2.red) {
          fo = S.o({ c: 'red', w: 1.4, rough: 0.7 });
          fo.fill = C.redWash; fo.fillStyle = 'solid';
        } else if (o2.ring) {
          fo = S.o({ c: o2.c || 'soft', w: 1.3, rough: 0.6 });
        } else {
          fo = faceOpts(C.bgDeep, C[o2.c || 'soft'], 1.2, 0.5);
        }
        S.put(S.rc.polygon(pts2, fo));
      } else if (it.kind === 'line' || it.kind === 'arrow') {
        var a2 = P(it.pts[0]), b2 = P(it.pts[1]);
        S[it.kind](a2[0], a2[1], b2[0], b2[1], e);
      } else if (it.kind === 'dashed') {
        var d = it.pts.map(function (p, i) { var q = P(p); return (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
        S.flow(d, Object.assign({ c: 'faint', dash: '4 5', still: true }, e));
      } else if (it.kind === 'ticks') {
        var p0 = it.pts[0], p1 = it.pts[1];
        for (var k = 0; k <= it.n; k++) {
          var q = P(v3add(p0, v3mul(v3sub(p1, p0), k / it.n)));
          S.line(q[0], q[1], q[0] - 7, q[1] + 7, { c: e.c || 'faint', w: 1.1, rough: 0.6 });
        }
      } else if (it.kind === 'text') {
        var t = P(it.pts[0]);
        S.text(t[0] + (e.dx || 0), t[1] + (e.dy || 0), it.str, e);
      } else if (it.kind === 'ring') {
        var c2 = P(it.pts[0]);
        S.ell(c2[0], c2[1], it.r * 2, it.r * 1.6, { c: e.c || 'red', w: 1.8, rough: 1.2 }, S.fx);
      }
    });
    return this;
  };

  // A tube split into segments, so other parts can be layered between them.
  function tubeSegs(I, x0, x1, y, z, r, cuts, opts) {
    var pts = [x0].concat(cuts, [x1]), out = [];
    for (var i = 0; i < pts.length - 1; i++) out.push([pts[i], pts[i + 1]]);
    return out.map(function (s) { return function () { I.tube([s[0], y, z], [s[1], y, z], r, opts); }; });
  }

  /* ---- Isometric redraws of the PER figures ---- */

  /* K&C: last season's rig, redrawn from the shop photos. */
  SK['kc-iso-oldrig'] = function (S) {
    var I = new Iso(S, { padTop: 30, padBottom: 26 });
    I.box([-110, 0, 20], [70, 130, 70], {});
    I.tube([-40, 40, 38], [40, 62, 42], 3.2, {});
    I.tube([-40, 90, 38], [40, 66, 42], 3.2, {});
    I.tube([-40, 40, 78], [40, 62, 74], 3.2, {});
    I.tube([-40, 90, 78], [40, 66, 74], 3.2, {});
    I.prism([96, 22, 2], [1, 0, 0], [0, 0, 1], [[0, 0], [44, 0], [0, 70]], 4, { tone: 'steel' });
    I.box([60, 14, -4], [70, 102, 6], { tone: 'steel' });
    I.tube([40, 64, 58], [60, 64, 58], 18, {});
    I.prism([60, 64, 0], [0, 1, 0], [0, 0, 1], [[-40, 2], [40, 2], [26, 98], [-26, 98]], 5, { tone: 'steel', holes: [[0, 58, 6]] });
    I.prism([66, 102, 2], [1, 0, 0], [0, 0, 1], [[0, 0], [44, 0], [0, 70]], 4, { tone: 'steel' });
    I.box([60, 60, 100], [8, 8, 34], { tone: 'steel' });
    I.box([-130, 60, 134], [210, 8, 8], { tone: 'steel' });
    I.arrow([130, 64, 4], [220, 64, 4], { c: 'red', w: 2.2, head: 9 });
    I.text([215, 64, 4], 'ratchet strap', { color: 'coral', dy: 22, anchor: 'end' });
    I.text([-130, 64, 142], 'clamped extrusion', { color: 'faint', dy: -10 });
    I.text([62, 64, 98], 'rig on the hub', { color: 'soft', dx: 16, dy: -16 });
    I.text([-110, 130, 20], 'chassis', { color: 'faint', dx: -10, dy: 6, anchor: 'end' });
    I.ring([50, 64, 58], 30, { c: 'red' });
    I.text([50, 64, 30], 'wheel steered and spun', { color: 'coral', dx: -40, dy: 40, anchor: 'end' });
    I.render();
  };

  /* K&C: the shim stack locking the steering rack. */
  SK['kc-iso-shims'] = function (S) {
    var I = new Iso(S, { padTop: 34, padBottom: 30 });
    I.tube([-130, 0, 0], [-26, 0, 0], 22, {});
    I.tube([-26, 0, 0], [-20, 0, 0], 13, {});
    I.tube([-20, 0, 0], [60, 0, 0], 9, { tone: 'steel' });
    var slot = [[30, -32], [30, 40], [9.4, 40]].concat(arcPts(0, 0, 9.4, 0, -180, 10).map(function (p) { return [p[0], p[1]]; }), [[-9.4, 40], [-30, 40], [-30, -32]]);
    var x = -20;
    [7.5, 7.5, 7.5, 7.5, 7.5, 3.75, 1.9].forEach(function (t, i) {
      I.prism([x, 0, 0], [0, 1, 0], [0, 0, 1], slot, t - 0.6, { tone: 'red', nohatch: true, w: 1.3 });
      x += t;
    });
    I.box([x + 1, -14, -14], [30, 28, 28], { tone: 'steel' });
    I.tube([x + 16, -18, 0], [x + 16, 18, 0], 4, { tone: 'blue' });
    I.tube([x + 31, 0, 0], [x + 90, 0, 0], 6, { tone: 'steel' });
    I.line([-20, -30, 52], [x, -30, 52], { c: 'faint', w: 1.2 });
    I.line([-20, -30, 46], [-20, -30, 58], { c: 'faint', w: 1.2 });
    I.line([x, -30, 46], [x, -30, 58], { c: 'faint', w: 1.2 });
    I.text([x, -30, 58], '1.45 in', { color: 'soft', dx: 8, dy: -6 });
    I.text([-130, 0, -22], 'rack housing', { color: 'faint', dy: 20 });
    I.text([x - 8, 30, -32], '1/4, 1/8, 1/16 in shims', { color: 'coral', dy: 24, anchor: 'middle' });
    I.text([x + 30, 0, 14], 'clevis', { color: 'faint', dx: 6, dy: -12 });
    I.render();
  };

  /* K&C: rig plate on the hub, spacer to the caliper mount. */
  SK['kc-iso-hub'] = function (S) {
    var I = new Iso(S, { padTop: 26, padBottom: 30 });
    I.tube([-120, -20, 30], [-30, 0, 34], 3.4, {});
    I.tube([-120, 30, 30], [-30, 6, 34], 3.4, {});
    I.tube([-120, -20, -30], [-30, 0, -16], 3.4, {});
    I.tube([-120, 30, -30], [-30, 6, -16], 3.4, {});
    I.box([-34, -14, -24], [16, 28, 66], {});
    I.tube([-18, 0, 10], [0, 0, 10], 24, {});
    I.tube([0, 0, 10], [10, 0, 10], 36, {});
    I.box([-18, 30, 38], [20, 16, 16], {});
    I.tube([2, 38, 46], [18, 38, 46], 5, { tone: 'red' });
    I.prism([18, -44, -60], [1, 0, 0], [0, 0, 1], [[0, 0], [55, 0], [0, 100]], 5, { tone: 'steel' });
    var holes = [[0, 10, 11], [38, 46, 5]];
    for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3 + 0.5; holes.push([30 * Math.cos(a), 10 + 30 * Math.sin(a), 3.4]); }
    I.prism([18, 0, 0], [0, 1, 0], [0, 0, 1], [[-70, -60], [70, -60], [48, 75], [-48, 75]], 5, { tone: 'steel', holes: holes });
    I.prism([18, 44, -60], [1, 0, 0], [0, 0, 1], [[0, 0], [55, 0], [0, 100]], 5, { tone: 'steel' });
    I.text([18, 60, 75], 'spacer to caliper mount', { color: 'coral', dx: 10, dy: -6 });
    I.text([23, 70, -60], 'rig plate, rotor and caliper off', { color: 'faint', dx: -4, dy: 26, anchor: 'middle' });
    I.text([-120, -20, 30], 'upright and hub, behind', { color: 'faint', dx: 6, dy: -14 });
    I.render();
  };

  /* K&C: the full loading setup, I-beam, bracket, turnbuckle and load cell into the rig. */
  SK['kc-iso-setup'] = function (S) {
    var I = new Iso(S, { padTop: 34, padBottom: 30 });
    var Ip = [[-15, 0], [15, 0], [15, 4], [2, 4], [2, 26], [15, 26], [15, 30], [-15, 30], [-15, 26], [-2, 26], [-2, 4], [-15, 4]];
    [[-50, 40], [50, 40]].forEach(function (p) { I.tube([p[0], p[1], 0], [p[0], p[1], 60], 3.5, {}); });
    I.prism([-160, 100, 0], [0, 1, 0], [0, 0, 1], Ip, 250, { tone: 'steel' });
    I.wire([-65, 20, 60], [130, 180, 60]);
    I.prism([10, 100, 30], [1, 0, 0], [0, 0, 1], [[0, 0], [14, 0], [14, 28], [0, 22]], 4, { tone: 'red' });
    I.prism([-6, 86, 30], [1, 0, 0], [0, 1, 0], [[0, 0], [30, 0], [30, 28], [0, 28]], 4, { tone: 'red' });
    I.tube([24, 100, 48], [62, 100, 48], 3, { tone: 'steel' });
    I.box([62, 92, 40], [16, 16, 16], { tone: 'red' });
    I.tube([78, 100, 48], [124, 100, 48], 5, { tone: 'steel' });
    I.tube([65, 85, 82], [110, 100, 74], 3, {});
    I.tube([65, 115, 82], [110, 100, 74], 3, {});
    I.tube([100, 100, 72], [124, 100, 72], 20, {});
    [[-50, 180], [50, 180]].forEach(function (p) { I.tube([p[0], p[1], 0], [p[0], p[1], 60], 3.5, {}); });
    I.prism([150, 62, 4], [1, 0, 0], [0, 0, 1], [[0, 0], [-26, 0], [0, 76]], 4, { tone: 'steel' });
    I.prism([124, 100, 0], [0, 1, 0], [0, 0, 1], [[-42, 4], [42, 4], [28, 112], [-28, 112]], 5, { tone: 'steel' });
    I.box([120, 56, 0], [42, 88, 4], { tone: 'steel' });
    I.prism([150, 140, 4], [1, 0, 0], [0, 0, 1], [[0, 0], [-26, 0], [0, 76]], 4, { tone: 'steel' });
    I.arrow([110, 100, 160], [40, 100, 160], { c: 'red', w: 2.2, head: 9 });
    I.text([75, 100, 160], '~2700 N', { color: 'coral', size: 16, anchor: 'middle', dy: -12 });
    I.text([78, 108, 40], 'load cell', { color: 'coral', dx: -20, dy: 34, anchor: 'end' });
    I.text([10, 100, 58], 'bracket', { color: 'coral', dx: -6, dy: -8, anchor: 'end' });
    I.text([-160, 115, 0], 'I-beam', { color: 'faint', dx: -4, dy: 22 });
    I.text([162, 144, 0], 'rig', { color: 'soft', dx: 6, dy: 14 });
    I.text([-65, 20, 120], 'chassis on jack stands', { color: 'faint', dx: -6, dy: -8 });
    I.render();
  };

  /* K&C: proposed bracket from the I-beam up to the rig. */
  SK['kc-iso-bracket'] = function (S) {
    var I = new Iso(S, { padTop: 30, padBottom: 40 });
    var Ip = [[-20, 0], [20, 0], [20, 5], [3, 5], [3, 35], [20, 35], [20, 40], [-20, 40], [-20, 35], [-3, 35], [-3, 5], [-20, 5]];
    I.prism([-60, 0, 0], [0, 1, 0], [0, 0, 1], Ip, 200, { tone: 'steel' });
    I.prism([90, -22, 40], [1, 0, 0], [0, 1, 0], [[0, 0], [40, 0], [40, 44], [0, 44]], 5, { tone: 'red', holes: [[10, 10, 3.5], [30, 10, 3.5], [10, 34, 3.5], [30, 34, 3.5]] });
    I.prism([126, 0, 45], [0, 1, 0], [0, 0, 1], [[-22, 0], [22, 0], [22, 80], [-22, 92]], 5, { tone: 'red', holes: [[0, 62, 5]] });
    I.prism([90, 0, 45], [1, 0, 0], [0, 0, 1], [[0, 0], [36, 0], [36, 60]], 4, { tone: 'red' });
    I.dashed([[131, 0, 107], [131, 0, 160]], { c: 'faint' });
    I.text([131, 0, 160], 'up to the rig', { color: 'faint', dx: 8, dy: 4 });
    I.text([90, -22, 44], 'bolted to the flange', { color: 'faint', dx: -12, dy: -14, anchor: 'end' });
    I.text([-60, 0, 40], 'proposed bracket, sized with FEA', { color: 'coral', dy: -24 });
    I.text([140, 20, 0], 'I-beam', { color: 'faint', dx: 8, dy: 10 });
    I.render();
  };

  // The C shaped double shear tab, as a profile in (y, z) extruded along x.
  var CTAB = [[10, -40], [80, -40], [80, -34], [16, -34], [16, 24], [80, 24], [80, 30], [10, 30]];

  /* Control arm tab: C tab clashing with the frame tube. */
  SK['tab-iso-clash'] = function (S) {
    var I = new Iso(S, { padTop: 26, padBottom: 30 });
    I.tube([-70, 0, 32], [40, 0, 32], 20, {});
    I.prism([0, 0, 0], [0, 1, 0], [0, 0, 1], CTAB, 40, { tone: 'steel' });
    I.disc([20, 56, 30.2], [1, 0, 0], [0, 1, 0], 7, {});
    I.tube([40, 0, 32], [110, 0, 32], 20, {});
    var ov = [[10, 30], [10, 14.7], [13, 16.8], [16, 20], [18, 23.3], [19.5, 27.6], [19.9, 30]];
    I.patch(ov.map(function (p) { return [40.4, p[0], p[1]]; }), { red: true });
    I.ring([40, 15, 24], 30, { c: 'red' });
    I.text([40, 15, 24], 'clashes with the tube', { color: 'coral', dx: 40, dy: -26 });
    I.text([110, 0, 32], 'frame tube', { color: 'faint', dy: 40, anchor: 'end' });
    I.text([0, 80, -40], 'first C shaped tab', { color: 'faint', dx: -10, dy: 26, anchor: 'end' });
    I.render();
  };

  /* Control arm tab: FEA setup, mesh on the faces, fixed weld edges, bolt load at the holes. */
  SK['tab-iso-fea'] = function (S) {
    var I = new Iso(S, { padTop: 30, padBottom: 30 });
    I.prism([0, 0, 0], [0, 1, 0], [0, 0, 1], CTAB, 40, { tone: 'steel', nohatch: true });
    var e = { c: 'faint', w: 0.7, rough: 0.4 };
    var x, y, z;
    for (x = 0; x <= 40; x += 10) I.line([x, 16, 30], [x, 80, 30], e);
    for (y = 16; y <= 80; y += 10.67) I.line([0, y, 30], [40, y, 30], e);
    for (x = 0; x < 40; x += 10) for (y = 16; y < 79; y += 10.67) I.line([x, y, 30], [x + 10, y + 10.67, 30], e);
    for (x = 0; x <= 40; x += 10) I.line([x, 16, -34], [x, 16, 24], e);
    for (z = -34; z <= 24; z += 9.67) I.line([0, 16, z], [40, 16, z], e);
    I.disc([20, 56, 30.2], [1, 0, 0], [0, 1, 0], 7, {});
    I.disc([20, 56, -33.8], [1, 0, 0], [0, 1, 0], 7, {});
    [-8, 0, 8].forEach(function (d) {
      I.arrow([20 + d, 56, 78], [20 + d, 56, 36], { c: 'red', w: 1.9, head: 7 });
      I.arrow([20 + d, 56, -10], [20 + d, 56, -30], { c: 'red', w: 1.6, head: 6 });
    });
    I.ticks([40, 10, -40], [40, 10, 30], 8, { c: 'faint' });
    I.text([28, 56, 78], 'bolt load', { color: 'coral', dx: 10, dy: 4 });
    I.text([40, 10, -40], 'fixed along the weld', { color: 'faint', dx: -16, dy: 30 });
    I.text([0, 80, 30], 'tetrahedral mesh', { color: 'soft', dx: -10, dy: 6, anchor: 'end' });
    I.render();
  };

  /* Control arm tab: the revised bent tab with its coped edge sitting on the tube. */
  SK['tab-iso-final'] = function (S) {
    var I = new Iso(S, { padTop: 26, padBottom: 30 });
    var cope = arcPts(35, 72, 31.8, -43.8, -136.2, 14);
    var r = Math.hypot(23, 22);
    I.tube([35, -80, 72], [35, -6, 72], r, {});
    var vprof = [[0, 0], [70, 0], [70, 50]].concat(cope, [[0, 50]]);
    I.prism([0, 0, 0], [1, 0, 0], [0, 0, 1], vprof, 5, { tone: 'steel' });
    var hprof = [[0, 0], [70, 0], [70, 35]].concat(arcPts(50, 35, 20, 0, 90, 8), [[0, 55]]);
    I.prism([0, 0, 0], [1, 0, 0], [0, 1, 0], hprof, 5, { tone: 'steel', holes: [[45, 30, 8]] });
    I.tube([35, 0, 72], [35, 60, 72], r, { nohatch: true, alpha: 0.38 });
    I.text([35, 60, 72], 'frame tube', { color: 'faint', dx: -40, dy: -46 });
    I.text([70, 0, 50], 'coped edge', { color: 'coral', dx: 14, dy: 4 });
    I.text([70, 0, 0], 'revised bent tab', { color: 'faint', dx: 14, dy: 10 });
    I.render();
  };

  /* ARB jig: the jig seated on the frame tubes, holding the tabs. */
  function arbUpright() {
    var p = [[-20, -20], [25, -20], [25, 84], [-20, 84], [-20, 70], [0, 70]];
    p = p.concat(arcPts(0, 60, 10, 90, -90, 10).slice(1), [[-20, 50], [-20, 10], [0, 10]]);
    p = p.concat(arcPts(0, 0, 10, 90, -90, 10).slice(1), [[-20, -10]]);
    return p;
  }
  var ARB_TAB = [[-8, 0], [8, 0], [8, 22]].concat(arcPts(0, 22, 8, 0, 180, 8).slice(1), [[-8, 22]]);
  function tabProf(z0, z1) {
    var top = ARB_TAB.map(function (p) { return [p[0], p[1] + 68]; });
    return top.map(function (p) { return [p[0], Math.max(z0, Math.min(z1, p[1]))]; });
  }

  SK['arb-iso'] = function (S) {
    var I = new Iso(S, { padTop: 30, padBottom: 28 });
    var up = arbUpright(), tabsX = [-42, -30, 27, 39];
    var lo = tubeSegs(I, -150, 150, 0, 0, 10, [-60, 60], {});
    var hi = tubeSegs(I, -150, 150, 0, 60, 10, [-60, 60], {});
    lo[0](); hi[0]();
    I.prism([-60, 0, 0], [0, 1, 0], [0, 0, 1], up, 5, { tone: 'red' });
    lo[1]();
    I.box([-55, -15, 30], [110, 40, 4], { tone: 'red' });
    hi[1]();
    tabsX.forEach(function (x) { I.prism([x, 0, 0], [0, 1, 0], [0, 0, 1], tabProf(68, 84), 3, { tone: 'steel', nohatch: true }); });
    I.prism([55, 0, 0], [0, 1, 0], [0, 0, 1], up, 5, { tone: 'red' });
    I.box([-66, -16, 84], [132, 42, 5], { tone: 'red' });
    tabsX.forEach(function (x) {
      I.prism([x, 0, 0], [0, 1, 0], [0, 0, 1], tabProf(89, 100), 3, { tone: 'steel', nohatch: true, holes: [[0, 90, 3.6]] });
    });
    lo[2](); hi[2]();
    I.text([-66, -16, 89], 'jig, laser cut MDF', { color: 'coral', dx: -6, dy: -30 });
    I.text([39, 0, 100], 'ARB tabs', { color: 'soft', dx: 16, dy: -12 });
    I.text([150, 0, 0], 'frame tubes', { color: 'faint', dy: 30, anchor: 'end' });
    I.text([-60, -20, 84], 'notches find the tubes', { color: 'faint', dx: -12, dy: 4, anchor: 'end' });
    I.render();
  };

  /* ARB jig: exploded, every part is a flat sheet. */
  SK['arb-iso-parts'] = function (S) {
    var I = new Iso(S, { padTop: 28, padBottom: 28 });
    var up = arbUpright();
    I.prism([-60, 0, 0], [0, 1, 0], [0, 0, 1], up, 5, { tone: 'red' });
    I.box([-55, -15, 30], [110, 40, 4], { tone: 'red' });
    I.prism([55, 0, 0], [0, 1, 0], [0, 0, 1], up, 5, { tone: 'red' });
    I.box([-66, -16, 150], [132, 42, 5], { tone: 'red' });
    [[-36, 0], [33, 0]].forEach(function (p) {
      I.patch([[p[0] - 9, -9, 155.3], [p[0] + 9, -9, 155.3], [p[0] + 9, 9, 155.3], [p[0] - 9, 9, 155.3]], {});
    });
    [[-66, -16], [66, -16], [66, 26], [-66, 26]].forEach(function (c) { I.dashed([[c[0], c[1], 148], [c[0], c[1], 92]]); });
    I.dashed(arcPts(0, 0, 10, 0, 360, 24).map(function (p) { return [-60, p[0], p[1] + 60]; }));
    I.dashed(arcPts(0, 0, 10, 0, 360, 24).map(function (p) { return [-60, p[0], p[1]]; }));
    I.dashed(arcPts(0, 0, 10, 0, 360, 24).map(function (p) { return [60, p[0], p[1] + 60]; }));
    I.dashed(arcPts(0, 0, 10, 0, 360, 24).map(function (p) { return [60, p[0], p[1]]; }));
    I.text([66, 26, 155], 'slotted top plate', { color: 'coral', dx: 10, dy: 6 });
    I.text([60, 25, 0], 'notched uprights', { color: 'faint', dx: 10, dy: 20 });
    I.text([55, 25, 34], 'cross plate', { color: 'faint', dx: 14, dy: 4 });
    I.render();
  };

  /* RIPPLE, dependency graph: one plant, one precursor, six antibiotics. */
  SK['ripple-precursor'] = function (S) {
    S.factory(12, 92, { c: 'red', fill: C.redWash });
    S.text(37, 158, 'one plant', { color: 'coral', anchor: 'middle' });
    S.arrow(66, 118, 104, 112, { c: 'red', w: 1.8, head: 7 });
    S.circ(130, 110, 44, { c: 'soft', w: 1.9, fill: 'wash', gap: 5 });
    S.text(130, 115, '6-APA', { anchor: 'middle', size: 11 });
    var drugs = ['amoxicillin', 'ampicillin', 'piperacillin', 'dicloxacillin', 'nafcillin', 'oxacillin'];
    drugs.forEach(function (name, i) {
      var y = 24 + i * 34, d = 'M152,110 C200,110 210,' + y + ' 252,' + y;
      S.path(d, { c: 'faint', w: 1.3 });
      S.circ(258, y, 10, { c: 'soft', w: 1.5 });
      S.text(270, y + 4, name, { size: 11.5 });
      var id = S.motionPath(d);
      var pulse = S.group(S.fx);
      el('circle', { r: 2.8 * S.k, fill: C.coral }, pulse);
      S.mover(pulse, id, 2.4, -i * 0.4, { park: 0.6 });
    });
  };

  /* RIPPLE, reroute: a plant goes down and the model picks the next best supplier. */
  SK['ripple-reroute'] = function (S) {
    S.factory(20, 22);
    S.line(16, 16, 76, 70, { c: 'red', w: 2.4 });
    S.line(76, 16, 16, 70, { c: 'red', w: 2.4 });
    S.text(46, 88, 'shut down', { anchor: 'middle', color: 'coral' });
    S.factory(20, 118);
    S.text(46, 184, 'alternate', { anchor: 'middle' });
    S.flow('M76,44 C190,44 250,74 318,90', { c: 'faint', w: 1.4, dash: '3 8', still: true });
    S.line(190, 50, 204, 64, { c: 'red', w: 1.6 });
    S.line(204, 50, 190, 64, { c: 'red', w: 1.6 });
    S.path('M76,148 C190,148 250,118 318,104', { c: 'red', w: 2 });
    S.flow('M76,148 C190,148 250,118 318,104', { c: 'coral', w: 2.2, dash: '4 9' });
    S.circ(338, 98, 38, { c: 'soft', w: 1.9, fill: 'wash', gap: 5 });
    S.text(338, 103, 'drug', { anchor: 'middle', size: 11 });
    S.text(200, 158, 'new route', { color: 'coral', anchor: 'middle' });
    S.text(250, 30, 'old route', { color: 'faint', anchor: 'middle' });
  };

  /* RIPPLE, cold chain sensor node. */
  SK['ripple-sensor'] = function (S) {
    S.rect(34, 62, 136, 74, { c: 'soft', w: 1.8 });
    for (var x = 42; x <= 160; x += 12) {
      S.line(x, 62, x, 54, { c: 'faint', w: 1.1, rough: 0.6 });
      S.line(x, 136, x, 144, { c: 'faint', w: 1.1, rough: 0.6 });
    }
    S.rect(70, 80, 50, 38, { c: 'soft', w: 1.5, fill: 'wash', gap: 4 });
    S.text(95, 104, 'ESP32', { anchor: 'middle', size: 11 });
    S.path('M150,72 l6,-6 l6,6 l6,-6 l6,6', { c: 'soft', w: 1.4 });
    for (var i = 0; i < 3; i++) {
      var r = 16 + i * 14;
      var arc = el('path', {
        d: 'M' + (176 + r * 0.7) + ',' + (60 - r * 0.7) + ' A ' + r + ',' + r + ' 0 0,1 ' + (176 + r) + ',' + (60 + r * 0.15),
        fill: 'none', stroke: C.faint, 'stroke-width': 1.5 * S.k, 'stroke-linecap': 'round'
      }, S.fx);
      if (!reduceMotion) { arc.setAttribute('class', 'sk-pulse'); arc.style.animationDelay = (i * 0.35) + 's'; }
    }
    S.rect(262, 34, 16, 86, { c: 'soft', w: 1.7 });
    S.circ(270, 132, 28, { c: 'red', w: 1.8, fill: C.redWash, style: 'solid' });
    S.line(270, 120, 270, 70, { c: 'red', w: 3 });
    for (var y = 44; y <= 110; y += 11) S.line(278, y, 284, y, { c: 'faint', w: 1, rough: 0.5 });
    S.path('M170,120 C210,120 220,150 256,138', { c: 'faint', w: 1.4 });
    S.text(218, 28, 'streams', { color: 'faint', anchor: 'middle' });
    S.text(270, 170, 'probe', { anchor: 'middle', color: 'coral' });
    S.text(102, 166, 'sensor node', { anchor: 'middle', color: 'faint' });
  };

  /* G.E.A.R.: the kart in side view, air arriving at the front panel. */
  SK['gear-kart'] = function (S) {
    S.ground(10, S.W - 10, 170, 16);
    for (var i = 0; i < 4; i++) {
      var y = 70 + i * 22;
      S.flow('M0,' + y + ' C60,' + y + ' 110,' + (y - 18 + i * 3) + ' 170,' + (y - 22 + i * 4) + ' S300,' + (y - 12) + ' ' + S.W + ',' + (y - 10), { c: 'faint', w: 1.3 });
    }
    S.line(84, 152, 306, 152, { c: 'soft', w: 2 });
    S.line(112, 146, 290, 146, { c: 'soft', w: 1.4 });
    S.poly([[40, 156], [56, 142], [126, 118], [138, 128], [72, 156]], { c: 'red', w: 2, fill: C.redWash, style: 'hachure', gap: 4 });
    S.wheel(98, 152, 32, 1.1, true);
    S.wheel(290, 148, 42, 1.4, true);
    S.line(158, 146, 178, 104, { c: 'soft', w: 1.6 });
    S.ell(180, 100, 28, 9, { c: 'soft', w: 1.5 });
    S.path('M212,148 C214,120 218,106 240,98', { c: 'soft', w: 1.8 });
    S.rect(252, 114, 30, 24, { c: 'faint', w: 1.4, fill: 'wash', gap: 4 });
    S.circ(226, 60, 28, { c: 'soft', w: 1.7, fill: 'wash', gap: 5 });
    S.line(214, 60, 234, 56, { c: 'faint', w: 1.3 });
    S.path('M224,74 L220,122', { c: 'faint', w: 1.6 });
    S.path('M222,88 L184,98', { c: 'faint', w: 1.5 });
    S.path('M220,122 L164,138', { c: 'faint', w: 1.5 });
    S.text(24, 108, 'front panel', { color: 'coral' });
    S.line(58, 112, 72, 136, { c: 'red', w: 1, rough: 0.6 });
    S.text(S.W - 10, 40, 'airflow', { color: 'faint', anchor: 'end' });
  };

  /* G.E.A.R.: flow over the panel, drag backward and downforce down. */
  SK['gear-airflow'] = function (S) {
    S.ground(10, S.W - 10, 192, 16);
    S.arrow(14, 34, 64, 34, { c: 'faint', w: 1.5, head: 7 });
    S.text(70, 39, 'v', { color: 'soft', size: 15 });
    var panel = 'M52,176 C84,130 142,114 196,122 L204,136 C156,132 110,146 80,178 Z';
    [[60, 0], [82, 6], [104, 12], [126, 18]].forEach(function (s, i) {
      var y = s[0];
      S.flow('M0,' + y + ' C70,' + y + ' 110,' + (y - 22 + s[1]) + ' 190,' + (y - 18 + s[1]) + ' S300,' + (y + 8) + ' ' + S.W + ',' + (y + 12), { c: 'faint', w: 1.4 });
    });
    S.path(panel, { c: 'red', w: 2, fill: C.redWash, style: 'hachure', gap: 4 });
    [[262, 158, 13], [296, 168, 10], [326, 158, 8]].forEach(function (e) {
      S.path('M' + (e[0] + e[2]) + ',' + e[1] + ' A' + e[2] + ',' + e[2] + ' 0 1,0 ' + e[0] + ',' + (e[1] + e[2]), { c: 'faint', w: 1.3, rough: 0.6 });
      S.path('M' + (e[0] + e[2] * 0.45) + ',' + e[1] + ' A' + (e[2] * 0.45) + ',' + (e[2] * 0.45) + ' 0 1,0 ' + e[0] + ',' + (e[1] + e[2] * 0.45), { c: 'faint', w: 1.1, rough: 0.5 });
    });
    S.text(292, 132, 'wake', { color: 'faint', anchor: 'middle' });
    S.circ(128, 148, 6, { c: 'ink', w: 1.4 });
    S.arrow(132, 148, 232, 148, { c: 'red', w: 2.2, head: 9 });
    S.text(236, 144, 'drag', { color: 'coral' });
    S.arrow(128, 152, 128, 206, { c: 'red', w: 2.2, head: 9 });
    S.text(136, 206, 'downforce', { color: 'coral' });
  };

  /* G.E.A.R.: the wind tunnel, model on a force balance. */
  SK['gear-tunnel'] = function (S) {
    S.path('M8,26 C40,30 62,56 84,62', { c: 'soft', w: 1.8 });
    S.path('M8,184 C40,180 62,154 84,148', { c: 'soft', w: 1.8 });
    S.rect(16, 42, 18, 126, { c: 'faint', w: 1.3, fill: 'wash', style: 'cross-hatch', gap: 5 });
    S.line(84, 62, 268, 62, { c: 'soft', w: 1.8 });
    S.line(84, 148, 268, 148, { c: 'soft', w: 1.8 });
    S.line(268, 62, 318, 44, { c: 'soft', w: 1.8 });
    S.line(268, 148, 318, 166, { c: 'soft', w: 1.8 });
    [82, 100].forEach(function (y) { S.flow('M40,' + y + ' L262,' + y, { c: 'faint', w: 1.3 }); });
    S.flow('M40,138 L150,138', { c: 'faint', w: 1.3 });
    S.rect(158, 114, 62, 18, { c: 'soft', w: 1.7, fill: 'wash', gap: 4 });
    S.poly([[150, 132], [158, 120], [170, 114], [170, 132]], { c: 'red', w: 1.7, fill: C.redWash, style: 'solid' });
    S.circ(170, 134, 10, { c: 'soft', w: 1.4 });
    S.circ(210, 134, 10, { c: 'soft', w: 1.4 });
    S.line(190, 140, 190, 170, { c: 'soft', w: 2 });
    S.rect(166, 170, 48, 22, { c: 'red', w: 1.7 });
    var fan = S.group();
    S.circ(344, 105, 58, { c: 'soft', w: 1.8 }, fan);
    for (var i = 0; i < 4; i++) {
      var a = i * Math.PI / 2;
      S.path('M344,105 Q' + (344 + Math.cos(a + 0.5) * 22) + ',' + (105 + Math.sin(a + 0.5) * 22) + ' ' +
        (344 + Math.cos(a) * 26) + ',' + (105 + Math.sin(a) * 26), { c: 'faint', w: 1.6 }, fan);
    }
    S.spin(fan, 344, 105, 1.3);
    S.text(25, 204, 'flow straightener', { color: 'faint' });
    S.text(176, 56, 'test section', { color: 'faint', anchor: 'middle' });
    S.text(190, 208, 'force balance', { color: 'coral', anchor: 'middle' });
    S.text(344, 26, 'fan', { color: 'faint', anchor: 'middle' });
  };

  /* ---------------- Build and reveal ---------------- */

  function reveal(S) {
    if (reduceMotion || !window.anime || !anime.createDrawable) return;
    var paths = S.draw.querySelectorAll('path');
    if (!paths.length) return;
    var drawables = anime.createDrawable(paths);
    [S.fx, S.lab].forEach(function (g) { g.style.opacity = '0'; });
    var n = paths.length;
    var a1 = anime.animate(drawables, {
      draw: ['0 0', '0 1'],
      duration: 1100,
      delay: anime.stagger(Math.max(6, Math.min(34, 1300 / n))),
      ease: 'inOutQuad',
      autoplay: false
    });
    var a2 = anime.animate([S.fx, S.lab], {
      opacity: [0, 1],
      duration: 700,
      delay: 950,
      ease: 'outQuad',
      autoplay: false
    });
    var go = function () { a1.play(); a2.play(); };
    if (!('IntersectionObserver' in window)) { go(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); go(); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(S.svg);
  }

  function init() {
    document.querySelectorAll('svg[data-sketch]').forEach(function (svg) {
      var fn = SK[svg.getAttribute('data-sketch')];
      if (!fn || svg.getAttribute('data-built')) return;
      var S = new Ctx(svg);
      fn(S);
      svg.setAttribute('data-built', '1');
      reveal(S);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
