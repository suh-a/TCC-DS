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
});
