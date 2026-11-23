import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { usePublic } from '../lib/hooks.js';
import Seo from '../components/ui/Seo.jsx';
import { SectionTitle } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { CardSkeletons } from '../components/ui/Loaders.jsx';
import HeroSlider from '../components/home/HeroSlider.jsx';
import { ServiceCard, PostCard } from '../components/home/Cards.jsx';
import {
  StandardsTicker, AboutSection, StatsSection, WhyUsSection, ProcessSection,
  StandardsSection, ClientsMarquee, TestimonialsSection, CtaSection, LocationsSection,
} from '../components/home/Sections.jsx';

export const SECTION_KEYS = ['slider', 'ticker', 'about', 'services', 'stats', 'whyUs', 'process', 'standards', 'clients', 'testimonials', 'locations', 'blog', 'cta'];

export default function Home() {
  const { settings } = useSite();
  const h = settings.home || {};
  const { data, loading } = usePublic('/home');

  const sections = {
    slider: h.showSlider !== false && (data?.slides?.length ? <HeroSlider slides={data.slides} home={h} /> : <div className="h-[100svh] min-h-[640px] shimmer !bg-secondary" />),
    ticker: (h.showTicker ?? h.showStandards) !== false && <StandardsTicker />,
    about: h.showAbout !== false && <AboutSection />,
    services: h.showServices !== false && (
      <section className="relative overflow-hidden bg-surface py-24 lg:py-32">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_70%)]" />
        <div className="container-x relative">
          <SectionTitle eyebrow="Services" title={h.servicesTitle} subtitle={h.servicesSubtitle} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? <CardSkeletons count={6} /> : data?.services?.map((s, i) => (
              <Reveal key={s._id} delay={(i % 3) * 0.1}><ServiceCard s={s} index={i} /></Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center"><Link to="/services" className="btn-ghost">View all services <ArrowRight size={16} /></Link></Reveal>
        </div>
      </section>
    ),
    stats: h.showStats !== false && <StatsSection />,
    whyUs: h.showWhyUs !== false && <WhyUsSection />,
    process: h.showProcess !== false && <ProcessSection />,
    standards: h.showStandards !== false && <StandardsSection />,
    clients: h.showClients !== false && <ClientsMarquee clients={data?.clients} />,
    testimonials: h.showTestimonials !== false && <TestimonialsSection items={data?.testimonials} />,
    locations: h.showLocations !== false && <LocationsSection locations={data?.locations} />,
    blog: h.showBlog !== false && data?.posts?.length > 0 && (
      <section className="py-24 lg:py-32">
        <div className="container-x">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow="Insights" title={h.blogTitle} center={false} className="!mb-0" />
            <Reveal><Link to="/blog" className="btn-ghost">All articles <ArrowRight size={16} /></Link></Reveal>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((p, i) => <Reveal key={p._id} delay={i * 0.1}><PostCard p={p} /></Reveal>)}
          </div>
        </div>
      </section>
    ),
    cta: h.showCta !== false && <CtaSection />,
  };
  // Admin-defined order; any section missing from the saved order is appended
  const order = [...new Set([...(h.sectionOrder || []), ...SECTION_KEYS])].filter((k) => k in sections);

  return (
    <>
      <Seo />
      {order.map((k) => <Fragment key={k}>{sections[k] || null}</Fragment>)}
    </>
  );
}
