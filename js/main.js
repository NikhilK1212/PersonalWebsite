(function () {
  'use strict';

  /* ---------------- Credential tags (tear to reveal) ---------------- */

  document.querySelectorAll('.cred-tag').forEach(function (tag) {
    tag.addEventListener('click', function () {
      var isTorn = tag.classList.toggle('torn');
      tag.setAttribute('aria-expanded', isTorn ? 'true' : 'false');
    });
  });
})();
