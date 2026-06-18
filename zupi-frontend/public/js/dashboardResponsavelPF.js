/**
 * Dashboard Script — Responsável (Pais)
 * Usa ZupiAPI para todas as chamadas autenticadas.
 * Requer: /js/api.js carregado antes deste script.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (!ZupiAPI.requireAuth()) return;

    initDashboardCarousel();

    // Máscara CPF
    const cpfInput = document.getElementById('childCpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function () {
            this.value = formatCpf(this.value);
        });
    }

    // Botão adicionar criança
    const addBtn = document.getElementById('addChildButton');
    if (addBtn) {
        addBtn.addEventListener('click', cadastrarCrianca);
    }

    // Logout
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            ZupiAPI.logout();
        });
    });

    bindChildAccessActions();
    dashboardLoad();
});

function initDashboardCarousel() {
    const carouselEl = document.getElementById('dashCarousel');
    if (!carouselEl || typeof bootstrap === 'undefined' || !bootstrap.Carousel) return;

    const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl, {
        interval: 5000,
        ride: 'carousel',
        pause: false,
        wrap: true,
        touch: true
    });

    carousel.cycle();
}

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
    const age = parseInt(document.getElementById('childAge').value, 10);
    const cpf = onlyDigits(document.getElementById('childCpf').value);
    const birthInput = document.getElementById('childBirthdate').value;
    const childGrade = document.getElementById('childGrade').value;
    const userId = ZupiAPI.getUser().id;

    if (!name) {
        alert('Preencha o nome da criança.');
        return;
    }
    if (!cpf || cpf.length !== 11) {
        alert('CPF invalido. Informe 11 digitos.');
        return;
    }
    if (isNaN(age) || age < 5 || age > 25) {
        alert('A idade deve estar entre 5 e 25 anos.');
        return;
    }
    if (!childGrade) {
        alert('Informe o ano escolar.');
        return;
    }

    const childData = {
        name,
        age,
        cpf,
        birthDate: birthInput || null,
        schoolClass: childGrade,
        condition: null,
        responsibleId: parseInt(userId, 10)
    };

    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        const response = await ZupiAPI.post('/child', childData);
        if (!response) return;

        if (response.ok) {
            const text = await response.text();
            const created = JSON.parse(text);
            const child = created.child || created;
            const childId = child?.id || created.childId || created.id;
            const generatedPassword = created.generatedPassword;

            if (!childId) {
                console.error('Resposta de cadastro sem ID da crianca:', created);
                alert('Cadastro realizado, mas nao foi possivel abrir o quiz automaticamente.');
                btn.disabled = false;
                btn.textContent = 'Adicionar Criança';
                return;
            }

            localStorage.setItem('activeChildId', childId);
            localStorage.setItem('selectedChildId', childId);
            localStorage.setItem('childId', childId);

            const modalEl = document.getElementById('addChildModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            if (generatedPassword) {
                alert(`Criança cadastrada!\n\nLogin: ${child.childLoginEmail || 'Gerado automaticamente'}\nSenha: ${generatedPassword}\n\nAnote estas credenciais!`);
            }

            window.location.href = `/onboarding-crianca?childId=${encodeURIComponent(childId)}`;
        } else {
            ZupiUI.error(await ZupiAPI.readErrorMessage(response, 'Erro ao cadastrar crianca.'));
        }
    } catch (error) {
        console.error(error);
        ZupiUI.error('Erro de conexao ao cadastrar crianca.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Adicionar Criança';
    }
}

async function dashboardLoad() {
    try {
        const user = await getUserData();

        const titleEl = document.getElementById('title');
        if (titleEl) {
            titleEl.textContent = `Olá, ${user.name}`;
        }

        const children = await getChildData();
        toggleResponsiblePlanUi();

        const container = document.getElementById('perfil-criancas');
        if (container) {
            container.querySelectorAll('[data-child-card]').forEach((card) => card.remove());
        }
        if (container && children.length > 0) {
            children.forEach(child => {
                container.insertAdjacentHTML('beforeend', createChildCard(child));
            });
        }
        renderChildAccessList(children);
    } catch (e) {
        console.error(e);
        const container = document.getElementById('perfil-criancas');
        if (container) {
            container.innerHTML = '<div class="col-12"><p class="text-danger text-center">Não foi possível carregar o dashboard. Verifique se a API está rodando e faça login novamente.</p></div>';
        }
    }
}

function toggleResponsiblePlanUi() {
    const user = ZupiAPI.getUser();
    if (user.planType !== 'PESSOA_JURIDICA') return;
    document.querySelectorAll('a[href="/cadastro-dependentes"]').forEach((link) => {
        link.closest('.col-12, .nav-item')?.classList.add('d-none');
    });
}

function renderChildAccessList(children) {
    const container = document.getElementById('childAccessList');
    if (!container) return;
    if (!Array.isArray(children) || !children.length) {
        container.innerHTML = '<p class="text-muted mb-0">Nenhuma crianca cadastrada ainda.</p>';
        return;
    }
    container.innerHTML = `
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Login infantil</th>
            <th>Turma</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${children.map((child) => `
            <tr>
              <td>${escapeHtml(child.name)}</td>
              <td><code>${escapeHtml(child.childLoginEmail || '-')}</code></td>
              <td>${escapeHtml(child.schoolClass || '-')}</td>
              <td class="text-end">
                <button class="btn btn-outline-primary btn-sm me-2" data-child-access-action="login" data-child-id="${child.id}" data-current-login="${escapeHtml(child.childLoginEmail || '')}">Alterar</button>
                <button class="btn btn-primary btn-sm" data-child-access-action="reset" data-child-id="${child.id}">Nova senha</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
}

function bindChildAccessActions() {
    document.getElementById('childAccessList')?.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-child-access-action]');
        if (!button) return;
        const childId = button.dataset.childId;
        const action = button.dataset.childAccessAction;

        button.disabled = true;
        try {
            if (action === 'login') {
                const email = prompt('Novo login infantil', button.dataset.currentLogin || '');
                if (!email) return;
                const response = await ZupiAPI.patch(`/child/${childId}/access/login`, { email: email.trim() });
                if (!response) return;
                if (!response.ok) {
                    alert(await ZupiAPI.readErrorMessage(response, 'Nao foi possivel alterar o login infantil.'));
                    return;
                }
                alert('Login infantil atualizado com sucesso.');
            } else if (action === 'reset') {
                if (!confirm('Gerar uma nova senha infantil? A senha antiga deixara de funcionar.')) return;
                const response = await ZupiAPI.post(`/child/${childId}/access/password/reset`, {});
                if (!response) return;
                if (!response.ok) {
                    alert(await ZupiAPI.readErrorMessage(response, 'Nao foi possivel gerar nova senha.'));
                    return;
                }
                const data = await response.json();
                alert(`Nova senha gerada.\nLogin: ${data.email || '-'}\nSenha: ${data.generatedPassword || '-'}`);
            }
            await dashboardLoad();
        } catch (error) {
            alert('Erro de conexao ao gerenciar acesso infantil.');
        } finally {
            button.disabled = false;
        }
    });
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function createChildCard(child) {
    const avatar = ZupiChildAvatar.renderHtml(child, 80, 'mx-auto mb-3');
    return `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3" data-child-card>
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center d-flex flex-column">
            ${avatar}
            <h3 class="card-title h6 mb-2">${child.name}</h3>
            <p class="card-text text-muted small flex-grow-1">Idade: ${child.age ?? '—'}</p>
            <a href="/perfil-crianca?childId=${child.id}" class="btn btn-primary btn-sm mt-auto">Ver Perfil</a>
          </div>
        </div>
      </div>`;
}
