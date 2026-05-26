document.addEventListener('DOMContentLoaded', async function () {
    if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

    const childId = getQueryParam('childId') || localStorage.getItem('childId');
    if (!childId) {
        displayProfileError('ID da criança não encontrado. Selecione um perfil novamente.');
        return;
    }

    localStorage.setItem('childId', childId);

    try {
        const childData = await ZupiAPI.fetchJson(`/child/details/${childId}`);
        if (!childData) throw new Error('Erro ao buscar dados do perfil');
        renderChildProfile(childData);
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        displayProfileError('Não foi possível carregar o perfil da criança. Tente novamente.');
    }
});

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function formatDate(dateString) {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function renderChildProfile(child) {
    const avatarEl = document.getElementById('childProfileAvatar');
    if (avatarEl && typeof ZupiChildAvatar !== 'undefined') {
        ZupiChildAvatar.applyToElement(avatarEl, child, 96);
    }

    document.getElementById('childName').textContent = child.name || 'Nome não informado';
    document.getElementById('childAge').textContent =
        child.age != null ? `${child.age} anos` : 'Não informado';
    document.getElementById('childCondition').textContent = child.condition || 'Não informado';
    document.getElementById('childBirthDate').textContent = formatDate(child.birthDate);
    document.getElementById('childSchoolClass').textContent = child.schoolClass || 'Não informado';
    document.getElementById('childReportCount').textContent = '0';
}

function displayProfileError(message) {
    const container = document.querySelector('.profile-container') || document.body;
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.textContent = message;
    container.prepend(alert);
}
