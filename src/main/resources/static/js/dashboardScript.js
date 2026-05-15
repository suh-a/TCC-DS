const API_BASE = window.API_BASE_URL || window.location.origin;

document.addEventListener('DOMContentLoaded', function () {
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
    dashboardLoad();
});

async function getUserData() {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${API_BASE}/auth/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Usuário não encontrado');
    return await response.json();
}

async function getChildData() {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${API_BASE}/child/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return [];
    return await response.json();
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
    const childCondition = document.getElementById('childCondition').value;
    const userId = localStorage.getItem('userId');

    if (!name || !cpf || cpf.length !== 11) {
        alert('Preencha nome e CPF válido (11 dígitos).');
        return;
    }
    if (isNaN(age) || age < 5 || age > 25) {
        alert('A idade deve estar entre 5 e 25 anos.');
        return;
    }
    if (!childGrade || !childCondition) {
        alert('Selecione ano escolar e condição.');
        return;
    }

    const childData = {
        name,
        age,
        cpf,
        birthDate: birthInput || null,
        schoolClass: childGrade,
        condition: childCondition,
        responsibleId: parseInt(userId, 10)
    };

    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        const response = await fetch(`${API_BASE}/child`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(childData)
        });
        const text = await response.text();
        if (response.ok) {
            const created = JSON.parse(text);
            localStorage.setItem('activeChildId', created.id);
            const modalEl = document.getElementById('addChildModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            window.location.reload();
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
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/login';
        return;
    }

    try {
        const user = await getUserData();
        if (user.userType === 'PESSOA_JURIDICA') {
            window.location.href = '/dashboard-escola';
            return;
        }

        const children = await getChildData();
        document.getElementById('title').textContent = `Olá, ${user.name}`;
        const container = document.getElementById('perfil-criancas');
        children.forEach(child => {
            container.insertAdjacentHTML('beforeend', createChildCard(child));
        });
    } catch (e) {
        console.error(e);
        window.location.href = '/login';
    }
}

function createChildCard(child) {
    const photo = child.profilePhotoUrl || '/img/logokids1.png';
    return `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center d-flex flex-column">
            <img src="${photo}" alt="" class="img-fluid mx-auto mb-3 rounded-circle" style="max-width:80px;height:80px;object-fit:cover;">
            <h3 class="card-title h6 mb-2">${child.name}</h3>
            <p class="card-text text-muted small flex-grow-1">Idade: ${child.age ?? '—'}</p>
            <a href="/perfil?childId=${child.id}" class="btn btn-primary btn-sm mt-auto">Ver Perfil</a>
          </div>
        </div>
      </div>`;
}

