import { apiUrl } from '../core/api.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener('DOMContentLoaded', async () => {
  const childId = getQueryParam('childId') || localStorage.getItem('childId');
  if (!childId) {
    displayProfileError('ID da criança não encontrado. Selecione um perfil novamente.');
    return;
  }

  localStorage.setItem('childId', childId);

  try {
    const response = await fetch(apiUrl(`/child/details/${childId}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[perfil] erro no fetch:', errorBody);
      throw new Error('Erro ao buscar dados do perfil');
    }

    const childData = await response.json();
    renderChildProfile(childData);
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    displayProfileError('Não foi possível carregar o perfil da criança. Tente novamente.');
  }
});

function formatDate(dateString) {
  if (!dateString) return 'Não informado';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function renderChildProfile(child) {
  document.getElementById('childName').textContent = child.name || 'Nome não informado';
  document.getElementById('childAge').textContent =
    child.age !== null && child.age !== undefined ? `${child.age} anos` : 'Não informado';
  document.getElementById('childCondition').textContent = child.condition || 'Não informado';
  document.getElementById('childBirthDate').textContent = formatDate(child.birthDate);
  document.getElementById('childSchoolClass').textContent = child.schoolClass || 'Não informado';
  document.getElementById('childReportCount').textContent = '0';

  const reportsButton = document.getElementById('viewReportButton');
  if (reportsButton) {
    reportsButton.href = `/relatorios?childId=${child.id}`;
  }
}

function displayProfileError(message) {
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  }
}
