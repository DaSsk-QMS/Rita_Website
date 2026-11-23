import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { IMG } from '../data/defaults.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { SocialLinks } from '../components/layout/Header.jsx';
import EnquiryForm from '../components/forms/EnquiryForm.jsx';

export default function Contact() {
  const { settings } = useSite();
  const c = settings.contact || {};
  const cards = [
    { icon: Phone, title: 'Call us', lines: [c.phone, c.phone2], href: (v) => `tel:${v.replace(/\s/g, '')}` },
    { icon: Mail, title: 'Email us', lines: [c.email, c.email2], href: (v) => `mailto:${v}` },
    { icon: MapPin, title: 'Visit us', lines: [c.address] },
    { icon: Clock, title: 'Working hours', lines: [c.workingHours] },
  ].map((x) => ({ ...x, lines: x.lines.filter(Boolean) })).filter((x) => x.lines.length);

  return (
    <>
      <Seo title="Contact Us" description="Contact RITA System Assurance for ISA, RAMS and V&V enquiries." />
      <PageHero title="Contact Us" subtitle="Tell us about your project — we respond within one business day." image={IMG.office} crumbs={[{ label: 'Contact' }]} />

      <section className="relative z-10 -mt-12">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.1} className="group rounded-brand bg-white p-7 shadow-xl shadow-secondary/5 transition hover:-translate-y-1">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white"><card.icon size={24} /></span>
              <h3 className="mt-5 font-bold text-secondary">{card.title}</h3>
              {card.lines.map((l) => card.href
                ? <a key={l} href={card.href(l)} className="mt-1 block break-all text-sm text-slate-600 hover:text-primary">{l}</a>
                : <p key={l} className="mt-1 text-sm text-slate-600">{l}</p>)}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal from="left" className="lg:col-span-7">
            <span className="eyebrow">Send an enquiry</span>
            <h2 className="mb-8 mt-3 text-3xl font-extrabold text-secondary sm:text-4xl">How can we help?</h2>
            <EnquiryForm />
          </Reveal>
          <Reveal from="right" className="space-y-6 lg:col-span-5">
            {c.mapEmbed && (
              <div className="overflow-hidden rounded-brand shadow-xl">
                <iframe title="Office location" src={c.mapEmbed} className="h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
            )}
            <div className="rounded-brand bg-secondary p-8 text-white">
              <h3 className="font-heading text-lg font-bold">Follow us</h3>
              <p className="mt-1 text-sm text-white/60">Standards updates and project news.</p>
              <SocialLinks className="mt-5" itemClass="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition hover:bg-accent hover:text-secondary" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
