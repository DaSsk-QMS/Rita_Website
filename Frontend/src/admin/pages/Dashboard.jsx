import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, FileUser, Eye, Users, Newspaper, Mail, Briefcase, Layers, Radio, ArrowRight, Plus, Star, MapPinned, MessageSquareHeart, Images, Building2, Search } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatDate } from '../../lib/hooks.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader, Panel, Badge } from '../components/UI.jsx';
import { StatCard, TrafficChart, DonutChart, pct } from '../components/Charts.jsx';
import { PageLoader } from '../../components/ui/Loaders.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [a, setA] = useState(null);
  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setD(data)).catch(() => setD({ counts: {} }));
    api.get('/admin/analytics', { params: { days: 30, tz: Intl.DateTimeFormat().resolvedOptions().timeZone } }).then(({ data }) => setA(data)).catch(() => {});
  }, []);
  if (!d) return <PageLoader />;
  const c = d.counts || {};
  const hour = new Date().getHours();

  return (
    <div className="space-y-6">
      <PageHeader title={`Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0]} 👋`} subtitle="Here's what's happening on your website.">
        <Link to="/admin/slides" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Images size={16} /> Slideshow</Link>
        <Link to="/admin/posts" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white"><Plus size={16} /> New post</Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Eye} label="Page views (30 days)" value={a?.views ?? '—'} delta={a ? pct(a.views, a.prevViews) : null} />
        <StatCard icon={Users} label="Unique visitors (30 days)" value={a?.visitors ?? '—'} delta={a ? pct(a.visitors, a.prevVisitors) : null} tone="accent" />
        <StatCard icon={Inbox} label="Enquiries" value={c.enquiries} sub={`${c.newEnquiries || 0} new`} tone="green" />
        <StatCard icon={FileUser} label="Job applications" value={c.applications} sub={`${c.newApplications || 0} new`} tone="violet" />
        <StatCard icon={Star} label="Client rating" value={c.avgRating ? `${c.avgRating} / 5` : '—'} sub={`${c.feedback || 0} feedback · ${c.newFeedback || 0} new`} tone="cyan" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Traffic — last 30 days" className="xl:col-span-2" actions={a && <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600"><Radio size={14} className="animate-pulse" /> {a.live} online now</span>}>
          {a ? <TrafficChart data={a.series} /> : <div className="h-[300px] animate-pulse rounded-xl bg-slate-100" />}
        </Panel>
        <Panel title="Devices">{a ? <DonutChart data={a.devices} height={300} /> : null}</Panel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[[Newspaper, 'Blog posts', c.posts, '/admin/posts'], [Layers, 'Services', c.services, '/admin/services'], [Briefcase, 'Open jobs', c.jobs, '/admin/jobs'], [Mail, 'Subscribers', c.subscribers, '/admin/subscribers'], [MapPinned, 'Service areas (local SEO)', c.locations, '/admin/locations'], [Building2, 'Clients & logos', null, '/admin/clients'], [MessageSquareHeart, 'Client feedback', c.feedback, '/admin/feedback'], [Search, 'SEO settings', null, '/admin/settings/seo']].map(([Icon, label, v, to]) => (
          <Link key={label} to={to} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/30 hover:shadow-md">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white"><Icon size={19} /></span>
            <span className="flex-1"><span className="block font-heading text-xl font-bold text-slate-900">{v ?? <span className="text-base text-primary">Manage</span>}</span><span className="text-sm text-slate-500">{label}</span></span>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Latest enquiries" actions={<Link to="/admin/enquiries" className="text-sm font-semibold text-primary">View all</Link>}>
          <ul className="divide-y">
            {(d.recentEnquiries || []).map((e) => (
              <li key={e._id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate font-semibold text-slate-800">{e.name} <span className="font-normal text-slate-400">· {e.service || e.subject || 'General'}</span></p><p className="truncate text-sm text-slate-500">{e.message}</p></div>
                <div className="shrink-0 text-right"><Badge value={e.status} /><p className="mt-1 text-xs text-slate-400">{formatDate(e.createdAt)}</p></div>
              </li>
            ))}
            {!d.recentEnquiries?.length && <li className="py-8 text-center text-sm text-slate-400">No enquiries yet</li>}
          </ul>
        </Panel>
        <Panel title="Latest applications" actions={<Link to="/admin/applications" className="text-sm font-semibold text-primary">View all</Link>}>
          <ul className="divide-y">
            {(d.recentApplications || []).map((e) => (
              <li key={e._id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate font-semibold text-slate-800">{e.name}</p><p className="truncate text-sm text-slate-500">{e.jobTitle}</p></div>
                <div className="shrink-0 text-right"><Badge value={e.status} /><p className="mt-1 text-xs text-slate-400">{formatDate(e.createdAt)}</p></div>
              </li>
            ))}
            {!d.recentApplications?.length && <li className="py-8 text-center text-sm text-slate-400">No applications yet</li>}
          </ul>
        </Panel>
      </div>

      {d.recentFeedback?.length > 0 && (
        <Panel title="Latest feedback" actions={<Link to="/admin/feedback" className="text-sm font-semibold text-primary">View all</Link>}>
          <ul className="grid gap-4 md:grid-cols-2">
            {d.recentFeedback.map((f) => (
              <li key={f._id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex gap-0.5 text-accent">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} className={n <= f.rating ? 'fill-current' : 'text-slate-200'} />)}</span>
                  <Badge value={f.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{f.message}</p>
                <p className="mt-2 text-xs text-slate-400">{f.name}{f.company ? ` · ${f.company}` : ''} · {formatDate(f.createdAt)}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {a?.pages?.length > 0 && (
        <Panel title="Most viewed pages (30 days)">
          <ul className="space-y-3">
            {a.pages.map((p) => (
              <li key={p._id} className="text-sm">
                <div className="mb-1 flex justify-between"><span className="font-medium text-slate-700">{p._id}</span><span className="text-slate-500">{p.count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${(p.count / a.pages[0].count) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
