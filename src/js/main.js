// main.js — scripts globais simples para o site
document.addEventListener('DOMContentLoaded', () => {
  // Form de contato (todas as páginas que usam .contato-form)
  const contato = document.querySelector('.contato-form');
  if (contato) {
    contato.addEventListener('submit', (e) => {
      e.preventDefault();
      // Exemplo simples: feedback visual, limpa campos
      alert('Mensagem enviada — (mock). Em produção, envie ao backend.');
      contato.reset();
    });
  }

  // Smooth scroll para âncoras (início, sobre, planos, contato)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});