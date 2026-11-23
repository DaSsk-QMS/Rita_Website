import { useState } from 'react';
import toast from 'react-hot-toast';
import { KeyRound, Save, ShieldCheck, UserRound, MonitorSmartphone, LogOut } from 'lucide-react';
import { api, errMsg, img, saveToken } from '../../lib/api.js';
import { PasswordRules, PASSWORD_RULES } from './Auth.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate } from '../../lib/hooks.js';
import { PageHeader, Panel, Badge, ConfirmButton, abtnPrimary, abtnDanger } from '../components/UI.jsx';
import { ImageField } from '../components/Fields.jsx';
import { Spinner } from '../../components/ui/Loaders.jsx';

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}
const LEVELS = [['Too weak', 'bg-red-500'], ['Weak', 'bg-orange-500'], ['Fair', 'bg-amber-500'], ['Good', 'bg-lime-500'], ['Strong', 'bg-green-600']];

export default function Profile() {
  const { user, setUser, logoutEverywhere } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy('profile');
    try {
      const { data } = await api.put('/auth/profile', form);
      setUser(data);
      toast.success('Profile updated');
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('New passwords do not match');
    if (!PASSWORD_RULES.every(([, ok]) => ok(pw.newPassword))) return toast.error('New password does not meet the requirements');
    setBusy('pw');
    try {
      const { data } = await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      if (data.token) saveToken(data.token); // keep this session; other devices are signed out
      toast.success(data.message);
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };

  const lvl = strength(pw.newPassword);

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Update your account details and password." />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-primary p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 animate-aurora rounded-full bg-accent/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          {form.avatar
            ? <img src={img(form.avatar)} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/20" />
            : <span className="grid h-20 w-20 place-items-center rounded-2xl bg-white/15 font-heading text-3xl font-extrabold">{user?.name?.[0]}</span>}
          <div>
            <p className="font-heading text-2xl font-extrabold">{user?.name}</p>
            <p className="text-white/70">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
              <Badge value={user?.role} />
              {user?.lastLogin && <span>Last login {new Date(user.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={<span className="flex items-center gap-2"><UserRound size={17} /> Account details</span>}>
          <form onSubmit={saveProfile} className="space-y-4">
            <div><label className="label" htmlFor="pf-name">Name</label><input id="pf-name" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="pf-email">Email</label><input id="pf-email" required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><span className="label">Avatar</span><ImageField value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} /></div>
            <button disabled={busy === 'profile'} className={abtnPrimary}>{busy === 'profile' ? <Spinner className="h-4 w-4" /> : <Save size={15} />} Save profile</button>
          </form>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><KeyRound size={17} /> Change password</span>}>
          <form onSubmit={savePassword} className="space-y-4">
            <div><label className="label" htmlFor="pf-cur">Current password</label><input id="pf-cur" type="password" required autoComplete="current-password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></div>
            <div>
              <label className="label" htmlFor="pf-new">New password</label>
              <input id="pf-new" type="password" required minLength={8} autoComplete="new-password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
              {pw.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition ${i < lvl ? LEVELS[lvl][1] : 'bg-slate-200'}`} />)}</div>
                  <p className="mt-1 text-xs text-slate-500">{LEVELS[lvl][0]} — 12+ characters with symbols is best.</p>
                </div>
              )}
              <PasswordRules value={pw.newPassword} />
            </div>
            <div><label className="label" htmlFor="pf-conf">Confirm new password</label><input id="pf-conf" type="password" required minLength={8} autoComplete="new-password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
            <button disabled={busy === 'pw'} className={abtnPrimary}>{busy === 'pw' ? <Spinner className="h-4 w-4" /> : <ShieldCheck size={15} />} Update password</button>
          </form>
        </Panel>
      </div>

      <Panel title={<span className="flex items-center gap-2"><MonitorSmartphone size={17} /> Active sessions</span>}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-sm text-slate-500">Signed in on a shared or lost computer? Sign out everywhere else. This browser stays signed in. Changing your password does this automatically.</p>
          <ConfirmButton className={abtnDanger} label="Sign out all other devices" onConfirm={async () => { try { toast.success(await logoutEverywhere()); } catch (e) { toast.error(errMsg(e)); } }}>
            <LogOut size={15} /> Sign out all other devices
          </ConfirmButton>
        </div>
      </Panel>
    </div>
  );
}
