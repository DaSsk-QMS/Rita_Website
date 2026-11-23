import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext.jsx';
import { img } from '../../lib/api.js';
import { siteGraph, siteOrigin } from '../../lib/schema.js';

const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

/**
 * Per-page SEO. React 19 hoists <title>/<meta>/<link> into <head>.
 * Values from Admin › Page SEO override what the page passes in.
 * The server pre-renders the same tags (marked data-ssr) for crawlers; they are
 * removed here once React has rendered its own, so nothing is duplicated.
 */
export default function Seo({ title, description, image, type = 'website', keywords, jsonLd, noindex = false }) {
  const { settings, pageSeo = [] } = useSite();
  const { pathname } = useLocation();
  const seo = settings.seo || {};
  const override = pageSeo.find((p) => p.path === pathname) || {};
  const isHome = pathname === '/';

  useEffect(() => {
    document.querySelectorAll('[data-ssr]').forEach((el) => el.remove());
  }, [pathname]);

  const baseTitle = override.title || title;
  const fullTitle = isHome ? seo.metaTitle : baseTitle ? `${baseTitle}${seo.titleSuffix || ''}` : seo.metaTitle;
  const desc = override.description || description || seo.metaDescription;
  const ogImage = img(override.ogImage || image || seo.ogImage);
  const origin = siteOrigin(settings);
  const url = `${origin}${pathname}`;
  const abs = ogImage?.startsWith('/') ? origin + ogImage : ogImage;
  const ld = [].concat(jsonLd || []).filter(Boolean);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={override.keywords || keywords || seo.keywords} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      {abs && <meta property="og:image" content={abs} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {abs && <meta name="twitter:image" content={abs} />}
      {(seo.allowIndexing === false || noindex) && <meta name="robots" content="noindex,follow" />}
      {settings.general?.favicon && <link rel="icon" href={img(settings.general.favicon)} />}
      {ld.map((o, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(o) }} />)}
    </>
  );
}

/**
 * Site-wide Organization/LocalBusiness + WebSite schema and geo tags. In production the server
 * already injects these (#ld-site); this only renders them when they're missing (e.g. Vite dev).
 */
export function SiteSchema() {
  const { settings, services = [], locations = [] } = useSite();
  const seo = settings.seo || {};
  const serverRendered = typeof document !== 'undefined' && !!document.getElementById('ld-site');
  if (serverRendered) return null;
  return (
    <>
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={settings.general?.siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      {seo.regionCode && <meta name="geo.region" content={seo.regionCode} />}
      {seo.localCity && <meta name="geo.placename" content={[seo.localCity, seo.localRegion].filter(Boolean).join(', ')} />}
      {seo.latitude && seo.longitude && <meta name="geo.position" content={`${seo.latitude};${seo.longitude}`} />}
      {seo.latitude && seo.longitude && <meta name="ICBM" content={`${seo.latitude}, ${seo.longitude}`} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(siteGraph(settings, services, locations)) }} />
    </>
  );
}
