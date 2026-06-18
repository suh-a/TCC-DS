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

    showSectionFromHash();
    window.addEventListener('hashchange', showSectionFromHash);

    const container = document.getElementById('linkedStudentList');
    if (!container) return;

    try {
        const students = await ZupiAPI.fetchMyChildren();
        const linked = students.filter((student) => student.schoolLinked);
        if (!linked.length) {
            container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhum aluno credenciado vinculado a este responsavel.</p></div>';
            return;
        }

        const summaries = await Promise.all(linked.map(loadStudentSummary));

        container.innerHTML = summaries.map(({ student, progress }) => `
            <div class="col-md-6 col-lg-4">
                <article class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <h3 class="h5">${escapeHtml(student.name)}</h3>
                        <p class="text-muted mb-2">${escapeHtml(student.schoolName || 'Escola vinculada')}</p>
                        <p class="small mb-3">${escapeHtml(student.schoolClass || 'Turma nao informada')}</p>
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <div class="border rounded p-2 h-100">
                                    <span class="small text-muted d-block">Jogos</span>
                                    <strong>${escapeHtml(progress.totalGames ?? 0)}</strong>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="border rounded p-2 h-100">
                                    <span class="small text-muted d-block">Media</span>
                                    <strong>${escapeHtml(progress.averageScore ?? 0)}%</strong>
                                </div>
                            </div>
                        </div>
                        <p class="small text-muted flex-grow-1">${escapeHtml(progress.message || 'Ainda nao ha dados de desempenho para este aluno.')}</p>
                        <div class="d-flex flex-wrap gap-2 mt-auto">
                            <a class="btn btn-outline-primary btn-sm" data-child-link="${escapeHtml(student.id)}" href="/relatorios?childId=${encodeURIComponent(student.id)}">Relatorios</a>
                            <a class="btn btn-primary btn-sm" data-child-link="${escapeHtml(student.id)}" href="/perfil-crianca?childId=${encodeURIComponent(student.id)}">Perfil</a>
                        </div>
                    </div>
                </article>
            </div>
        `).join('');
        renderSummaryStats(summaries);
        renderReportsList(summaries);
        bindChildLinks();
    } catch (error) {
        container.innerHTML = '<div class="col-12"><p class="text-danger">Nao foi possivel carregar o aluno vinculado.</p></div>';
    }
});

function showSectionFromHash() {
    const hash = (window.location.hash || '').replace('#', '');
    if (!hash) return;
    document.querySelector(hash.startsWith('relatorios') ? '#relatorios-escola' : `#${hash}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadStudentSummary(student) {
    const [progress, sessions] = await Promise.all([
        loadProgress(student.id),
        loadSessions(student.id)
    ]);

    const totalGames = Array.isArray(sessions) ? sessions.length : Number(progress.totalGames || 0);
    const averageScore = Array.isArray(sessions) && sessions.length
        ? Math.round(sessions.reduce((sum, session) => sum + (Number(session.percentage) || 0), 0) / sessions.length)
        : Number(progress.averageScore || 0);

    return {
        student,
        sessions: Array.isArray(sessions) ? sessions : [],
        progress: {
            ...progress,
            totalGames,
            averageScore
        }
    };
}

async function loadProgress(childId) {
    try {
        return await ZupiAPI.fetchJson(`/child/${encodeURIComponent(childId)}/games/progress`, { skipAuthRedirect: true }) || {};
    } catch (_) {
        return {};
    }
}

async function loadSessions(childId) {
    try {
        const response = await ZupiAPI.get(`/child/${encodeURIComponent(childId)}/games/sessions`, { skipAuthRedirect: true });
        if (response && response.ok) return await response.json();
    } catch (_) {
        return [];
    }
    return [];
}

function renderSummaryStats(summaries) {
    const totalStudents = summaries.length;
    const totalGames = summaries.reduce((sum, item) => sum + Number(item.progress.totalGames || 0), 0);
    const averages = summaries
        .map((item) => Number(item.progress.averageScore || 0))
        .filter((value) => value > 0);
    const average = averages.length
        ? Math.round(averages.reduce((sum, value) => sum + value, 0) / averages.length)
        : 0;

    setText('statLinkedStudents', String(totalStudents));
    setText('statTotalGames', String(totalGames));
    setText('statAverageScore', `${average}%`);
}

function renderReportsList(summaries) {
    const container = document.getElementById('responsibleReportsList');
    if (!container) return;
    if (!summaries.length) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">Nenhum aluno vinculado para exibir relatorios.</p></div>';
        return;
    }

    container.innerHTML = summaries.map(({ student, progress, sessions }) => {
        const latest = sessions[0];
        const latestText = latest
            ? `${escapeHtml(latest.gameName || latest.gameId || 'Jogo')} - ${escapeHtml(progress.averageScore || 0)}%`
            : 'Nenhuma partida registrada ainda.';
        return `
            <div class="col-md-6 col-lg-4">
                <article class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <h3 class="h5">${escapeHtml(student.name)}</h3>
                        <p class="text-muted small mb-2">${escapeHtml(student.schoolClass || 'Turma nao informada')}</p>
                        <p class="small flex-grow-1">${latestText}</p>
                        <a class="btn btn-primary btn-sm mt-auto" data-child-link="${escapeHtml(student.id)}" href="/relatorios?childId=${encodeURIComponent(student.id)}">Abrir relatorio</a>
                    </div>
                </article>
            </div>
        `;
    }).join('');
}

function bindChildLinks() {
    document.querySelectorAll('[data-child-link]').forEach((link) => {
        link.addEventListener('click', () => {
            const childId = link.getAttribute('data-child-link');
            if (!childId) return;
            localStorage.setItem('activeChildId', String(childId));
            localStorage.setItem('selectedChildId', String(childId));
            localStorage.setItem('childId', String(childId));
        });
    });
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}
