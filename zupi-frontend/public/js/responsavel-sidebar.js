/**
 * Sidebar padronizada — área do responsável (pessoa física).
 */
(function () {
    const PF_PATHS = [
        '/dashboard',
        '/selecao-perfil',
        '/selecao-relatorios',
        '/relatorios',
        '/cadastro-dependentes',
        '/agenda',
        '/ajuda',
        '/perfil-responsavel',
        '/configuracoes',
        '/perfil',
        '/perfil-criancas',
        '/feed',
        '/biblioteca',
        '/guia-casa',
        '/dicas-inclusao',
        '/atividades-interativas',
        '/desafios-semanais'
    ];

    const MENU = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/selecao-relatorios', label: 'Relatórios' },
        { href: '/cadastro-dependentes', label: 'Cadastro de dependentes' },
        { href: '/agenda', label: 'Agenda' },
        { href: '/ajuda', label: 'Ajuda?' },
        { href: '/perfil-responsavel', label: 'Perfil' },
        { href: '/configuracoes', label: 'Configurações' }
    ];

    function currentPath() {
        let p = window.location.pathname.replace(/\.html$/i, '') || '/';
        if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
        return p;
    }

    function isPfArea() {
        const path = currentPath();
        return PF_PATHS.some((base) => path === base || path.startsWith(base + '/'));
    }

    function isActive(href) {
        const path = currentPath();
        if (href === '/dashboard') return path === '/dashboard';
        if (href === '/selecao-relatorios') {
            return path === '/selecao-relatorios' || path === '/relatorios';
        }
        return path === href || path.startsWith(href + '/');
    }

    function buildNavItems() {
        return MENU.map((item) => {
            const active = isActive(item.href);
            const cls = 'nav-link text-white' + (active ? ' active' : '');
            const aria = active ? ' aria-current="page"' : '';
            return `<li class="nav-item mb-2"><a class="${cls}" href="${item.href}"${aria}>${item.label}</a></li>`;
        }).join('')
            + '<li class="nav-item mt-auto"><a class="nav-link text-white" href="#" data-action="logout">Sair</a></li>';
    }

    function renderSidebars() {
        document.querySelectorAll('.dashboard-sidebar .nav.nav-pills, .dashboard-offcanvas .nav.nav-pills').forEach((ul) => {
            ul.innerHTML = buildNavItems();
        });
    }

    function bindLogout() {
        document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
            if (btn.dataset.logoutBound) return;
            btn.dataset.logoutBound = '1';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof ZupiAPI !== 'undefined' && ZupiAPI.logout) {
                    ZupiAPI.logout();
                } else {
                    window.location.href = '/login';
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!isPfArea()) return;
        if (typeof ZupiAPI !== 'undefined' && ZupiAPI.isAuthenticated()) {
            const type = ZupiAPI.getUser().type;
            if (type && type !== 'RESPONSAVEL' && type !== 'ADMIN') return;
        }
        renderSidebars();
        bindLogout();
    });
})();
