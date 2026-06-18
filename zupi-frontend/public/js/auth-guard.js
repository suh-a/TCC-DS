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
            '/perfil-criancas', '/perfil-responsavel', '/feed',
            '/dicas-inclusao', '/guia-casa',
            '/ajuda',
            '/pagamento'
        ];
        return responsible.includes(path);
    }

    function isChildContentArea(path = normalizePath()) {
        return ['/biblioteca', '/atividades-interativas', '/desafios-semanais', '/menuJogos', '/recompensas'].includes(path);
    }

    function isResponsibleCredentialArea(path = normalizePath()) {
        return [
            '/relatorios',
            '/perfil-crianca',
            '/perfil',
            '/ajuda',
            '/configuracoes',
            '/biblioteca'
        ].includes(path);
    }

    function isSchoolChildReportArea(path = normalizePath()) {
        return path === '/relatorios';
    }

    function isSharedSettingsArea(path = normalizePath()) {
        return path === '/configuracoes';
    }

    const ROLE_AREAS = [
        { paths: ['/dashboard-escola'], roles: ['ESCOLA', 'ADMIN'] },
        { paths: ['/dashboard-docente'], roles: ['DOCENTE', 'ADMIN'] },
        { paths: ['/dashboard-aluno-credenciado'], roles: ['ALUNO_CREDENCIADO', 'ADMIN'] },
        { paths: ['/dashboard-responsavel-credenciado'], roles: ['RESPONSAVEL_CREDENCIADO', 'ADMIN'] },
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

        if (isResponsibleArea(path) && type === 'RESPONSAVEL_CREDENCIADO' && !isResponsibleCredentialArea(path)) {
            window.location.href = `/403?from=${encodeURIComponent(path)}`;
            return;
        }

        const responsibleAreaRoles = isSchoolChildReportArea(path)
            ? ['RESPONSAVEL', 'RESPONSAVEL_CREDENCIADO', 'ESCOLA', 'DOCENTE', 'ALUNO_CREDENCIADO', 'ADMIN']
            : isSharedSettingsArea(path)
                ? ['RESPONSAVEL', 'RESPONSAVEL_CREDENCIADO', 'ESCOLA', 'DOCENTE', 'ADMIN']
            : ['RESPONSAVEL', 'RESPONSAVEL_CREDENCIADO', 'ADMIN'];
        if (isResponsibleArea(path) && type && !responsibleAreaRoles.includes(type)) {
            window.location.href = `/403?from=${encodeURIComponent(path)}`;
            return;
        }

        if (type === 'RESPONSAVEL_CREDENCIADO' && path === '/cadastro-dependentes') {
            window.location.href = `/403?from=${encodeURIComponent(path)}`;
            return;
        }

        if (isChildContentArea(path)
            && type
            && !['CRIANCA', 'ALUNO_CREDENCIADO', 'RESPONSAVEL', 'RESPONSAVEL_CREDENCIADO', 'ESCOLA', 'DOCENTE', 'ADMIN'].includes(type)) {
            window.location.href = `/403?from=${encodeURIComponent(path)}`;
            return;
        }

        const requestedChildId = new URLSearchParams(window.location.search).get('childId');
        if (CHILD_ONLY_PATHS.has(path) && !['CRIANCA', 'ALUNO_CREDENCIADO'].includes(type) && !localStorage.getItem('activeChildId') && !requestedChildId) {
            window.location.href = (ZupiRoutes && ZupiRoutes.selecaoPerfil) || '/selecao-perfil';
        }
    }

    return { guardPage, isPublicPage, normalizePath };
})();

document.addEventListener('DOMContentLoaded', () => {
    ZupiAuthGuard.guardPage();
});
