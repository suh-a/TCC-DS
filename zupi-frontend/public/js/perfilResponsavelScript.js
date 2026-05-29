document.addEventListener('DOMContentLoaded', async () => {
  if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

  const user = ZupiAPI.getUser();
  renderResponsible(user);
  await loadDependents();
});

function renderResponsible(user) {
  const name = user.name || 'Responsavel';
  setText('nomeResponsavel', name);
  setText('emailResponsavel', user.email || 'Nao informado');

  const preview = document.getElementById('responsiblePhotoPreview');
  if (preview && window.ZupiProfileMedia) {
    preview.dataset.profileName = name;
    preview.innerHTML = ZupiProfileMedia.renderAvatar({ type: 'responsible', id: user.id, name, size: 132 });
    ZupiProfileMedia.bindInput(document.getElementById('responsiblePhotoInput'), {
      type: 'responsible',
      id: user.id,
      previewSelector: '#responsiblePhotoPreview'
    });
  }
}

async function loadDependents() {
  const container = document.getElementById('dependentes-list');
  if (!container) return;

  try {
    const children = await ZupiAPI.fetchMyChildren();
    if (!Array.isArray(children) || !children.length) {
      container.innerHTML = '<div class="col-12"><p class="text-muted text-center">Nenhum dependente cadastrado.</p></div>';
      return;
    }

    container.innerHTML = children.map(child => `
      <div class="col-md-6 col-xl-4">
        <article class="card profile-card h-100">
          <div class="card-body text-center">
            ${ZupiProfileMedia.renderAvatar({ type: 'child', id: child.id, name: child.name, size: 88, fallbackUrl: child.profilePhotoUrl || '' })}
            <h3 class="h5 mb-1">${escapeHtml(child.name || 'Crianca')}</h3>
            <p class="selection-card-meta">Idade: ${child.age ?? '-'} anos</p>
            <p class="selection-card-meta">${escapeHtml(child.schoolClass || 'Ano escolar nao informado')}</p>
            <a class="btn btn-sm btn-outline-primary mt-2" href="/perfil?childId=${child.id}">Abrir perfil</a>
          </div>
        </article>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div class="col-12"><p class="text-danger text-center">Erro ao carregar dependentes.</p></div>';
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}
