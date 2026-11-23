import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { DynIcon } from '../../lib/icons.jsx';
import { img } from '../../lib/api.js';
import { formatDate } from '../../lib/hooks.js';
import { useSite } from '../../context/SiteContext.jsx';
import { useSpotlight } from '../ui/Motion.jsx';

export function ServiceCard({ s, index = 0 }) {
  const { settings } = useSite();
  const spot = useSpotlight();
  const on = settings.theme?.spotlight !== false;
  return (
    <Link to={`/services/${s.slug}`} onMouseMove={on ? spot : undefined} className={`${on ? 'spotlight' : ''} group relative flex h-full flex-col overflow-hidden rounded-brand border border-slate-200/80 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl hover:shadow-primary/15`}>
      <span className="absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-gradient-to-r from-accent to-primary transition-transform duration-500 group-hover:scale-x-100" />
      {s.image && (
        <>
          <img src={img(s.image)} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 to-secondary/95 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </>
      )}
      <span className="absolute right-6 top-5 font-heading text-6xl font-extrabold text-slate-100 transition group-hover:text-white/10">{String(index + 1).padStart(2, '0')}</span>
      <div className="relative flex flex-1 flex-col">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/20 text-primary transition-all duration-500 group-hover:rotate-6 group-hover:bg-white group-hover:from-white group-hover:to-white">
          <DynIcon name={s.icon} size={30} strokeWidth={1.8} />
        </span>
        <h3 className="mt-6 text-xl font-bold text-secondary transition group-hover:text-white">{s.title}</h3>
        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-600 transition group-hover:text-white/80">{s.shortDescription}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:text-accent">
          Learn more <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function PostCard({ p }) {
  return (
    <Link to={`/blog/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-brand border border-slate-200/80 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-secondary/10">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={img(p.coverImage)} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        {p.category && <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-primary shadow">{p.category}</span>}
        <span className="absolute bottom-4 right-4 grid h-11 w-11 translate-y-4 place-items-center rounded-full bg-accent text-secondary opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={20} /></span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(p.publishedAt)}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} />{p.readingTime || 3} min read</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-secondary transition group-hover:text-primary">{p.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{p.excerpt}</p>
      </div>
    </Link>
  );
}

export function ClientLogo({ c }) {
  return (
    <div className="flex h-24 min-w-[220px] items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-6 grayscale transition hover:border-primary/30 hover:grayscale-0 hover:shadow-lg">
      {c.logo ? (
        <img src={img(c.logo)} alt={c.name} loading="lazy" className="max-h-14 max-w-[160px] object-contain" />
      ) : (
        <>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary font-heading text-sm font-bold text-white">
            {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </span>
          <span className="text-left">
            <span className="block text-sm font-bold leading-tight text-secondary">{c.name}</span>
            {c.industry && <span className="text-xs text-slate-500">{c.industry}</span>}
          </span>
        </>
      )}
    </div>
  );
}
