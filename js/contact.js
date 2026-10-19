/* Contact form: the site has no backend, so the form opens the visitor's
   own mail app with the message pre-filled. The Copy button covers
   visitors who have no mail app set up. */
(function () {
  'use strict';

  var TO = 'nikhilkr@engineering.upenn.edu';
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var copyBtn = document.getElementById('copyEmail');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var subject = 'Website message from ' + name;
      var body = message + '\n\n' + name + '\n' + email;
      window.location.href = 'mailto:' + TO +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      note.textContent = 'Opening your email app with your message filled in. If nothing opens, copy my address above and email me directly.';
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function () {
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(TO).then(done, function () { copyBtn.textContent = 'Select and copy above'; });
      } else {
        copyBtn.textContent = 'Select and copy above';
      }
    });
  }
})();
