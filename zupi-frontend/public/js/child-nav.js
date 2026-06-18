/**
 * Navegação compartilhada do dashboard infantil.
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

        if (childContext && user.type !== 'ALUNO_CREDENCIADO') {
            document.querySelectorAll('[data-pf-sidebar]').forEach(menu => {
                menu.innerHTML = menuItemsHtml(active, true);
                menu.classList.remove('pf-sidebar-nav');
            });
            if (!document.getElementById('dashboardOffcanvas')) {
                document.body.insertAdjacentHTML('afterbegin', `
                  <div class="offcanvas offcanvas-start dashboard-offcanvas" tabindex="-1" id="dashboardOffcanvas" aria-labelledby="dashboardOffcanvasLabel">
                    <div class="offcanvas-header">
                      <h2 class="offcanvas-title h5" id="dashboardOffcanvasLabel">Zupi</h2>
                      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
                    </div>
                    <nav class="offcanvas-body p-0" aria-label="Navegação infantil">
                      <ul class="nav nav-pills flex-column p-4">${menuItemsHtml(active, true)}</ul>
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

        document.querySelectorAll('[data-action="logout"]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                if (typeof ZupiAPI !== 'undefined') ZupiAPI.logout();
            });
        });

        if (childContext && user.type !== 'ALUNO_CREDENCIADO') {
            bindParentGate(childId);
        }

        return childId;
    }

    function menuItemsHtml(active, includeExit = false) {
        const items = MENU.map(item => {
            const cls = item.id === active ? 'nav-link text-white active' : 'nav-link text-white';
            const href = typeof item.href === 'function' ? item.href() : item.href;
            return `<li class="nav-item mb-2">
              <a class="${cls}" href="${href}" data-child-nav-link="${item.id}">${item.label}</a>
            </li>`;
        }).join('');
        if (!includeExit) return items;
        return items + `<li class="nav-item mt-auto">
          <a class="nav-link text-white" href="/selecao-perfil" data-parent-gate>Voltar ao menu</a>
        </li>`;
    }

    function bindParentGate(childId) {
        document.querySelectorAll('a[href="/selecao-perfil"]').forEach(link => {
            if (link.dataset.parentGateBound) return;
            link.dataset.parentGate = '1';
            link.dataset.parentGateBound = '1';
            link.addEventListener('click', event => {
                event.preventDefault();
                showParentGate(childId);
            });
        });
    }

    function showParentGate(childId) {
        let dialog = document.getElementById('parentAccessDialog');
        if (!dialog) {
            document.body.insertAdjacentHTML('beforeend', `
              <dialog id="parentAccessDialog" class="parent-access-dialog">
                <form method="dialog" id="parentAccessForm" class="parent-access-form">
                  <button class="parent-access-close" type="button" data-parent-access-close aria-label="Fechar">×</button>
                  <p class="parent-access-icon" aria-hidden="true">🔒</p>
                  <h2 class="h4">Área do responsável</h2>
                  <p class="text-muted">Digite a senha do responsável para sair do acesso infantil.</p>
                  <label class="form-label" for="parentAccessPassword">Senha do responsável</label>
                  <input class="form-control" id="parentAccessPassword" type="password" autocomplete="current-password" required>
                  <p class="text-danger small mt-2 mb-0 d-none" id="parentAccessError" role="alert"></p>
                  <button class="btn btn-primary w-100 mt-3" type="submit">Confirmar e sair</button>
                </form>
              </dialog>`);
            dialog = document.getElementById('parentAccessDialog');
            dialog.querySelector('[data-parent-access-close]').addEventListener('click', () => dialog.close());
            dialog.addEventListener('click', event => {
                if (event.target === dialog) dialog.close();
            });
            dialog.querySelector('#parentAccessForm').addEventListener('submit', event => {
                event.preventDefault();
                verifyParentAccess(dialog, childId);
            });
        }
        dialog.dataset.childId = String(childId);
        dialog.querySelector('#parentAccessPassword').value = '';
        dialog.querySelector('#parentAccessError').classList.add('d-none');
        dialog.showModal();
        dialog.querySelector('#parentAccessPassword').focus();
    }

    async function verifyParentAccess(dialog, fallbackChildId) {
        const password = dialog.querySelector('#parentAccessPassword').value;
        const error = dialog.querySelector('#parentAccessError');
        const submit = dialog.querySelector('button[type="submit"]');
        submit.disabled = true;
        error.classList.add('d-none');
        try {
            const response = await ZupiAPI.post('/auth/parent-access/verify', {
                childId: Number(dialog.dataset.childId || fallbackChildId),
                password
            });
            if (!response || !response.ok) {
                error.textContent = response
                    ? await ZupiAPI.readErrorMessage(response, 'Senha do responsável incorreta.')
                    : 'Não foi possível validar a senha.';
                error.classList.remove('d-none');
                return;
            }
            localStorage.setItem('activeProfile', 'RESPONSAVEL');
            localStorage.removeItem('activeChildId');
            localStorage.removeItem('selectedChildId');
            localStorage.removeItem('childId');
            window.location.href = '/selecao-perfil';
        } catch (e) {
            error.textContent = 'Não foi possível validar a senha. Tente novamente.';
            error.classList.remove('d-none');
        } finally {
            submit.disabled = false;
        }
    }

    return { init, resolveChildId, isChildContext, MENU, menuItemsHtml };
})();
