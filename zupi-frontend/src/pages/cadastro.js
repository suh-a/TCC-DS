import { apiUrl } from '../core/api.js';

function init() {
  const cadastroForm = document.getElementById('signupForm');
  if (!cadastroForm) return;
  cadastroForm.addEventListener('submit', cadastrar);
}

async function cadastrar(event) {
  event.preventDefault();

  const name = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('senhaConfirm').value;
  const erroSenha = document.getElementById('erroSenha');
  const erroEmail = document.getElementById('erroEmail');

  erroSenha.style.display = 'none';
  erroEmail.style.display = 'none';

  if (password !== confirmarSenha) {
    erroSenha.textContent = 'As senhas não coincidem!';
    erroSenha.style.display = 'block';
    return;
  }

  const userData = { name, email, password };

  try {
    const response = await fetch(apiUrl('/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      let mensagem = '';
      try {
        mensagem = await response.text();
      } catch {
        mensagem = 'Erro ao processar resposta do servidor.';
      }
      if (response.status === 409) {
        erroEmail.textContent = 'Este e-mail já está cadastrado!';
        erroEmail.style.display = 'block';
      } else {
        erroEmail.textContent = mensagem || 'Erro ao cadastrar usuário.';
        erroEmail.style.display = 'block';
      }
      return;
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Resposta inválida (não é JSON válido):', e);
      erroEmail.textContent = 'Erro inesperado do servidor (resposta inválida).';
      erroEmail.style.display = 'block';
      return;
    }

    alert('Cadastro realizado com sucesso!');
    localStorage.setItem('userId', responseData.id);
    localStorage.removeItem('dailyReportId');
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    erroEmail.textContent = 'Erro de conexão com o servidor.';
    erroEmail.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', init);
