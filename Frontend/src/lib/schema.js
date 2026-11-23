// JSON-LD builders shared by the SPA. The server injects the same site graph into the
// initial HTML (see Server/src/routes/seo.js) so crawlers see it without JavaScript.
import { img } from './api.js';

const list = (v) => (Array.isArray(v) ? v : String(v || '').split(/[,\n]/)).map((s) => String(s).trim()).filter(Boolean);

export const siteOrigin = (settings) => {
  const u = settings?.seo?.siteUrl;
  return (u && !u.includes('localhost') ? u : typeof window !== 'undefined' ? window.location.origin : '').replace(/\/$/, '');
};

export function siteGraph(settings, services = [], locations = []) {
  const base = siteOrigin(settings);
  const { general: g = {}, contact: c = {}, seo = {}, social = {} } = settings || {};
  const abs = (u) => { const x = img(u); return x && x.startsWith('/') ? base + x : x || undefined; };
  const areas = [...new Set([...list(seo.areaServed), ...locations.map((l) => l.name)])];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': seo.businessType || 'ProfessionalService',
        '@id': `${base}/#organization`,
        name: g.siteName, alternateName: g.shortName, slogan: g.tagline, description: seo.metaDescription,
        url: `${base}/`, logo: abs(g.logo), image: abs(seo.ogImage), email: c.email || undefined, telephone: c.phone || undefined,
        openingHours: seo.openingHours || undefined, foundingDate: seo.foundingYear || undefined,
        address: {
          '@type': 'PostalAddress', streetAddress: seo.streetAddress || c.address || undefined, addressLocality: seo.localCity || undefined,
          addressRegion: seo.localRegion || undefined, postalCode: seo.postalCode || undefined, addressCountry: seo.countryCode || 'IN',
        },
        geo: seo.latitude && seo.longitude ? { '@type': 'GeoCoordinates', latitude: Number(seo.latitude), longitude: Number(seo.longitude) } : undefined,
        areaServed: [
          ...(seo.localRegion ? [{ '@type': 'State', name: seo.localRegion }] : []),
          ...areas.map((name) => ({ '@type': 'City', name })),
          { '@type': 'Country', name: 'India' },
        ],
        knowsAbout: services.map((s) => s.title),
        sameAs: Object.values(social).filter((u) => /^https?:\/\/.+\/.+/.test(u || '')),
      },
      {
        '@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: g.siteName, inLanguage: 'en-IN',
        publisher: { '@id': `${base}/#organization` },
        potentialAction: { '@type': 'SearchAction', target: `${base}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
      },
    ],
  };
}

export function breadcrumbLd(settings, crumbs = []) {
  const base = siteOrigin(settings);
  const here = typeof window !== 'undefined' ? window.location.pathname : '/';
  const items = [{ label: 'Home', to: '/' }, ...crumbs.map((c, i) => ({ ...c, to: c.to || (i === crumbs.length - 1 ? here : undefined) }))].filter((c) => c.to);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: `${base}${c.to}` })),
  };
}

export const providerRef = (settings) => ({ '@id': `${siteOrigin(settings)}/#organization` });
