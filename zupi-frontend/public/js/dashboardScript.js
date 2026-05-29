/**
 * Dashboard Script — Usa ZupiAPI para todas as chamadas autenticadas.
 * Requer: /js/api.js carregado antes deste script.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (!ZupiAPI.requireAuth()) return;

    const cpfInput = document.getElementById('childCpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function () {
            this.value = formatCpf(this.value);
        });
    }

    const addBtn = document.getElementById('addChildButton');
    if (addBtn) {
        addBtn.addEventListener('click', cadastrarCrianca);
    }

    // Logout buttons
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            ZupiAPI.logout();
        });
    });

    dashboardLoad();
});

async function getUserData() {
    const user = await ZupiAPI.fetchMe();
    if (!user) throw new Error('Usuário não encontrado');
    return user;
}

async function getChildData() {
    return ZupiAPI.fetchMyChildren();
}

function formatCpf(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function onlyDigits(v) {
    return (v || '').replace(/\D/g, '');
}

async function cadastrarCrianca() {
    const btn = document.getElementById('addChildButton');
    const name = document.getElementById('childName').value.trim();
    const cpf = onlyDigits(document.getElementById('childCpf').value);
    const birthInput = document.getElementById('childBirthdate').value;
    const childGrade = document.getElementById('childGrade').value;
    const userId = ZupiAPI.getUser().id;

    if (!name || !cpf || cpf.length !== 11) {
        alert('Preencha nome e CPF válido (11 dígitos).');
        return;
    }
    if (!birthInput) {
        alert('Informe a data de nascimento.');
        return;
    }
    if (!childGrade) {
        alert('Informe o ano escolar.');
        return;
    }

    const childData = {
        name,
        cpf,
        birthDate: birthInput,
        schoolClass: childGrade,
        condition: null,
        responsibleId: parseInt(userId, 10)
    };

    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        const response = await ZupiAPI.post('/child', childData);
        if (!response) return;

        const text = await response.text();
        if (response.ok) {
            const created = JSON.parse(text);
            const childData = created.child || created;
            const generatedPassword = created.generatedPassword;

            localStorage.setItem('activeChildId', childData.id);

            // Close modal
            const modalEl = document.getElementById('addChildModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            // Show credentials if available
            if (generatedPassword) {
                alert(`Criança cadastrada!\n\nLogin: ${childData.childLoginEmail || 'Gerado automaticamente'}\nSenha: ${generatedPassword}\n\nAnote estas credenciais!`);
            }

            // Redirect to quiz
            window.location.href = `/onboarding-crianca?childId=${childData.id}`;
        } else {
            alert(text || 'Erro ao cadastrar criança.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão ao cadastrar criança.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Adicionar Criança';
    }
}

async function dashboardLoad() {
    try {
        const user = await getUserData();

        // Redirect if wrong dashboard
        if (user.userType === 'ESCOLA') {
            window.location.href = '/dashboard-escola';
            return;
        }

        const children = await getChildData();

        const titleEl = document.getElementById('title');
        if (titleEl) {
            titleEl.textContent = `Olá, ${user.name}`;
        }

        await loadParentGameSummary(children);

        const container = document.getElementById('perfil-criancas');
        if (container) {
            children.forEach(child => {
                container.insertAdjacentHTML('beforeend', createChildCard(child));
            });
        }
    } catch (e) {
        console.error(e);
        const container = document.getElementById('perfil-criancas');
        if (container) {
            container.innerHTML = '<div class="col-12"><p class="text-danger text-center">Não foi possível carregar o dashboard. Verifique se a API está rodando e faça login novamente.</p></div>';
        }
    }
}

async function loadParentGameSummary(children) {
    if (!window.ZupiGameReports) return;
    const firstChild = Array.isArray(children) && children.length ? children[0] : null;
    const childId = localStorage.getItem('activeChildId') || firstChild?.id;
    if (!childId) return;

    localStorage.setItem('activeChildId', String(childId));
    localStorage.setItem('childId', String(childId));

    const sessions = await ZupiGameReports.loadSessions(childId);
    const summary = ZupiGameReports.summarize(sessions);

    const totalTime = document.getElementById('parentTotalTime');
    const completed = document.getElementById('parentGamesCompleted');
    const progress = document.getElementById('parentProgress');
    if (totalTime) totalTime.textContent = ZupiGameReports.formatMinutes(summary.totalSeconds);
    if (completed) completed.textContent = String(summary.totalSessions);
    if (progress) progress.textContent = `${summary.average}%`;

    ZupiGameReports.renderMiniReport(
        document.getElementById('parentGameReport'),
        sessions,
        { title: 'Resumo do dependente selecionado' }
    );
}

function createChildCardLegacy(child) {
    const childName = child.name || 'Crianca';
    const avatar = window.ZupiProfileMedia
        ? ZupiProfileMedia.renderAvatar({
            type: 'child',
            id: child.id,
            name: childName,
            size: 92,
            fallbackUrl: child.profilePhotoUrl || ''
        })
        : `<img src="${escapeAttribute(child.profilePhotoUrl || '/img/logokids1.png')}" alt="" class="img-fluid mx-auto mb-3 rounded-circle" style="max-width:92px;height:92px;object-fit:cover;">`;
    return `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center d-flex flex-column">
            <div>${avatar}</div>
            <h3 class="card-title h6 mb-2">${escapeHtml(childName)}</h3>
            <p class="card-text text-muted small flex-grow-1">Idade: ${child.age ?? '—'}</p>
            <a href="/perfil?childId=${child.id}" class="btn btn-primary btn-sm mt-auto">Ver Perfil</a>
          </div>
        </div>
      </div>`;
}

function createChildCard(child) {
    const childName = child.name || 'Crianca';
    const avatar = window.ZupiProfileMedia
        ? ZupiProfileMedia.renderAvatar({
            type: 'child',
            id: child.id,
            name: childName,
            size: 92,
            fallbackUrl: child.profilePhotoUrl || ''
        })
        : `<img src="${escapeAttribute(child.profilePhotoUrl || '/img/logokids1.png')}" alt="" class="img-fluid mx-auto mb-3 rounded-circle" style="max-width:92px;height:92px;object-fit:cover;">`;

    return `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm profile-card child-profile-dashboard-card">
          <div class="card-body text-center d-flex flex-column align-items-center">
            <div id="dashboard-child-avatar-${escapeAttribute(child.id)}" class="mb-2">${avatar}</div>
            <h3 class="card-title h6 mb-1">${escapeHtml(childName)}</h3>
            <p class="card-text text-muted small mb-1">Idade: ${child.age ?? '-'}</p>
            <p class="selection-card-meta mb-2">${escapeHtml(child.schoolClass || 'Perfil infantil')}</p>
            <label class="profile-photo-action mt-0 mb-3" onclick="event.stopPropagation();">
              <input type="file" accept="image/*" data-profile-name="${escapeAttribute(childName)}" onchange="saveDashboardChildPhoto(event, '${escapeJsString(child.id)}')">
              <span>Trocar foto</span>
            </label>
            <a href="/perfil?childId=${encodeURIComponent(child.id)}" class="btn btn-primary btn-sm mt-auto w-100">Ver Perfil</a>
          </div>
        </div>
      </div>`;
}

function saveDashboardChildPhoto(event, childId) {
    event.stopPropagation();
    if (!window.ZupiProfileMedia) return;
    const name = event.target.dataset.profileName || 'Crianca';
    ZupiProfileMedia.saveFromInput(event.target, {
        type: 'child',
        id: childId,
        onSaved: () => updateDashboardChildAvatar(childId, name)
    });
}

function updateDashboardChildAvatar(childId, name) {
    if (!window.ZupiProfileMedia) return;
    const preview = document.getElementById(`dashboard-child-avatar-${childId}`);
    if (!preview) return;
    preview.innerHTML = ZupiProfileMedia.renderAvatar({ type: 'child', id: childId, name, size: 92 });
    ZupiProfileMedia.animatePreview(preview);
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
