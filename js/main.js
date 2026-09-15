(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Hanging badge swing ---------------- */

  var badgeRig = document.querySelector('.badge-rig');
  var badge = document.getElementById('badge');

  function triggerSwing() {
    if (!badgeRig || reduceMotion) return;
    badgeRig.classList.remove('swing');
    void badgeRig.offsetWidth;
    badgeRig.classList.add('swing');
  }

  if (badge) {
    badge.addEventListener('click', triggerSwing);
    badge.addEventListener('pointerenter', triggerSwing);
    if (badgeRig) {
      badgeRig.addEventListener('animationend', function (e) {
        if (e.animationName === 'swing') badgeRig.classList.remove('swing');
      });
    }
  }

  /* ---------------- Credential tags (tear to reveal) ---------------- */

  document.querySelectorAll('.cred-tag').forEach(function (tag) {
    tag.addEventListener('click', function () {
      var isTorn = tag.classList.toggle('torn');
      tag.setAttribute('aria-expanded', isTorn ? 'true' : 'false');
    });
  });

  /* ---------------- Split-flap role display ---------------- */

  var roles = [
    'MECH E @ PENN       ',
    'PENN ELECTRIC RACING',
    'NASA SEES ALUM      ',
    'PUBLISHED RESEARCHER'
  ];

  var flipCellsEl = document.getElementById('flipCells');
  var flipBoard = document.getElementById('flipBoard');
  var roleIndex = 0;
  var current = roles[0].split('');
  var flipping = false;

  function buildCells() {
    if (!flipCellsEl) return;
    flipCellsEl.innerHTML = '';
    current.forEach(function (ch) {
      var cell = document.createElement('span');
      cell.className = 'flap-cell';
      var rotor = document.createElement('span');
      rotor.className = 'flap-rotor';
      rotor.textContent = ch;
      cell.appendChild(rotor);
      flipCellsEl.appendChild(cell);
    });
  }

  function flipTo(nextRole) {
    if (!flipCellsEl || flipping) return;
    flipping = true;
    var next = nextRole.split('');
    var cells = flipCellsEl.querySelectorAll('.flap-rotor');
    var delayStep = reduceMotion ? 0 : 14;
    var half = reduceMotion ? 1 : 130;

    cells.forEach(function (rotor, i) {
      if (current[i] === next[i]) return;
      setTimeout(function () {
        rotor.style.transition = 'transform ' + half + 'ms ease-in';
        rotor.style.transform = 'rotateX(90deg)';
        setTimeout(function () {
          rotor.textContent = next[i];
          rotor.style.transition = 'transform ' + half + 'ms ease-out';
          rotor.style.transform = 'rotateX(0deg)';
        }, half);
      }, i * delayStep);
    });

    current = next;
    setTimeout(function () { flipping = false; }, cells.length * delayStep + half * 2 + 40);
  }

  if (flipBoard) {
    buildCells();
    flipBoard.addEventListener('click', function () {
      roleIndex = (roleIndex + 1) % roles.length;
      flipTo(roles[roleIndex]);
    });
  }
})();
