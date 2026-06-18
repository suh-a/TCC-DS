/**
 * Navegacao compartilhada do dashboard infantil.
 * Defina data-child-nav no <body> com: dashboard | jogos | atividades | desafios | perfil
 */
const ChildNav = (() => {
    function dashboardHref() {
        const type = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser().type : null;
        return type === 'ALUNO_CREDENCIADO' ? '/dashboard-aluno-credenciado' : '/dashboard-crianca';
    }

    const MENU = [
        { id: 'dashboard', href: dashboardHref, label: 'Dashboard' },
        { id: 'jogos', href: '/menuJogos', label: 'Jogos' },
        { id: 'atividades', href: '/atividades-interativas', label: 'Atividades' },
        { id: 'desafios', href: '/desafios-semanais', label: 'Desafios semanais' },
        { id: 'biblioteca', href: '/biblioteca', label: 'Biblioteca' },
        { id: 'perfil', href: '/perfil-crianca', label: 'Perfil' }
    ];

    function isChildContext(user = {}) {
        return ['CRIANCA', 'ALUNO_CREDENCIADO'].includes(user.type)
            || (user.type === 'RESPONSAVEL'
                && localStorage.getItem('activeProfile') === 'CRIANCA'
                && Boolean(resolveChildId()));
    }

    function resolveChildId() {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get('childId');
        if (fromUrl) {
            localStorage.setItem('activeChildId', fromUrl);
            return fromUrl;
        }
        return localStorage.getItem('activeChildId');
    }

    function hrefWithChild(href, childId) {
        if (!childId || !href || href.startsWith('#')) return href;
        const url = new URL(href, window.location.origin);
        if (!url.searchParams.has('childId')) {
            url.searchParams.set('childId', childId);
        }
        return url.pathname + url.search;
    }

    function init(options = {}) {
        const active = document.body.dataset.childNav || options.active || '';
        const user = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser() : {};
        const childId = resolveChildId() || (['CRIANCA', 'ALUNO_CREDENCIADO'].includes(user.type) ? user.id : null);

        const childContext = isChildContext(user);
        const includeExit = childContext;
        const exitMode = ['CRIANCA', 'ALUNO_CREDENCIADO'].includes(user.type) ? 'logout' : 'profile';

        if (childContext) {
            document.querySelectorAll('[data-pf-sidebar]').forEach(menu => {
                menu.innerHTML = menuItemsHtml(active, includeExit, exitMode);
                menu.classList.remove('pf-sidebar-nav');
            });
            document.querySelectorAll('.dashboard-sidebar ul.nav:not([data-pf-sidebar]), .dashboard-offcanvas ul.nav:not([data-pf-sidebar])').forEach(menu => {
                menu.innerHTML = menuItemsHtml(active, includeExit, exitMode);
            });
            if (!document.getElementById('dashboardOffcanvas')) {
                document.body.insertAdjacentHTML('afterbegin', `
                  <div class="offcanvas offcanvas-start dashboard-offcanvas" tabindex="-1" id="dashboardOffcanvas" aria-labelledby="dashboardOffcanvasLabel">
                    <div class="offcanvas-header">
                      <h2 class="offcanvas-title h5" id="dashboardOffcanvasLabel">Zupi</h2>
                      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
                    </div>
                    <nav class="offcanvas-body p-0" aria-label="Navegacao infantil">
                      <ul class="nav nav-pills flex-column p-4">${menuItemsHtml(active, includeExit, exitMode)}</ul>
                    </nav>
                  </div>`);
            }
        }

        if (!childId && options.requireChild !== false) {
            window.location.href = user.type === 'ALUNO_CREDENCIADO' ? '/dashboard-aluno-credenciado' : '/selecao-perfil';
            return null;
        }

        document.querySelectorAll('[data-child-nav-link]').forEach(link => {
            let base = link.getAttribute('href');
            if (link.getAttribute('data-child-nav-link') === 'dashboard') {
                base = dashboardHref();
                link.setAttribute('href', base);
            }
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

        bindExitLinks(exitMode);

        return childId;
    }

    function menuItemsHtml(active, includeExit = false, exitMode = 'profile') {
        const user = typeof ZupiAPI !== 'undefined' ? ZupiAPI.getUser() : {};
        const hideLibrary = user.type === 'CRIANCA'
            || (user.type === 'RESPONSAVEL' && localStorage.getItem('activeProfile') === 'CRIANCA');
        const items = MENU.filter(item => !(hideLibrary && item.id === 'biblioteca')).map(item => {
            const cls = item.id === active ? 'nav-link text-white active' : 'nav-link text-white';
            const href = typeof item.href === 'function' ? item.href() : item.href;
            return `<li class="nav-item mb-2">
              <a class="${cls}" href="${href}" data-child-nav-link="${item.id}">${item.label}</a>
            </li>`;
        }).join('');
        if (!includeExit) return items;
        const exitLink = exitMode === 'logout'
            ? '<a class="nav-link text-white" href="#" data-action="logout">Sair</a>'
            : '<a class="nav-link text-white" href="/selecao-perfil" data-child-exit-profile>Voltar ao menu</a>';
        return items + `<li class="nav-item mt-auto">${exitLink}</li>`;
    }

    function bindExitLinks(exitMode) {
        if (exitMode === 'logout') {
            document.querySelectorAll('[data-action="logout"]').forEach(link => {
                if (link.dataset.childLogoutBound) return;
                link.dataset.childLogoutBound = '1';
                link.addEventListener('click', event => {
                    event.preventDefault();
                    if (typeof ZupiAPI !== 'undefined') ZupiAPI.logout();
                });
            });
            return;
        }

        document.querySelectorAll('[data-child-exit-profile]').forEach(link => {
            if (link.dataset.childExitProfileBound) return;
            link.dataset.childExitProfileBound = '1';
            link.addEventListener('click', event => {
                event.preventDefault();
                localStorage.setItem('activeProfile', 'RESPONSAVEL');
                localStorage.removeItem('activeChildId');
                localStorage.removeItem('selectedChildId');
                localStorage.removeItem('childId');
                window.location.href = '/selecao-perfil';
            });
        });
    }


    return { init, resolveChildId, isChildContext, MENU, menuItemsHtml };
})();
