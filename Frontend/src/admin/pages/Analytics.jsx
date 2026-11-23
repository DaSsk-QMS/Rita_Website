import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, Users, MousePointerClick, Layers, Radio, CalendarDays, RefreshCw, Infinity as InfinityIcon, Monitor, Smartphone, Tablet, Sparkles, Globe2 } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader, Panel, ConfirmButton, abtnGhost, abtnDanger } from '../components/UI.jsx';
import { StatCard, TrafficChart, DonutChart, HBarChart, HourChart, pct } from '../components/Charts.jsx';
import { PageLoader } from '../../components/ui/Loaders.jsx';

const RANGES = [[7, '7 days'], [30, '30 days'], [90, '90 days'], [365, '12 months']];
const TZ_NAMES = {
  'Asia/Kolkata': 'India', 'Asia/Calcutta': 'India', 'Asia/Dubai': 'UAE', 'Asia/Singapore': 'Singapore', 'Europe/London': 'United Kingdom',
  'America/New_York': 'USA (East)', 'America/Los_Angeles': 'USA (West)', 'America/Chicago': 'USA (Central)', 'Europe/Berlin': 'Germany',
  'Europe/Paris': 'France', 'Australia/Sydney': 'Australia', 'Asia/Riyadh': 'Saudi Arabia', 'Asia/Qatar': 'Qatar', 'Asia/Tokyo': 'Japan',
};
const region = (tz) => TZ_NAMES[tz] || (tz ? tz.split('/').pop().replace(/_/g, ' ') : 'Unknown');
const ago = (d) => { const s = (Date.now() - new Date(d)) / 1000; return s < 60 ? 'now' : s < 3600 ? `${Math.floor(s / 60)}m` : `${Math.floor(s / 3600)}h`; };
const DEV = { Mobile: Smartphone, Tablet, Desktop: Monitor };

function BarList({ rows, labelOf = (r) => r._id, empty = 'No data yet' }) {
  if (!rows?.length) return <p className="py-10 text-center text-sm text-slate-400">{empty}</p>;
  const max = rows[0].count || 1;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r._id} className="text-sm">
          <div className="mb-1 flex justify-between gap-3"><span className="truncate font-medium text-slate-700">{labelOf(r)}</span><span className="shrink-0 font-semibold text-slate-500">{r.count.toLocaleString('en-IN')}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(r.count / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);
  const [a, setA] = useState(null);
  const load = useCallback(() => {
    api.get('/admin/analytics', { params: { days, tz: Intl.DateTimeFormat().resolvedOptions().timeZone } }).then(({ data }) => setA(data)).catch((e) => toast.error(errMsg(e)));
  }, [days]);
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);
  const reset = async () => { await api.delete('/admin/analytics'); toast.success('Analytics data cleared'); load(); };

  if (!a) return <PageLoader />;
  const regions = Object.values((a.timezones || []).reduce((acc, t) => {
    const k = region(t._id);
    acc[k] = { _id: k, count: (acc[k]?.count || 0) + t.count };
    return acc;
  }, {})).sort((x, y) => y.count - x.count);
  const peak = (a.hours || []).reduce((m, h) => (h.views > m.views ? h : m), { hour: 0, views: 0 });

  return (
    <div className="space-y-6">
      <PageHeader title="Visitor Analytics" subtitle="Privacy-friendly, first-party statistics collected by your own server. Updates every minute.">
        <div className="flex rounded-lg border bg-white p-1">
          {RANGES.map(([d, l]) => <button key={d} onClick={() => setDays(d)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${days === d ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{l}</button>)}
        </div>
        <button onClick={load} className={abtnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
        {user?.role === 'admin' && <ConfirmButton onConfirm={reset} className={abtnDanger} label="Reset data" />}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Radio} label="Online now (5 min)" value={a.live} tone="green" />
        <StatCard icon={CalendarDays} label="Views today" value={a.today} tone="cyan" />
        <StatCard icon={Eye} label="Page views" value={a.views} delta={pct(a.views, a.prevViews)} />
        <StatCard icon={Users} label="Unique visitors" value={a.visitors} delta={pct(a.visitors, a.prevVisitors)} tone="accent" />
        <StatCard icon={MousePointerClick} label="Pages / session" value={a.pagesPerSession} sub={`${a.sessions} sessions`} tone="violet" />
        <StatCard icon={InfinityIcon} label="All-time page views" value={a.allTime} tone="red" />
      </div>

      <Panel title={`Traffic over ${days} days`}><TrafficChart data={a.series} height={340} /></Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Busiest hours" className="lg:col-span-2" actions={peak.views > 0 && <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-amber-700">Peak: {peak.hour}:00 – {peak.hour + 1}:00</span>}>
          <HourChart data={a.hours} />
        </Panel>
        <Panel title="New vs returning visitors"><DonutChart data={a.newVsReturning?.filter((x) => x.count)} height={240} /></Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top pages">
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {a.pages.map((p) => (
                <tr key={p._id}><td className="py-2.5"><a href={p._id} target="_blank" rel="noreferrer" className="font-medium text-slate-700 hover:text-primary">{p._id}</a></td><td className="py-2.5 text-right font-semibold">{p.count}</td></tr>
              ))}
              {!a.pages.length && <tr><td className="py-10 text-center text-slate-400">No data yet</td></tr>}
            </tbody>
          </table>
        </Panel>
        <Panel title="Landing pages (where visits start)"><BarList rows={a.entries} /></Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title={<span className="flex items-center gap-2"><Globe2 size={16} /> Visitor regions</span>}>
          <BarList rows={a.countries?.length ? a.countries : regions} empty="No location data yet" />
          <p className="mt-4 text-xs text-slate-400">{a.countries?.length ? 'From your CDN country header.' : 'Estimated from each visitor’s time zone.'}</p>
        </Panel>
        <Panel title="Traffic sources (referrers)"><HBarChart data={a.referrers} /></Panel>
        <Panel title="Languages"><BarList rows={a.languages} /></Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Devices"><DonutChart data={a.devices} /></Panel>
        <Panel title="Browsers"><DonutChart data={a.browsers} /></Panel>
        <Panel title="Operating systems"><DonutChart data={a.os} /></Panel>
      </div>

      <Panel title={<span className="flex items-center gap-2"><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" /></span> Live visit feed (last 24 h)</span>}>
        {a.recent?.length ? (
          <ul className="divide-y">
            {a.recent.map((v) => {
              const D = DEV[v.device] || Monitor;
              return (
                <li key={v._id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-10 shrink-0 text-xs font-semibold text-slate-400">{ago(v.createdAt)}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><D size={15} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium text-slate-700">{v.path}</span><span className="block truncate text-xs text-slate-400">{[v.browser, v.os, region(v.timezone), v.referrer && `from ${v.referrer}`].filter(Boolean).join(' · ')}</span></span>
                  {v.isNewVisitor && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary"><Sparkles size={11} /> New</span>}
                </li>
              );
            })}
          </ul>
        ) : <p className="py-10 text-center text-sm text-slate-400">No visits in the last 24 hours</p>}
      </Panel>
      <p className="flex items-center gap-2 text-xs text-slate-400"><Layers size={13} /> Admin pages and bots are excluded. Data older than ~13 months is removed automatically. Visitors are counted with an anonymous random ID — no third-party trackers or personal data.</p>
    </div>
  );
}
