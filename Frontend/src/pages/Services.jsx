import { useSite } from '../context/SiteContext.jsx';
import { usePublic } from '../lib/hooks.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, SectionTitle } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { CardSkeletons } from '../components/ui/Loaders.jsx';
import { ServiceCard } from '../components/home/Cards.jsx';
import { StandardsSection, CtaSection, ProcessSection } from '../components/home/Sections.jsx';

export default function Services() {
  const { settings } = useSite();
  const { data, loading } = usePublic('/services');
  return (
    <>
      <Seo title="Services" description={settings.home?.servicesSubtitle} />
      <PageHero title="Our Services" subtitle={settings.home?.servicesSubtitle} image={settings.home?.ctaImage} crumbs={[{ label: 'Services' }]} />
      <section className="py-24">
        <div className="container-x">
          <SectionTitle eyebrow="What we do" title={settings.home?.servicesTitle} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? <CardSkeletons count={6} /> : data?.map((s, i) => <Reveal key={s._id} delay={(i % 3) * 0.1}><ServiceCard s={s} index={i} /></Reveal>)}
          </div>
        </div>
      </section>
      <ProcessSection />
      <StandardsSection />
      <CtaSection />
    </>
  );
}
