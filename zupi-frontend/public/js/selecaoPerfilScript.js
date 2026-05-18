/**
 * Seleção de Perfil Script — Estilo Netflix.
 * Requer: /js/api.js carregado antes deste script.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (!ZupiAPI.requireAuth()) return;
    loadProfileSelection();
});

async function loadProfileSelection() {
    const user = ZupiAPI.getUser();
    const container = document.getElementById('childrenProfiles');

    if (!container) return;

    if (!user.id) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Usuário não autenticado. Faça login novamente.</p></div>';
        return;
    }

    try {
        const children = await ZupiAPI.fetchMyChildren();

        container.innerHTML = '';

        // Card do Responsável (sempre primeiro)
        container.insertAdjacentHTML('beforeend', createResponsibleCard(user));

        // Cards das crianças
        if (Array.isArray(children) && children.length > 0) {
            children.forEach(child => {
                container.insertAdjacentHTML('beforeend', createChildProfileCard(child));
            });
        }

        // Card de adicionar
        container.insertAdjacentHTML('beforeend', createAddCard());

    } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Erro ao carregar perfis.</p></div>';
    }
}

function createResponsibleCard(user) {
    return `
    <div class="col-md-4 col-lg-3">
      <div class="card h-100 profile-card profile-card--responsible" role="button"
           onclick="selectResponsibleProfile()" style="cursor:pointer;">
        <div class="card-body text-center d-flex flex-column align-items-center justify-content-center" style="min-height:220px;">
          <div class="profile-avatar mb-3" style="width:80px;height:80px;border-radius:50%;background:var(--zupi-primary,#6C63FF);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:2rem;color:white;">👤</span>
          </div>
          <h3 class="card-title h5 mb-1">${user.name || 'Responsável'}</h3>
          <p class="card-text text-muted small">Perfil do Responsável</p>
          <span class="badge bg-primary mt-2">Acessar</span>
        </div>
      </div>
    </div>`;
}

function createChildProfileCard(child) {
    const photo = child.profilePhotoUrl;
    const avatarContent = photo
        ? `<img src="${photo}" alt="" class="rounded-circle" style="width:80px;height:80px;object-fit:cover;">`
        : `<div style="width:80px;height:80px;border-radius:50%;background:var(--zupi-highlight,#FFB677);display:flex;align-items:center;justify-content:center;">
             <span style="font-size:2rem;">🧒</span>
           </div>`;

    return `
    <div class="col-md-4 col-lg-3">
      <div class="card h-100 profile-card profile-card--child" role="button"
           onclick="selectChildProfile(${child.id})" style="cursor:pointer;">
        <div class="card-body text-center d-flex flex-column align-items-center justify-content-center" style="min-height:220px;">
          <div class="profile-avatar mb-3">
            ${avatarContent}
          </div>
          <h3 class="card-title h5 mb-1">${child.name}</h3>
          <p class="card-text text-muted small">Idade: ${child.age ?? 'N/A'} anos</p>
          <p class="card-text text-muted small">${child.schoolClass || ''}</p>
          <span class="badge bg-success mt-2">Jogar</span>
        </div>
      </div>
    </div>`;
}

function createAddCard() {
    return `
    <div class="col-md-4 col-lg-3">
      <div class="card h-100 profile-card profile-card--add" role="button"
           onclick="window.location.href='${(typeof ZupiRoutes !== 'undefined' && ZupiRoutes.cadastroDependentes) || '/cadastro-dependentes'}'" style="cursor:pointer;border:2px dashed #ccc;">
        <div class="card-body text-center d-flex flex-column align-items-center justify-content-center" style="min-height:220px;">
          <div style="width:80px;height:80px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:2.5rem;color:#999;">+</span>
          </div>
          <h3 class="card-title h6 mt-3">Adicionar Criança</h3>
        </div>
      </div>
    </div>`;
}

function selectResponsibleProfile() {
    localStorage.setItem('activeProfile', 'RESPONSAVEL');
    localStorage.removeItem('activeChildId');
    window.location.href = '/dashboard';
}

function selectChildProfile(childId) {
    localStorage.setItem('activeProfile', 'CRIANCA');
    localStorage.setItem('activeChildId', childId);
    window.location.href = `/dashboard-crianca?childId=${childId}`;
}

function selectChildForReports(childId) {
    localStorage.setItem('activeChildId', childId);
    window.location.href = `/relatorios?childId=${childId}`;
}
