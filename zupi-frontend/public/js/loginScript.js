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
            const erroLogin = document.getElementById('erroLogin');
            if (erroLogin) {
                erroLogin.textContent = 'Login com Google estará disponível em breve.';
                erroLogin.style.display = 'block';
            }
        });
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
        const response = await ZupiAPI.postPublic('/auth/login', { email, password });

        if (!response || !response.ok) {
            erroLogin.textContent = response?.status === 401
                ? 'Email ou senha inválidos!'
                : 'Erro ao realizar login.';
            erroLogin.style.display = 'block';
            return;
        }

        const data = await response.json();
        ZupiAPI.saveSession(data);

        const userType = data.user?.userType || ZupiAPI.getUser().type || 'RESPONSAVEL';
        ZupiAPI.redirectByUserType(userType);
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        erroLogin.textContent = 'Erro de conexão com o servidor. Verifique se a API está em execução.';
        erroLogin.style.display = 'block';
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
    }
}