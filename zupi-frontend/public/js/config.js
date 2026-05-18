document.addEventListener('DOMContentLoaded', function () {
    if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

    const nameInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const saveBtn = document.getElementById('saveBtn');
    const saveEmailBtn = document.getElementById('saveEmailBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const auth2passos = document.getElementById('auth2passos');

    loadUserData().then((userData) => {
        if (userData) {
            if (nameInput) nameInput.value = userData.name || '';
            if (emailInput) emailInput.value = userData.email || '';
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
    return ZupiAPI.fetchMe();
}

async function changeUserName() {
    const userId = ZupiAPI.getUser().id;
    const name = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    try {
        const response = await ZupiAPI.put(`/auth/${userId}`, { name, email, password: '' });
        if (response && response.ok) alert('Nome atualizado!');
    } catch (e) {
        alert('Erro ao atualizar nome.');
    }
}

async function changeEmail() {
    const userId = ZupiAPI.getUser().id;
    const email = document.getElementById('email').value;
    try {
        const response = await ZupiAPI.patch(`/auth/${userId}/email`, { email });
        if (response && response.ok) alert('E-mail atualizado!');
        else if (response) alert(await response.text());
    } catch (e) {
        alert('Erro ao atualizar e-mail.');
    }
}

async function changePassword() {
    const userId = ZupiAPI.getUser().id;
    const current = document.getElementById('senhaAtual')?.value;
    const nova = document.getElementById('senhaNova')?.value;
    const conf = document.getElementById('senhaConfirm')?.value;
    if (!nova || nova !== conf) {
        alert('As senhas não coincidem.');
        return;
    }
    try {
        const response = await ZupiAPI.patch(`/auth/${userId}/password`, {
            currentPassword: current,
            newPassword: nova
        });
        if (response && response.ok) alert('Senha alterada!');
        else alert('Senha atual incorreta.');
    } catch (e) {
        alert('Erro ao alterar senha.');
    }
}

async function toggle2FA(enabled) {
    const userId = ZupiAPI.getUser().id;
    try {
        await ZupiAPI.patch(`/auth/${userId}/two-factor?enabled=${enabled}`, {});
    } catch (e) {
        console.error(e);
    }
}
