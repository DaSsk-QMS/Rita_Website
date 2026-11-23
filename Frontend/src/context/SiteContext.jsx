import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getPublic } from '../lib/api.js';
import { offlineBootstrap } from '../lib/offline.js';

const SiteContext = createContext(null);
const SYSTEM_FONTS = ['system-ui', 'Georgia', 'Arial'];

function applyTheme(theme = {}) {
  const root = document.documentElement.style;
  const set = (k, v) => v && root.setProperty(k, v);
  set('--c-primary', theme.primary);
  set('--c-secondary', theme.secondary);
  set('--c-accent', theme.accent);
  set('--c-bg', theme.background);
  set('--c-surface', theme.surface);
  set('--c-text', theme.text);
  if (theme.radius !== undefined) set('--radius', `${theme.radius}px`);
  if (theme.headingFont) set('--font-head', `'${theme.headingFont}', system-ui, sans-serif`);
  if (theme.bodyFont) set('--font-body', `'${theme.bodyFont}', system-ui, sans-serif`);
  set('--btn-radius', { pill: '9999px', rounded: '12px', square: '4px' }[theme.buttonStyle] || '9999px');
  set('--anim-speed', String(Number(theme.animationSpeed) || 1));
  set('--hero-overlay', String(Math.min(100, Math.max(0, Number(theme.heroOverlay ?? 85))) / 100));
  document.documentElement.classList.toggle('no-anim', theme.animations === false);

  const fonts = [...new Set([theme.headingFont, theme.bodyFont])].filter((f) => f && !SYSTEM_FONTS.includes(f));
  const id = 'theme-fonts';
  const href = fonts.length
    ? `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`).join('&')}&display=swap`
    : '';
  let link = document.getElementById(id);
  if (href && link?.href !== href) {
    if (!link) { link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; document.head.appendChild(link); }
    link.href = href;
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.secondary || '#0a1a33');
}

function injectAnalytics(gaId) {
  if (!gaId || document.getElementById('ga-script')) return;
  const s = document.createElement('script');
  s.id = 'ga-script';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date());
  window.gtag('config', gaId);
}

export function SiteProvider({ children }) {
  // Start with the bundled defaults so the first paint is instant and never blank
  const [state, setState] = useState(() => ({ ...offlineBootstrap(), loaded: false, offline: false }));

  const load = useCallback(async () => {
    try {
      const { data, offline } = await getPublic('/bootstrap');
      setState({ ...data, loaded: true, offline });
    } catch {
      setState((s) => ({ ...s, loaded: true, offline: true }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { applyTheme(state.settings.theme); }, [state.settings.theme]);
  useEffect(() => { injectAnalytics(state.settings.seo?.googleAnalyticsId); }, [state.settings.seo?.googleAnalyticsId]);

  const value = useMemo(() => ({ ...state, reload: load }), [state, load]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
export { applyTheme };
