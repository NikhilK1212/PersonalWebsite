var root = document.documentElement;
var toggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
    toggle.textContent = 'dark';
  } else {
    root.removeAttribute('data-theme');
    toggle.textContent = 'light';
  }
}

var saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
applyTheme(saved === 'light' ? 'light' : 'dark');

toggle.addEventListener('click', function () {
  var isLight = root.getAttribute('data-theme') === 'light';
  var next = isLight ? 'dark' : 'light';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});
