document.addEventListener('DOMContentLoaded', () => {
    const forgotForm = document.getElementById('formEsqueci');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgot);
    }

    const resetForm = document.getElementById('formReset');
    if (resetForm) {
        resetForm.addEventListener('submit', handleReset);
    }
});

async function handleForgot(e) {
    e.preventDefault();
    const msg = document.getElementById('msg');
    const email = document.getElementById('email').value.trim();
    const url = typeof ZupiAPI !== 'undefined' ? ZupiAPI.buildUrl('/auth/forgot-password') : '/auth/forgot-password';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        msg.className = 'mt-3 small text-success';
        msg.textContent = res.ok || res.status === 202
            ? 'Se o e-mail existir, você receberá as instruções.'
            : 'Não foi possível processar. Tente novamente.';
    } catch {
        msg.className = 'mt-3 small text-danger';
        msg.textContent = 'Erro de conexão.';
    }
}

async function handleReset(e) {
    e.preventDefault();
    const msg = document.getElementById('msg');
    const token = new URLSearchParams(window.location.search).get('token');
    const s1 = document.getElementById('senha').value;
    const s2 = document.getElementById('senha2').value;

    if (s1 !== s2) {
        msg.className = 'text-danger';
        msg.textContent = 'Senhas não coincidem.';
        return;
    }
    if (!token) {
        msg.className = 'text-danger';
        msg.textContent = 'Link inválido.';
        return;
    }

    const url = typeof ZupiAPI !== 'undefined' ? ZupiAPI.buildUrl('/auth/reset-password') : '/auth/reset-password';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword: s1 })
        });
        if (res.ok) {
            msg.className = 'text-success';
            msg.textContent = 'Senha alterada! Redirecionando...';
            setTimeout(() => { window.location.href = '/login'; }, 2000);
        } else {
            msg.className = 'text-danger';
            msg.textContent = 'Token inválido ou expirado.';
        }
    } catch {
        msg.className = 'text-danger';
        msg.textContent = 'Erro de conexão.';
    }
}
