// auth.js 

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.querySelector('.login-form');

  // Cadastro: só redireciona se todos os campos estiverem preenchidos
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = signupForm.querySelector('#nome')?.value.trim() || '';
      const email = signupForm.querySelector('#email')?.value.trim() || '';
      const senha = signupForm.querySelector('#senha')?.value || '';

      if (!nome || !email || !senha) {
        // Se algum campo estiver vazio, não faz nada (mantém na página)
        return;
      }

      // Tudo preenchido -> redireciona para perfis (sem salvar nada)
      window.location.href = 'perfis.html';
    });
  }

  // Login: só redireciona se todos os campos estiverem preenchidos
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('#email')?.value.trim() || '';
      const senha = loginForm.querySelector('#senha')?.value || '';

      if (!email || !senha) {
        return;
      }

      // Campos preenchidos -> redireciona para perfis
      window.location.href = 'perfis.html';
    });
  }
});
