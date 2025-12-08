// auth.js 

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.querySelector('.login-form');

  // Cadastro: envia POST para backend e redireciona ao sucesso
  async function handleSignup() {
    const nome = signupForm.querySelector('#nome')?.value.trim() || '';
    const email = signupForm.querySelector('#email')?.value.trim() || '';
    const senha = signupForm.querySelector('#senha')?.value || '';

    if (!nome || !email || !senha) return;

    try {
      const res = await fetch('/api/usuarios/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipoPlano: 'gratis' })
      });

      if (res.status === 201) {
        window.location.href = 'inicio.html';
      } else {
        const text = await res.text();
        alert('Falha ao cadastrar: ' + (text || res.status));
      }
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      alert('Erro de rede ao cadastrar usuário.');
    }
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => { e.preventDefault(); handleSignup(); });
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) signupBtn.addEventListener('click', handleSignup);
  }

  // Login: chama API e redireciona ao sucesso
  async function handleLogin() {
    const email = loginForm.querySelector('#email')?.value.trim() || '';
    const senha = loginForm.querySelector('#senha')?.value || '';
    if (!email || !senha) return;

    try {
      const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      if (res.ok) {
        window.location.href = 'inicio.html';
      } else {
        alert('Falha no login. Verifique suas credenciais.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      alert('Erro de rede ao tentar fazer login.');
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => { e.preventDefault(); handleLogin(); });
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  }
});
