import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ShieldCheck, ShieldAlert, LogIn, Lock, Unlock, Users, RefreshCw, CheckCircle2, AlertTriangle, LogOut, Globe,
  KeyRound, FileLock2, Bug, Timer, Fingerprint, Filter, Monitor, Smartphone,
} from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader, Panel, Badge, ConfirmButton, abtnGhost } from '../components/UI.jsx';
import { StatCard } from '../components/Charts.jsx';
import { PageLoader, Spinner } from '../../components/ui/Loaders.jsx';

const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const ago = (d) => {
  if (!d) return 'never';
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};
const device = (ua = '') => (/mobile|android|iphone/i.test(ua) ? Smartphone : Monitor);
const browser = (ua = '') => (/edg\//i.test(ua) ? 'Edge' : /chrome\//i.test(ua) ? 'Chrome' : /firefox/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : /curl|node|python/i.test(ua) ? 'Script' : 'Other');

const ACTIONS = {
  'login.success': ['Signed in', 'text-green-600 bg-green-50', LogIn],
  'login.failed': ['Failed sign-in', 'text-red-600 bg-red-50', ShieldAlert],
  'login.blocked': ['Blocked (locked)', 'text-red-700 bg-red-100', Lock],
  'account.locked': ['Account locked', 'text-red-700 bg-red-100', Lock],
  'password.change': ['Password changed', 'text-violet-700 bg-violet-50', KeyRound],
  'password.reset': ['Password reset', 'text-violet-700 bg-violet-50', KeyRound],
  'password.reset-request': ['Reset requested', 'text-slate-600 bg-slate-100', KeyRound],
  'sessions.revoke': ['Signed out everywhere', 'text-amber-700 bg-amber-50', LogOut],
};
const describe = (a) => ACTIONS[a] || [a.replace(/[.-]/g, ' '), 'text-primary bg-primary/10', FileLock2];

const CHECKS = [
  ['strongSecret', 'Strong JWT secret', 'Set JWT_SECRET in Server/.env to a random value of 32+ characters.'],
  ['defaultPasswordChanged', 'Default admin password changed', 'Change the password created from ADMIN_PASSWORD in My Profile.'],
  ['production', 'Running in production mode', 'Set NODE_ENV=production on the live server.'],
  ['https', 'Served over HTTPS', 'Install an SSL certificate (e.g. Let’s Encrypt) on your domain.'],
  ['smtp', 'Email configured (password reset & alerts)', 'Configure SMTP in Settings › Email.'],
];

const PROTECTIONS = [
  [Lock, 'Account lockout', '5 wrong passwords lock the account for 15 minutes'],
  [Timer, 'Rate limiting', 'Login, forms and API are throttled per IP'],
  [Bug, 'Injection filtering', 'MongoDB operators stripped from all input; HTML sanitised'],
  [KeyRound, 'Password policy', '8+ chars with upper, lower case and a number'],
  [Fingerprint, 'Session revocation', 'Password change signs out every other device'],
  [FileLock2, 'Upload sandbox', 'Uploaded files are served with a no-script policy'],
  [ShieldCheck, 'Spam traps', 'Honeypot fields and timing checks on public forms'],
  [Globe, 'Security headers', 'Helmet, HSTS, referrer & permissions policies'],
];

const TABS = [['', 'All activity'], ['logins', 'Sign-ins'], ['failed', 'Failed / blocked'], ['changes', 'Content changes']];

export default function Security() {
  const { user: me } = useAuth();
  const [d, setD] = useState(null);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/security', { params: { type, page } }).then(({ data }) => setD(data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [type, page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [type]);

  const act = async (url, done) => {
    try { const { data } = await api.post(url); toast.success(data.message); done?.(); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  if (!d) return <PageLoader />;
  const score = CHECKS.filter(([k]) => d.checks?.[k]).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Security Centre" subtitle="Sign-in activity, account protection and an audit trail of every change made in the admin panel.">
        <button onClick={load} className={abtnGhost} aria-label="Refresh">{loading ? <Spinner className="h-4 w-4" /> : <RefreshCw size={15} />}</button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={LogIn} label="Successful sign-ins (24 h)" value={d.stats.success24h} tone="green" />
        <StatCard icon={ShieldAlert} label="Failed sign-ins (24 h)" value={d.stats.failed24h} tone={d.stats.failed24h > 10 ? 'red' : 'accent'} />
        <StatCard icon={Lock} label="Locked accounts" value={d.stats.locked} tone={d.stats.locked ? 'red' : 'cyan'} />
        <StatCard icon={Users} label="Admin users" value={d.stats.users} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Panel title="Security health" className="xl:col-span-3" actions={<span className={`rounded-full px-3 py-1 text-xs font-bold ${score === CHECKS.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{score}/{CHECKS.length} passed</span>}>
          <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${score === CHECKS.length ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${(score / CHECKS.length) * 100}%` }} /></div>
          <ul className="space-y-3">
            {CHECKS.map(([k, label, fix]) => {
              const ok = !!d.checks?.[k];
              return (
                <li key={k} className={`flex gap-3 rounded-xl border p-3.5 ${ok ? 'border-green-100 bg-green-50/40' : 'border-amber-200 bg-amber-50/60'}`}>
                  {ok ? <CheckCircle2 size={19} className="mt-px shrink-0 text-green-600" /> : <AlertTriangle size={19} className="mt-px shrink-0 text-amber-600" />}
                  <span><span className="block text-sm font-semibold text-slate-800">{label}</span>{!ok && <span className="text-xs text-slate-600">{fix}</span>}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Active protections" className="xl:col-span-2">
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {PROTECTIONS.map(([Icon, t, x]) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={17} /></span>
                <span><span className="block text-sm font-semibold text-slate-800">{t}</span><span className="text-xs text-slate-500">{x}</span></span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Admin accounts">
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Last sign-in</th><th className="px-5 py-3">Password changed</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {d.users.map((u) => {
                const locked = u.lockUntil && new Date(u.lockUntil) > new Date();
                return (
                  <tr key={u._id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3"><p className="font-semibold text-slate-800">{u.name}{String(u._id) === String(me?._id) && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                    <td className="px-5 py-3"><Badge value={u.role} /></td>
                    <td className="px-5 py-3"><p className="text-slate-700">{ago(u.lastLogin)}</p>{u.lastLoginIp && <p className="text-xs text-slate-400">IP {u.lastLoginIp}</p>}</td>
                    <td className="px-5 py-3 text-slate-600">{u.passwordChangedAt ? ago(u.passwordChangedAt) : <span className="text-amber-600">never</span>}</td>
                    <td className="px-5 py-3">{locked ? <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700"><Lock size={11} /> Locked until {new Date(u.lockUntil).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</span> : <Badge value={!!u.active} label={u.active ? 'Active' : 'Disabled'} />}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {locked && <button onClick={() => act(`/admin/users/${u._id}/unlock`)} className={abtnGhost}><Unlock size={14} /> Unlock</button>}
                        {String(u._id) !== String(me?._id) && (
                          <ConfirmButton onConfirm={() => act(`/admin/users/${u._id}/revoke-sessions`)} className={`${abtnGhost} !text-xs`} label="Sign out"><LogOut size={14} /> Sign out devices</ConfirmButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Activity log" className="xl:col-span-2" actions={<span className="flex items-center gap-1 text-xs text-slate-400"><Filter size={12} /> kept for 180 days</span>}>
          <div className="mb-4 flex flex-wrap gap-2">
            {TABS.map(([k, l]) => <button key={k} onClick={() => setType(k)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${type === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>)}
          </div>
          <ul className="divide-y">
            {d.items.map((a) => {
              const [label, tone, Icon] = describe(a.action);
              const Dev = device(a.userAgent);
              return (
                <li key={a._id} className="flex items-start gap-3 py-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800"><span className="font-semibold capitalize">{label}</span>{a.target && <span className="text-slate-500"> · {a.target}</span>}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
                      <span>{a.userName || a.email || 'Unknown'}</span>
                      {a.ip && <span>IP {a.ip}</span>}
                      <span className="inline-flex items-center gap-1"><Dev size={11} /> {browser(a.userAgent)}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-xs text-slate-400" title={fmt(a.createdAt)}>{ago(a.createdAt)}</span>
                </li>
              );
            })}
            {!d.items.length && <li className="py-10 text-center text-sm text-slate-400">No activity recorded yet</li>}
          </ul>
          {d.pages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
              <span className="text-slate-500">Page {d.page} of {d.pages}</span>
              <div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={abtnGhost}>Previous</button><button disabled={page >= d.pages} onClick={() => setPage((p) => p + 1)} className={abtnGhost}>Next</button></div>
            </div>
          )}
        </Panel>
        <Panel title="Failed sign-ins by IP (7 days)">
          {d.suspiciousIps.length ? (
            <ul className="space-y-3">
              {d.suspiciousIps.map((x) => (
                <li key={x._id || 'unknown'} className="flex items-center gap-3 text-sm">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${x.count >= 10 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}><Globe size={15} /></span>
                  <span className="flex-1"><span className="block font-mono text-slate-700">{x._id || 'unknown'}</span><span className="text-xs text-slate-400">last {ago(x.last)}</span></span>
                  <span className="font-heading font-bold text-slate-800">{x.count}</span>
                </li>
              ))}
            </ul>
          ) : <p className="py-10 text-center text-sm text-slate-400">No failed sign-ins in the last 7 days 🎉</p>}
        </Panel>
      </div>
    </div>
  );
}
