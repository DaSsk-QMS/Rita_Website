import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Megaphone, ShieldCheck, ShieldOff, TrendingUp, MessageSquareHeart, ThumbsUp, ExternalLink } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import LeadsManager from '../components/LeadsManager.jsx';
import { StatCard } from '../components/Charts.jsx';
import { abtnPrimary } from '../components/UI.jsx';
import { Spinner } from '../../components/ui/Loaders.jsx';

const Stars = ({ n, size = 14 }) => (
  <span className="flex gap-0.5 text-accent">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} className={i <= n ? 'fill-current' : 'text-slate-200'} />)}</span>
);
const npsGroup = (n) => (n === undefined || n === null ? null : n >= 9 ? ['Promoter', 'bg-green-100 text-green-700'] : n >= 7 ? ['Passive', 'bg-amber-100 text-amber-700'] : ['Detractor', 'bg-red-100 text-red-700']);

function Summary() {
  const [s, setS] = useState(null);
  useEffect(() => {
    api.get('/admin/feedback', { params: { limit: 500 } }).then(({ data }) => {
      const items = data.items.filter((f) => f.status !== 'archived');
      const rated = items.filter((f) => f.rating);
      const nps = items.filter((f) => typeof f.nps === 'number');
      const promoters = nps.filter((f) => f.nps >= 9).length;
      const detractors = nps.filter((f) => f.nps <= 6).length;
      setS({
        total: items.length,
        avg: rated.length ? (rated.reduce((a, f) => a + f.rating, 0) / rated.length).toFixed(1) : '—',
        nps: nps.length ? Math.round(((promoters - detractors) / nps.length) * 100) : '—',
        consent: items.filter((f) => f.consent).length,
        dist: [5, 4, 3, 2, 1].map((r) => [r, rated.filter((f) => f.rating === r).length]),
      });
    }).catch(() => {});
  }, []);
  if (!s) return null;
  const max = Math.max(1, ...s.dist.map(([, c]) => c));
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3 xl:grid-cols-4">
        <StatCard icon={MessageSquareHeart} label="Responses" value={s.total} />
        <StatCard icon={Star} label="Average rating" value={s.avg} sub="out of 5" tone="accent" />
        <StatCard icon={TrendingUp} label="Net Promoter Score" value={s.nps} sub="−100 to +100" tone="green" />
        <StatCard icon={ThumbsUp} label="Can be published" value={s.consent} sub="gave consent" tone="violet" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <p className="mb-3 text-sm font-semibold text-slate-700">Rating distribution</p>
        <ul className="space-y-2">
          {s.dist.map(([r, c]) => (
            <li key={r} className="flex items-center gap-3 text-xs">
              <span className="flex w-8 items-center gap-0.5 font-semibold text-slate-600">{r}<Star size={11} className="fill-accent text-accent" /></span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-accent transition-all" style={{ width: `${(c / max) * 100}%` }} /></span>
              <span className="w-6 text-right text-slate-500">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PublishButton({ item, onDone }) {
  const [busy, setBusy] = useState(false);
  if (!item.consent) return <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500"><ShieldOff size={15} /> No consent to publish — keep this feedback internal.</p>;
  if (item.status === 'published') return <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700"><ShieldCheck size={16} /> Published as a testimonial. <a href="/admin/testimonials" className="ml-auto inline-flex items-center gap-1 underline">Manage <ExternalLink size={13} /></a></p>;
  const publish = async () => {
    setBusy(true);
    try { const { data } = await api.post(`/admin/feedback/${item._id}/publish`); toast.success(data.message); onDone(data.item); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
      <p className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck size={16} className="text-green-600" /> Consent given to publish on the website.</p>
      <button type="button" onClick={publish} disabled={busy} className={abtnPrimary}>{busy ? <Spinner className="h-4 w-4" /> : <Megaphone size={15} />} Publish as testimonial</button>
    </div>
  );
}

export default function FeedbackAdmin() {
  return (
    <>
      <Summary />
      <LeadsManager
        endpoint="/admin/feedback"
        title="Client Feedback"
        subtitle="Collected from the public /feedback page"
        statuses={['new', 'reviewed', 'published', 'archived']}
        exportUrl="/admin/feedback/export/csv"
        canReply
        replySubject={() => 'Thank you for your feedback'}
        searchPlaceholder="Search name, company, message…"
        renderAvatar={(f) => (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-heading text-sm font-extrabold ${f.rating >= 4 ? 'bg-green-100 text-green-700' : f.rating === 3 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{f.rating}★</span>
        )}
        renderSummary={(f) => (
          <>
            <Stars n={f.rating} size={12} />
            <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{f.category}</span>
            <span className="truncate text-sm text-slate-500">{f.message}</span>
          </>
        )}
        renderDetail={(f) => {
          const g = npsGroup(f.nps);
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Stars n={f.rating} size={22} />
                <span className="font-heading text-lg font-bold text-slate-800">{f.rating}/5</span>
                {g && <span className={`rounded-full px-3 py-1 text-xs font-bold ${g[1]}`}>Recommend: {f.nps}/10 · {g[0]}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">{f.category}</span>
                {f.service && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{f.service}</span>}
                {f.designation && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{f.designation}</span>}
              </div>
              <div className="whitespace-pre-wrap rounded-xl border bg-white p-4 text-sm leading-relaxed text-slate-700">{f.message}</div>
            </div>
          );
        }}
        renderActions={(f, update) => <PublishButton item={f} onDone={update} />}
      />
    </>
  );
}
