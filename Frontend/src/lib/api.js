import axios from 'axios';
import { offlineGet } from './offline.js';

export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const TOKEN_KEY = 'rita_admin_token';

// "Remember me" keeps the token in localStorage; otherwise it lives only for this browser tab session.
const stores = () => { try { return [localStorage, sessionStorage]; } catch { return []; } };
export const getToken = () => { for (const s of stores()) { const t = s.getItem(TOKEN_KEY); if (t) return t; } return null; };
export const clearToken = () => stores().forEach((s) => s.removeItem(TOKEN_KEY));
export const saveToken = (token, remember) => {
  const persistent = remember ?? !!localStorage.getItem(TOKEN_KEY);
  clearToken();
  (persistent ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
};

export const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 20000 });

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const onAdmin = window.location.pathname.startsWith('/admin');
    const isAuthCall = err.config?.url?.startsWith('/auth/');
    if (err.response?.status === 401 && onAdmin && !isAuthCall) {
      clearToken();
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

/** Resolve uploaded file paths against the API origin. */
export const img = (u) => (!u ? '' : u.startsWith('/uploads') ? `${API_URL}${u}` : u);

/** Download an authenticated file (CSV export, resume). */
export async function download(url, filename) {
  const res = await api.get(url, { responseType: 'blob' });
  const cd = res.headers['content-disposition'] || '';
  const name = filename || decodeURIComponent((cd.match(/filename="?([^"]+)"?/) || [])[1] || 'download');
  const href = URL.createObjectURL(res.data);
  const a = Object.assign(document.createElement('a'), { href, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

/**
 * GET a public endpoint. If the backend is unreachable (network error, 5xx, or an
 * HTML page returned by a static host), fall back to the built-in default content.
 */
export async function getPublic(path, params) {
  try {
    const { data } = await api.get(`/public${path}`, { params });
    if (typeof data === 'string') throw new Error('Backend unavailable');
    return { data, offline: false };
  } catch (e) {
    if (e.response && e.response.status < 500 && typeof e.response.data !== 'string') throw e;
    const data = offlineGet(path, params);
    if (data === undefined) throw e;
    return { data, offline: true };
  }
}
