/**
 * Login - autenticacao via ZupiAPI.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (ZupiAPI.isAuthenticated()) {
        ZupiAPI.redirectByUserType(ZupiAPI.getUser().type);
        return;
    }

    bindAuthInteractions();
    restoreRememberedEmail();

    const loginForm = document.getElementById('signupForm');
    if (loginForm) loginForm.addEventListener('submit', loginUser);
});

function bindAuthInteractions() {
    document.querySelectorAll('[data-toggle-password]').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.togglePassword);
            if (!input) return;
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            button.textContent = showing ? 'Mostrar' : 'Ocultar';
        });
    });

    document.querySelectorAll('.auth-field input, .auth-field select').forEach((field) => {
        field.addEventListener('input', () => field.closest('.auth-field')?.classList.toggle('is-filled', !!field.value));
        field.dispatchEvent(new Event('input'));
    });
}

function restoreRememberedEmail() {
    const savedEmail = localStorage.getItem('zupiRememberedEmail');
    const email = document.getElementById('email');
    const remember = document.getElementById('rememberLogin');
    if (savedEmail && email) {
        email.value = savedEmail;
        if (remember) remember.checked = true;
    }
}

function setLoginError(message) {
    const erroLogin = document.getElementById('erroLogin');
    if (!erroLogin) return;
    erroLogin.textContent = message;
    erroLogin.style.display = message ? 'block' : 'none';
}

function setLoading(button, loading, label) {
    if (!button) return;
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
    if (loading) {
        button.dataset.defaultLabel = button.textContent;
        button.textContent = label || 'Aguarde...';
    } else if (button.dataset.defaultLabel) {
        button.textContent = button.dataset.defaultLabel;
    }
}

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('senha').value;
    const planType = document.getElementById('tipoConta')?.value || null;
    const remember = document.getElementById('rememberLogin')?.checked;
    const submit = document.getElementById('loginSubmit');

    setLoginError('');

    if (!email || !password) {
        setLoginError('Preencha todos os campos para continuar.');
        return;
    }

    if (remember) localStorage.setItem('zupiRememberedEmail', email);
    else localStorage.removeItem('zupiRememberedEmail');

    const body = { email, password };
    if (planType) body.planType = planType;

    setLoading(submit, true, 'Entrando...');

    try {
        const response = await ZupiAPI.postPublic('/auth/login', body);

        if (!response || !response.ok) {
            if (response?.status === 409) {
                const msg = await response.text();
                setLoginError(msg || 'Selecione o tipo de conta: Pessoa Fisica ou Juridica.');
            } else {
                setLoginError(response?.status === 401 ? 'E-mail ou senha invalidos.' : 'Erro ao realizar login.');
            }
            return;
        }

        const data = await response.json();
        ZupiAPI.saveSession(data);
        const userType = data.user?.userType || ZupiAPI.getUser().type || 'RESPONSAVEL';
        ZupiAPI.redirectByUserType(userType);
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        setLoginError('Erro de conexao com o servidor. Verifique se a API esta em execucao.');
    } finally {
        setLoading(submit, false);
    }
}

window.onload = function () {
    if (!window.google || !document.getElementById('googleBtn')) return;

    google.accounts.id.initialize({
        client_id: '841923211184-gn3apap7cv42s3nrbtrri7seh31h0gvp.apps.googleusercontent.com',
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(document.getElementById('googleBtn'), {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        width: 360,
        text: 'continue_with'
    });
};

async function handleGoogleLogin(response) {
    try {
        const res = await fetch('http://localhost:8080/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });

        if (!res.ok) throw new Error('Erro no login Google');
        const data = await res.json();
        ZupiAPI.saveSession(data);
        ZupiAPI.redirectByUserType(data.user?.userType || 'RESPONSAVEL');
    } catch (error) {
        console.error('Erro login Google:', error);
        setLoginError('Nao foi possivel entrar com Google agora.');
    }
}
