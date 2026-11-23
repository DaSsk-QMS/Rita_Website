import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

const PALETTE = ['var(--c-primary)', 'var(--c-accent)', '#14b8a6', '#8b5cf6', '#ef4444', '#64748b'];
const short = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, boxShadow: '0 10px 30px -10px rgba(0,0,0,.2)' };

export function TrafficChart({ data = [], height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--c-primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--c-primary)" stopOpacity={0} /></linearGradient>
          <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--c-accent)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--c-accent)" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="date" tickFormatter={short} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={short} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="views" name="Page views" stroke="var(--c-primary)" strokeWidth={2.5} fill="url(#gViews)" />
        <Area type="monotone" dataKey="visitors" name="Visitors" stroke="var(--c-accent)" strokeWidth={2.5} fill="url(#gVisitors)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data = [], height = 220 }) {
  const rows = data.map((d) => ({ name: d._id, value: d.count }));
  if (!rows.length) return <p className="py-16 text-center text-sm text-slate-400">No data yet</p>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={3} stroke="none">
          {rows.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HBarChart({ data = [], height = 260 }) {
  const rows = data.map((d) => ({ name: d._id, value: d.count }));
  if (!rows.length) return <p className="py-16 text-center text-sm text-slate-400">No data yet</p>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="value" name="Visits" fill="var(--c-primary)" radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatCard({ icon: Icon, label, value, delta, tone = 'primary', sub }) {
  const tones = { primary: 'bg-primary/10 text-primary', accent: 'bg-accent/20 text-amber-700', green: 'bg-green-100 text-green-700', violet: 'bg-violet-100 text-violet-700', cyan: 'bg-cyan-100 text-cyan-700', red: 'bg-red-100 text-red-600' };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></span>
        {delta !== undefined && delta !== null && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${delta >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%</span>
        )}
      </div>
      <p className="mt-4 font-heading text-3xl font-extrabold text-slate-900">{value?.toLocaleString?.('en-IN') ?? value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export const pct = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 100) : cur ? 100 : null);

export function HourChart({ data = [], height = 240 }) {
  const peak = Math.max(0, ...data.map((d) => d.views));
  if (!peak) return <p className="py-16 text-center text-sm text-slate-400">No data yet</p>;
  const label = (h) => (h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 6, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="hour" tickFormatter={label} interval={2} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={(h) => `${label(h)} – ${label((h + 1) % 24)}`} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="views" name="Page views" radius={[6, 6, 0, 0]} barSize={14}>
          {data.map((d) => <Cell key={d.hour} fill={d.views === peak ? 'var(--c-accent)' : 'var(--c-primary)'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
