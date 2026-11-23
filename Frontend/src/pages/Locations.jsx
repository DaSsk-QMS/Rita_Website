import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Building2, Clock, Navigation } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { usePublic } from '../lib/hooks.js';
import { img } from '../lib/api.js';
import { IMG } from '../data/defaults.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, SectionTitle } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { CardSkeletons } from '../components/ui/Loaders.jsx';
import { CtaSection } from '../components/home/Sections.jsx';

export function LocationCard({ l, index = 0 }) {
  return (
    <Link to={`/locations/${l.slug}`} className="group relative flex h-full flex-col overflow-hidden rounded-brand border border-slate-200/80 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/15">
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
        {l.image && <img src={img(l.image)} alt={`Railway projects in ${l.name}`} loading="lazy" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100" />}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/30 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary shadow">{l.region || 'Telangana'}</span>
        <span className="absolute right-4 top-4 font-heading text-4xl font-extrabold text-white/20">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="absolute bottom-4 left-5 right-5 flex items-center gap-2 text-2xl font-extrabold text-white"><MapPin size={20} className="text-accent" />{l.name}</h3>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex-1 text-sm leading-relaxed text-slate-600">{l.intro}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Services in {l.name} <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

export default function Locations() {
  const { settings } = useSite();
  const { data: locations, loading } = usePublic('/locations');
  const seo = settings.seo || {};
  const c = settings.contact || {};
  const region = seo.localRegion || 'Telangana';
  const city = seo.localCity || 'Hyderabad';
  const extra = String(seo.areaServed || '').split(',').map((s) => s.trim()).filter(Boolean)
    .filter((a) => !(locations || []).some((l) => l.name.toLowerCase().includes(a.toLowerCase())));

  return (
    <>
      <Seo
        title={`Areas We Serve in ${region}`}
        description={`Railway safety assessment, RAMS and V&V services from ${city} for projects in ${(locations || []).map((l) => l.name).join(', ')} and across ${region} and India.`}
        keywords={(locations || []).map((l) => `railway safety assessment ${l.name}, RAMS ${l.name}`).join(', ')}
      />
      <PageHero title={`Areas we serve in ${region}`} subtitle={`Based in ${city}, our assessors support railway projects throughout ${region} — and across India.`} image={IMG.viaduct} crumbs={[{ label: 'Areas we serve' }]} />

      <section className="relative z-10 -mt-12">
        <div className="container-x">
          <Reveal className="grid gap-px overflow-hidden rounded-brand bg-slate-200 shadow-xl shadow-secondary/5 sm:grid-cols-3">
            {[
              [Building2, 'Head office', [city, region].join(', ')],
              [Navigation, 'Coverage', `${(locations || []).length || 6}+ districts in ${region}, plus pan-India projects`],
              [Clock, 'On-site response', `Same-day visits within ${city}; 24–48 h across ${region}`],
            ].map(([Icon, t, v]) => (
              <div key={t} className="flex items-start gap-4 bg-white p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={22} /></span>
                <span><span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{t}</span><span className="mt-1 block font-semibold text-secondary">{v}</span></span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-24">
        <div className="container-x">
          <SectionTitle eyebrow="Service areas" title={`Railway safety assurance across ${region}`} subtitle="Independent Safety Assessment, RAMS engineering, CENELEC compliance, V&V and ISO 22163 support — delivered locally." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? <CardSkeletons count={6} /> : (locations || []).map((l, i) => (
              <Reveal key={l._id} delay={(i % 3) * 0.08}><LocationCard l={l} index={i} /></Reveal>
            ))}
          </div>
          {extra.length > 0 && (
            <Reveal className="mt-12 rounded-brand border border-dashed border-primary/30 bg-primary/[0.03] p-6 text-center">
              <p className="text-sm font-semibold text-secondary">We also support projects in</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {extra.map((a) => <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm"><MapPin size={13} className="text-primary" />{a}</span>)}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {c.mapEmbed && (
        <section className="pb-8">
          <div className="container-x">
            <Reveal className="grid overflow-hidden rounded-brand border shadow-xl lg:grid-cols-5">
              <div className="flex flex-col justify-center bg-secondary p-10 text-white lg:col-span-2">
                <span className="eyebrow !text-accent">Visit us</span>
                <h2 className="mt-3 text-3xl font-extrabold">Our {city} office</h2>
                {c.address && <p className="mt-4 flex gap-3 text-white/75"><MapPin size={20} className="mt-0.5 shrink-0 text-accent" />{c.address}</p>}
                {c.workingHours && <p className="mt-3 flex gap-3 text-white/75"><Clock size={20} className="mt-0.5 shrink-0 text-accent" />{c.workingHours}</p>}
                <Link to="/contact" className="btn-accent mt-8 self-start">Book a meeting <ArrowRight size={16} /></Link>
              </div>
              <iframe title={`${city} office location`} src={c.mapEmbed} className="h-[380px] w-full border-0 lg:col-span-3 lg:h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </Reveal>
          </div>
        </section>
      )}
      <CtaSection />
    </>
  );
}
