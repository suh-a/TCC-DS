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
        '/403',
        '/403.html',
        '/acesso-negado',
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
            '/dashboard', '/dashboard-pais', '/selecao-perfil', '/selecao-relatorios', '/relatorios',
            '/agenda', '/configuracoes', '/cadastro-dependentes', '/perfil',
            '/perfil-criancas', '/perfil-responsavel', '/feed', '/biblioteca',
            '/dicas-inclusao', '/atividades-interativas', '/guia-casa',
            '/desafios-semanais', '/ajuda', '/recompensas', '/onboarding-crianca',
            '/pagamento'
        ];
        return responsible.includes(path);
    }

    const ROLE_AREAS = [
        { paths: ['/dashboard-escola'], roles: ['ESCOLA', 'ADMIN'] },
        { paths: ['/dashboard-docente'], roles: ['DOCENTE', 'ADMIN'] },
        { paths: ['/dashboard-admin'], roles: ['ADMIN'] }
    ];

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

        const restrictedArea = ROLE_AREAS.find((area) =>
            area.paths.some((base) => path === base || path.startsWith(base + '/'))
        );
        if (restrictedArea && type && !restrictedArea.roles.includes(type)) {
            window.location.href = `/403?from=${encodeURIComponent(path)}`;
            return;
        }

        if (isResponsibleArea(path) && type && !['RESPONSAVEL', 'ADMIN'].includes(type) && !(path === '/biblioteca' && type === 'ESCOLA')) {
            window.location.href = `/403?from=${encodeURIComponent(path)}`;
            return;
        }

        if (type === 'RESPONSAVEL'
            && ZupiAPI.getUser().planType === 'PESSOA_JURIDICA'
            && path === '/cadastro-dependentes') {
            window.location.href = `/403?from=${encodeURIComponent(path)}`;
            return;
        }

        if (CHILD_ONLY_PATHS.has(path) && !['CRIANCA', 'ALUNO_CREDENCIADO'].includes(type) && !localStorage.getItem('activeChildId')) {
            window.location.href = (ZupiRoutes && ZupiRoutes.selecaoPerfil) || '/selecao-perfil';
        }
    }

    return { guardPage, isPublicPage, normalizePath };
})();

document.addEventListener('DOMContentLoaded', () => {
    ZupiAuthGuard.guardPage();
});
