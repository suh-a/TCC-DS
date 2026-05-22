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
    const planType = document.getElementById('tipoConta')?.value || null;
    const erroLogin = document.getElementById('erroLogin');

    erroLogin.style.display = 'none';

    if (!email || !password) {
        erroLogin.textContent = 'Preencha todos os campos.';
        erroLogin.style.display = 'block';
        return;
    }

    const body = { email, password };
    if (planType) body.planType = planType;

    try {
        const response = await ZupiAPI.postPublic('/auth/login', body);

        if (!response || !response.ok) {
            if (response?.status === 409) {
                const msg = await response.text();
                erroLogin.textContent = msg || 'Selecione o tipo de conta (Pessoa Física ou Jurídica).';
            } else {
                erroLogin.textContent = response?.status === 401
                    ? 'Email ou senha inválidos!'
                    : 'Erro ao realizar login.';
            }
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
