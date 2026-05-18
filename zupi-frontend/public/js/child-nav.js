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
        const childId = resolveChildId();

        if (!childId && options.requireChild !== false) {
            window.location.href = '/selecao-perfil';
            return null;
        }

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
