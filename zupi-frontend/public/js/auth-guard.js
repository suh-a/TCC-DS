/**
 * Proteção global de rotas e utilitários de navegação.
 * Carregar após routes.js e api.js.
 */
const ZupiAuthGuard = (() => {
    const PUBLIC_EXACT = new Set([
        '/',
        '/index.html',
        '/login',
        '/login.html',
        '/cadastro',
        '/cadastro.html',
        '/sobre',
        '/sobre.html',
        '/planos',
        '/planos.html',
        '/contato',
        '/contato.html',
        '/contatos',
        '/esqueci-senha',
        '/esqueci-senha.html',
        '/redefinir-senha',
        '/redefinir-senha.html',
        '/erro',
        '/erro.html',
        '/plano-gratis',
        '/plano-premium',
        '/plano-pro',
        '/pagamento',
        '/videos',
        '/zupi',
        '/zupi.html'
    ]);

    const GAME_PREFIX = /^\/jogo/i;

    function normalizePath() {
        let path = window.location.pathname || '/';
        if (path.endsWith('/index.html')) path = '/';
        if (path.endsWith('.html')) {
            path = '/' + path.split('/').pop().replace('.html', '');
        }
        return path;
    }

    function isPublicPage(path = normalizePath()) {
        if (PUBLIC_EXACT.has(path)) return true;
        if (GAME_PREFIX.test(path)) return true;
        if (path === '/JogoMath' || path === '/JogoLigarObjetos') return true;
        return false;
    }

    function isResponsibleArea(path = normalizePath()) {
        const responsible = [
            '/dashboard', '/selecao-perfil', '/selecao-relatorios', '/relatorios',
            '/agenda', '/configuracoes', '/cadastro-dependentes', '/perfil',
            '/perfil-criancas', '/perfil-responsavel', '/feed', '/biblioteca',
            '/dicas-inclusao', '/atividades-interativas', '/guia-casa',
            '/desafios-semanais', '/ajuda', '/recompensas', '/onboarding-crianca',
            '/pagamento'
        ];
        return responsible.includes(path);
    }

    /** Exige perfil de criança selecionado (contexto infantil) */
    const CHILD_ONLY_PATHS = new Set([
        '/dashboard-crianca',
        '/menuJogos',
        '/perfil-crianca',
        '/onboarding-crianca'
    ]);

    function guardPage() {
        if (typeof ZupiAPI === 'undefined') return;

        const path = normalizePath();
        if (isPublicPage(path)) return;

        if (!ZupiAPI.requireAuth()) return;

        const type = ZupiAPI.getUser().type;

        if (isResponsibleArea(path) && type && !['RESPONSAVEL', 'ADMIN'].includes(type)) {
            ZupiAPI.redirectByUserType(type);
            return;
        }

        if (CHILD_ONLY_PATHS.has(path) && !localStorage.getItem('activeChildId')) {
            window.location.href = (ZupiRoutes && ZupiRoutes.selecaoPerfil) || '/selecao-perfil';
        }
    }

    return { guardPage, isPublicPage, normalizePath };
})();

document.addEventListener('DOMContentLoaded', () => {
    ZupiAuthGuard.guardPage();
});
