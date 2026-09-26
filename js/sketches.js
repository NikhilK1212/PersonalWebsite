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
