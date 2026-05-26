/**
 * Login — autenticação via ZupiAPI.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (ZupiAPI.isAuthenticated()) {
        ZupiAPI.redirectByUserType(ZupiAPI.getUser().type);
        return;
    }

    const loginForm = document.getElementById('signupForm');
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            ZupiUI.show('Login com Google estara disponivel em breve.');
        });
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

        const userType = data.user?.userType || ZupiAPI.getUser().type || 'RESPONSAVEL';
        ZupiAPI.redirectByUserType(userType);
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        ZupiUI.error('Erro de conexao com o servidor. Verifique se a API esta em execucao.');
    }
}

window.onload = function () {

    google.accounts.id.initialize({
        client_id: "841923211184-gn3apap7cv42s3nrbtrri7seh31h0gvp.apps.googleusercontent.com",

        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            width: 360,
            text: "continue_with"
        }
    );
};

async function handleGoogleLogin(response) {

    try {

        const res = await fetch(
            'http://localhost:8080/auth/google',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    token: response.credential
                })
            }
        );

        if (!res.ok) {
            throw new Error('Erro no login Google');
        }

        const data = await res.json();

        console.log(data);

        // salva sessão
        ZupiAPI.saveSession(data);

        // pega tipo usuário
        const userType =
            data.user?.userType || 'RESPONSAVEL';

        // redireciona corretamente
        ZupiAPI.redirectByUserType(userType);

    } catch (error) {

        console.error(
            'Erro login Google:',
            error
        );
        ZupiUI.error('Erro ao fazer login com Google.');
    }
}
