(function () {
    const SCHOOL_CONTEXT_PATHS = new Set([
        '/relatorios',
        '/perfil-crianca'
    ]);

    const MENU = [
        { href: '/dashboard-escola', label: 'Dashboard', section: 'dashboard' },
        { href: '/dashboard-escola#alunos', label: 'Alunos', section: 'alunos' },
        { href: '/dashboard-escola#docentes', label: 'Docentes', section: 'docentes' },
        { href: '/dashboard-escola#responsaveis', label: 'Responsaveis', section: 'responsaveis' },
        { href: '/dashboard-escola#acessos', label: 'Acessos', section: 'acessos' },
        { href: '/dashboard-escola#turmas', label: 'Turmas', section: 'turmas' },
        { href: '/dashboard-escola#relatorios', label: 'Relatorios', section: 'relatorios' },
        { href: '/biblioteca', label: 'Biblioteca', section: 'biblioteca' },
        { href: '/dashboard-escola#ajuda', label: 'Ajuda', section: 'ajuda' }
    ];

    function currentPath() {
        let path = window.location.pathname || '/';
        if (path.endsWith('.html')) {
            path = '/' + path.split('/').pop().replace('.html', '');
        }
        return path;
    }

    function isSchoolUser() {
        return typeof ZupiAPI !== 'undefined'
            && ZupiAPI.isAuthenticated()
            && ZupiAPI.getUser().type === 'ESCOLA';
    }

    function isActive(item) {
        const path = currentPath();
        if (path === '/dashboard-escola') {
            const section = (window.location.hash || '#dashboard').replace('#', '') || 'dashboard';
            return item.section === section;
        }
        if (path === '/relatorios') return item.section === 'relatorios';
        if (path === '/biblioteca') return item.section === 'biblioteca';
        return false;
    }

    function buildMenu() {
        const items = MENU.map((item) => {
            const active = isActive(item);
            const cls = 'nav-link text-white' + (active ? ' active' : '');
            const aria = active ? ' aria-current="page"' : '';
            return `<li class="nav-item mb-2"><a class="${cls}" href="${item.href}"${aria}>${item.label}</a></li>`;
        }).join('');
        return items + '<li class="nav-item mt-auto"><a class="nav-link text-white" href="#" data-action="logout">Sair</a></li>';
    }

    function replaceSidebars() {
        const html = buildMenu();
        document.querySelectorAll('.dashboard-sidebar ul.nav, .dashboard-offcanvas ul.nav').forEach((ul) => {
            ul.innerHTML = html;
            ul.dataset.schoolSidebarRendered = '1';
        });
        document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
            if (btn.dataset.schoolLogoutBound) return;
            btn.dataset.schoolLogoutBound = '1';
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                ZupiAPI.logout();
            });
        });
        document.dispatchEvent(new CustomEvent('school-sidebar-ready'));
    }

    function adjustPageLinks() {
        if (currentPath() !== '/relatorios') return;
        const back = document.querySelector('a[href="/selecao-relatorios"]');
        if (back) {
            back.href = '/dashboard-escola#relatorios';
            back.textContent = 'Voltar ao painel da escola';
        }
    }

    function init() {
        if (!isSchoolUser() || !SCHOOL_CONTEXT_PATHS.has(currentPath())) return;
        replaceSidebars();
        adjustPageLinks();
    }

    init();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
