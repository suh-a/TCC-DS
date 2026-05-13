import { apiUrl } from '../core/api.js';

const userId = localStorage.getItem('userId');

function init() {
  if (!userId) {
    console.error('ID de usuário não encontrado');
    return;
  }

  const nameInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('senha');
  const saveBtn = document.getElementById('saveBtn');

  loadUserData().then((userData) => {
    if (userData) {
      nameInput.value = userData.name || '';
      emailInput.value = userData.email || '';
      passwordInput.value = userData.password ? '*'.repeat(userData.password.length) : '';
    }
  });

  saveBtn.addEventListener('click', () => changeUserData());
}

async function loadUserData() {
  try {
    const response = await fetch(apiUrl(`/auth/${userId}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Erro ao carregar dados do usuário');
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
  }
}

async function changeUserData() {
  const name = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('senha').value;
  const updatedData = { name, email, password };

  try {
    const response = await fetch(apiUrl(`/auth/${userId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      alert('Dados atualizados com sucesso!');
    }

    const responseData = await response.json();
    document.getElementById('nome').value = responseData.name || '';
    document.getElementById('email').value = responseData.email || '';
    document.getElementById('senha').value = responseData.password
      ? '*'.repeat(responseData.password.length)
      : '';

    location.reload();
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    alert('Erro ao atualizar dados do usuário. Por favor, tente novamente.');
  }
}

document.addEventListener('DOMContentLoaded', init);
