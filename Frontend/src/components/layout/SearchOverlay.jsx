import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, ArrowRight, FileText, Briefcase, Layers } from 'lucide-react';
import { getPublic } from '../../lib/api.js';
import { useDebounce } from '../../lib/hooks.js';
import { Spinner } from '../ui/Loaders.jsx';

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const term = useDebounce(q.trim(), 300);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 100); document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = '';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  useEffect(() => {
    if (term.length < 2) { setRes(null); return; }
    let alive = true;
    setLoading(true);
    getPublic('/search', { q: term })
      .then(({ data }) => alive && setRes(data))
      .catch(() => alive && setRes({ services: [], posts: [], jobs: [] }))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [term]);

  const go = (to) => { onClose(); setQ(''); navigate(to); };
  const groups = res ? [
    { label: 'Services', icon: Layers, items: res.services.map((s) => ({ title: s.title, text: s.shortDescription, to: `/services/${s.slug}` })) },
    { label: 'Insights', icon: FileText, items: res.posts.map((p) => ({ title: p.title, text: p.excerpt, to: `/blog/${p.slug}` })) },
    { label: 'Careers', icon: Briefcase, items: res.jobs.map((j) => ({ title: j.title, text: `${j.location || ''} · ${j.type || ''}`, to: `/careers/${j.slug}` })) },
  ].filter((g) => g.items.length) : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] overflow-y-auto bg-secondary/95 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button onClick={onClose} aria-label="Close search" className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X /></button>
          <motion.div className="container-x max-w-3xl pb-16 pt-28" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`); }} className="relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50" size={28} />
              <input
                ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search services, insights, careers…"
                className="w-full border-b-2 border-white/20 bg-transparent py-5 pl-12 pr-12 font-heading text-2xl text-white outline-none placeholder:text-white/40 focus:border-accent sm:text-3xl"
              />
              {loading && <Spinner className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 text-accent" />}
            </form>
            <p className="mt-3 text-sm text-white/40">Press Enter to see all results · Esc to close · Ctrl + K to open</p>

            <div className="mt-10 space-y-8">
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent"><g.icon size={14} /> {g.label}</p>
                  <div className="space-y-2">
                    {g.items.slice(0, 5).map((it) => (
                      <button key={it.to} onClick={() => go(it.to)} className="group flex w-full items-center justify-between gap-4 rounded-xl bg-white/5 p-4 text-left transition hover:bg-white/10">
                        <span>
                          <span className="block font-semibold text-white">{it.title}</span>
                          {it.text && <span className="mt-1 line-clamp-1 block text-sm text-white/50">{it.text}</span>}
                        </span>
                        <ArrowRight size={18} className="shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-accent" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {res && !groups.length && !loading && <p className="text-white/60">No results for “{term}”. Try another keyword or <Link to="/contact" onClick={onClose} className="text-accent underline">ask us directly</Link>.</p>}
              {!res && (
                <div className="flex flex-wrap gap-2">
                  {['ISA', 'RAMS', 'EN 50128', 'EN 50129', 'ISO 22163', 'Signalling', 'Audit'].map((t) => (
                    <button key={t} onClick={() => setQ(t)} className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/70 hover:border-accent hover:text-accent">{t}</button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
