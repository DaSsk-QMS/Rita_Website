import { API_URL } from './api.js';

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

function safeGet(store, key) {
  try { return store.getItem(key); } catch { return null; }
}
function safeSet(store, key, val) {
  try { store.setItem(key, val); } catch { /* ignore */ }
}

let isNew = false;
function ids() {
  let visitorId = safeGet(localStorage, 'rita_vid');
  if (!visitorId) { visitorId = uid(); safeSet(localStorage, 'rita_vid', visitorId); isNew = true; }
  const now = Date.now();
  let sessionId = safeGet(sessionStorage, 'rita_sid');
  const last = Number(safeGet(sessionStorage, 'rita_sid_t') || 0);
  if (!sessionId || now - last > 30 * 60 * 1000) { sessionId = uid(); safeSet(sessionStorage, 'rita_sid', sessionId); }
  safeSet(sessionStorage, 'rita_sid_t', String(now));
  return { visitorId, sessionId };
}

let firstHit = true;
export function trackPageView(path) {
  if (path.startsWith('/admin')) return;
  // Small delay so the page title from the new route is in place
  setTimeout(() => {
    const body = {
      path,
      title: document.title,
      referrer: firstHit ? document.referrer : '',
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; } })(),
      ...ids(),
      isNew, // true for every page view in a visitor's very first session
      hit: firstHit, // a fresh page load -> server adds 1 to the total visit counter
    };
    firstHit = false;
    fetch(`${API_URL}/api/public/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    })
      .then((r) => (r.status === 200 ? r.json() : null))
      .then((d) => { if (d && typeof d.count === 'number') publishVisitCount(d.count); })
      .catch(() => {});
  }, 300);
}

// ---------- Live total visit count ----------
const VISIT_EVENT = 'rita:visits';
let lastCount = null;
function publishVisitCount(count) {
  if (lastCount !== null && count < lastCount) return; // never show a lower number
  lastCount = count;
  window.dispatchEvent(new CustomEvent(VISIT_EVENT, { detail: count }));
}

export function fetchVisitCount() {
  return fetch(`${API_URL}/api/public/visits`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d && typeof d.count === 'number') publishVisitCount(d.count); })
    .catch(() => {});
}

export function onVisitCount(cb) {
  if (lastCount !== null) cb(lastCount);
  const h = (e) => cb(e.detail);
  window.addEventListener(VISIT_EVENT, h);
  return () => window.removeEventListener(VISIT_EVENT, h);
}
