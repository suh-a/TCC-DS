(function () {
    const CONTEXT_PATHS = new Set([
        '/dashboard-responsavel-credenciado',
        '/relatorios',
        '/perfil-crianca',
        '/biblioteca'
    ]);

    const MENU = [
        { href: '/dashboard-responsavel-credenciado', label: 'Dashboard', section: 'dashboard' },
        { href: '/dashboard-responsavel-credenciado#aluno-vinculado', label: 'Aluno vinculado', section: 'aluno-vinculado' },
        { href: '/dashboard-responsavel-credenciado#acompanhamento', label: 'Acompanhamento', section: 'acompanhamento' },
        { href: '/dashboard-responsavel-credenciado#relatorios-escola', label: 'Relatorios', section: 'relatorios-escola' },
        { href: '/biblioteca', label: 'Biblioteca', section: 'biblioteca' },
        { href: '/dashboard-responsavel-credenciado#ajuda-escola', label: 'Ajuda', section: 'ajuda-escola' }
    ];

    function currentPath() {
        let path = window.location.pathname || '/';
        if (path.endsWith('.html')) path = '/' + path.split('/').pop().replace('.html', '');
        return path;
    }

    function isCredentialedResponsible() {
        return typeof ZupiAPI !== 'undefined'
            && ZupiAPI.isAuthenticated()
            && ZupiAPI.getUser().type === 'RESPONSAVEL_CREDENCIADO';
    }

    function activeSection() {
        const path = currentPath();
        if (path === '/dashboard-responsavel-credenciado') {
            return (window.location.hash || '#dashboard').replace('#', '') || 'dashboard';
        }
        if (path === '/relatorios') return 'relatorios-escola';
        if (path === '/biblioteca') return 'biblioteca';
        if (path === '/perfil-crianca') return 'aluno-vinculado';
        return 'dashboard';
    }

    function buildMenu() {
        const active = activeSection();
        return MENU.map((item) => {
            const selected = item.section === active;
            const cls = 'nav-link text-white' + (selected ? ' active' : '');
            const aria = selected ? ' aria-current="page"' : '';
            return `<li class="nav-item mb-2"><a class="${cls}" href="${item.href}"${aria}>${item.label}</a></li>`;
        }).join('') + '<li class="nav-item mt-auto"><a class="nav-link text-white" href="#" data-action="logout">Sair</a></li>';
    }

    function render() {
        const html = buildMenu();
        document.querySelectorAll('.dashboard-sidebar ul.nav, .dashboard-offcanvas ul.nav, [data-pf-sidebar]').forEach((ul) => {
            ul.innerHTML = html;
            ul.dataset.credentialedSidebarRendered = '1';
        });
        document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
            if (btn.dataset.credentialedLogoutBound) return;
            btn.dataset.credentialedLogoutBound = '1';
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                ZupiAPI.logout();
            });
        });
        document.dispatchEvent(new CustomEvent('credentialed-sidebar-ready'));
    }

    function adjustPageLinks() {
        if (currentPath() !== '/relatorios') return;
        const back = document.querySelector('a[href="/selecao-relatorios"]');
        if (back) {
            back.href = '/dashboard-responsavel-credenciado#relatorios-escola';
            back.textContent = 'Voltar ao painel do responsavel';
        }
    }

    function init() {
        if (!CONTEXT_PATHS.has(currentPath()) || !isCredentialedResponsible()) return;
        render();
        adjustPageLinks();
    }

    init();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
    window.addEventListener('hashchange', init);
})();
