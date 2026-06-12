/**
 * Garante sessão e criança ativa em páginas de jogos.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ZupiAPI === 'undefined') return;

    const path = window.location.pathname || '';
    const isGamePage = /^\/jogo/i.test(path) || path === '/menuJogos' || path === '/JogoMath' || path === '/JogoLigarObjetos';
    if (!isGamePage) return;

    if (!ZupiAPI.isAuthenticated()) {
        ZupiAPI.requireAuth();
        return;
    }

    const childId = resolveGameChildId();
    if (!childId) {
        window.location.href = (ZupiRoutes && ZupiRoutes.selecaoPerfil) || '/selecao-perfil';
    }
});

function resolveGameChildId() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('childId');
    const stored = fromUrl
        || localStorage.getItem('activeChildId')
        || localStorage.getItem('selectedChildId')
        || localStorage.getItem('childId');

    const user = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser() : {};
    const userType = user.type;
    const childId = stored || (['CRIANCA', 'ALUNO_CREDENCIADO'].includes(userType) ? user.id : null);

    if (childId) {
        localStorage.setItem('activeChildId', String(childId));
        localStorage.setItem('selectedChildId', String(childId));
        localStorage.setItem('childId', String(childId));
    }

    return childId;
}
