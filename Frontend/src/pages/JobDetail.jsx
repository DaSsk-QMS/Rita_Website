import { useParams } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Users, Wallet, CalendarClock, CheckCircle2 } from 'lucide-react';
import { usePublic, formatDate } from '../lib/hooks.js';
import { IMG } from '../data/defaults.js';
import Seo from '../components/ui/Seo.jsx';
import { siteOrigin } from '../lib/schema.js';
import { useSite } from '../context/SiteContext.jsx';
import { PageHero, Html } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { PageLoader } from '../components/ui/Loaders.jsx';
import ApplicationForm from '../components/forms/ApplicationForm.jsx';
import NotFound from './NotFound.jsx';

function List({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold text-secondary">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((r) => <li key={r} className="flex gap-3 text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={19} />{r}</li>)}
      </ul>
    </div>
  );
}

export default function JobDetail() {
  const { slug } = useParams();
  const { settings: siteSettings } = useSite();
  const { data: j, loading, error } = usePublic(`/jobs/${slug}`);
  if (loading) return <div className="pt-40"><PageLoader /></div>;
  if (error || !j) return <NotFound />;

  const facts = [
    [MapPin, 'Location', j.location], [Clock, 'Job type', j.type], [Briefcase, 'Experience', j.experience],
    [Users, 'Openings', j.openings], [Wallet, 'Salary', j.salary], [CalendarClock, 'Apply by', j.deadline && formatDate(j.deadline)],
  ].filter(([, , v]) => v);

  const seo = siteSettings.seo || {};
  const typeMap = { 'Full-time': 'FULL_TIME', 'Part-time': 'PART_TIME', Contract: 'CONTRACTOR', Internship: 'INTERN', Freelance: 'CONTRACTOR' };
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'JobPosting', title: j.title, description: j.description || j.title,
    datePosted: j.createdAt, employmentType: typeMap[j.type] || 'FULL_TIME', directApply: true,
    validThrough: j.deadline || (j.createdAt && new Date(new Date(j.createdAt).getTime() + 120 * 864e5).toISOString()),
    hiringOrganization: { '@type': 'Organization', name: siteSettings.general?.siteName, sameAs: siteOrigin(siteSettings) },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: seo.localCity || 'Hyderabad', addressRegion: seo.localRegion || 'Telangana', postalCode: seo.postalCode || undefined, addressCountry: 'IN' } },
    totalJobOpenings: j.openings, experienceRequirements: j.experience,
  };

  return (
    <>
      <Seo title={`${j.title} – Careers`} description={`${j.title} · ${j.location} · ${j.type}`} jsonLd={jsonLd} />
      <PageHero title={j.title} subtitle={j.department} image={IMG.engineer2} crumbs={[{ label: 'Careers', to: '/careers' }, { label: j.title }]} />
      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Html html={j.description} />
            <List title="Responsibilities" items={j.responsibilities} />
            <List title="Requirements" items={j.requirements} />
            <div id="apply" className="scroll-mt-28">
              <Reveal className="mt-12 rounded-brand border p-8">
                <h3 className="mb-6 text-2xl font-bold text-secondary">Apply for this role</h3>
                <ApplicationForm job={j} />
              </Reveal>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="sticky top-28 rounded-brand bg-surface p-8">
              <h3 className="font-heading text-lg font-bold text-secondary">Job overview</h3>
              <ul className="mt-6 space-y-5">
                {facts.map(([Icon, label, v]) => (
                  <li key={label} className="flex items-center gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-primary shadow-sm"><Icon size={19} /></span>
                    <span><span className="block text-xs text-slate-500">{label}</span><span className="font-semibold text-secondary">{v}</span></span>
                  </li>
                ))}
              </ul>
              <a href="#apply" className="btn-primary mt-8 w-full">Apply now</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
