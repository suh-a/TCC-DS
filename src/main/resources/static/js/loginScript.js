/**
 * Login Script — Usa ZupiAPI para autenticação real.
 * Requer: /js/api.js carregado antes deste script.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Se já autenticado, redirecionar
    if (ZupiAPI.isAuthenticated()) {
        const userType = ZupiAPI.getUser().type;
        ZupiAPI.redirectByUserType(userType);
        return;
    }

    const loginForm = document.getElementById('signupForm');
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', loginWithGoogle);
    }
});

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('senha').value;
    const erroLogin = document.getElementById('erroLogin');

    erroLogin.style.display = 'none';

    if (!email || !password) {
        erroLogin.textContent = 'Preencha todos os campos.';
        erroLogin.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${ZupiAPI.BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            erroLogin.textContent = response.status === 401
                ? 'Email ou senha inválidos!'
                : 'Erro ao realizar login.';
            erroLogin.style.display = 'block';
            return;
        }

        const data = await response.json();
        ZupiAPI.saveSession(data);

        const userType = data.user?.userType || 'RESPONSAVEL';
        ZupiAPI.redirectByUserType(userType);

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        erroLogin.textContent = 'Erro de conexão com o servidor.';
        erroLogin.style.display = 'block';
    }
}

async function loginWithGoogle() {
    const erroLogin = document.getElementById('erroLogin');
    erroLogin.style.display = 'none';

    // TODO: Integrate real Google OAuth2 — currently uses placeholder
    const googlePayload = {
        email: 'google.user@zupi.com',
        googleToken: 'placeholder-token',
        userType: 'RESPONSAVEL'
    };

    try {
        const response = await fetch(`${ZupiAPI.BASE}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(googlePayload)
        });

        if (!response.ok) {
            erroLogin.textContent = 'Falha no login com Google.';
            erroLogin.style.display = 'block';
            return;
        }

        const data = await response.json();
        ZupiAPI.saveSession(data);

        const userType = data.user?.userType || 'RESPONSAVEL';
        ZupiAPI.redirectByUserType(userType);

    } catch (error) {
        console.error('Erro ao fazer login com Google:', error);
        erroLogin.textContent = 'Erro de conexão com o servidor.';
        erroLogin.style.display = 'block';
    }
}
