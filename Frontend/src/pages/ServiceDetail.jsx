import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
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

export default function ServiceDetail() {
  const { slug } = useParams();
  const { settings, locations = [] } = useSite();
  const { data, loading, error } = usePublic(`/services/${slug}`);
  if (loading) return <div className="pt-40"><PageLoader /></div>;
  if (error || !data?.item) return <NotFound />;
  const s = data.item;
  const c = settings.contact || {};
  const region = settings.seo?.localRegion || 'Telangana';
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Service', name: s.title, serviceType: s.title, description: s.shortDescription,
    url: `${siteOrigin(settings)}/services/${s.slug}`, provider: providerRef(settings), image: img(s.image) || undefined,
    areaServed: [{ '@type': 'State', name: region }, ...locations.map((l) => ({ '@type': 'City', name: l.name })), { '@type': 'Country', name: 'India' }],
  };

  return (
    <>
      <Seo title={s.seoTitle || s.title} description={s.seoDescription || s.shortDescription} image={s.image} keywords={s.seoKeywords} jsonLd={jsonLd} />
      <PageHero title={s.title} subtitle={s.shortDescription} image={s.image} crumbs={[{ label: 'Services', to: '/services' }, { label: s.title }]} />
      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {s.image && (
              <Reveal className="overflow-hidden rounded-brand shadow-xl">
                <img src={img(s.image)} alt={s.title} className="aspect-[16/8] w-full object-cover" />
              </Reveal>
            )}
            <Reveal className="mt-10"><Html html={s.content} /></Reveal>
            {s.features?.length > 0 && (
              <Reveal className="mt-10 rounded-brand bg-surface p-8">
                <h3 className="text-xl font-bold text-secondary">What's included</h3>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex gap-3 text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={20} />{f}</li>
                  ))}
                </ul>
              </Reveal>
            )}
            <Reveal className="mt-12 rounded-brand border p-8">
              <h3 className="mb-6 text-2xl font-bold text-secondary">Enquire about this service</h3>
              <EnquiryForm defaultService={s.title} source="service" />
            </Reveal>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <Reveal from="right" className="overflow-hidden rounded-brand border">
                <p className="bg-secondary px-6 py-4 font-heading font-bold text-white">All services</p>
                <ul>
                  {[{ ...s, current: true }, ...(data.others || [])].sort((a, b) => (a.order || 0) - (b.order || 0)).map((o) => (
                    <li key={o.slug}>
                      <Link to={`/services/${o.slug}`} className={`flex items-center gap-3 border-b px-6 py-4 text-sm font-medium transition last:border-0 ${o.slug === slug ? 'bg-primary text-white' : 'text-slate-700 hover:bg-surface hover:text-primary'}`}>
                        <DynIcon name={o.icon} size={18} /> <span className="flex-1">{o.title}</span> <ArrowRight size={15} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal from="right" className="relative overflow-hidden rounded-brand bg-gradient-to-br from-primary to-secondary p-8 text-white">
                <h3 className="text-xl font-bold">Need expert advice?</h3>
                <p className="mt-2 text-sm text-white/75">Speak directly with an assessor about your project.</p>
                {c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="mt-6 flex items-center gap-3 font-semibold"><Phone size={18} className="text-accent" />{c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="mt-3 flex items-center gap-3 break-all font-semibold"><Mail size={18} className="text-accent" />{c.email}</a>}
              </Reveal>
              {locations.length > 0 && (
                <Reveal from="right" className="rounded-brand border p-6">
                  <p className="flex items-center gap-2 font-heading font-bold text-secondary"><MapPin size={18} className="text-primary" /> Available across {region}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {locations.map((l) => (
                      <Link key={l.slug} to={`/locations/${l.slug}`} className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-primary hover:text-white" title={`${s.title} in ${l.name}`}>{l.name}</Link>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
