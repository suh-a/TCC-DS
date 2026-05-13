import { apiUrl } from '../core/api.js';

function init() {
  const loginForm = document.getElementById('signupForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', loginUser);
}

async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('senha').value;
  const erroLogin = document.getElementById('erroLogin');
  erroLogin.style.display = 'none';

  const loginData = { email, password };

  try {
    const response = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        erroLogin.textContent = 'Email ou senha inválidos!';
      } else {
        erroLogin.textContent = 'Erro ao realizar login.';
      }
      erroLogin.style.display = 'block';
      return;
    }

    const responseData = await response.json();
    alert('Login realizado com sucesso!');
    localStorage.setItem('userId', responseData.id);
    localStorage.removeItem('dailyReportId');
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    erroLogin.textContent = 'Erro de conexão com o servidor.';
    erroLogin.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', init);
