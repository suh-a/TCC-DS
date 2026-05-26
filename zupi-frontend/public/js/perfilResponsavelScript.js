(function () {
    function text(id, value, fallback = '---') {
        const el = document.getElementById(id);
        if (!el) return;
        const normalized = value == null ? '' : String(value).trim();
        el.textContent = normalized || fallback;
    }

    function digits(value) {
        return String(value || '').replace(/\D/g, '');
    }

    function formatCpf(value) {
        const cpf = digits(value);
        if (cpf.length !== 11) return value || '';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function formatCep(value) {
        const cep = digits(value);
        if (cep.length !== 8) return value || '';
        return cep.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2-$3');
    }

    function formatPhone(value) {
        const phone = digits(value);
        if (phone.length === 11) {
            return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        if (phone.length === 10) {
            return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return value || '';
    }

    function parseAddress(address) {
        if (!address) return {};
        if (typeof address === 'object') return address;

        const raw = String(address).trim();
        const match = raw.match(/^(.*?),\s*(.*?)\s*-\s*(.*?),\s*(.*?),\s*(.*?),\s*CEP:\s*(.*)$/i);
        if (!match) return { street: raw };

        return {
            street: match[1],
            number: match[2],
            neighborhood: match[3],
            city: match[4],
            state: match[4],
            country: match[5],
            cep: match[6]
        };
    }

    function renderResponsible(user) {
        if (!user) {
            text('nomeResponsavel', localStorage.getItem('userName'));
            text('emailResponsavel', localStorage.getItem('userEmail'));
            return;
        }

        text('nomeResponsavel', user.name);
        text('cpfResponsavel', formatCpf(user.cpf));
        text('emailResponsavel', user.email);
        text('telefoneResponsavel', formatPhone(user.phone));

        const photo = document.getElementById('fotoResponsavel');
        if (photo && user.profilePhotoUrl) {
            photo.textContent = '';
            photo.style.background = `url("${user.profilePhotoUrl}") center / cover no-repeat`;
        }

        const address = parseAddress(user.address);
        text('ruaResponsavel', address.street || address.rua || address.logradouro);
        text('numeroResponsavel', address.number || address.numero);
        text('bairroResponsavel', address.neighborhood || address.bairro);
        text('cidadeResponsavel', address.city || address.cidade || address.state || address.estado);
        text('paisResponsavel', address.country || address.pais);
        text('cepResponsavel', formatCep(address.cep || address.zipCode));
    }

    function createChildCard(child) {
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

        const link = document.createElement('a');
        link.className = 'card h-100 text-decoration-none text-dark';
        link.href = `/perfil?childId=${encodeURIComponent(child.id)}`;

        const body = document.createElement('div');
        body.className = 'card-body text-center';

        const avatar = ZupiChildAvatar.createElement(child, 80, 'mb-3');

        const title = document.createElement('h4');
        title.className = 'h6 mb-2';
        title.textContent = child.name || 'Dependente';

        const age = document.createElement('p');
        age.className = 'small text-muted mb-1';
        age.textContent = child.age != null ? `${child.age} anos` : 'Idade nao informada';

        const schoolClass = document.createElement('p');
        schoolClass.className = 'small text-muted mb-0';
        schoolClass.textContent = child.schoolClass || 'Turma nao informada';

        body.append(avatar, title, age, schoolClass);
        link.appendChild(body);
        col.appendChild(link);
        return col;
    }

    function renderDependents(children) {
        const container = document.getElementById('dependentes-list');
        if (!container) return;
        container.textContent = '';

        if (!Array.isArray(children) || children.length === 0) {
            const col = document.createElement('div');
            col.className = 'col-12';
            const empty = document.createElement('p');
            empty.className = 'text-muted text-center';
            empty.textContent = 'Nenhum dependente cadastrado.';
            col.appendChild(empty);
            container.appendChild(col);
            return;
        }

        children.forEach((child) => container.appendChild(createChildCard(child)));
    }

    async function init() {
        if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

        try {
            const [user, children] = await Promise.all([
                ZupiAPI.fetchMe(),
                ZupiAPI.fetchMyChildren()
            ]);
            renderResponsible(user);
            renderDependents(children);
        } catch (error) {
            console.error('[PerfilResponsavel] Erro ao carregar perfil:', error);
            renderResponsible(null);
            renderDependents([]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
