import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, MapPin, Phone, Clock, Send, Users, Eye, Lock } from 'lucide-react';
import { useSite } from '../../context/SiteContext.jsx';
import { api, errMsg, getPublic } from '../../lib/api.js';
import { Logo } from '../ui/Common.jsx';
import { Counter } from '../ui/Motion.jsx';
import { SocialLinks } from './Header.jsx';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/public/subscribe', { email });
      toast.success(data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.response ? errMsg(err) : 'Service unavailable, please try later.');
    } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="flex w-full max-w-md overflow-hidden rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 focus-within:ring-accent">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" aria-label="Email" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40" />
      <button disabled={busy} className="btn-accent !px-5 !py-2.5"><Send size={16} /> Subscribe</button>
    </form>
  );
}

function VisitorCounter({ label }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let alive = true;
    getPublic('/stats').then(({ data }) => alive && data && setStats(data)).catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!stats) return null;
  return (
    <div className="flex items-center gap-3" aria-label="Website visitor statistics">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white">
        <Users size={14} className="text-accent" />
        <span className="font-heading font-bold tabular-nums"><Counter value={stats.visitors} duration={1.6} /></span>
        <span className="text-white/60">{label || 'Visitors'}</span>
      </span>
      <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white sm:inline-flex">
        <Eye size={14} className="text-accent" />
        <span className="font-heading font-bold tabular-nums"><Counter value={stats.views} duration={1.6} /></span>
        <span className="text-white/60">Page views</span>
      </span>
      <span className="hidden items-center gap-1.5 text-white/60 md:inline-flex">
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" /></span>
        {stats.online} online
      </span>
    </div>
  );
}

export default function Footer() {
  const { settings, services, locations = [] } = useSite();
  const { general: g = {}, contact: c = {}, footer: f = {}, menu = [] } = settings;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-secondary text-white/70">
      {/* decorative rails */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fff 0 2px, transparent 2px 46px)' }} />
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />

      {f.showNewsletter && (
        <div className="relative border-b border-white/10">
          <div className="container-x flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
            <div>
              <h3 className="font-heading text-2xl font-bold text-white">{f.newsletterTitle}</h3>
              <p className="mt-1 text-sm">{f.newsletterText}</p>
            </div>
            <Newsletter />
          </div>
        </div>
      )}

      <div className="container-x relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-6 max-w-sm text-sm leading-relaxed">{f.about}</p>
          <p className="mt-4 font-heading text-sm font-semibold text-accent">{g.tagline}</p>
          <SocialLinks className="mt-6" itemClass="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:-translate-y-1 hover:bg-accent hover:text-secondary" />
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-5 font-heading text-lg font-bold text-white">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {menu.filter((m) => !m.hidden && m.label).map((m) => (
              <li key={m.label}><Link to={m.path} className="group inline-flex items-center gap-2 transition hover:text-accent"><ArrowRight size={14} className="-ml-5 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />{m.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="mb-5 font-heading text-lg font-bold text-white">Services</h4>
          <ul className="space-y-3 text-sm">
            {services.slice(0, 7).map((s) => (
              <li key={s.slug}><Link to={`/services/${s.slug}`} className="transition hover:text-accent">{s.title}</Link></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="mb-5 font-heading text-lg font-bold text-white">Get in Touch</h4>
          <ul className="space-y-4 text-sm">
            {c.address && <li className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-accent" /><span>{c.address}</span></li>}
            {c.phone && <li><a href={`tel:${c.phone.replace(/\s/g, '')}`} className="flex gap-3 hover:text-accent"><Phone size={18} className="shrink-0 text-accent" />{c.phone}</a></li>}
            {c.phone2 && <li><a href={`tel:${c.phone2.replace(/\s/g, '')}`} className="flex gap-3 hover:text-accent"><Phone size={18} className="shrink-0 text-accent" />{c.phone2}</a></li>}
            {c.email && <li><a href={`mailto:${c.email}`} className="flex gap-3 break-all hover:text-accent"><Mail size={18} className="shrink-0 text-accent" />{c.email}</a></li>}
            {c.workingHours && <li className="flex gap-3"><Clock size={18} className="shrink-0 text-accent" />{c.workingHours}</li>}
          </ul>
        </div>
      </div>

      {f.showLocations !== false && locations.length > 0 && (
        <div className="relative border-t border-white/10">
          <div className="container-x flex flex-col gap-4 py-6 lg:flex-row lg:items-center">
            <Link to="/locations" className="flex shrink-0 items-center gap-2 font-heading text-sm font-bold text-white hover:text-accent"><MapPin size={16} className="text-accent" />{f.locationsTitle || 'Areas we serve'}</Link>
            <ul className="flex flex-wrap gap-2">
              {locations.map((l) => (
                <li key={l.slug}><Link to={`/locations/${l.slug}`} className="inline-block rounded-full border border-white/10 px-3 py-1 text-xs transition hover:border-accent hover:text-accent">{l.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 text-xs lg:flex-row">
          <p className="text-center lg:text-left">{(f.copyright || '').replace('{year}', year)}</p>
          {g.showVisitorCounter && <VisitorCounter label={g.visitorCounterLabel} />}
          <div className="flex flex-wrap justify-center gap-5">
            {(f.bottomLinks || []).map((l) =>
              l.path.endsWith('.xml') || l.path.startsWith('http')
                ? <a key={l.label} href={l.path} className="hover:text-accent">{l.label}</a>
                : <Link key={l.label} to={l.path} className="hover:text-accent">{l.label}</Link>
            )}
            {g.showAdminLink && <Link to="/admin/login" className="inline-flex items-center gap-1 hover:text-accent" rel="nofollow"><Lock size={11} /> Admin</Link>}
          </div>
        </div>
      </div>
    </footer>
  );
}
