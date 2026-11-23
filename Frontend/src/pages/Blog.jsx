import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Tag, X } from 'lucide-react';
import { usePublic } from '../lib/hooks.js';
import { IMG } from '../data/defaults.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, EmptyState } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { CardSkeletons } from '../components/ui/Loaders.jsx';
import { PostCard } from '../components/home/Cards.jsx';

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const query = { page: params.get('page') || 1, category: params.get('category') || '', tag: params.get('tag') || '', q: params.get('q') || '' };
  const { data, loading } = usePublic('/posts', query);
  const update = (patch) => {
    const next = { ...Object.fromEntries(params), ...patch };
    if (!('page' in patch)) delete next.page;
    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setParams(next);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };
  const filtered = query.category || query.tag || query.q;

  return (
    <>
      <Seo title="Insights" description="Articles on railway safety assessment, RAMS and standards." />
      <PageHero title="Insights & Articles" subtitle="Practical guidance on safety assessment, RAMS and railway standards." image={IMG.documents} crumbs={[{ label: 'Insights' }]} />
      <section className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {filtered && (
              <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500">Filtered by:</span>
                {[['category', query.category], ['tag', query.tag], ['q', query.q]].filter(([, v]) => v).map(([k, v]) => (
                  <button key={k} onClick={() => update({ [k]: '' })} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{v} <X size={14} /></button>
                ))}
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              {loading ? <CardSkeletons count={4} className="h-96" /> : data?.items?.map((p, i) => <Reveal key={p._id} delay={(i % 2) * 0.1}><PostCard p={p} /></Reveal>)}
            </div>
            {!loading && !data?.items?.length && <EmptyState title="No articles found" text="Try a different search or category." />}
            {data?.pages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: data.pages }).map((_, i) => (
                  <button key={i} onClick={() => update({ page: i + 1 })} className={`h-11 w-11 rounded-full font-semibold transition ${Number(query.page) === i + 1 ? 'bg-primary text-white' : 'bg-surface text-slate-700 hover:bg-primary/10'}`}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <form onSubmit={(e) => { e.preventDefault(); update({ q }); }} className="relative">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="input !rounded-full !py-3.5 pr-14" aria-label="Search articles" />
              <button className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-primary text-white" aria-label="Search"><Search size={17} /></button>
            </form>
            {data?.categories?.length > 0 && (
              <div className="card p-6">
                <h3 className="mb-4 font-heading text-lg font-bold text-secondary">Categories</h3>
                <ul className="space-y-1">
                  {data.categories.filter((c) => c._id).map((c) => (
                    <li key={c._id}>
                      <button onClick={() => update({ category: c._id })} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${query.category === c._id ? 'bg-primary text-white' : 'text-slate-700 hover:bg-surface'}`}>
                        {c._id} <span className="rounded-full bg-black/5 px-2 text-xs">{c.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data?.tags?.length > 0 && (
              <div className="card p-6">
                <h3 className="mb-4 font-heading text-lg font-bold text-secondary">Popular tags</h3>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((t) => (
                    <button key={t._id} onClick={() => update({ tag: t._id })} className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${query.tag === t._id ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'}`}>
                      <Tag size={11} /> {t._id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
