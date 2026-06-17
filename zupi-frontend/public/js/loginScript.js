/**
 * Login - autenticacao via ZupiAPI.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (ZupiAPI.isAuthenticated()) {
        redirectAuthenticatedUser();
        return;
    }

    const loginForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }
});

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('senha').value;

    if (!email || !password) {
        ZupiUI.error('Preencha todos os campos.');
        return;
    }

    try {
        const response = await ZupiAPI.postPublic('/auth/login', { email, password });

        if (!response || !response.ok) {
            const message = response?.status === 401
                ? 'Email ou senha invalidos!'
                : await ZupiAPI.readErrorMessage(response, 'Erro ao realizar login.');
            ZupiUI.error(message);
            return;
        }

        const data = await response.json();
        ZupiAPI.saveSession(data);

        const userType = await resolvePostLoginUserType(data.user?.userType || ZupiAPI.getUser().type || 'RESPONSAVEL');
        ZupiAPI.redirectByUserType(userType);
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        ZupiUI.error('Erro de conexao com o servidor. Verifique se a API esta em execucao.');
    }
}

let googleInitAttempts = 0;

window.addEventListener('load', initGoogleButton);

function initGoogleButton() {
    const container = document.getElementById('googleBtn');
    if (!container) {
        return;
    }

    if (!window.google?.accounts?.id) {
        if (googleInitAttempts < 20) {
            googleInitAttempts++;
            window.setTimeout(initGoogleButton, 250);
        } else {
            ZupiUI.error('Nao foi possivel carregar o botao do Google. Tente novamente em instantes.');
        }
        return;
    }

    if (container.dataset.googleRendered === 'true') return;
    container.dataset.googleRendered = 'true';

    google.accounts.id.initialize({
        client_id: '841923211184-gn3apap7cv42s3nrbtrri7seh31h0gvp.apps.googleusercontent.com',
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            width: 360,
            text: 'continue_with'
        }
    );
}

async function handleGoogleLogin(response) {
    try {
        const res = await ZupiAPI.postPublic('/auth/google', {
            token: response.credential
        });

        if (!res || !res.ok) {
            const message = await ZupiAPI.readErrorMessage(res, 'Erro no login Google');
            throw new Error(message);
        }

        const data = await res.json();

        if (data.status === 'REGISTRATION_REQUIRED') {
            sessionStorage.setItem('zupiGooglePending', JSON.stringify({
                token: response.credential,
                name: data.pendingUser?.name || '',
                email: data.pendingUser?.email || '',
                googleId: data.pendingUser?.googleId || '',
                picture: data.pendingUser?.picture || ''
            }));
            window.location.href = '/cadastro?google=1';
            return;
        }

        ZupiAPI.saveSession(data);
        const userType = await resolvePostLoginUserType(data.user?.userType || ZupiAPI.getUser().type || 'RESPONSAVEL');
        ZupiAPI.redirectByUserType(userType);
    } catch (error) {
        console.error('Erro login Google:', error);
        ZupiUI.error(error.message || 'Erro ao fazer login com Google.');
    }
}

async function redirectAuthenticatedUser() {
    const userType = await resolvePostLoginUserType(ZupiAPI.getUser().type || 'RESPONSAVEL');
    ZupiAPI.redirectByUserType(userType);
}

async function resolvePostLoginUserType(userType) {
    if (userType !== 'RESPONSAVEL') {
        return userType;
    }

    try {
        const children = await ZupiAPI.fetchMyChildren();
        const hasSchoolLinkedStudent = Array.isArray(children) && children.some((child) => child.schoolLinked);
        if (hasSchoolLinkedStudent) {
            ZupiAPI.markCredentialedResponsible();
            return 'RESPONSAVEL_CREDENCIADO';
        }
    } catch (error) {
        console.warn('Nao foi possivel verificar vinculo escolar do responsavel:', error);
    }

    return userType;
}
