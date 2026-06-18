document.addEventListener('DOMContentLoaded', () => {
    if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

    const user = ZupiAPI.getUser();
    if (user.type !== 'ALUNO_CREDENCIADO' && user.type !== 'ADMIN') {
        window.location.href = `/403?from=${encodeURIComponent('/dashboard-aluno-credenciado')}`;
        return;
    }

    const title = document.getElementById('studentTitle');
    if (title && user.name) {
        title.textContent = `Ola, ${user.name}`;
    }

    document.querySelectorAll('[data-switch-responsible]').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            bootstrap.Modal.getOrCreateInstance(document.getElementById('switchResponsibleModal')).show();
        });
    });

    document.getElementById('switchResponsibleForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('responsibleEmailSwitch')?.value.trim();
        const password = document.getElementById('responsiblePasswordSwitch')?.value;
        const response = await ZupiAPI.postPublic('/auth/login', { email, password });
        if (!response || !response.ok) {
            alert(response ? await ZupiAPI.readErrorMessage(response, 'Credenciais invalidas.') : 'Erro de conexao.');
            return;
        }
        const data = await response.json();
        const type = data.user?.userType || data.userType;
        if (type !== 'RESPONSAVEL_CREDENCIADO') {
            alert('Use um acesso de responsavel credenciado vinculado a escola.');
            return;
        }
        ZupiAPI.saveSession(data);
        window.location.href = '/dashboard-responsavel-credenciado';
    });
});
