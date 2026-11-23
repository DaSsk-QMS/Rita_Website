import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Quote, Star, Eye, Target, Gem, Phone, MapPin } from 'lucide-react';
import { useSite } from '../../context/SiteContext.jsx';
import { img } from '../../lib/api.js';
import { DynIcon } from '../../lib/icons.jsx';
import { Reveal, Counter, useSpotlight, Magnetic } from '../ui/Motion.jsx';
import { SectionTitle } from '../ui/Common.jsx';
import { ClientLogo } from './Cards.jsx';
import 'swiper/css';
import 'swiper/css/pagination';

export function StandardsTicker() {
  const { settings } = useSite();
  const items = (settings.home?.standards || []).map((s) => s.code);
  if (!items?.length) return null;
  const row = [...items, 'ISA', 'RAMS', 'V&V', 'Safety Audits', ...items, 'ISA', 'RAMS', 'V&V', 'Safety Audits'];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-primary py-5 text-white">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap hover:[animation-play-state:paused]">
        {[...row, ...row].map((t, i) => (
          <span key={i} className="flex items-center gap-12 font-heading text-lg font-bold uppercase tracking-wider">
            {t} <span className="h-2 w-2 rotate-45 bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function AboutSection({ full = false }) {
  const { settings } = useSite();
  const g = settings.general || {};
  const [tab, setTab] = useState('mission');
  const tabs = [
    { id: 'mission', label: 'Mission', icon: Target, text: g.mission },
    { id: 'vision', label: 'Vision', icon: Eye, text: g.vision },
    { id: 'values', label: 'Values', icon: Gem, text: g.values },
  ].filter((t) => t.text);

  return (
    <section id="about" className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <Reveal from="left" className="relative">
          <div className="relative overflow-hidden rounded-[calc(var(--radius)*2)] shadow-2xl">
            <img src={img(g.aboutImage)} alt="About us" loading="lazy" className="aspect-[4/5] w-full object-cover sm:aspect-[5/5]" />
          </div>
          {g.aboutImage2 && (
            <div className="absolute -bottom-10 -right-4 hidden w-1/2 overflow-hidden rounded-brand border-8 border-white shadow-2xl sm:block">
              <img src={img(g.aboutImage2)} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            </div>
          )}
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute -left-4 top-10 rounded-2xl bg-white p-5 shadow-2xl sm:-left-8">
            <p className="font-heading text-4xl font-extrabold text-primary">{g.experienceYears}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Years of<br />expertise</p>
          </motion.div>
          <div className="absolute -right-6 -top-6 -z-10 h-40 w-40 rounded-3xl bg-accent/30" />
        </Reveal>

        <div>
          <Reveal><span className="eyebrow">About {g.shortName}</span></Reveal>
          <Reveal delay={0.1}><h2 className="mt-3 text-3xl font-extrabold leading-tight text-secondary sm:text-4xl lg:text-5xl">{g.aboutTitle}</h2></Reveal>
          <Reveal delay={0.2}>
            {full ? <div className="prose-brand mt-6" dangerouslySetInnerHTML={{ __html: g.aboutContent }} /> : <p className="mt-6 text-lg leading-relaxed text-slate-600">{g.aboutShort}</p>}
          </Reveal>

          {tabs.length > 0 && (
            <Reveal delay={0.3} className="mt-8">
              <div className="flex gap-2 rounded-full bg-surface p-1.5">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition ${tab === t.id ? 'text-white' : 'text-slate-600 hover:text-primary'}`}>
                    {tab === t.id && <motion.span layoutId="aboutTab" className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/30" />}
                    <t.icon size={16} className="relative" /> <span className="relative">{t.label}</span>
                  </button>
                ))}
              </div>
              <motion.p key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex gap-3 text-slate-700">
                <CheckCircle2 className="mt-0.5 shrink-0 text-accent" size={22} />
                {tabs.find((t) => t.id === tab)?.text}
              </motion.p>
            </Reveal>
          )}

          {!full && (
            <Reveal delay={0.4} className="mt-10 flex flex-wrap items-center gap-6">
              <Link to="/about" className="btn-primary">Discover more <ArrowRight size={18} /></Link>
              {settings.contact?.phone && (
                <a href={`tel:${settings.contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/20 text-primary"><Phone size={20} /></span>
                  <span><span className="block text-xs text-slate-500">Call us anytime</span><span className="font-heading font-bold text-secondary">{settings.contact.phone}</span></span>
                </a>
              )}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  const { settings } = useSite();
  const stats = settings.home?.stats || [];
  if (!stats.length) return null;
  return (
    <section className="relative isolate overflow-hidden bg-secondary py-20">
      <img src={img(settings.general?.aboutImage2 || settings.seo?.ogImage)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15" loading="lazy" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-secondary via-secondary/90 to-primary/80" />
      <div className="container-x grid grid-cols-2 gap-8 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1} className="relative text-center lg:border-r lg:border-white/10 lg:last:border-0">
            <p className="font-heading text-5xl font-extrabold text-white lg:text-6xl"><Counter value={s.value} suffix={s.suffix} /></p>
            <p className="mx-auto mt-3 max-w-[12rem] text-sm font-medium text-white/70">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function WhyUsSection() {
  const { settings } = useSite();
  const spot = useSpotlight();
  const glow = settings.theme?.spotlight !== false;
  const h = settings.home || {};
  if (!h.whyUs?.length) return null;
  return (
    <section className="bg-surface py-24 lg:py-32">
      <div className="container-x">
        <SectionTitle eyebrow="Why RITA" title={h.whyUsTitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {h.whyUs.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.1} onMouseMove={glow ? spot : undefined} className={`${glow ? 'spotlight' : ''} group relative overflow-hidden rounded-brand bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl`}>
              <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-accent transition-transform duration-500 group-hover:scale-x-100" />
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 transition duration-500 group-hover:rotate-[8deg] group-hover:scale-110 group-hover:bg-accent group-hover:text-secondary">
                <DynIcon name={w.icon} size={26} />
              </span>
              <h3 className="relative mt-6 text-lg font-bold text-secondary">{w.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-slate-600">{w.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  const { settings } = useSite();
  const h = settings.home || {};
  if (!h.process?.length) return null;
  return (
    <section className="py-24 lg:py-32">
      <div className="container-x">
        <SectionTitle eyebrow="Our approach" title={h.processTitle} />
        <div className="relative grid gap-10 md:grid-cols-3 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-[repeating-linear-gradient(90deg,var(--c-primary)_0_12px,transparent_12px_20px)] opacity-30 lg:block" />
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: 'easeInOut' }} className="absolute left-[10%] right-[10%] top-8 hidden h-0.5 origin-left bg-gradient-to-r from-primary to-accent lg:block" />
          {h.process.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12} className="relative text-center">
              <span className="group/step relative mx-auto grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-primary to-secondary font-heading text-xl font-extrabold text-white shadow-xl shadow-primary/25 transition duration-500 hover:scale-110">
                <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-primary/40" style={{ animationDelay: `${i * 0.4}s` }} />
                {i + 1}
              </span>
              <h3 className="mt-6 text-lg font-bold text-secondary">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StandardsSection() {
  const { settings } = useSite();
  const h = settings.home || {};
  if (!h.standards?.length) return null;
  return (
    <section className="relative overflow-hidden bg-secondary py-24 lg:py-32">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="container-x relative">
        <SectionTitle eyebrow="Compliance" title={h.standardsTitle} light />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {h.standards.map((s, i) => (
            <Reveal key={s.code} delay={i * 0.08} className="glass group relative overflow-hidden rounded-brand p-7 transition duration-500 hover:-translate-y-1 hover:border-accent/50 hover:bg-white/15">
              <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/0 blur-2xl transition duration-500 group-hover:bg-accent/30" />
              <p className="font-heading text-2xl font-extrabold text-accent">{s.code}</p>
              <p className="mt-1 font-semibold text-white">{s.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClientsMarquee({ clients }) {
  const { settings } = useSite();
  if (!clients?.length) return null;
  const list = clients.length < 6 ? [...clients, ...clients, ...clients] : clients;
  return (
    <section className="py-20">
      <div className="container-x"><SectionTitle eyebrow="Clients" title={settings.home?.clientsTitle} /></div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
          {[...list, ...list].map((c, i) => <ClientLogo key={`${c._id}-${i}`} c={c} />)}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({ items }) {
  const { settings } = useSite();
  if (!items?.length) return null;
  return (
    <section className="relative overflow-hidden bg-surface py-24 lg:py-32">
      <div className="container-x">
        <SectionTitle eyebrow="Testimonials" title={settings.home?.testimonialsTitle} />
        <Reveal>
          <Swiper className="testi-swiper !pb-14" modules={[Autoplay, Pagination]} autoplay={{ delay: 5000, disableOnInteraction: false }} pagination={{ clickable: true }} spaceBetween={24} breakpoints={{ 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } }}>
            {items.map((t) => (
              <SwiperSlide key={t._id} className="!h-auto">
                <div className="relative flex h-full flex-col rounded-brand bg-white p-8 shadow-sm">
                  <Quote className="absolute right-6 top-6 text-accent/30" size={56} />
                  <div className="flex gap-1 text-accent">{Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                  <p className="mt-5 flex-1 leading-relaxed text-slate-700">“{t.message}”</p>
                  <div className="mt-8 flex items-center gap-4 border-t pt-6">
                    {t.photo ? <img src={img(t.photo)} alt={t.name} loading="lazy" className="h-14 w-14 rounded-full object-cover ring-4 ring-primary/10" /> : <span className="grid h-14 w-14 place-items-center rounded-full bg-primary font-bold text-white">{t.name[0]}</span>}
                    <div>
                      <p className="font-heading font-bold text-secondary">{t.name}</p>
                      <p className="text-sm text-slate-500">{[t.designation, t.company].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaSection() {
  const { settings } = useSite();
  const h = settings.home || {};
  return (
    <section className="py-24">
      <div className="container-x">
        <Reveal from="zoom" className="relative isolate overflow-hidden rounded-[calc(var(--radius)*2)] bg-secondary px-8 py-16 text-center sm:px-16 lg:py-24">
          {h.ctaImage && <img src={img(h.ctaImage)} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/90 via-secondary/90 to-secondary" />
          <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 animate-aurora rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 -z-10 h-80 w-80 animate-aurora rounded-full bg-primary/40 blur-3xl [animation-delay:-6s]" />
          <div className="bg-dots absolute inset-0 -z-10 opacity-10" />
          <h2 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">{h.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">{h.ctaText}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Magnetic><Link to="/contact" className="btn-accent !px-8 !py-4">{h.ctaButton || 'Contact us'} <ArrowRight size={18} /></Link></Magnetic>
            <Link to="/services" className="btn-outline !px-8 !py-4">Explore services</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LocationsSection({ locations }) {
  const { settings } = useSite();
  const h = settings.home || {};
  const seo = settings.seo || {};
  if (!locations?.length) return null;
  const hq = seo.localCity || 'Hyderabad';
  return (
    <section className="relative isolate overflow-hidden bg-secondary py-24 text-white lg:py-32">
      <div className="bg-dots pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" />
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-96 w-96 animate-aurora rounded-full bg-primary/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 -z-10 h-80 w-80 animate-aurora rounded-full bg-accent/15 blur-3xl [animation-delay:-9s]" />
      {/* decorative rail network */}
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.12]" preserveAspectRatio="none" viewBox="0 0 1200 600" aria-hidden="true">
        <path d="M0 420 C 250 380, 380 200, 620 260 S 980 120, 1200 160" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 12" className="animate-[dash_30s_linear_infinite]" />
        <path d="M0 520 C 300 500, 520 380, 760 420 S 1050 330, 1200 360" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeDasharray="4 10" />
      </svg>
      <div className="container-x grid items-center gap-14 lg:grid-cols-12">
        <Reveal from="left" className="lg:col-span-5">
          <span className="eyebrow !text-accent">Local presence</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">{h.locationsTitle}</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">{h.locationsSubtitle}</p>
          <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-accent text-secondary">
              <span className="absolute inset-0 animate-pulse-ring rounded-xl bg-accent/50" />
              <MapPin size={22} className="relative" />
            </span>
            <span><span className="block text-xs font-bold uppercase tracking-wider text-white/50">Head office</span><span className="font-heading text-lg font-bold">{[hq, seo.localRegion].filter(Boolean).join(', ')}</span></span>
          </div>
          <div className="mt-8"><Link to="/locations" className="btn-accent">All service areas <ArrowRight size={16} /></Link></div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {locations.slice(0, 6).map((l, i) => (
            <Reveal key={l._id || l.slug} delay={(i % 2) * 0.08 + Math.floor(i / 2) * 0.06}>
              <Link to={`/locations/${l.slug}`} className="group flex h-full items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition hover:-translate-y-1 hover:border-accent/50 hover:bg-white/10">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${l.name.startsWith(hq) ? 'bg-accent text-secondary' : 'bg-white/10 text-accent group-hover:bg-accent group-hover:text-secondary'}`}><MapPin size={19} /></span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-heading text-lg font-bold">{l.name}{l.name.startsWith(hq) && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">HQ</span>}</span>
                  <span className="mt-1 line-clamp-2 block text-sm text-white/60">{l.intro}</span>
                </span>
                <ArrowRight size={16} className="ml-auto mt-1 shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-accent" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
