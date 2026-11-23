import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import { usePublic } from '../lib/hooks.js';
import { DynIcon } from '../lib/icons.jsx';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, EmptyState } from '../components/ui/Common.jsx';
import { PageLoader } from '../components/ui/Loaders.jsx';
import { PostCard } from '../components/home/Cards.jsx';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [term, setTerm] = useState(q);
  const { data, loading } = usePublic(q.length >= 2 ? '/search' : null, { q });
  const total = data ? data.services.length + data.posts.length + data.jobs.length : 0;

  return (
    <>
      <Seo title={q ? `Search: ${q}` : 'Search'} noindex />
      <PageHero title="Search" subtitle={q ? `Results for “${q}”` : 'Find services, insights and careers'} crumbs={[{ label: 'Search' }]} />
      <section className="py-16">
        <div className="container-x max-w-5xl">
          <form onSubmit={(e) => { e.preventDefault(); setParams({ q: term }); }} className="relative mb-12">
            <input value={term} onChange={(e) => setTerm(e.target.value)} className="input !rounded-full !py-4 !pl-6 !pr-16 !text-base" placeholder="Search…" aria-label="Search" />
            <button className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-primary text-white" aria-label="Search"><SearchIcon size={18} /></button>
          </form>
          {loading && <PageLoader />}
          {data && !loading && (
            <div className="space-y-14">
              <p className="text-slate-500">{total} result{total === 1 ? '' : 's'} found</p>
              {data.services.length > 0 && (
                <div>
                  <h2 className="mb-5 text-2xl font-bold text-secondary">Services</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.services.map((s) => (
                      <Link key={s.slug} to={`/services/${s.slug}`} className="group flex gap-4 rounded-brand border p-5 transition hover:border-primary/30 hover:shadow-lg">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><DynIcon name={s.icon} size={22} /></span>
                        <span><span className="font-bold text-secondary group-hover:text-primary">{s.title}</span><span className="mt-1 line-clamp-2 block text-sm text-slate-500">{s.shortDescription}</span></span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {data.posts.length > 0 && (
                <div>
                  <h2 className="mb-5 text-2xl font-bold text-secondary">Insights</h2>
                  <div className="grid gap-6 md:grid-cols-3">{data.posts.map((p) => <PostCard key={p._id} p={p} />)}</div>
                </div>
              )}
              {data.jobs.length > 0 && (
                <div>
                  <h2 className="mb-5 text-2xl font-bold text-secondary">Careers</h2>
                  <div className="space-y-3">
                    {data.jobs.map((j) => (
                      <Link key={j.slug} to={`/careers/${j.slug}`} className="flex items-center justify-between rounded-brand border p-5 hover:border-primary/30 hover:shadow-lg">
                        <span><span className="font-bold text-secondary">{j.title}</span><span className="block text-sm text-slate-500">{j.location} · {j.type}</span></span>
                        <ArrowRight className="text-primary" size={18} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {!total && <EmptyState title="No results" text="Try different keywords such as ISA, RAMS or EN 50129." />}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
