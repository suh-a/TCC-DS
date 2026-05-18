/**
 * Zupi API — cliente HTTP centralizado (JWT Bearer).
 */
const ZupiAPI = (() => {
    function resolveBase() {
        // Vite dev/preview: sempre usar proxy (evita CORS e 401 em loop)
        if (typeof location !== 'undefined' && (location.port === '5173' || location.port === '4173')) {
            return '';
        }
        if (window.ZUPI_API_BASE !== undefined && window.ZUPI_API_BASE !== '') {
            return String(window.ZUPI_API_BASE).replace(/\/$/, '');
        }
        return 'http://localhost:8080';
    }

    const BASE = resolveBase();
    const loginPath = (typeof ZupiRoutes !== 'undefined' && ZupiRoutes.login) || '/login';

    function getToken() {
        return localStorage.getItem('authToken');
    }

    function getUser() {
        return {
            id: localStorage.getItem('userId'),
            type: localStorage.getItem('userType'),
            name: localStorage.getItem('userName'),
            email: localStorage.getItem('userEmail')
        };
    }

    function saveSession(data) {
        if (!data || !data.token) return;

        const user = data.user || data.child || {};
        localStorage.setItem('authToken', data.token);

        if (user.id != null) {
            localStorage.setItem('userId', String(user.id));
        }
        const type = user.userType || data.userType;
        if (type) {
            localStorage.setItem('userType', String(type));
        }
        localStorage.setItem('userName', user.name || '');
        localStorage.setItem('userEmail', user.email || user.childLoginEmail || '');
    }

    function clearSession() {
        [
            'authToken', 'userId', 'userType', 'userName', 'userEmail',
            'activeChildId', 'childId', 'dailyReportId', 'selectedChildId', 'activeProfile'
        ].forEach((k) => localStorage.removeItem(k));
    }

    function isAuthenticated() {
        const token = getToken();
        const userId = getUser().id;
        return !!(token && userId && userId !== 'undefined' && userId !== 'null');
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = loginPath;
            return false;
        }
        return true;
    }

    function requireRole(...roles) {
        if (!requireAuth()) return false;
        const type = getUser().type;
        if (roles.length && !roles.includes(type)) {
            window.location.href = (typeof ZupiRoutes !== 'undefined' && ZupiRoutes.home) || '/';
            return false;
        }
        return true;
    }

    function buildUrl(url) {
        if (url.startsWith('http')) return url;
        return `${BASE}${url}`;
    }

    async function request(url, options = {}) {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token && !options.skipAuth) {
            headers.Authorization = `Bearer ${token}`;
        }

        const fullUrl = buildUrl(url);

        try {
            const response = await fetch(fullUrl, {
                ...options,
                headers
            });

            if (!options.skipAuthRedirect && (response.status === 401 || response.status === 403)) {
                clearSession();
                window.location.href = loginPath;
                return null;
            }

            return response;
        } catch (error) {
            console.error('[ZupiAPI] Erro de conexão:', error);
            throw error;
        }
    }

    async function fetchJson(url, options = {}) {
        const response = await request(url, options);
        if (!response || !response.ok) return null;
        return response.json();
    }

    async function fetchMe() {
        return fetchJson('/auth/me');
    }

    async function fetchMyChildren() {
        const data = await fetchJson('/child/me');
        return Array.isArray(data) ? data : [];
    }

    async function get(url, options = {}) {
        return request(url, { ...options, method: 'GET' });
    }

    async function post(url, body, options = {}) {
        return request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    async function postPublic(url, body) {
        return request(url, {
            method: 'POST',
            body: JSON.stringify(body),
            skipAuth: true,
            skipAuthRedirect: true
        });
    }

    async function put(url, body, options = {}) {
        return request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    async function patch(url, body, options = {}) {
        return request(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    async function del(url, options = {}) {
        return request(url, { ...options, method: 'DELETE' });
    }

    async function upload(url, formData) {
        const token = getToken();
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        return fetch(buildUrl(url), { method: 'POST', headers, body: formData });
    }

    function redirectByUserType(userType) {
        const R = typeof ZupiRoutes !== 'undefined' ? ZupiRoutes : {};
        const type = userType || getUser().type || 'RESPONSAVEL';

        switch (type) {
            case 'ESCOLA':
                window.location.href = R.dashboardEscola || '/dashboard-escola';
                break;
            case 'DOCENTE':
                window.location.href = R.dashboardDocente || '/dashboard-docente';
                break;
            case 'ADMIN':
                window.location.href = R.dashboardAdmin || '/dashboard-admin';
                break;
            case 'RESPONSAVEL':
                window.location.href = R.selecaoPerfil || '/selecao-perfil';
                break;
            case 'CRIANCA':
            case 'ALUNO_CREDENCIADO':
                window.location.href = R.dashboardCrianca || '/dashboard-crianca';
                break;
            default:
                window.location.href = R.dashboard || '/dashboard';
        }
    }

    function logout() {
        clearSession();
        window.location.href = loginPath;
    }

    return {
        getToken,
        getUser,
        saveSession,
        clearSession,
        isAuthenticated,
        requireAuth,
        requireRole,
        fetchJson,
        fetchMe,
        fetchMyChildren,
        get,
        post,
        postPublic,
        put,
        patch,
        del,
        upload,
        redirectByUserType,
        logout,
        buildUrl,
        BASE
    };
})();
