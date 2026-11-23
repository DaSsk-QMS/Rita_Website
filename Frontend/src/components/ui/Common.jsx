import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, SplitText } from './Motion.jsx';
import { useSite } from '../../context/SiteContext.jsx';
import { img } from '../../lib/api.js';
import { breadcrumbLd } from '../../lib/schema.js';

export function Logo({ light = false, className = '' }) {
  const { settings } = useSite();
  const g = settings.general || {};
  const src = light ? g.logoDark || g.logo : g.logo;
  if (src) return <img src={img(src)} alt={g.siteName} className={`h-11 w-auto object-contain ${className}`} />;
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
        <svg viewBox="0 0 64 64" className="h-8 w-8">
          <path d="M32 10l17 6.5v12.5c0 11.5-7.4 19.8-17 23-9.6-3.2-17-11.5-17-23V16.5z" fill="none" stroke="var(--c-accent)" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M24.5 32l5.5 5.5 10.5-11.5" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-heading text-2xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-secondary'}`}>{g.logoText || g.shortName}</span>
        <span className={`mt-1 block text-[10px] font-semibold uppercase tracking-[0.25em] ${light ? 'text-white/70' : 'text-primary'}`}>{g.logoSubText}</span>
      </span>
    </span>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, center = true, light = false, className = '' }) {
  return (
    <Reveal className={`${center ? 'mx-auto text-center' : ''} mb-12 max-w-3xl ${className}`}>
      {eyebrow && <span className={`eyebrow ${center ? 'justify-center' : ''} ${light ? '!text-accent' : ''}`}>{eyebrow}</span>}
      <h2 className={`mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.75rem] ${light ? 'text-white' : 'text-secondary'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? 'text-white/70' : 'text-slate-600'}`}>{subtitle}</p>}
    </Reveal>
  );
}

export function PageHero({ title, subtitle, image, crumbs = [] }) {
  const { settings } = useSite();
  const bg = img(image || settings.seo?.ogImage);
  return (
    <section className="relative isolate overflow-hidden bg-secondary pb-20 pt-40 text-white sm:pb-24 sm:pt-48">
      {crumbs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(settings, crumbs)).replace(/</g, '\\u003c') }} />}
      {bg && <img src={bg} alt="" className="absolute inset-0 -z-20 h-full w-full animate-kenburns object-cover opacity-40" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-secondary via-secondary/85 to-secondary/40" />
      <div className="absolute -bottom-px left-0 right-0 -z-10 h-24 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="pointer-events-none absolute -right-24 top-10 -z-10 h-80 w-80 animate-aurora rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 -z-10 h-72 w-72 animate-aurora rounded-full bg-accent/20 blur-3xl [animation-delay:-8s]" />
      <div className="bg-dots pointer-events-none absolute inset-0 -z-10 opacity-[0.06]" />
      <div className="container-x">
        <motion.nav initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-white/70" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 hover:text-accent"><Home size={14} /> Home</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronRight size={14} />
              {c.to ? <Link to={c.to} className="hover:text-accent">{c.label}</Link> : <span className="text-white">{c.label}</span>}
            </span>
          ))}
        </motion.nav>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          <SplitText text={title} delay={0.1} />
        </h1>
        {subtitle && (
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }} className="mt-5 max-w-2xl text-lg text-white/75">
            {subtitle}
          </motion.p>
        )}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-8 h-1 w-24 origin-left rounded bg-accent" />
      </div>
    </section>
  );
}

export function EmptyState({ title = 'Nothing here yet', text }) {
  return (
    <div className="rounded-brand border border-dashed border-slate-300 p-12 text-center">
      <p className="font-heading text-lg font-bold text-secondary">{title}</p>
      {text && <p className="mt-2 text-slate-500">{text}</p>}
    </div>
  );
}

export function Html({ html, className = 'prose-brand' }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html || '' }} />;
}
