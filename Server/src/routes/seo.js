import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { Service, Post, Job, PageSeo, Location } from '../models/index.js';
import { getSettings } from '../utils/settings.js';
import { asyncH } from '../utils/crud.js';
import { esc } from '../utils/email.js';

const r = Router();

const baseUrl = (settings, req) =>
  (settings.seo.siteUrl && !settings.seo.siteUrl.includes('localhost')
    ? settings.seo.siteUrl
    : `${req.protocol}://${req.get('host')}`
  ).replace(/\/$/, '');

const STATIC_PAGES = [
  ['/', '1.0', 'weekly'], ['/about', '0.8', 'monthly'], ['/services', '0.9', 'monthly'], ['/locations', '0.8', 'monthly'],
  ['/blog', '0.8', 'weekly'], ['/careers', '0.7', 'weekly'], ['/clients', '0.7', 'monthly'], ['/gallery', '0.5', 'monthly'],
  ['/feedback', '0.5', 'monthly'], ['/contact', '0.8', 'yearly'],
];

r.get(
  '/sitemap.xml',
  asyncH(async (req, res) => {
    const settings = await getSettings();
    const base = baseUrl(settings, req);
    const [services, posts, jobs, locations] = await Promise.all([
      Service.find({ active: true }).select('slug updatedAt image').lean(),
      Post.find({ status: 'published', publishedAt: { $lte: new Date() } }).select('slug updatedAt coverImage').lean(),
      Job.find({ active: true }).select('slug updatedAt').lean(),
      Location.find({ active: true }).select('slug updatedAt').lean(),
    ]);
    const urls = [
      ...STATIC_PAGES.map(([loc, priority, changefreq]) => ({ loc, priority, changefreq })),
      ...services.map((s) => ({ loc: `/services/${s.slug}`, lastmod: s.updatedAt, priority: '0.9', changefreq: 'monthly', image: s.image })),
      ...locations.map((l) => ({ loc: `/locations/${l.slug}`, lastmod: l.updatedAt, priority: '0.8', changefreq: 'monthly' })),
      ...posts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.updatedAt, priority: '0.6', changefreq: 'monthly', image: p.coverImage })),
      ...jobs.map((j) => ({ loc: `/careers/${j.slug}`, lastmod: j.updatedAt, priority: '0.5', changefreq: 'weekly' })),
    ];
    const abs = (u) => (u && u.startsWith('/') ? base + u : u);
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
        .map(
          (u) =>
            `  <url><loc>${base}${u.loc === '/' ? '' : u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority>${u.image ? `<image:image><image:loc>${esc(abs(u.image))}</image:loc></image:image>` : ''}</url>`
        )
        .join('\n')}\n</urlset>`
    );
  })
);

r.get(
  '/robots.txt',
  asyncH(async (req, res) => {
    const settings = await getSettings();
    const base = baseUrl(settings, req);
    res.type('text/plain').send(
      settings.seo.allowIndexing
        ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nDisallow: /search\n\nSitemap: ${base}/sitemap.xml\n`
        : 'User-agent: *\nDisallow: /\n'
    );
  })
);

// ---------------------------------------------------------------- structured data

