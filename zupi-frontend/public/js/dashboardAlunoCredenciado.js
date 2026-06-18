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

    document.querySelectorAll('[data-action="logout"]').forEach((button) => {
        if (button.dataset.studentLogoutBound) return;
        button.dataset.studentLogoutBound = '1';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            ZupiAPI.logout();
        });
    });
});
