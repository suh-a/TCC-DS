/** Página Zupi — animação ao clicar (usa classe .bounce em zupi.css). */
function bounceZupi(el) {
  if (!el) return;
  el.classList.remove('bounce');
  void el.offsetWidth;
  el.classList.add('bounce');
}

window.bounceZupi = bounceZupi;
