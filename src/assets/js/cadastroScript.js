document.addEventListener('DOMContentLoaded', function() {
    const cadastroForm = document.getElementById('signupForm');
   
    cadastroForm.addEventListener('submit', cadastrar);


});

async function cadastrar(event) {
    event.preventDefault();

    const name = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('senha').value;

    const userData = {
        name: name,
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');

            const responseData = await response.json();

            localStorage.setItem('userId', responseData.id);
            console.log(localStorage.getItem('userId'));
            localStorage.removeItem('dailyReportId'
            window.location.href = 'dashboard-pais.html'; 
        }
    
    
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
    }
}

