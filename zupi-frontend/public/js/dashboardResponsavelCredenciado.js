document.addEventListener('DOMContentLoaded', async () => {
    if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

    const user = ZupiAPI.getUser();
    if (user.type !== 'RESPONSAVEL_CREDENCIADO' && user.type !== 'ADMIN') {
        window.location.href = `/403?from=${encodeURIComponent('/dashboard-responsavel-credenciado')}`;
        return;
    }

    const title = document.getElementById('responsibleTitle');
    if (title && user.name) {
        title.textContent = `Ola, ${user.name}`;
    }

    const container = document.getElementById('linkedStudentList');
    if (!container) return;

    try {
        const students = await ZupiAPI.fetchMyChildren();
        const linked = students.filter((student) => student.schoolLinked);
        if (!linked.length) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhum aluno credenciado vinculado a este responsavel.</p></div>';
            return;
        }

        container.innerHTML = linked.map((student) => `
            <div class="col-md-6 col-lg-4">
                <article class="card h-100">
                    <div class="card-body">
                        <h3 class="h5">${escapeHtml(student.name)}</h3>
                        <p class="text-muted mb-2">${escapeHtml(student.schoolName || 'Escola vinculada')}</p>
                        <p class="small mb-3">${escapeHtml(student.schoolClass || 'Turma nao informada')}</p>
                        <a class="btn btn-outline-primary btn-sm" href="/relatorios?childId=${encodeURIComponent(student.id)}">Ver acompanhamento</a>
                    </div>
                </article>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="col-12"><p class="text-danger">Nao foi possivel carregar o aluno vinculado.</p></div>';
    }
});

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}
