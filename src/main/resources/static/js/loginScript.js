const API_BASE = window.API_BASE_URL || window.location.origin;

document.addEventListener('DOMContentLoaded', function() {

    const loginForm = document.getElementById('signupForm');

    loginForm.addEventListener('submit', loginUser);
});

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;

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

        if (response.ok) {
            alert('Login realizado com sucesso!');
            const responseData = await response.json();
            localStorage.setItem('userId', responseData.id);
            localStorage.removeItem('dailyReportId');
            window.location.href = '/dashboard';
        }

    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }

}