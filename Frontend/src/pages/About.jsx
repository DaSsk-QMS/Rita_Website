import { useSite } from '../context/SiteContext.jsx';
import { usePublic } from '../lib/hooks.js';
import { img } from '../lib/api.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, SectionTitle } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { SOCIAL_ICONS } from '../lib/icons.jsx';
import { AboutSection, StatsSection, WhyUsSection, ProcessSection, CtaSection } from '../components/home/Sections.jsx';

export default function About() {
  const { settings } = useSite();
  const { data: team } = usePublic('/team');
  const g = settings.general || {};
  const LinkedIn = SOCIAL_ICONS.linkedin;

  return (
    <>
      <Seo title="About Us" description={g.aboutShort} />
      <PageHero title="About Us" subtitle={g.tagline} image={g.aboutImage2} crumbs={[{ label: 'About' }]} />
      <AboutSection full />
      <StatsSection />
      <WhyUsSection />
      <ProcessSection />

      {team?.length > 0 && (
        <section className="py-24">
          <div className="container-x">
            <SectionTitle eyebrow="Our people" title="Meet the team" subtitle="Experienced assessors and engineers who know what authorities expect." />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m, i) => (
                <Reveal key={m._id} delay={i * 0.1} className="group">
                  <div className="relative overflow-hidden rounded-brand">
                    <img src={img(m.photo)} alt={m.name} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent opacity-0 transition group-hover:opacity-100" />
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="absolute bottom-4 left-1/2 grid h-10 w-10 -translate-x-1/2 translate-y-6 place-items-center rounded-full bg-accent text-secondary opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                        <LinkedIn size={16} />
                      </a>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-bold text-secondary">{m.name}</h3>
                    <p className="text-sm text-primary">{m.designation}</p>
                    {m.bio && <p className="mt-2 text-sm text-slate-500">{m.bio}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaSection />
    </>
  );
}
