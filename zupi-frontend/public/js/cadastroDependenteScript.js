document.addEventListener('DOMContentLoaded', function () {
    if (!ZupiAPI.requireAuth()) return;

    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            ZupiAPI.logout();
        });
    });

    const form = document.getElementById('cadastroDependenteForm');
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                e.target.value = value;
            }
        });
    }

    if (form) {
        form.addEventListener('submit', submitDependente);
    }

    loadDependentesList();
});

async function submitDependente(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const loadingMsg = document.getElementById('loadingMessage');
    const successMsg = document.getElementById('successMessage');
    const errorMsg = document.getElementById('errorMessage');

    loadingMsg.style.display = 'none';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';

    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    const birthDate = document.getElementById('dataNascimento').value;
    const name = document.getElementById('nomeCompleto').value.trim();
    const userId = ZupiAPI.getUser().id;

    if (!name || cpf.length !== 11 || !birthDate) {
        errorMsg.textContent = 'Preencha nome, CPF e data de nascimento.';
        errorMsg.style.display = 'block';
        return;
    }

    const payload = {
        name,
        cpf,
        birthDate,
        schoolClass: '',
        condition: null,
        responsibleId: parseInt(userId, 10),
        schoolLinked: false,
        schoolName: null
    };

    loadingMsg.style.display = 'block';
    submitBtn.disabled = true;

    try {
        const response = await ZupiAPI.post('/child', payload);
        loadingMsg.style.display = 'none';

        if (!response) return;

        const text = await response.text();
        if (response.ok) {
            const created = JSON.parse(text);
            const child = created.child || created;
            successMsg.style.display = 'block';
            e.target.reset();
            setTimeout(() => {
                window.location.href = '/onboarding-crianca?childId=' + child.id;
            }, 1500);
        } else {
            errorMsg.textContent = text || 'Erro ao cadastrar dependente.';
            errorMsg.style.display = 'block';
            submitBtn.disabled = false;
        }
    } catch (err) {
        loadingMsg.style.display = 'none';
        errorMsg.textContent = 'Erro ao processar: ' + err.message;
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
    }
}

async function loadDependentesList() {
    const container = document.getElementById('dependentesList');
    if (!container) return;

    try {
        const response = await ZupiAPI.get('/child/me');
        if (!response || !response.ok) throw new Error('Falha ao carregar');

        const children = await response.json();
        container.textContent = '';

        if (!Array.isArray(children) || children.length === 0) {
            const empty = document.createElement('DIV');
            empty.className = 'col-12';
            const p = document.createElement('p');
            p.className = 'text-muted text-center';
            p.textContent = 'Nenhum dependente cadastrado.';
            empty.appendChild(p);
            container.appendChild(empty);
            return;
        }

        children.forEach(c => {
            const col = document.createElement('DIV');
            col.className = 'col-md-4';
            const card = document.createElement('DIV');
            card.className = 'card';
            const body = document.createElement('DIV');
            body.className = 'card-body';
            const title = document.createElement('h3');
            title.className = 'h6';
            title.textContent = c.name;
            const meta = document.createElement('p');
            meta.className = 'small text-muted mb-0';
            meta.textContent = 'Idade: ' + (c.age ?? '-') + ' anos';
            body.appendChild(title);
            body.appendChild(meta);
            card.appendChild(body);
            col.appendChild(card);
            container.appendChild(col);
        });
    } catch (e) {
        container.textContent = '';
        const col = document.createElement('DIV');
        col.className = 'col-12';
        const p = document.createElement('p');
        p.className = 'text-muted text-center';
        p.textContent = 'Erro ao carregar dependentes.';
        col.appendChild(p);
        container.appendChild(col);
    }
}
