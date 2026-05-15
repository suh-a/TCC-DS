(function () {
  const STORAGE_KEY = 'zupi-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = document.getElementById('modoEscuro');
    if (toggle) toggle.checked = theme === 'dark';
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) || 'light';
    applyTheme(saved);
  }

  function toggleTheme(enabled) {
    const theme = enabled ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    const toggle = document.getElementById('modoEscuro');
    if (toggle) {
      toggle.addEventListener('change', function () {
        toggleTheme(this.checked);
      });
    }
  });

  window.ZupiTheme = { initTheme, toggleTheme, applyTheme };
})();

