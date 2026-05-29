document.addEventListener('DOMContentLoaded', () => {
    bindResetInteractions();

    const forgotForm = document.getElementById('formEsqueci');
    if (forgotForm) forgotForm.addEventListener('submit', handleForgot);

    const resetForm = document.getElementById('formReset');
    if (resetForm) resetForm.addEventListener('submit', handleReset);
});

function bindResetInteractions() {
    document.querySelectorAll('[data-toggle-password]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.togglePassword);
            if (!input) return;
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            button.textContent = showing ? 'Mostrar' : 'Ocultar';
        });
    });

    const senha = document.getElementById('senha');
    if (senha) senha.addEventListener('input', updatePasswordStrength);
}

function setFeedback(msg, text, type) {
    if (!msg) return;
    msg.className = 'auth-feedback ' + (type === 'success' ? 'text-success' : 'text-danger');
    msg.textContent = text;
}

function setButtonLoading(button, loading, text) {
    if (!button) return;
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
    if (loading) {
        button.dataset.defaultLabel = button.textContent;
        button.textContent = text || 'Aguarde...';
    } else if (button.dataset.defaultLabel) {
        button.textContent = button.dataset.defaultLabel;
    }
}

function updatePasswordStrength() {
    const value = document.getElementById('senha')?.value || '';
    const bar = document.getElementById('passwordStrengthBar');
    const label = document.getElementById('passwordStrengthText');
    if (!bar || !label) return;

    let score = 0;
    if (value.length >= 6) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    bar.className = score >= 4 ? 'strong' : score >= 2 ? 'medium' : '';
    bar.style.width = [0, 28, 55, 78, 100][score] + '%';
    label.textContent = score >= 4 ? 'Forca da senha: forte.' : score >= 2 ? 'Forca da senha: media.' : value ? 'Forca da senha: fraca.' : 'Forca da senha: aguardando digitacao.';
}

async function handleForgot(e) {
    e.preventDefault();
    const msg = document.getElementById('msg');
    const email = document.getElementById('email').value.trim();
    const button = document.getElementById('forgotSubmit');

    if (!email) {
        setFeedback(msg, 'Informe o e-mail cadastrado.', 'error');
        return;
    }

    const url = typeof ZupiAPI !== 'undefined' ? ZupiAPI.buildUrl('/auth/forgot-password') : '/auth/forgot-password';
    setButtonLoading(button, true, 'Enviando...');

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        setFeedback(msg, res.ok || res.status === 202 ? 'Se o e-mail existir, voce recebera as instrucoes.' : 'Nao foi possivel processar. Tente novamente.', res.ok || res.status === 202 ? 'success' : 'error');
    } catch {
        setFeedback(msg, 'Erro de conexao. Tente novamente em alguns instantes.', 'error');
    } finally {
        setButtonLoading(button, false);
    }
}

async function handleReset(e) {
    e.preventDefault();
    const msg = document.getElementById('msg');
    const button = document.getElementById('resetSubmit');
    const token = new URLSearchParams(window.location.search).get('token');
    const s1 = document.getElementById('senha').value;
    const s2 = document.getElementById('senha2').value;

    if (s1.length < 6) {
        setFeedback(msg, 'A senha precisa ter pelo menos 6 caracteres.', 'error');
        return;
    }
    if (s1 !== s2) {
        setFeedback(msg, 'As senhas nao coincidem.', 'error');
        return;
    }
    if (!token) {
        setFeedback(msg, 'Link invalido ou expirado.', 'error');
        return;
    }

    const url = typeof ZupiAPI !== 'undefined' ? ZupiAPI.buildUrl('/auth/reset-password') : '/auth/reset-password';
    setButtonLoading(button, true, 'Salvando...');

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword: s1 })
        });
        if (res.ok) {
            setFeedback(msg, 'Senha alterada. Redirecionando para o login...', 'success');
            setTimeout(() => { window.location.href = '/login'; }, 1800);
        } else {
            setFeedback(msg, 'Token invalido ou expirado.', 'error');
        }
    } catch {
        setFeedback(msg, 'Erro de conexao. Tente novamente.', 'error');
    } finally {
        setButtonLoading(button, false);
    }
}
