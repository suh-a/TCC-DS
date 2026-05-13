/**
 * Base da API: variável global (HTML), env Vite, ou mesmo origin (proxy).
 */
export function getApiBase() {
  if (typeof window === 'undefined') return '';
  const w = window.__ZUPI_API_BASE__;
  if (w !== undefined && w !== null && String(w).trim() !== '') {
    return String(w).replace(/\/$/, '');
  }
  const fromEnv = import.meta.env?.VITE_API_PUBLIC_URL;
  if (fromEnv && String(fromEnv).trim() !== '') {
    return String(fromEnv).replace(/\/$/, '');
  }
  return '';
}

/** Monta URL para fetch: com base absoluta ou path relativo (recomendado com proxy). */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBase();
  return base ? `${base}${p}` : p;
}
