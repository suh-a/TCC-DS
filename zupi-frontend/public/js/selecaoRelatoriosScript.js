document.addEventListener('DOMContentLoaded', function () {
    if (!ZupiAPI.requireAuth()) return;

    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            ZupiAPI.logout();
        });
    });

    loadReportProfileSelection();
});

async function loadReportProfileSelection() {
    const user = ZupiAPI.getUser();
    const container = document.getElementById('childrenProfiles');
    if (!container) return;

    try {
        const children = await ZupiAPI.fetchMyChildren();
        if (!children) throw new Error('Erro ao buscar perfis');
        container.innerHTML = '';

        if (!Array.isArray(children) || children.length === 0) {
            const col = document.createElement('div');
            col.className = 'col-12';
            col.innerHTML = '<p class="text-center text-muted">Nenhum dependente cadastrado. <a href="/cadastro-dependentes">Cadastre um dependente</a> para ver relatórios.</p>';
            container.appendChild(col);
            return;
        }

        children.forEach(child => container.appendChild(createReportProfileCard(child)));
    } catch (error) {
        console.error(error);
        const col = document.createElement('DIV');
        col.className = 'col-12';
        col.innerHTML = '<p class="text-center text-danger">Erro ao carregar perfis.</p>';
        container.appendChild(col);
    }
}

function createReportProfileCard(child) {
    const col = document.createElement('div');
    col.className = 'col-md-5 col-lg-4';

    const card = document.createElement('div');
    card.className = 'card h-100 profile-card border-0 shadow-sm';
    card.style.cssText = 'cursor:pointer;background:var(--zupi-primary-solid,#7ec8e6);';
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => openChildReports(child.id));

    const body = document.createElement('div');
    body.className = 'card-body text-center d-flex flex-column align-items-center justify-content-center';
    body.style.minHeight = '260px';

    const avatar = ZupiChildAvatar.createElement(child, 90, 'mb-3');
    avatar.style.background = 'rgba(255,255,255,.35)';

    const title = document.createElement('h3');
    title.className = 'h5 text-white mb-3';
    title.textContent = child.name;

    const btn = document.createElement('span');
    btn.className = 'btn btn-light rounded-pill px-4 fw-semibold';
    btn.textContent = 'Acessar relatórios';

    body.appendChild(avatar);
    body.appendChild(title);
    body.appendChild(btn);
    card.appendChild(body);
    col.appendChild(card);
    return col;
}

function openChildReports(childId) {
    localStorage.setItem('activeChildId', childId);
    localStorage.setItem('childId', childId);
    window.location.href = `/relatorios?childId=${childId}`;
}
