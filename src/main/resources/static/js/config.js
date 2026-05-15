const API_BASE = window.API_BASE_URL || window.location.origin;
const userId = localStorage.getItem('userId');

document.addEventListener('DOMContentLoaded', function() {
    if (!userId) {
        window.location.href = '/login';
        return;
    }

    const nameInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const saveBtn = document.getElementById('saveBtn');
    const saveEmailBtn = document.getElementById('saveEmailBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const auth2passos = document.getElementById('auth2passos');

    loadUserData().then(userData => {
        if (userData) {
            nameInput.value = userData.name || '';
            emailInput.value = userData.email || '';
            if (auth2passos) auth2passos.checked = userData.twoFactorEnabled;
        }
    });

    if (saveBtn) saveBtn.addEventListener('click', () => changeUserName());
    if (saveEmailBtn) saveEmailBtn.addEventListener('click', () => changeEmail());
    if (savePasswordBtn) savePasswordBtn.addEventListener('click', () => changePassword());
    if (auth2passos) {
        auth2passos.addEventListener('change', () => toggle2FA(auth2passos.checked));
    }
});

async function loadUserData() {
    try {
        const response = await fetch(`${API_BASE}/auth/${userId}`);
        if (!response.ok) throw new Error('Erro ao carregar');
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function changeUserName() {
    const name = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    try {
        const response = await fetch(`${API_BASE}/auth/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: '' })
        });
        if (response.ok) alert('Nome atualizado!');
    } catch (e) {
        alert('Erro ao atualizar nome.');
    }
}

async function changeEmail() {
    const email = document.getElementById('email').value;
    try {
        const response = await fetch(`${API_BASE}/auth/${userId}/email`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (response.ok) alert('E-mail atualizado!');
        else alert(await response.text());
    } catch (e) {
        alert('Erro ao atualizar e-mail.');
    }
}

async function changePassword() {
    const current = document.getElementById('senhaAtual')?.value;
    const nova = document.getElementById('senhaNova')?.value;
    const conf = document.getElementById('senhaConfirm')?.value;
    if (!nova || nova !== conf) {
        alert('As senhas não coincidem.');
        return;
    }
    try {
        const response = await fetch(`${API_BASE}/auth/${userId}/password`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: current, newPassword: nova })
        });
        if (response.ok) alert('Senha alterada!');
        else alert('Senha atual incorreta.');
    } catch (e) {
        alert('Erro ao alterar senha.');
    }
}

async function toggle2FA(enabled) {
    try {
        await fetch(`${API_BASE}/auth/${userId}/two-factor?enabled=${enabled}`, { method: 'PATCH' });
    } catch (e) {
        console.error(e);
    }
}
