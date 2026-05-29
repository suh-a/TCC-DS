document.addEventListener('DOMContentLoaded', async function () {
    if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

    const childId = getQueryParam('childId')
        || localStorage.getItem('activeChildId')
        || localStorage.getItem('selectedChildId')
        || localStorage.getItem('childId');

    if (!childId) {
        displayProfileError('ID da crianca nao encontrado. Selecione um perfil novamente.');
        return;
    }

    localStorage.setItem('childId', childId);
    localStorage.setItem('activeChildId', childId);
    localStorage.setItem('selectedChildId', childId);

    try {
        const childData = await ZupiAPI.fetchJson(`/child/details/${childId}`);
        if (!childData) throw new Error('Erro ao buscar dados do perfil');
        renderChildProfile(childData, childId);
        await renderChildReports(childId);
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        displayProfileError('Nao foi possivel carregar o perfil da crianca. Tente novamente.');
    }
});

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function formatDate(dateString) {
    if (!dateString) return 'Nao informado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function renderChildProfile(child, childId) {
    setText('childName', child.name || 'Nome nao informado');
    setText('childAge', child.age != null ? `${child.age} anos` : 'Nao informado');
    setText('childCondition', child.condition || 'Nao informado');
    setText('childBirthDate', formatDate(child.birthDate));
    setText('childSchoolClass', child.schoolClass || 'Nao informado');

    const reportButton = document.getElementById('viewReportButton');
    if (reportButton) reportButton.href = `/relatorios?childId=${childId}`;

    renderChildPhoto(child, childId);
}

function renderChildPhoto(child, childId) {
    if (!window.ZupiProfileMedia) return;

    const preview = document.getElementById('childPhotoPreview');
    if (preview) {
        preview.dataset.profileName = child.name || 'Crianca';
        preview.innerHTML = ZupiProfileMedia.renderAvatar({
            type: 'child',
            id: childId,
            name: child.name || 'Crianca',
            size: Number(preview.dataset.profileSize || 120),
            fallbackUrl: child.profilePhotoUrl || ''
        });
    }

    const input = document.getElementById('childPhotoInput');
    ZupiProfileMedia.bindInput(input, {
        type: 'child',
        id: childId,
        previewSelector: '#childPhotoPreview'
    });
}

async function renderChildReports(childId) {
    if (!window.ZupiGameReports) return;

    const sessions = await ZupiGameReports.loadSessions(childId);
    const summary = ZupiGameReports.summarize(sessions);
    const categories = ZupiGameReports.areaAverages(sessions);

    setText('childReportCount', String(summary.totalSessions));
    setText('profileTotalReports', String(summary.totalSessions));
    setText('profileTotalActivities', String(categories.length));
    setText('profileProgress', `${summary.average}%`);

    const message = document.getElementById('profileReportsMessage');
    if (message) {
        message.textContent = summary.totalSessions
            ? `Este perfil tem ${summary.totalSessions} partida${summary.totalSessions === 1 ? '' : 's'} registrada${summary.totalSessions === 1 ? '' : 's'}, organizadas por categoria e por jogo.`
            : 'Nenhum jogo foi registrado ainda para este perfil. Os dados aparecem automaticamente depois das partidas.';
    }

    ZupiGameReports.renderMiniReport(
        document.getElementById('profileGameSummary'),
        sessions,
        { title: 'Resumo dos jogos deste perfil' }
    );
    ZupiGameReports.renderCategoryDetails(document.getElementById('profileCategoryDetails'), sessions);
    ZupiGameReports.renderGameDetails(document.getElementById('profileGameDetails'), sessions);
    ZupiGameReports.renderLatestSessions(document.getElementById('profileLatestSessions'), sessions);
    setText('profileNarrative', ZupiGameReports.buildNarrative(sessions));
}

function displayProfileError(message) {
    const container = document.querySelector('.dashboard-main-content') || document.body;
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.textContent = message;
    container.prepend(alert);
}
