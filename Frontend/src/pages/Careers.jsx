import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, MapPin, Clock, Users, Heart, GraduationCap, Rocket, Globe } from 'lucide-react';
import { usePublic } from '../lib/hooks.js';
import { IMG } from '../data/defaults.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, SectionTitle, EmptyState } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { CardSkeletons } from '../components/ui/Loaders.jsx';
import ApplicationForm from '../components/forms/ApplicationForm.jsx';

const perks = [
  { icon: GraduationCap, title: 'Learn from experts', text: 'Work alongside experienced assessors on real safety-critical projects.' },
  { icon: Rocket, title: 'Grow your career', text: 'Clear progression from engineer to lead assessor.' },
  { icon: Globe, title: 'Varied projects', text: 'Metro, mainline, signalling and rolling stock assignments.' },
  { icon: Heart, title: 'Balanced work', text: 'Hybrid working and a supportive, respectful culture.' },
];

export default function Careers() {
  const { data: jobs, loading } = usePublic('/jobs');
  return (
    <>
      <Seo title="Careers" description="Join RITA System Assurance — careers in railway safety assessment, RAMS and V&V." />
      <PageHero title="Careers at RITA" subtitle="Build a career in railway safety assurance with a team that values independence and technical excellence." image={IMG.team} crumbs={[{ label: 'Careers' }]} />

      <section className="bg-surface py-20">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className="rounded-brand bg-white p-7 shadow-sm">
              <p.icon className="text-primary" size={30} />
              <h3 className="mt-4 font-bold text-secondary">{p.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="container-x">
          <SectionTitle eyebrow="Open positions" title="Current openings" subtitle="Don't see the right role? Send a general application below." />
          <div className="mx-auto max-w-5xl space-y-4">
            {loading ? <CardSkeletons count={3} className="h-28" /> : jobs?.map((j, i) => (
              <Reveal key={j._id} delay={i * 0.08}>
                <Link to={`/careers/${j.slug}`} className="group flex flex-col gap-4 rounded-brand border bg-white p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{j.department}</span>
                    <h3 className="mt-1 text-xl font-bold text-secondary group-hover:text-primary">{j.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><MapPin size={15} />{j.location}</span>
                      <span className="flex items-center gap-1.5"><Clock size={15} />{j.type}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={15} />{j.experience}</span>
                      {j.openings > 1 && <span className="flex items-center gap-1.5"><Users size={15} />{j.openings} openings</span>}
                    </div>
                  </div>
                  <span className="btn-ghost shrink-0">View & apply <ArrowRight size={16} /></span>
                </Link>
              </Reveal>
            ))}
            {!loading && !jobs?.length && <EmptyState title="No open positions right now" text="We're always happy to hear from great people — send a general application." />}
          </div>
        </div>
      </section>

      <section className="bg-surface py-24">
        <div className="container-x max-w-3xl">
          <SectionTitle eyebrow="General application" title="Send us your CV" />
          <Reveal className="rounded-brand bg-white p-8 shadow-sm"><ApplicationForm /></Reveal>
        </div>
      </section>
    </>
  );
}
