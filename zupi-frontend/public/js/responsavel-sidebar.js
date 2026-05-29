/**
 * Sidebar padronizada — área do responsável (pessoa física).
 * Fonte única do menu; evita substituir HTML estático a cada navegação (piscar).
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
        '/desafios-semanais',
        '/onboarding-crianca'
    ];

    /** Rotas permitidas no menu do responsável (PF) */
    const MENU = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/selecao-perfil', label: 'Perfis das crianças' },
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

    function isPfUser() {
        if (typeof ZupiAPI === 'undefined' || !ZupiAPI.isAuthenticated()) return true;
        const type = ZupiAPI.getUser().type;
        return !type || type === 'RESPONSAVEL' || type === 'ADMIN';
    }

    function isActive(href) {
        const path = currentPath();
        if (href === '/dashboard') return path === '/dashboard';
        if (href === '/selecao-perfil') {
            return path === '/selecao-perfil' || path === '/perfil' || path === '/perfil-criancas';
        }
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

    function applyActiveState(ul) {
        ul.querySelectorAll('a.nav-link[href^="/"]').forEach((link) => {
            const href = link.getAttribute('href');
            const active = isActive(href);
            link.classList.toggle('active', active);
            if (active) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function renderSidebars() {
        const html = buildNavItems();
        document.querySelectorAll('[data-pf-sidebar]').forEach((ul) => {
            const managed = ul.dataset.pfSidebarRendered === '1';
            if (!managed) {
                ul.innerHTML = html;
                ul.dataset.pfSidebarRendered = '1';
            } else {
                applyActiveState(ul);
            }
            ul.removeAttribute('aria-busy');
            requestAnimationFrame(() => ul.classList.add('is-ready'));
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

    function init() {
        if (document.body.dataset.childNav) return;
        if (!isPfArea() || !isPfUser()) return;
        renderSidebars();
        bindLogout();
        document.dispatchEvent(new CustomEvent('pf-sidebar-ready'));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
