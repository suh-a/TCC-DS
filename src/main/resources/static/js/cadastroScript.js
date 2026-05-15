const API_BASE = window.API_BASE_URL || window.location.origin;

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.tipo-btn').forEach(btn => {
        btn.addEventListener('click', () => showForm(btn.dataset.tipo));
    });
    document.querySelectorAll('.voltar-tipo').forEach(btn => {
        btn.addEventListener('click', showTypeStep);
    });

    document.getElementById('signupFormPF').addEventListener('submit', cadastrarPF);
    document.getElementById('signupFormPJ').addEventListener('submit', cadastrarPJ);

    maskCpf(document.getElementById('cpfPF'));
    maskCnpj(document.getElementById('cnpjPJ'));
});

function showTypeStep() {
    document.getElementById('stepTipo').classList.remove('d-none');
    document.getElementById('formPF').classList.add('d-none');
    document.getElementById('formPJ').classList.add('d-none');
}

function showForm(tipo) {
    document.getElementById('stepTipo').classList.add('d-none');
    document.getElementById('formPF').classList.toggle('d-none', tipo !== 'PESSOA_FISICA');
    document.getElementById('formPJ').classList.toggle('d-none', tipo !== 'PESSOA_JURIDICA');
}

function maskCpf(el) {
    if (!el) return;
    el.addEventListener('input', () => {
        const d = el.value.replace(/\D/g, '').slice(0, 11);
        el.value = d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    });
}

function maskCnpj(el) {
    if (!el) return;
    el.addEventListener('input', () => {
        const d = el.value.replace(/\D/g, '').slice(0, 14);
        el.value = d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    });
}

async function register(userData, erroEl, redirect) {
    erroEl.style.display = 'none';
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const msg = await response.text();
            erroEl.textContent = response.status === 409 ? 'E-mail ou documento já cadastrado.' : (msg || 'Erro ao cadastrar.');
            erroEl.style.display = 'block';
            return;
        }
        const data = await response.json();
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userType', data.userType || userData.userType);
        alert('Cadastro realizado com sucesso!');
        window.location.href = redirect;
    } catch (e) {
        erroEl.textContent = 'Erro de conexão com o servidor.';
        erroEl.style.display = 'block';
    }
}

async function cadastrarPF(e) {
    e.preventDefault();
    const senha = document.getElementById('senhaPF').value;
    const conf = document.getElementById('senhaConfirmPF').value;
    const erro = document.getElementById('erroPF');
    if (senha !== conf) {
        erro.textContent = 'As senhas não coincidem.';
        erro.style.display = 'block';
        return;
    }
    await register({
        name: document.getElementById('nomePF').value,
        email: document.getElementById('emailPF').value,
        password: senha,
        cpf: document.getElementById('cpfPF').value,
        cnpj: null,
        birthDate: document.getElementById('nascimentoPF').value,
        userType: 'PESSOA_FISICA'
    }, erro, '/dashboard');
}

async function cadastrarPJ(e) {
    e.preventDefault();
    const senha = document.getElementById('senhaPJ').value;
    const conf = document.getElementById('senhaConfirmPJ').value;
    const erro = document.getElementById('erroPJ');
    if (senha !== conf) {
        erro.textContent = 'As senhas não coincidem.';
        erro.style.display = 'block';
        return;
    }
    await register({
        name: document.getElementById('nomePJ').value,
        email: document.getElementById('emailPJ').value,
        password: senha,
        cpf: null,
        cnpj: document.getElementById('cnpjPJ').value,
        birthDate: null,
        userType: 'PESSOA_JURIDICA'
    }, erro, '/dashboard-escola');
}
