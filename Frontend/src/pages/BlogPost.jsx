import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, Eye, User, Tag, Link2, Check } from 'lucide-react';
import { usePublic, formatDate } from '../lib/hooks.js';
import { img } from '../lib/api.js';
import { SOCIAL_ICONS } from '../lib/icons.jsx';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, Html } from '../components/ui/Common.jsx';
import { Reveal } from '../components/ui/Motion.jsx';
import { PageLoader } from '../components/ui/Loaders.jsx';
import { PostCard } from '../components/home/Cards.jsx';
import NotFound from './NotFound.jsx';

function Share({ title }) {
  const [copied, setCopied] = useState(false);
  const url = encodeURIComponent(window.location.href);
  const t = encodeURIComponent(title);
  const links = [
    ['linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${url}`],
    ['twitter', `https://x.com/intent/tweet?url=${url}&text=${t}`],
    ['facebook', `https://www.facebook.com/sharer/sharer.php?u=${url}`],
    ['whatsapp', `https://wa.me/?text=${t}%20${url}`],
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-sm font-semibold text-secondary">Share:</span>
      {links.map(([k, href]) => {
        const Icon = SOCIAL_ICONS[k];
        return <a key={k} href={href} target="_blank" rel="noreferrer" aria-label={`Share on ${k}`} className="grid h-10 w-10 place-items-center rounded-full bg-surface text-secondary transition hover:bg-primary hover:text-white"><Icon size={16} /></a>;
      })}
      <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} aria-label="Copy link" className="grid h-10 w-10 place-items-center rounded-full bg-surface text-secondary transition hover:bg-primary hover:text-white">
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  );
}

function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = document.getElementById('article');
      if (!el) return;
      const r = el.getBoundingClientRect();
      setP(Math.min(100, Math.max(0, ((window.innerHeight - r.top) / r.height) * 100)));
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return <div className="fixed bottom-0 left-0 z-50 h-1 bg-accent transition-[width]" style={{ width: `${p}%` }} />;
}

export default function BlogPost() {
  const { slug } = useParams();
  const { data, loading, error } = usePublic(`/posts/${slug}`);
  if (loading) return <div className="pt-40"><PageLoader /></div>;
  if (error || !data?.item) return <NotFound />;
  const p = data.item;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt,
    image: img(p.coverImage), datePublished: p.publishedAt, dateModified: p.updatedAt || p.publishedAt,
    author: { '@type': 'Organization', name: p.author }, keywords: (p.tags || []).join(', '),
    publisher: { '@id': `${window.location.origin}/#organization` }, mainEntityOfPage: window.location.href,
    articleSection: p.category, inLanguage: 'en-IN',
  };

  return (
    <>
      <Seo title={p.seoTitle || p.title} description={p.seoDescription || p.excerpt} image={p.coverImage} type="article" keywords={p.seoKeywords || (p.tags || []).join(', ')} jsonLd={jsonLd} />
      <ReadingProgress />
      <PageHero title={p.title} image={p.coverImage} crumbs={[{ label: 'Insights', to: '/blog' }, { label: p.category || 'Article' }]} />
      <section className="py-16">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <article id="article" className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-5 border-b pb-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><User size={15} /> {p.author}</span>
              <span className="flex items-center gap-1.5"><Calendar size={15} /> {formatDate(p.publishedAt)}</span>
              <span className="flex items-center gap-1.5"><Clock size={15} /> {p.readingTime || 3} min read</span>
              {p.views > 0 && <span className="flex items-center gap-1.5"><Eye size={15} /> {p.views} views</span>}
            </div>
            {p.coverImage && <Reveal className="mt-8 overflow-hidden rounded-brand"><img src={img(p.coverImage)} alt={p.title} className="aspect-[16/8] w-full object-cover" /></Reveal>}
            {p.excerpt && <p className="mt-8 border-l-4 border-accent pl-5 text-xl leading-relaxed text-slate-700">{p.excerpt}</p>}
            <div className="mt-8"><Html html={p.content} className="prose-brand prose-lg" /></div>
            <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t pt-6">
              <div className="flex flex-wrap gap-2">
                {(p.tags || []).map((t) => <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-primary hover:text-white"><Tag size={11} />{t}</Link>)}
              </div>
              <Share title={p.title} />
            </div>
          </article>
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="card p-6">
                <h3 className="mb-5 font-heading text-lg font-bold text-secondary">Recent articles</h3>
                <div className="space-y-5">
                  {(data.recent || []).map((r) => (
                    <Link key={r._id} to={`/blog/${r.slug}`} className="group flex gap-4">
                      <img src={img(r.coverImage)} alt="" loading="lazy" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                      <span>
                        <span className="line-clamp-2 text-sm font-semibold text-secondary group-hover:text-primary">{r.title}</span>
                        <span className="mt-1 block text-xs text-slate-500">{formatDate(r.publishedAt)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="rounded-brand bg-gradient-to-br from-primary to-secondary p-8 text-white">
                <h3 className="text-xl font-bold">Have a project in mind?</h3>
                <p className="mt-2 text-sm text-white/75">Get independent advice from our assessors.</p>
                <Link to="/contact" className="btn-accent mt-6">Contact us</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
      {data.related?.length > 0 && (
        <section className="bg-surface py-20">
          <div className="container-x">
            <h2 className="mb-10 text-3xl font-extrabold text-secondary">Related articles</h2>
            <div className="grid gap-6 md:grid-cols-3">{data.related.map((r) => <PostCard key={r._id} p={r} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