const list = (v) => (Array.isArray(v) ? v : String(v || '').split(/[,\n]/)).map((s) => String(s).trim()).filter(Boolean);
const plain = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/** Organization / ProfessionalService (local business) + WebSite graph, shared by every page. */
export function siteGraph(settings, base, { services = [], locations = [] } = {}) {
  const { general: g, contact: c, seo, social } = settings;
  const abs = (u) => (u && u.startsWith('/') ? base + u : u);
  const areas = [...new Set([...list(seo.areaServed), ...locations.map((l) => l.name)])];
  const org = {
    '@type': seo.businessType || 'ProfessionalService',
    '@id': `${base}/#organization`,
    name: g.siteName,
    alternateName: g.shortName,
    slogan: g.tagline,
    description: seo.metaDescription,
    url: `${base}/`,
    logo: abs(g.logo) || undefined,
    image: abs(seo.ogImage) || undefined,
    email: c.email || undefined,
    telephone: c.phone || undefined,
    foundingDate: seo.foundingYear || undefined,
    priceRange: seo.priceRange || undefined,
    openingHours: seo.openingHours || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: seo.streetAddress || c.address || undefined,
      addressLocality: seo.localCity || undefined,
      addressRegion: seo.localRegion || undefined,
      postalCode: seo.postalCode || undefined,
      addressCountry: seo.countryCode || 'IN',
    },
    geo: seo.latitude && seo.longitude ? { '@type': 'GeoCoordinates', latitude: Number(seo.latitude), longitude: Number(seo.longitude) } : undefined,
    hasMap: seo.latitude && seo.longitude ? `https://www.google.com/maps?q=${seo.latitude},${seo.longitude}` : undefined,
    areaServed: [
      ...(seo.localRegion ? [{ '@type': 'State', name: seo.localRegion }] : []),
      ...areas.map((name) => ({ '@type': 'City', name })),
      { '@type': 'Country', name: 'India' },
    ],
    knowsAbout: [...services.map((s) => s.title), ...list(seo.keywords).slice(0, 12)],
    hasOfferCatalog: services.length
      ? {
          '@type': 'OfferCatalog',
          name: 'Railway safety assurance services',
          itemListElement: services.map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.title, url: `${base}/services/${s.slug}` },
          })),
        }
      : undefined,
    contactPoint: c.phone || c.email
      ? [{
          '@type': 'ContactPoint', contactType: 'customer service', telephone: c.phone || undefined, email: c.email || undefined,
          areaServed: 'IN', availableLanguage: list(seo.languages || 'English'),
        }]
      : undefined,
    sameAs: Object.values(social || {}).filter((u) => /^https?:\/\/.+\/.+/.test(u || '')),
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: `${base}/`,
    name: g.siteName,
    inLanguage: 'en-IN',
    publisher: { '@id': `${base}/#organization` },
    potentialAction: { '@type': 'SearchAction', target: `${base}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
  };
  return { '@context': 'https://schema.org', '@graph': [org, website] };
}

const breadcrumbs = (base, items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...items].map((it, i) => ({
    '@type': 'ListItem', position: i + 1, name: it.name, item: `${base}${it.path === '/' ? '/' : it.path}`,
  })),
});

const ldTag = (obj, attrs = '') => `<script type="application/ld+json"${attrs}>${JSON.stringify(JSON.parse(JSON.stringify(obj))).replace(/</g, '\\u003c')}</script>`;

/**
 * Serves the built React app (Frontend/dist) with per-page <title>, description,
 * Open Graph, geo tags and JSON-LD injected server-side, so search engines and social
 * networks see correct metadata even without running JavaScript.
 * Page-level tags carry data-ssr so the React app can replace them after it boots.
 */
export function spaWithSeo(distDir) {
  const indexPath = path.join(distDir, 'index.html');
  return asyncH(async (req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    if (!fs.existsSync(indexPath)) return next();
    let html = await fs.promises.readFile(indexPath, 'utf8');
    const settings = await getSettings();
    const seo = settings.seo;
    const base = baseUrl(settings, req);
    let title = seo.metaTitle;
    let description = seo.metaDescription;
    let keywords = seo.keywords;
    let image = seo.ogImage;
    let type = 'website';
    const ld = [];
    const isAdmin = req.path.startsWith('/admin');

    const p = req.path.replace(/\/$/, '') || '/';
    const [, section, slug] = p.split('/');
    const suffix = seo.titleSuffix || '';
    const [services, locations] = await Promise.all([
      Service.find({ active: true }).sort({ order: 1 }).select('title slug').lean(),
      Location.find({ active: true }).sort({ order: 1 }).select('name slug').lean(),
    ]);
    const provider = { '@id': `${base}/#organization` };
    const areaServed = [seo.localRegion, ...locations.map((l) => l.name)].filter(Boolean).map((name) => ({ '@type': 'Place', name }));
    const sectionNames = { services: 'Services', blog: 'Insights', careers: 'Careers', locations: 'Areas we serve' };

    if (section === 'blog' && slug) {
      const post = await Post.findOne({ slug, status: 'published' }).lean();
      if (post) {
        title = (post.seoTitle || post.title) + suffix; description = post.seoDescription || post.excerpt; image = post.coverImage || image; type = 'article';
        keywords = post.seoKeywords || (post.tags || []).join(', ') || keywords;
        ld.push({
          '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt,
          image: image && image.startsWith('/') ? base + image : image, datePublished: post.publishedAt, dateModified: post.updatedAt,
          author: { '@type': 'Organization', name: post.author || settings.general.siteName }, publisher: provider,
          mainEntityOfPage: `${base}${p}`, keywords: (post.tags || []).join(', '), articleSection: post.category, inLanguage: 'en-IN',
        });
        ld.push(breadcrumbs(base, [{ name: 'Insights', path: '/blog' }, { name: post.title, path: p }]));
      }
    } else if (section === 'services' && slug) {
      const s = await Service.findOne({ slug }).lean();
      if (s) {
        title = (s.seoTitle || s.title) + suffix; description = s.seoDescription || s.shortDescription; image = s.image || image;
        keywords = s.seoKeywords || keywords;
        ld.push({
          '@context': 'https://schema.org', '@type': 'Service', name: s.title, serviceType: s.title, description: s.shortDescription,
          url: `${base}${p}`, provider, areaServed, image: image && image.startsWith('/') ? base + image : image,
        });
        ld.push(breadcrumbs(base, [{ name: 'Services', path: '/services' }, { name: s.title, path: p }]));
      }
    } else if (section === 'locations' && slug) {
      const l = await Location.findOne({ slug, active: true }).lean();
      if (l) {
        title = (l.seoTitle || `${l.headline || `Railway Safety Assessment & RAMS in ${l.name}`}`) + suffix;
        description = l.seoDescription || l.intro || description;
        keywords = l.seoKeywords || services.map((s) => `${s.title} ${l.name}`).join(', ');
        image = l.image || image;
        ld.push({
          '@context': 'https://schema.org', '@type': 'Service', name: `Railway safety assurance in ${l.name}`, provider,
          areaServed: { '@type': 'City', name: l.name, containedInPlace: { '@type': 'State', name: l.region || seo.localRegion } },
          url: `${base}${p}`, description,
          hasOfferCatalog: { '@type': 'OfferCatalog', name: `Services in ${l.name}`, itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title } })) },
        });
        ld.push(breadcrumbs(base, [{ name: 'Areas we serve', path: '/locations' }, { name: l.name, path: p }]));
      }
    } else if (section === 'careers' && slug) {
      const j = await Job.findOne({ slug }).lean();
      if (j) {
        title = `${j.title} – Careers${suffix}`; description = `${j.title} · ${j.location} · ${j.type}. ${plain(j.description).slice(0, 120)}`;
        const typeMap = { 'Full-time': 'FULL_TIME', 'Part-time': 'PART_TIME', Contract: 'CONTRACTOR', Internship: 'INTERN', Freelance: 'CONTRACTOR' };
        ld.push({
          '@context': 'https://schema.org', '@type': 'JobPosting', title: j.title,
          description: j.description || j.title, datePosted: j.createdAt,
          validThrough: j.deadline || new Date(new Date(j.createdAt).getTime() + 120 * 864e5),
          employmentType: typeMap[j.type] || 'FULL_TIME', directApply: true,
          hiringOrganization: { '@type': 'Organization', name: settings.general.siteName, sameAs: base, logo: settings.general.logo ? base + settings.general.logo : undefined },
          jobLocation: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: seo.localCity || 'Hyderabad', addressRegion: seo.localRegion || 'Telangana', postalCode: seo.postalCode || undefined, streetAddress: seo.streetAddress || undefined, addressCountry: 'IN' },
          },
          jobLocationType: /remote/i.test(j.location || '') ? 'TELECOMMUTE' : undefined,
          applicantLocationRequirements: /remote/i.test(j.location || '') ? { '@type': 'Country', name: 'India' } : undefined,
          totalJobOpenings: j.openings, experienceRequirements: j.experience, industry: 'Railway engineering & safety assurance',
        });
        ld.push(breadcrumbs(base, [{ name: 'Careers', path: '/careers' }, { name: j.title, path: p }]));
      }
    } else {
      const ps = await PageSeo.findOne({ path: p }).lean();
      if (ps) {
        title = p === '/' ? seo.metaTitle : (ps.title || '') + suffix; description = ps.description || description; image = ps.ogImage || image;
        keywords = ps.keywords || keywords;
      }
      if (p !== '/' && section && !isAdmin) ld.push(breadcrumbs(base, [{ name: ps?.title || sectionNames[section] || section, path: p }]));
    }

    const abs = (u) => (u && u.startsWith('/') ? base + u : u);
    const lat = seo.latitude;
    const lon = seo.longitude;
    const ssr = ' data-ssr="1"';
    const meta = [
      `<title${ssr}>${esc(title)}</title>`,
      `<meta${ssr} name="description" content="${esc(description)}">`,
      `<meta${ssr} name="keywords" content="${esc(keywords)}">`,
      `<link${ssr} rel="canonical" href="${base}${p === '/' ? '/' : p}">`,
      `<link rel="alternate" hreflang="en-IN" href="${base}${p === '/' ? '/' : p}">`,
      `<link rel="alternate" hreflang="x-default" href="${base}${p === '/' ? '/' : p}">`,
      `<meta${ssr} property="og:type" content="${type}">`,
      `<meta property="og:locale" content="en_IN">`,
      `<meta property="og:site_name" content="${esc(settings.general.siteName)}">`,
      `<meta${ssr} property="og:title" content="${esc(title)}">`,
      `<meta${ssr} property="og:description" content="${esc(description)}">`,
      `<meta${ssr} property="og:url" content="${base}${p}">`,
      image ? `<meta${ssr} property="og:image" content="${esc(abs(image))}">` : '',
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta${ssr} name="twitter:title" content="${esc(title)}">`,
      `<meta${ssr} name="twitter:description" content="${esc(description)}">`,
      image ? `<meta${ssr} name="twitter:image" content="${esc(abs(image))}">` : '',
      seo.regionCode ? `<meta name="geo.region" content="${esc(seo.regionCode)}">` : '',
      seo.localCity ? `<meta name="geo.placename" content="${esc([seo.localCity, seo.localRegion].filter(Boolean).join(', '))}">` : '',
      lat && lon ? `<meta name="geo.position" content="${esc(`${lat};${lon}`)}">` : '',
      lat && lon ? `<meta name="ICBM" content="${esc(`${lat}, ${lon}`)}">` : '',
      seo.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(seo.googleSiteVerification)}">` : '',
      seo.bingSiteVerification ? `<meta name="msvalidate.01" content="${esc(seo.bingSiteVerification)}">` : '',
      !seo.allowIndexing || isAdmin ? '<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index,follow,max-image-preview:large">',
      settings.general.favicon ? `<link rel="icon" href="${esc(settings.general.favicon)}">` : '',
      isAdmin ? '' : ldTag(siteGraph(settings, base, { services, locations }), ' id="ld-site"'),
      ...ld.map((o) => ldTag(o, ssr)),
    ].filter(Boolean).join('\n    ');

    html = html
      .replace('<html lang="en">', '<html lang="en-IN">')
      .replace(/<title>.*?<\/title>/s, '')
      .replace(/<meta name="description"[^>]*>/, '')
      .replace('</head>', `    ${meta}\n  </head>`);
    res.set('Cache-Control', 'no-cache').type('html').send(html);
  });
}

export default r;
