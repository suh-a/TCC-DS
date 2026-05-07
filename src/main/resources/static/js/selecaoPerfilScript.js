const API_BASE = window.API_BASE_URL || window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
  loadChildrenProfiles();
});

async function loadChildrenProfiles() {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    console.error('ID de usuário não encontrado');
    const container = document.getElementById('childrenProfiles');
    if (container) {
      container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Usuário não autenticado. Faça login novamente.</p></div>';
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/child/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar perfis das crianças');
    }

    const children = await response.json();
    const container = document.getElementById('childrenProfiles');

    if (!container) return;

    if (!Array.isArray(children) || children.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center text-muted">Nenhuma criança cadastrada. Vá para o Dashboard para adicionar.</p></div>';
      return;
    }

    children.forEach(child => {
      const cardHTML = createChildProfileCard(child);
      container.insertAdjacentHTML('beforeend', cardHTML);
    });

  } catch (error) {
    console.error('Erro ao carregar perfis:', error);
    const container = document.getElementById('childrenProfiles');
    if (container) {
      container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Erro ao carregar perfis das crianças.</p></div>';
    }
  }
}

function storeChildId(id) {
  localStorage.setItem('childId', id);
}

function createChildProfileCard(child) {
  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100">
        <div class="card-body text-center d-flex flex-column">
          <div class="display-4 mb-3">👦</div>
          <h3 class="card-title h5">${child.name}</h3>
          <p class="card-text text-muted"><strong>Idade:</strong> ${child.age ?? 'Não informado'} anos</p>
          <p class="card-text text-muted small"><strong>Ano Escolar:</strong> ${child.schoolClass || 'Não informado'}</p>
          <p class="card-text text-muted small"><strong>Condição:</strong> ${child.condition || 'Não informado'}</p>
          <div class="mt-auto d-grid gap-2">
            <a href="/menuJogos?childId=${child.id}" class="btn btn-primary btn-sm">Acessar Jogos</a>
            <a href="/perfil?childId=${child.id}" class="btn btn-primary btn-sm" onclick="storeChildId(${child.id})">Perfil</a>
            <a href="/relatorios?childId=${child.id}" class="btn btn-outline-primary btn-sm" onclick="storeChildId(${child.id})">Ver Relatório</a>
          </div>
        </div>
      </div>
    </div>
  `;
}
  