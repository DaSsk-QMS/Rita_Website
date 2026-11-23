// Mirrors the public API using bundled default content, so the website
// still works when the backend/database is not running.
import {
  defaultSettings, defaultSlides, defaultServices, defaultPosts, defaultCategories, defaultJobs,
  defaultGallery, defaultClients, defaultTestimonials, defaultTeam, defaultPageSeo, defaultLocations,
} from '../data/defaults.js';

const withIds = (arr, p) => arr.map((x, i) => ({ _id: `${p}-${i}`, active: true, ...x }));
const services = withIds(defaultServices, 'svc');
const posts = withIds(defaultPosts, 'post').map((p) => ({
  ...p,
  readingTime: Math.max(1, Math.round(p.content.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 200)),
}));
const jobs = withIds(defaultJobs, 'job');
const locations = withIds(defaultLocations, 'loc');
const card = ({ content, ...rest }) => rest;
const has = (q) => (s) => String(s || '').toLowerCase().includes(q);

export const offlineBootstrap = () => {
  const { smtp, ...settings } = defaultSettings;
  return {
    settings,
    services: services.map(({ _id, title, slug, icon, shortDescription }) => ({ _id, title, slug, icon, shortDescription })),
    pageSeo: defaultPageSeo,
    locations: locations.map(({ _id, name, slug, region }) => ({ _id, name, slug, region })),
  };
};

export function offlineGet(path, params = {}) {
  const [, root, slug] = path.split('/');
  switch (root) {
    case 'bootstrap':
      return offlineBootstrap();
    case 'home':
      return {
        slides: withIds(defaultSlides, 'slide'),
        services: services.filter((s) => s.featured).map(card),
        clients: withIds(defaultClients, 'client'),
        testimonials: withIds(defaultTestimonials, 'testi'),
        posts: posts.slice(0, 3).map(card),
        locations: locations.map(card),
      };
    case 'services':
      if (slug) {
        const item = services.find((s) => s.slug === slug);
        return item ? { item, others: services.filter((s) => s.slug !== slug) } : undefined;
      }
      return services;
    case 'posts': {
      if (slug) {
        const item = posts.find((p) => p.slug === slug);
        if (!item) return undefined;
        const others = posts.filter((p) => p.slug !== slug).map(card);
        return { item, related: others.filter((p) => p.category === item.category).slice(0, 3), recent: others.slice(0, 4) };
      }
      let items = posts;
      if (params.category) items = items.filter((p) => p.category === params.category);
      if (params.tag) items = items.filter((p) => p.tags.includes(params.tag));
      if (params.q) { const m = has(String(params.q).toLowerCase()); items = items.filter((p) => m(p.title) || m(p.excerpt) || m(p.content)); }
      const count = (key) => Object.entries(posts.flatMap((p) => [].concat(p[key])).reduce((a, k) => ({ ...a, [k]: (a[k] || 0) + 1 }), {})).map(([_id, c]) => ({ _id, count: c }));
      return { items: items.map(card), total: items.length, page: 1, pages: 1, categories: count('category'), tags: count('tags') };
    }
    case 'jobs':
      if (slug) return jobs.find((j) => j.slug === slug);
      return jobs;
    case 'locations':
      if (slug) {
        const item = locations.find((l) => l.slug === slug);
        return item ? { item, others: locations.filter((l) => l.slug !== slug), services: services.map(card) } : undefined;
      }
      return locations;
    case 'feedback':
      return { items: [], summary: { average: 0, count: 0 }, categories: ['Service quality', 'Communication', 'Technical expertise', 'Timeliness', 'Website', 'Other'] };
    case 'stats':
      return undefined;
    case 'gallery': return withIds(defaultGallery, 'gal');
    case 'clients': return withIds(defaultClients, 'client');
    case 'testimonials': return withIds(defaultTestimonials, 'testi');
    case 'team': return withIds(defaultTeam, 'team');
    case 'categories': return defaultCategories;
    case 'slides': return withIds(defaultSlides, 'slide');
    case 'search': {
      const m = has(String(params.q || '').toLowerCase());
      return {
        services: services.filter((s) => m(s.title) || m(s.shortDescription) || m(s.content)),
        posts: posts.filter((p) => m(p.title) || m(p.excerpt) || m(p.content)).map(card),
        jobs: jobs.filter((j) => m(j.title) || m(j.department)),
      };
    }
    default:
      return undefined;
  }
}
