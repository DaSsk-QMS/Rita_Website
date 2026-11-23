import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, CheckCircle2, MessageSquareHeart, Quote, ShieldCheck } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { usePublic, formatDate } from '../lib/hooks.js';
import { api, errMsg } from '../lib/api.js';
import { IMG } from '../data/defaults.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { Spinner } from '../components/ui/Loaders.jsx';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const DEFAULT_CATEGORIES = ['Service quality', 'Communication', 'Technical expertise', 'Timeliness', 'Website', 'Other'];

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}
            className="rounded-lg p-1 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary">
            <Star size={36} className={`transition ${n <= shown ? 'fill-accent text-accent' : 'text-slate-300'}`} />
          </button>
        ))}
        <AnimatePresence mode="wait">
          {shown > 0 && <motion.span key={shown} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="ml-3 font-heading text-lg font-bold text-secondary">{LABELS[shown]}</motion.span>}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NpsInput({ value, onChange }) {
  return (
    <div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, n) => {
          const tone = n <= 6 ? 'hover:bg-red-50 data-[on=true]:bg-red-500' : n <= 8 ? 'hover:bg-amber-50 data-[on=true]:bg-amber-500' : 'hover:bg-green-50 data-[on=true]:bg-green-600';
          return (
            <button key={n} type="button" data-on={value === n} onClick={() => onChange(value === n ? '' : n)} aria-pressed={value === n}
              className={`aspect-square rounded-lg border text-sm font-bold text-slate-600 transition data-[on=true]:border-transparent data-[on=true]:text-white ${tone}`}>{n}</button>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-400"><span>Not likely</span><span>Extremely likely</span></div>
    </div>
  );
}

const empty = { rating: 0, nps: '', category: 'Service quality', service: '', name: '', email: '', phone: '', company: '', designation: '', message: '', consent: false, website: '' };

export default function Feedback() {
  const { settings, services } = useSite();
  const g = settings.general || {};
  const { data } = usePublic('/feedback');
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const startedAt = useMemo(() => Date.now(), [done]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  const categories = data?.categories || DEFAULT_CATEGORIES;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.rating) return toast.error('Please choose a star rating');
    setBusy(true);
    try {
      const { data: r } = await api.post('/public/feedback', { ...form, _t: startedAt });
      toast.success(r.message);
      setDone(true);
      setForm(empty);
    } catch (err) {
      toast.error(err.response && typeof err.response.data === 'object' ? errMsg(err) : `We couldn't send your feedback right now. Please email ${settings.contact?.email}.`);
    } finally { setBusy(false); }
  };

  const summary = data?.summary;

  return (
    <>
      <Seo title="Client Feedback" description={g.feedbackText || 'Share your experience of working with us.'} />
      <PageHero title={g.feedbackTitle || 'Share your experience'} subtitle={g.feedbackText} image={IMG.handshake} crumbs={[{ label: 'Feedback' }]} />

      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal from="left" className="lg:col-span-7">
            <div className="rounded-brand border border-slate-200/80 bg-white p-6 shadow-xl shadow-secondary/5 sm:p-10">
              {done ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100 text-green-600"><CheckCircle2 size={44} /></span>
                  <h2 className="mt-6 text-2xl font-bold text-secondary">Thank you for your feedback!</h2>
                  <p className="mx-auto mt-2 max-w-md text-slate-600">It goes straight to our management team. If you asked for a response, we'll be in touch shortly.</p>
                  <button onClick={() => setDone(false)} className="btn-ghost mt-8">Submit another response</button>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="space-y-7">
                  <input type="text" name="website" value={form.website} onChange={set('website')} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <div>
                    <span className="eyebrow">Step 1</span>
                    <h2 className="mt-2 text-xl font-bold text-secondary">How would you rate your overall experience? *</h2>
                    <div className="mt-4"><StarInput value={form.rating} onChange={set('rating')} /></div>
                  </div>

                  <div>
                    <p className="label">What is your feedback mainly about?</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, category: c }))} aria-pressed={form.category === c}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${form.category === c ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' : 'border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary'}`}>{c}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="fb-service">Service you used</label>
                      <select id="fb-service" className="input" value={form.service} onChange={set('service')}>
                        <option value="">Select a service</option>
                        {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <p className="label">How likely are you to recommend us? (0–10)</p>
                      <NpsInput value={form.nps} onChange={set('nps')} />
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="fb-msg">Your feedback *</label>
                    <textarea id="fb-msg" required minLength={5} rows={5} className="input resize-none" value={form.message} onChange={set('message')} placeholder="What went well? What could we do better?" />
                  </div>

                  <div>
                    <span className="eyebrow">Step 2</span>
                    <h2 className="mb-4 mt-2 text-xl font-bold text-secondary">About you</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><label className="label" htmlFor="fb-name">Full name *</label><input id="fb-name" required className="input" value={form.name} onChange={set('name')} /></div>
                      <div><label className="label" htmlFor="fb-email">Email *</label><input id="fb-email" type="email" required className="input" value={form.email} onChange={set('email')} /></div>
                      <div><label className="label" htmlFor="fb-company">Company</label><input id="fb-company" className="input" value={form.company} onChange={set('company')} /></div>
                      <div><label className="label" htmlFor="fb-role">Designation</label><input id="fb-role" className="input" value={form.designation} onChange={set('designation')} /></div>
                    </div>
                  </div>

                  <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600">
                    <input type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--c-primary)]" />
                    <span>You may publish my feedback with my name, designation and company on this website. <span className="text-slate-400">(Optional — your email is never shown.)</span></span>
                  </label>

                  <button disabled={busy} className="btn-primary w-full sm:w-auto">{busy ? <Spinner className="h-4 w-4" /> : <Send size={16} />} Submit feedback</button>
                </form>
              )}
            </div>
          </Reveal>

          <aside className="space-y-6 lg:col-span-5">
            <Reveal from="right" className="relative overflow-hidden rounded-brand bg-secondary p-8 text-white">
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 animate-aurora rounded-full bg-primary/50 blur-3xl" />
              <MessageSquareHeart className="relative text-accent" size={34} />
              {summary?.count > 0 ? (
                <div className="relative mt-5 flex items-end gap-4">
                  <span className="font-heading text-6xl font-extrabold">{summary.average}</span>
                  <span className="pb-2">
                    <span className="flex gap-0.5 text-accent">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={18} className={n <= Math.round(summary.average) ? 'fill-current' : 'opacity-30'} />)}</span>
                    <span className="mt-1 block text-sm text-white/60">from {summary.count} client review{summary.count > 1 ? 's' : ''}</span>
                  </span>
                </div>
              ) : (
                <h3 className="relative mt-5 text-2xl font-bold">Your opinion matters</h3>
              )}
              <ul className="relative mt-6 space-y-3 text-sm text-white/75">
                {['Read personally by our management team', 'Used to improve our assessments and reports', 'Published only with your permission'].map((t) => (
                  <li key={t} className="flex gap-2.5"><ShieldCheck size={17} className="shrink-0 text-accent" />{t}</li>
                ))}
              </ul>
            </Reveal>

            {data?.items?.map((f, i) => (
              <Reveal key={f._id} from="right" delay={i * 0.05} className="relative rounded-brand border bg-white p-6 shadow-sm">
                <Quote className="absolute right-5 top-5 text-accent/25" size={40} />
                <div className="flex gap-0.5 text-accent">{Array.from({ length: f.rating }).map((_, n) => <Star key={n} size={15} className="fill-current" />)}</div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">“{f.message}”</p>
                <p className="mt-4 text-sm font-bold text-secondary">{f.name}</p>
                <p className="text-xs text-slate-500">{[f.designation, f.company].filter(Boolean).join(', ')} · {formatDate(f.createdAt)}</p>
              </Reveal>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}
