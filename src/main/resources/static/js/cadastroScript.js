/**
 * Cadastro Script — Usa ZupiAPI para registro e login automático.
 * Requer: /js/api.js carregado antes deste script.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Se já autenticado, redirecionar
    if (ZupiAPI.isAuthenticated()) {
        const userType = ZupiAPI.getUser().type;
        ZupiAPI.redirectByUserType(userType);
        return;
    }

    document.querySelectorAll('.tipo-btn').forEach(btn => {
        btn.addEventListener('click', () => showForm(btn.dataset.tipo));
    });
    document.querySelectorAll('.voltar-tipo').forEach(btn => {
        btn.addEventListener('click', showTypeStep);
    });

    const formPF = document.getElementById('signupFormPF');
    const formPJ = document.getElementById('signupFormPJ');
    if (formPF) formPF.addEventListener('submit', cadastrarPF);
    if (formPJ) formPJ.addEventListener('submit', cadastrarPJ);

    maskCpf(document.getElementById('cpfPF'));
    maskCnpj(document.getElementById('cnpjPJ'));
    maskPhone(document.getElementById('phonePF'));
    maskPhone(document.getElementById('phonePJ'));
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

function maskPhone(el) {
    if (!el) return;
    el.addEventListener('input', () => {
        const d = el.value.replace(/\D/g, '').slice(0, 11);
        if (d.length <= 10) {
            el.value = d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            el.value = d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
        }
    });
}

async function registerAndLogin(userData, erroEl) {
    erroEl.style.display = 'none';
    try {
        // 1. Register
        const regResponse = await fetch(`${ZupiAPI.BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!regResponse.ok) {
            const msg = await regResponse.text();
            erroEl.textContent = regResponse.status === 409
                ? 'E-mail ou documento já cadastrado.'
                : (msg || 'Erro ao cadastrar.');
            erroEl.style.display = 'block';
            return;
        }

        // 2. Auto-login after registration
        const loginResponse = await fetch(`${ZupiAPI.BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userData.email, password: userData.password })
        });

        if (loginResponse.ok) {
            const data = await loginResponse.json();
            ZupiAPI.saveSession(data);
            const userType = data.user?.userType || userData.userType;
            ZupiAPI.redirectByUserType(userType);
        } else {
            // Login failed but registration succeeded — redirect to login page
            alert('Cadastro realizado! Faça login para continuar.');
            window.location.href = '/login';
        }

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
    if (senha.length < 6) {
        erro.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        erro.style.display = 'block';
        return;
    }

    await registerAndLogin({
        name: document.getElementById('nomePF').value,
        email: document.getElementById('emailPF').value,
        password: senha,
        cpf: document.getElementById('cpfPF').value,
        cnpj: null,
        birthDate: document.getElementById('nascimentoPF').value,
        phone: document.getElementById('phonePF')?.value || null,
        address: document.getElementById('addressPF')?.value || null,
        userType: 'RESPONSAVEL',
        planType: 'PESSOA_FISICA'
    }, erro);
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
    if (senha.length < 6) {
        erro.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        erro.style.display = 'block';
        return;
    }

    await registerAndLogin({
        name: document.getElementById('nomePJ').value,
        email: document.getElementById('emailPJ').value,
        password: senha,
        cpf: null,
        cnpj: document.getElementById('cnpjPJ').value,
        birthDate: null,
        phone: document.getElementById('phonePJ')?.value || null,
        address: document.getElementById('addressPJ')?.value || null,
        userType: 'ESCOLA',
        planType: 'PESSOA_JURIDICA'
    }, erro);
}
