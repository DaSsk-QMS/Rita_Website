import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldCheck, LayoutDashboard, Inbox, BarChart3, Search, Users, Images,
  AlertTriangle, ShieldAlert, KeyRound, CheckCircle2, Circle, ArrowRight, Fingerprint,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSite } from '../../context/SiteContext.jsx';
import { api, errMsg } from '../../lib/api.js';
import { IMG } from '../../data/defaults.js';
import { Logo } from '../../components/ui/Common.jsx';
import { Spinner } from '../../components/ui/Loaders.jsx';

const FEATURES = [
  { icon: Images, title: 'Content & slideshow', text: 'Pages, services, blog, gallery' },
  { icon: Inbox, title: 'Enquiries & feedback', text: 'Reply, track and export leads' },
  { icon: BarChart3, title: 'Visitor analytics', text: 'Live visitors, sources, devices' },
  { icon: Search, title: 'SEO & local search', text: 'Telangana service-area pages' },
  { icon: Users, title: 'Clients & careers', text: 'Logos, profiles, applications' },
  { icon: ShieldCheck, title: 'Security centre', text: 'Audit log, lockout, sessions' },
];

function Shell({ title, subtitle, children, icon: Icon = LayoutDashboard }) {
  const { settings } = useSite();
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-secondary lg:block">
        <img src={IMG.station} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/90 to-primary/70" />
        <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 animate-aurora rounded-full bg-primary/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 animate-aurora rounded-full bg-accent/20 blur-3xl [animation-delay:-7s]" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white xl:p-16">
          <Link to="/" aria-label="Back to website"><Logo light /></Link>

          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent backdrop-blur">
              <Fingerprint size={14} /> Admin control centre
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 max-w-lg text-4xl font-extrabold leading-tight xl:text-5xl">
              Manage your entire website from <span className="text-accent">one secure place.</span>
            </motion.h2>
            <p className="mt-4 max-w-md text-white/65">{settings.general?.tagline}</p>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                  className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur transition hover:border-accent/40 hover:bg-white/10">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-accent transition group-hover:bg-accent group-hover:text-secondary"><f.icon size={18} /></span>
                  <span><span className="block text-sm font-bold">{f.title}</span><span className="block text-xs text-white/55">{f.text}</span></span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
            <span>© {new Date().getFullYear()} {settings.general?.siteName}</span>
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Lock size={12} /> Encrypted sessions</span>
              <span className="flex items-center gap-1.5"><ShieldAlert size={12} /> Brute-force lockout</span>
            </span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center overflow-hidden p-6 sm:p-10">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,#000_10%,transparent_60%)]" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 24 }} className="relative w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl shadow-secondary/10 backdrop-blur sm:p-10">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30"><Icon size={24} /></span>
            <h1 className="mt-6 font-heading text-3xl font-extrabold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <Lock size={12} /> Restricted area. All sign-in attempts are logged.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder = 'Password', id, autoComplete = 'current-password', onCaps }) {
  const [show, setShow] = useState(false);
  const caps = (e) => onCaps?.(e.getModifierState?.('CapsLock'));
  return (
    <div className="relative">
      <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input id={id} type={show ? 'text' : 'password'} required minLength={8} value={value} onChange={onChange} onKeyUp={caps} onKeyDown={caps}
        placeholder={placeholder} className="input !py-3.5 !pl-11 !pr-11" autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function Alert({ tone = 'red', children }) {
  const tones = { red: 'border-red-200 bg-red-50 text-red-700', amber: 'border-amber-200 bg-amber-50 text-amber-800', green: 'border-green-200 bg-green-50 text-green-800' };
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className={`flex gap-2.5 rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
        {tone === 'green' ? <CheckCircle2 size={18} className="mt-px shrink-0" /> : <AlertTriangle size={18} className="mt-px shrink-0" />}
        <span>{children}</span>
      </div>
    </motion.div>
  );
}

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [caps, setCaps] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await login(email, password, remember);
      toast.success(`Welcome back, ${u.name}`);
      navigate('/admin');
    } catch (err) {
      const status = err.response?.status;
      setError({
        tone: status === 423 || status === 429 ? 'red' : /attempt/.test(errMsg(err)) ? 'amber' : 'red',
        text: err.response ? errMsg(err) : 'Cannot reach the server. Is the backend running?',
      });
    } finally { setBusy(false); }
  };

  return (
    <Shell title="Welcome back" subtitle="Sign in to manage your website, leads and analytics." icon={LayoutDashboard}>
      <form onSubmit={submit} className="space-y-5" noValidate={false}>
        <AnimatePresence>{error && <Alert tone={error.tone}>{error.text}</Alert>}</AnimatePresence>
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" className="input !py-3.5 !pl-11" autoComplete="username" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">Password</label>
            <Link to="/admin/forgot-password" className="mb-1.5 text-sm font-semibold text-primary hover:underline">Forgot password?</Link>
          </div>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} onCaps={setCaps} />
          <AnimatePresence>
            {caps && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600"><AlertTriangle size={13} /> Caps Lock is on</motion.p>}
          </AnimatePresence>
        </div>
        <label className="flex cursor-pointer select-none items-center gap-3 text-sm text-slate-600">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-[var(--c-primary)]" />
          Keep me signed in on this device
        </label>
        <button disabled={busy} className="btn-primary group w-full !rounded-xl !py-3.5 text-base">
          {busy ? <Spinner className="h-4 w-4" /> : null} {busy ? 'Signing in…' : 'Sign in'}
          {!busy && <ArrowRight size={18} className="transition group-hover:translate-x-1" />}
        </button>
        <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" /></div>
        <Link to="/" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"><ArrowLeft size={15} /> Back to website</Link>
      </form>
    </Shell>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.post('/auth/forgot-password', { email }); setSent(true); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Forgot password?" subtitle="Enter your admin email and we'll send you a secure reset link (valid 30 minutes)." icon={KeyRound}>
      {sent ? (
        <Alert tone="green">If that account exists, a reset link has been sent. Check your inbox (and spam folder).</Alert>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your admin email" className="input !py-3.5 !pl-11" autoComplete="username" />
          </div>
          <button disabled={busy} className="btn-primary w-full !rounded-xl !py-3.5">{busy && <Spinner className="h-4 w-4" />} Send reset link</button>
        </form>
      )}
      <Link to="/admin/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"><ArrowLeft size={15} /> Back to sign in</Link>
    </Shell>
  );
}

export const PASSWORD_RULES = [
  ['At least 8 characters', (p) => p.length >= 8],
  ['Upper- and lower-case letters', (p) => /[a-z]/.test(p) && /[A-Z]/.test(p)],
  ['At least one number', (p) => /\d/.test(p)],
];

export function PasswordRules({ value }) {
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map(([label, ok]) => (
        <li key={label} className={`flex items-center gap-2 text-xs ${ok(value) ? 'text-green-600' : 'text-slate-400'}`}>
          {ok(value) ? <CheckCircle2 size={13} /> : <Circle size={13} />} {label}
        </li>
      ))}
    </ul>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = PASSWORD_RULES.every(([, ok]) => ok(pw));
  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return toast.error('Password does not meet the requirements');
    if (pw !== pw2) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password: pw });
      setSession(data, true);
      toast.success('Password updated');
      navigate('/admin');
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Set a new password" subtitle="Choose a strong password. All other sessions will be signed out." icon={KeyRound}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" autoComplete="new-password" />
          <PasswordRules value={pw} />
        </div>
        <PasswordInput value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" />
        {pw2 && pw !== pw2 && <p className="text-xs font-semibold text-red-500">Passwords do not match</p>}
        <button disabled={busy || !valid} className="btn-primary w-full !rounded-xl !py-3.5">{busy && <Spinner className="h-4 w-4" />} Update password</button>
      </form>
    </Shell>
  );
}
