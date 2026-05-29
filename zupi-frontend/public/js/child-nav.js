/**
 * Navegação compartilhada do dashboard infantil.
 * Defina data-child-nav no <body> com: dashboard | jogos | atividades | desafios | biblioteca | perfil
 */
const ChildNav = (() => {
    const MENU = [
        { id: 'dashboard', href: '/dashboard-crianca', label: 'Dashboard' },
        { id: 'jogos', href: '/menuJogos', label: 'Jogos' },
        { id: 'atividades', href: '/atividades-interativas', label: 'Atividades' },
        { id: 'desafios', href: '/desafios-semanais', label: 'Desafios semanais' },
        { id: 'biblioteca', href: '/biblioteca', label: 'Biblioteca' },
        { id: 'perfil', href: '/perfil-crianca', label: 'Perfil' }
    ];

    function resolveChildId() {
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
        }

        return childId;
    }

    function hrefWithChild(href, childId) {
        if (!childId || !href || href.startsWith('#')) return href;
        const url = new URL(href, window.location.origin);
        if (!url.searchParams.has('childId')) {
            url.searchParams.set('childId', childId);
        }
        return url.pathname + url.search;
    }

    function buildNavItems(active) {
        return MENU.map(item => {
            const cls = item.id === active ? 'nav-link text-white active' : 'nav-link text-white';
            const aria = item.id === active ? ' aria-current="page"' : '';
            return `<li class="nav-item mb-2">
              <a class="${cls}" href="${item.href}" data-child-nav-link="${item.id}"${aria}>${item.label}</a>
            </li>`;
        }).join('')
            + '<li class="nav-item mt-auto"><a class="nav-link text-white" href="/selecao-perfil">Voltar ao menu</a></li>';
    }

    function renderSidebars(active) {
        if (!document.querySelector('.dashboard-offcanvas') && document.querySelector('.menu-toggle')) {
            const panel = document.createElement('div');
            panel.className = 'offcanvas offcanvas-start dashboard-offcanvas';
            panel.tabIndex = -1;
            panel.id = 'dashboardOffcanvas';
            panel.innerHTML = `
              <div class="offcanvas-header">
                <h5 class="offcanvas-title">Zupi</h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
              </div>
              <div class="offcanvas-body p-0">
                <nav role="navigation" aria-label="Navegação do dashboard">
                  <ul class="nav nav-pills flex-column p-4" data-child-sidebar aria-busy="true"></ul>
                </nav>
              </div>`;
            document.body.appendChild(panel);
        }

        const selectors = [
            '[data-child-sidebar]',
            'body[data-child-nav] .dashboard-sidebar ul.nav',
            'body[data-child-nav] .dashboard-offcanvas ul.nav',
            'body[data-child-nav] .pf-sidebar-nav'
        ].join(',');

        document.querySelectorAll(selectors).forEach(ul => {
            if (ul.dataset.childSidebarRendered !== '1') {
                ul.innerHTML = buildNavItems(active);
                ul.dataset.childSidebarRendered = '1';
            }
            ul.classList.add('child-sidebar-nav');
            ul.removeAttribute('aria-busy');
        });
    }

    function animateSidebars() {
        requestAnimationFrame(() => {
            document.querySelectorAll('.child-sidebar-nav, .pf-sidebar-nav').forEach(ul => {
                ul.classList.add('is-ready');
            });
        });
    }

    function init(options = {}) {
        const active = document.body.dataset.childNav || options.active || '';
        const childId = resolveChildId();

        if (!childId && options.requireChild !== false) {
            window.location.href = '/selecao-perfil';
            return null;
        }

        renderSidebars(active);

        document.querySelectorAll('[data-child-nav-link]').forEach(link => {
            const base = link.getAttribute('href');
            if (base && childId) {
                link.setAttribute('href', hrefWithChild(base, childId));
            }
        });

        document.querySelectorAll('[data-child-nav-link]').forEach(link => {
            const navId = link.getAttribute('data-child-nav-link');
            link.classList.toggle('active', navId === active);
            if (navId === active) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        document.querySelectorAll('[data-action="logout"]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                if (typeof ZupiAPI !== 'undefined') ZupiAPI.logout();
            });
        });

        animateSidebars();

        return childId;
    }

    function menuItemsHtml(active) {
        return MENU.map(item => {
            const cls = item.id === active ? 'nav-link text-white active' : 'nav-link text-white';
            return `<li class="nav-item mb-2">
              <a class="${cls}" href="${item.href}" data-child-nav-link="${item.id}">${item.label}</a>
            </li>`;
        }).join('');
    }

    return { init, resolveChildId, MENU, menuItemsHtml };
})();
