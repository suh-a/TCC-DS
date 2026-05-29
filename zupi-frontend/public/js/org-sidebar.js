(function () {
    const MENUS = {
        escola: [
            { label: 'Dashboard', section: 'dashboard', href: '/dashboard-escola' },
            { label: 'Alunos', section: 'alunos' },
            { label: 'Docentes', section: 'docentes' },
            { label: 'Turmas', section: 'turmas' },
            { label: 'Relat\u00f3rios', section: 'relatorios' },
            { label: 'Conte\u00fados', section: 'conteudos' },
            { label: 'Biblioteca', section: 'biblioteca' },
            { label: 'Ajuda', section: 'ajuda' }
        ],
        docente: [
            { label: 'Dashboard', section: 'dashboard', href: '/dashboard-docente' },
            { label: 'Minhas Turmas', section: 'turmas' },
            { label: 'Atividades', section: 'atividades' },
            { label: 'Quizzes', section: 'quizzes' },
            { label: 'Relat\u00f3rios', section: 'relatorios' },
            { label: 'Biblioteca', href: '/biblioteca' },
            { label: 'Ajuda', section: 'ajuda' }
        ],
        admin: [
            { label: 'Dashboard', section: 'dashboard', href: '/dashboard-admin' },
            { label: 'Usu\u00e1rios', section: 'usuarios' },
            { label: 'Escolas', section: 'escolas' },
            { label: 'Conte\u00fados', section: 'conteudos' },
            { label: 'Jogos', section: 'jogos' },
            { label: 'M\u00e9tricas', section: 'metricas' },
            { label: 'Chamados', section: 'chamados' }
        ]
    };

    function currentMenu() {
        const declared = document.body.dataset.orgNav;
        if (declared && MENUS[declared]) return declared;
        const path = window.location.pathname;
        if (path.includes('dashboard-docente')) return 'docente';
        if (path.includes('dashboard-admin')) return 'admin';
        return 'escola';
    }

    function buildItem(item, activeSection) {
        const active = item.section === activeSection;
        const cls = 'nav-link text-white' + (active ? ' active' : '');
        const aria = active ? ' aria-current="page"' : '';
        if (item.section) {
            return `<li class="nav-item mb-2"><a class="${cls}" href="${item.href || '#'}" data-org-section="${item.section}"${aria}>${item.label}</a></li>`;
        }
        return `<li class="nav-item mb-2"><a class="${cls}" href="${item.href}"${aria}>${item.label}</a></li>`;
    }

    function setActive(section) {
        document.querySelectorAll('[data-org-section]').forEach(link => {
            const active = link.dataset.orgSection === section;
            link.classList.toggle('active', active);
            if (active) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function render() {
        const menu = MENUS[currentMenu()];
        const active = document.body.dataset.orgSection || 'dashboard';
        const html = menu.map(item => buildItem(item, active)).join('')
            + '<li class="nav-item mt-auto"><a class="nav-link text-white" href="#" data-action="logout">Sair</a></li>';

        document.querySelectorAll('[data-org-sidebar]').forEach(ul => {
            ul.innerHTML = html;
            ul.dataset.orgSidebarRendered = '1';
            ul.removeAttribute('aria-busy');
            requestAnimationFrame(() => ul.classList.add('is-ready'));
        });
        setActive(active);
    }

    function bind() {
        document.addEventListener('click', event => {
            const link = event.target.closest('[data-org-section]');
            if (!link) return;
            const section = link.dataset.orgSection;
            if (!section) return;
            event.preventDefault();
            document.body.dataset.orgSection = section;
            if (typeof window.showSection === 'function') window.showSection(section);
            setActive(section);
            const panel = link.closest('.offcanvas');
            if (panel && window.bootstrap) {
                window.bootstrap.Offcanvas.getOrCreateInstance(panel).hide();
            }
        });
    }

    function init() {
        render();
        bind();
        document.dispatchEvent(new CustomEvent('org-sidebar-ready'));
    }

    window.ZupiOrgSidebar = { render, setActive };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


