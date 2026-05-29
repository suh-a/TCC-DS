/**
 * Selecao de perfil.
 * Requer: /js/api.js e /js/profile-media.js carregados antes deste script.
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
        container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Usuario nao autenticado. Faca login novamente.</p></div>';
        return;
    }

    try {
        const children = await ZupiAPI.fetchMyChildren();

        container.innerHTML = '';
        container.insertAdjacentHTML('beforeend', createResponsibleCard(user));

        if (Array.isArray(children) && children.length > 0) {
            children.forEach(child => {
                container.insertAdjacentHTML('beforeend', createChildProfileCard(child));
            });
        }

        container.insertAdjacentHTML('beforeend', createAddCard());
    } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Erro ao carregar perfis.</p></div>';
    }
}

function createResponsibleCard(user) {
    const userName = user.name || 'Responsavel';
    const avatar = window.ZupiProfileMedia
        ? ZupiProfileMedia.renderAvatar({ type: 'responsible', id: user.id, name: userName, size: 88 })
        : '';

    return `
    <div class="col-md-4 col-lg-3">
      <div class="card h-100 profile-card profile-card--responsible" role="button"
           onclick="selectResponsibleProfile()" style="cursor:pointer;">
        <div class="card-body text-center d-flex flex-column align-items-center justify-content-center" style="min-height:250px;">
          <div id="responsible-card-avatar-${escapeAttribute(user.id)}">${avatar}</div>
          <h3 class="card-title h5 mb-1">${escapeHtml(userName)}</h3>
          <p class="card-text text-muted small mb-2">Perfil do Responsavel</p>
          <label class="profile-photo-action mt-1" onclick="event.stopPropagation();">
            <input type="file" accept="image/*" data-profile-name="${escapeAttribute(userName)}" onchange="saveProfileCardPhoto(event, 'responsible', '${escapeJsString(user.id)}')">
            <span>Trocar foto</span>
          </label>
          <span class="badge bg-primary mt-3">Acessar</span>
        </div>
      </div>
    </div>`;
}

function createChildProfileCard(child) {
    const childName = child.name || 'Crianca';
    const avatar = window.ZupiProfileMedia
        ? ZupiProfileMedia.renderAvatar({
            type: 'child',
            id: child.id,
            name: childName,
            size: 88,
            fallbackUrl: child.profilePhotoUrl || ''
        })
        : '';

    return `
    <div class="col-md-4 col-lg-3">
      <div class="card h-100 profile-card profile-card--child" role="button"
           onclick="selectChildProfile('${escapeJsString(child.id)}')" style="cursor:pointer;">
        <div class="card-body text-center d-flex flex-column align-items-center justify-content-center" style="min-height:250px;">
          <div id="child-card-avatar-${escapeAttribute(child.id)}">${avatar}</div>
          <h3 class="card-title h5 mb-1">${escapeHtml(childName)}</h3>
          <p class="card-text text-muted small mb-1">Idade: ${child.age ?? 'N/A'} anos</p>
          <p class="card-text text-muted small mb-2">${escapeHtml(child.schoolClass || '')}</p>
          <label class="profile-photo-action mt-1" onclick="event.stopPropagation();">
            <input type="file" accept="image/*" data-profile-name="${escapeAttribute(childName)}" onchange="saveProfileCardPhoto(event, 'child', '${escapeJsString(child.id)}')">
            <span>Trocar foto</span>
          </label>
          <span class="badge bg-success mt-3">Jogar</span>
        </div>
      </div>
    </div>`;
}

function createAddCard() {
    return `
    <div class="col-md-4 col-lg-3">
      <div class="card h-100 profile-card profile-card--add" role="button"
           onclick="window.location.href='${(typeof ZupiRoutes !== 'undefined' && ZupiRoutes.cadastroDependentes) || '/cadastro-dependentes'}'" style="cursor:pointer;border:2px dashed #ccc;">
        <div class="card-body text-center d-flex flex-column align-items-center justify-content-center" style="min-height:250px;">
          <div style="width:80px;height:80px;border-radius:24px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:2.5rem;color:#999;">+</span>
          </div>
          <h3 class="card-title h6 mt-3">Adicionar Crianca</h3>
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

function saveProfileCardPhoto(event, type, id) {
    event.stopPropagation();
    if (!window.ZupiProfileMedia) return;
    const name = event.target.dataset.profileName || '';
    ZupiProfileMedia.saveFromInput(event.target, {
        type,
        id,
        onSaved: () => {
            const prefix = type === 'child' ? 'child-card-avatar' : 'responsible-card-avatar';
            const preview = document.getElementById(`${prefix}-${id}`);
            if (preview) {
                preview.innerHTML = ZupiProfileMedia.renderAvatar({ type, id, name, size: 88 });
                ZupiProfileMedia.animatePreview(preview);
            }
        }
    });
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
}

function escapeJsString(value) {
    return String(value == null ? '' : value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
