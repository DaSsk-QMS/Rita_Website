import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MapPin, Phone, Mail, ChevronDown, Navigation } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { usePublic } from '../lib/hooks.js';
import { img } from '../lib/api.js';
import { DynIcon } from '../lib/icons.jsx';
import { providerRef, siteOrigin } from '../lib/schema.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, Html } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { PageLoader } from '../components/ui/Loaders.jsx';
import EnquiryForm from '../components/forms/EnquiryForm.jsx';
import NotFound from './NotFound.jsx';

function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y rounded-brand border bg-white">
      {items.map((f, i) => (
        <div key={f.q}>
          <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-secondary hover:text-primary" aria-expanded={open === i}>
            {f.q}<ChevronDown size={18} className={`shrink-0 transition ${open === i ? 'rotate-180 text-primary' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function LocationDetail() {
  const { slug } = useParams();
  const { settings } = useSite();
  const { data, loading, error } = usePublic(`/locations/${slug}`);
  if (loading) return <div className="pt-40"><PageLoader /></div>;
  if (error || !data?.item) return <NotFound />;
  const l = data.item;
  const c = settings.contact || {};
  const seo = settings.seo || {};
  const services = data.services || [];
  const city = seo.localCity || 'Hyderabad';
  const region = l.region || seo.localRegion || 'Telangana';

  const faqs = [
    { q: `Do you provide Independent Safety Assessment in ${l.name}?`, a: `Yes. Our ${city}-based assessors provide CENELEC-compliant Independent Safety Assessment (EN 50126, EN 50128/EN 50716, EN 50129) for signalling, train control, rolling stock and station systems in ${l.name} and across ${region}.` },
    { q: `How quickly can your team be on site in ${l.name}?`, a: l.slug === 'hyderabad' || l.slug === 'secunderabad' ? `Usually the same or next working day — our office is in ${city}.` : `Typically within 24–48 hours from our ${city} office. Many review activities can also be done remotely, with site visits for workshops, audits and test witnessing.` },
    { q: 'Which standards do you work to?', a: 'EN 50126 (RAMS), EN 50128 / EN 50716 (software), EN 50129 (safety-related electronic systems), EN 50657, ISO 22163 (IRIS) and IEC 61508 functional safety, alongside RDSO and Indian Railways requirements where applicable.' },
    { q: `Can you support suppliers as well as operators in ${l.name}?`, a: 'Yes. We work with railway operators, metro corporations, system integrators and component suppliers — from gap analysis and RAMS documentation through to independent assessment and certification readiness.' },
  ];
  const base = siteOrigin(settings);
  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: `Railway safety assurance in ${l.name}`, provider: providerRef(settings),
      areaServed: { '@type': 'City', name: l.name, containedInPlace: { '@type': 'State', name: region } }, url: `${base}/locations/${l.slug}`, description: l.intro,
      hasOfferCatalog: { '@type': 'OfferCatalog', name: `Services in ${l.name}`, itemListElement: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, url: `${base}/services/${s.slug}` } })) },
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  return (
    <>
      <Seo
        title={l.seoTitle || l.headline || `Railway Safety Assessment & RAMS in ${l.name}`}
        description={l.seoDescription || l.intro}
        keywords={l.seoKeywords || services.map((s) => `${s.title} ${l.name}`).concat([`railway safety ${l.name}`, `ISA ${region}`]).join(', ')}
        image={l.image}
        jsonLd={jsonLd}
      />
      <PageHero title={l.headline || `Railway safety assurance in ${l.name}`} subtitle={l.intro} image={l.image} crumbs={[{ label: 'Areas we serve', to: '/locations' }, { label: l.name }]} />

      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            {l.highlights?.length > 0 && (
              <Reveal className="grid gap-4 sm:grid-cols-2">
                {l.highlights.map((h) => (
                  <div key={h} className="flex gap-3 rounded-brand border border-slate-200/80 bg-white p-5 shadow-sm">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={20} /><span className="text-sm font-medium text-slate-700">{h}</span>
                  </div>
                ))}
              </Reveal>
            )}
            {l.content && <Reveal><Html html={l.content} /></Reveal>}

            {services.length > 0 && (
              <Reveal>
                <span className="eyebrow">Our services in {l.name}</span>
                <h2 className="mt-3 text-3xl font-extrabold text-secondary">What we deliver locally</h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {services.map((s) => (
                    <Link key={s.slug} to={`/services/${s.slug}`} className="group flex items-start gap-4 rounded-brand border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white"><DynIcon name={s.icon} size={22} /></span>
                      <span className="min-w-0">
                        <span className="block font-bold text-secondary group-hover:text-primary">{s.title}</span>
                        <span className="mt-1 line-clamp-2 block text-sm text-slate-500">{s.shortDescription}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <span className="eyebrow">FAQ</span>
              <h2 className="mb-8 mt-3 text-3xl font-extrabold text-secondary">Questions from teams in {l.name}</h2>
              <Faq items={faqs} />
            </Reveal>

            <Reveal className="rounded-brand border p-8">
              <h2 className="mb-6 text-2xl font-bold text-secondary">Discuss your {l.name} project</h2>
              <EnquiryForm source={`location:${l.slug}`} />
            </Reveal>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <Reveal from="right" className="relative overflow-hidden rounded-brand bg-gradient-to-br from-primary to-secondary p-8 text-white">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-aurora rounded-full bg-accent/30 blur-2xl" />
                <MapPin size={28} className="relative text-accent" />
                <h3 className="relative mt-4 text-xl font-bold">Serving {l.name} from {city}</h3>
                <p className="relative mt-2 text-sm text-white/75">{c.address}</p>
                {c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="relative mt-6 flex items-center gap-3 font-semibold"><Phone size={18} className="text-accent" />{c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="relative mt-3 flex items-center gap-3 break-all font-semibold"><Mail size={18} className="text-accent" />{c.email}</a>}
                {l.latitude && l.longitude && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${l.latitude},${l.longitude}`} target="_blank" rel="noreferrer" className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"><Navigation size={15} /> Open in Google Maps</a>
                )}
              </Reveal>
              {data.others?.length > 0 && (
                <Reveal from="right" className="overflow-hidden rounded-brand border">
                  <p className="bg-secondary px-6 py-4 font-heading font-bold text-white">Other areas in {region}</p>
                  <ul>
                    {data.others.map((o) => (
                      <li key={o.slug}>
                        <Link to={`/locations/${o.slug}`} className="flex items-center gap-3 border-b px-6 py-3.5 text-sm font-medium text-slate-700 transition last:border-0 hover:bg-surface hover:text-primary">
                          <MapPin size={16} className="text-primary" /><span className="flex-1">{o.name}</span><ArrowRight size={15} />
                        </Link>
                      </li>
                    ))}
                    <li><Link to="/locations" className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-primary hover:bg-surface">All service areas <ArrowRight size={15} /></Link></li>
                  </ul>
                </Reveal>
              )}
              {l.image && <Reveal from="right" className="overflow-hidden rounded-brand"><img src={img(l.image)} alt={`Railway in ${l.name}`} loading="lazy" className="aspect-[4/3] w-full object-cover" /></Reveal>}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
