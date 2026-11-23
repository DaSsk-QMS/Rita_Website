import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, CalendarDays, Briefcase, ExternalLink, Quote, X, CheckCircle2, Building2 } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { usePublic } from '../lib/hooks.js';
import { img } from '../lib/api.js';
import { IMG } from '../data/defaults.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, SectionTitle } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { CardSkeletons } from '../components/ui/Loaders.jsx';
import { TestimonialsSection, StatsSection, CtaSection } from '../components/home/Sections.jsx';

const initials = (name = '') => name.split(' ').map((w) => w[0]).slice(0, 2).join('');

function LogoMark({ c, size = 'md' }) {
  const box = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-14 w-14 text-base';
  return c.logo
    ? <span className={`grid ${box} shrink-0 place-items-center overflow-hidden rounded-2xl border bg-white p-2`}><img src={img(c.logo)} alt={`${c.name} logo`} loading="lazy" className="max-h-full max-w-full object-contain" /></span>
    : <span className={`grid ${box} shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary font-heading font-extrabold text-white`}>{initials(c.name)}</span>;
}

function Meta({ c }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
      {c.industry && <span className="flex items-center gap-1.5"><Building2 size={13} className="text-primary" />{c.industry}</span>}
      {c.location && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-primary" />{c.location}</span>}
      {c.since && <span className="flex items-center gap-1.5"><CalendarDays size={13} className="text-primary" />Client since {c.since}</span>}
      {c.projects && <span className="flex items-center gap-1.5"><Briefcase size={13} className="text-primary" />{c.projects}</span>}
    </div>
  );
}

function ClientModal({ c, onClose }) {
  useEffect(() => {
    if (!c) return undefined;
    const on = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [c, onClose]);
  return (
    <AnimatePresence>
      {c && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-secondary/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label={c.name} initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.96 }} onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-brand bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-secondary to-primary p-8 text-white">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-aurora rounded-full bg-accent/30 blur-2xl" />
              <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close"><X size={18} /></button>
              <div className="relative flex items-center gap-5">
                <LogoMark c={c} size="lg" />
                <div>
                  <h3 className="text-2xl font-extrabold">{c.name}</h3>
                  {c.industry && <p className="mt-1 text-sm text-white/70">{c.industry}{c.location ? ` · ${c.location}` : ''}</p>}
                </div>
              </div>
            </div>
            <div className="space-y-6 p-8">
              <Meta c={c} />
              {c.about && <p className="leading-relaxed text-slate-700">{c.about}</p>}
              {c.services?.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Services delivered</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {c.services.map((s) => <li key={s} className="flex gap-2 text-sm text-slate-700"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />{s}</li>)}
                  </ul>
                </div>
              )}
              {c.quote && (
                <blockquote className="relative rounded-xl bg-surface p-5 text-slate-700">
                  <Quote size={28} className="absolute right-4 top-4 text-accent/40" />
                  <p className="italic">“{c.quote}”</p>
                  {c.quoteBy && <footer className="mt-2 text-sm font-semibold text-secondary">— {c.quoteBy}</footer>}
                </blockquote>
              )}
              {c.website && <a href={c.website} target="_blank" rel="noreferrer noopener" className="btn-ghost">Visit website <ExternalLink size={15} /></a>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Clients() {
  const { settings } = useSite();
  const { data: clients, loading } = usePublic('/clients');
  const { data: testimonials } = usePublic('/testimonials');
  const [industry, setIndustry] = useState('All');
  const [open, setOpen] = useState(null);
  const industries = useMemo(() => ['All', ...new Set((clients || []).map((c) => c.industry).filter(Boolean))], [clients]);
  const featured = (clients || []).filter((c) => c.featured);
  const shown = (clients || []).filter((c) => industry === 'All' || c.industry === industry);

  return (
    <>
      <Seo title="Our Clients" description="Metro, mainline, signalling and rolling stock organisations we support in Telangana and across India." />
      <PageHero title="Our Clients" subtitle={settings.home?.clientsTitle} image={IMG.interior} crumbs={[{ label: 'Clients' }]} />

      {featured.length > 0 && (
        <section className="bg-surface py-24">
          <div className="container-x">
            <SectionTitle eyebrow="Featured partnerships" title="Selected client engagements" subtitle="A look at how we support operators, suppliers and integrators." />
            <div className="grid gap-6 lg:grid-cols-3">
              {featured.map((c, i) => (
                <Reveal key={c._id} delay={i * 0.08}>
                  <button type="button" onClick={() => setOpen(c)} className="group flex h-full w-full flex-col rounded-brand border border-slate-200/80 bg-white p-7 text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
                    <div className="flex items-center gap-4">
                      <LogoMark c={c} />
                      <div className="min-w-0"><p className="truncate font-heading text-lg font-bold text-secondary group-hover:text-primary">{c.name}</p><p className="text-sm text-slate-500">{c.industry}</p></div>
                    </div>
                    {c.about && <p className="mt-5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{c.about}</p>}
                    {c.services?.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {c.services.slice(0, 3).map((s) => <span key={s} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{s.replace(/\s*\(.*\)/, '')}</span>)}
                      </div>
                    )}
                    <div className="mt-5 border-t pt-4"><Meta c={c} /></div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24">
        <div className="container-x">
          <SectionTitle eyebrow="Partnerships" title="Organisations we support" subtitle="Operators, suppliers and integrators across metro, mainline and rolling stock. Select a client for details." />
          {industries.length > 2 && (
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              {industries.map((x) => (
                <button key={x} onClick={() => setIndustry(x)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${industry === x ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-surface text-slate-600 hover:text-primary'}`}>{x}</button>
              ))}
            </div>
          )}
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? <CardSkeletons count={8} className="h-28" /> : (
              <AnimatePresence mode="popLayout">
                {shown.map((c) => (
                  <motion.button layout key={c._id} type="button" onClick={() => setOpen(c)} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="group flex h-28 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 text-left transition hover:border-primary/30 hover:shadow-lg">
                    {c.logo
                      ? <img src={img(c.logo)} alt={`${c.name} logo`} loading="lazy" className="max-h-14 max-w-[45%] object-contain grayscale transition group-hover:grayscale-0" />
                      : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary font-heading text-sm font-bold text-white">{initials(c.name)}</span>}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-secondary group-hover:text-primary">{c.name}</span>
                      <span className="block truncate text-xs text-slate-500">{[c.industry, c.location].filter(Boolean).join(' · ')}</span>
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </section>
      <StatsSection />
      <TestimonialsSection items={testimonials} />
      <CtaSection />
      <ClientModal c={open} onClose={() => setOpen(null)} />
    </>
  );
}
