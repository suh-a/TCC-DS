const API_BASE = window.API_BASE_URL || window.location.origin;

document.addEventListener('DOMContentLoaded', function() {

    const loginForm = document.getElementById('signupForm');

    loginForm.addEventListener('submit', loginUser);
});

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;

    const erroLogin = document.getElementById('erroLogin');

    erroLogin.style.display = "none";

    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                erroLogin.textContent = "Email ou senha inválidos!";
            } else {
                erroLogin.textContent = "Erro ao realizar login.";
            }

            erroLogin.style.display = "block";
            return;
        }

        const responseData = await response.json();

        alert('Login realizado com sucesso!');
        localStorage.setItem('userId', responseData.id);
        localStorage.removeItem('dailyReportId');
        window.location.href = '/dashboard';

    } catch (error) {
        console.error('Erro ao fazer login:', error);

        erroLogin.textContent = "Erro de conexão com o servidor.";
        erroLogin.style.display = "block";
    }
}