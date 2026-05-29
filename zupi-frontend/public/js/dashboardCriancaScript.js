document.addEventListener('DOMContentLoaded', async function () {
    if (typeof ZupiAPI !== 'undefined' && !ZupiAPI.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    const childId = ChildNav.init({ active: 'dashboard' });
    if (!childId) return;

    await loadChildDashboard(childId);
});

async function loadChildDashboard(childId) {
    const titleEl = document.getElementById('title');
    const totalTimeEl = document.getElementById('totalTime');
    const gamesCompletedEl = document.getElementById('gamesCompleted');
    const progressEl = document.getElementById('progress');

    try {
        const [childRes, progressRes, sessionsRes] = await Promise.all([
            ZupiAPI.get(`/child/details/${childId}`),
            ZupiAPI.get(`/child/${childId}/games/progress`),
            ZupiAPI.get(`/child/${childId}/games/sessions`)
        ]);

        if (childRes && childRes.ok) {
            const child = await childRes.json();
            if (titleEl) titleEl.textContent = `Olá, ${child.name}!`;
        }

        let totalMinutes = 0;
        let completed = 0;
        let progressPct = 0;
        let sessions = [];

        if (sessionsRes && sessionsRes.ok) {
            const apiSessions = await sessionsRes.json();
            if (Array.isArray(apiSessions)) {
                sessions = apiSessions;
            }
        }

        if (window.ZupiGameReports) {
            sessions = ZupiGameReports.mergeSessions(sessions, childId);
            const summary = ZupiGameReports.summarize(sessions);
            completed = summary.totalSessions;
            totalMinutes = summary.totalSeconds / 60;
            progressPct = summary.average;
            ZupiGameReports.renderMiniReport(
                document.getElementById('childGameReport'),
                sessions,
                { title: 'Meu resumo dos jogos' }
            );
        } else if (Array.isArray(sessions)) {
            completed = sessions.length;
            totalMinutes = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60;
        }

        if (progressRes && progressRes.ok) {
            const progress = await progressRes.json();
            progressPct = progressPct || progress.averageScore || progress.average || 0;
        }

        if (totalTimeEl) totalTimeEl.textContent = `${Math.round(totalMinutes)} min`;
        if (gamesCompletedEl) gamesCompletedEl.textContent = String(completed);
        if (progressEl) progressEl.textContent = `${progressPct}%`;
    } catch (e) {
        console.error('Erro ao carregar dashboard infantil:', e);
    }
}
