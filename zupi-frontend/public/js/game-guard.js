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

    if (!localStorage.getItem('activeChildId')) {
        window.location.href = (ZupiRoutes && ZupiRoutes.selecaoPerfil) || '/selecao-perfil';
    }
});
