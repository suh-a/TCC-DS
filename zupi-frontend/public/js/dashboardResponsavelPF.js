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

        const container = document.getElementById('perfil-criancas');
        if (container && children.length > 0) {
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

function createChildCard(child) {
    const avatar = ZupiChildAvatar.renderHtml(child, 80, 'mx-auto mb-3');
    return `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center d-flex flex-column">
            ${avatar}
            <h3 class="card-title h6 mb-2">${child.name}</h3>
            <p class="card-text text-muted small flex-grow-1">Idade: ${child.age ?? '—'}</p>
            <a href="/perfil?childId=${child.id}" class="btn btn-primary btn-sm mt-auto">Ver Perfil</a>
          </div>
        </div>
      </div>`;
}
