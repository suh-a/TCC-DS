/**
 * Zupi API — Módulo centralizado de comunicação com o backend.
 * Todas as chamadas fetch passam pelo header Authorization automaticamente.
 * O token também é salvo como cookie para navegação Thymeleaf.
 */
const ZupiAPI = (() => {
    const BASE = window.location.origin;

    // ─── Token Management ───────────────────────────────────────
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
        const token = data.token;
        const user = data.user || {};

        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userType', user.userType || 'RESPONSAVEL');
        localStorage.setItem('userName', user.name || '');
        localStorage.setItem('userEmail', user.email || '');

        // Set cookie for Thymeleaf page navigation
        document.cookie = `zupiToken=${token}; path=/; max-age=86400; SameSite=Lax`;
    }

    function clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('activeChildId');
        localStorage.removeItem('childId');
        localStorage.removeItem('dailyReportId');
        document.cookie = 'zupiToken=; path=/; max-age=0';
    }

    function isAuthenticated() {
        return !!getToken();
    }

    // ─── Auth Guard ─────────────────────────────────────────────
    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    // ─── Fetch Wrapper ──────────────────────────────────────────
    async function request(url, options = {}) {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const fullUrl = url.startsWith('http') ? url : `${BASE}${url}`;

        try {
            const response = await fetch(fullUrl, {
                ...options,
                headers
            });

            // Token expired or invalid
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.href = '/login';
                return null;
            }

            return response;
        } catch (error) {
            console.error('[ZupiAPI] Erro de conexão:', error);
            throw error;
        }
    }

    async function get(url) {
        return request(url, { method: 'GET' });
    }

    async function post(url, body) {
        return request(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    async function put(url, body) {
        return request(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    async function patch(url, body) {
        return request(url, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    async function del(url) {
        return request(url, { method: 'DELETE' });
    }

    // Multipart upload (for files)
    async function upload(url, formData) {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Don't set Content-Type — browser sets multipart boundary
        const fullUrl = url.startsWith('http') ? url : `${BASE}${url}`;
        return fetch(fullUrl, {
            method: 'POST',
            headers,
            body: formData
        });
    }

    // ─── Navigation Helpers ─────────────────────────────────────
    function redirectByUserType(userType) {
        switch (userType) {
            case 'ESCOLA':
                window.location.href = '/dashboard-escola';
                break;
            case 'DOCENTE':
                window.location.href = '/dashboard-docente';
                break;
            case 'ADMIN':
                window.location.href = '/dashboard-admin';
                break;
            case 'RESPONSAVEL':
                window.location.href = '/selecao-perfil';
                break;
            case 'CRIANCA':
                window.location.href = '/dashboard-crianca';
                break;
            case 'ALUNO_CREDENCIADO':
                window.location.href = '/dashboard-aluno';
                break;
            default:
                window.location.href = '/dashboard';
                break;
        }
    }

    function logout() {
        clearSession();
        window.location.href = '/login';
    }

    // ─── Public API ─────────────────────────────────────────────
    return {
        getToken,
        getUser,
        saveSession,
        clearSession,
        isAuthenticated,
        requireAuth,
        get,
        post,
        put,
        patch,
        del,
        upload,
        redirectByUserType,
        logout,
        BASE
    };
})();
