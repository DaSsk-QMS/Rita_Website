import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { usePublic } from '../lib/hooks.js';
import { img } from '../lib/api.js';
import { IMG } from '../data/defaults.js';
import Seo from '../components/ui/Seo.jsx';
import { PageHero, EmptyState } from '../components/ui/Common.jsx';
import { CardSkeletons } from '../components/ui/Loaders.jsx';

function Lightbox({ items, index, onClose, onNav }) {
  useEffect(() => {
    const on = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onNav(1); if (e.key === 'ArrowLeft') onNav(-1); };
    window.addEventListener('keydown', on);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', on); document.body.style.overflow = ''; };
  }, [onClose, onNav]);
  const it = items[index];
  return (
    <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <button className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close"><X /></button>
      <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous"><ChevronLeft /></button>
      <button onClick={(e) => { e.stopPropagation(); onNav(1); }} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next"><ChevronRight /></button>
      <motion.figure key={index} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img src={img(it.image)} alt={it.title} className="max-h-[80vh] w-auto rounded-xl object-contain" />
        <figcaption className="mt-4 text-center text-white">
          <p className="font-heading text-lg font-bold">{it.title}</p>
          {it.description && <p className="text-sm text-white/60">{it.description}</p>}
          <p className="mt-1 text-xs text-white/40">{index + 1} / {items.length}</p>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}

export default function Gallery() {
  const { data, loading } = usePublic('/gallery');
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);
  const cats = useMemo(() => ['All', ...new Set((data || []).map((g) => g.category).filter(Boolean))], [data]);
  const items = useMemo(() => (data || []).filter((g) => cat === 'All' || g.category === cat), [data, cat]);
  const nav = useCallback((d) => setOpen((i) => (i + d + items.length) % items.length), [items.length]);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <Seo title="Gallery" description="Projects, engineering and team gallery." />
      <PageHero title="Gallery" subtitle="A look at our projects, engineering work and team." image={IMG.steamViaduct} crumbs={[{ label: 'Gallery' }]} />
      <section className="py-20">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`relative rounded-full px-5 py-2 text-sm font-semibold transition ${cat === c ? 'text-white' : 'bg-surface text-slate-600 hover:text-primary'}`}>
                {cat === c && <motion.span layoutId="galTab" className="absolute inset-0 rounded-full bg-primary" />}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeletons count={6} className="h-64" /></div>
          ) : (
            <motion.div layout className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              <AnimatePresence>
                {items.map((g, i) => (
                  <motion.button
                    layout key={g._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                    onClick={() => setOpen(i)} className="group relative mb-4 block w-full overflow-hidden rounded-brand break-inside-avoid"
                  >
                    <img src={img(g.image)} alt={g.title} loading="lazy" className={`w-full object-cover transition duration-700 group-hover:scale-110 ${i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`} />
                    <span className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/70 text-white opacity-0 transition group-hover:opacity-100">
                      <ZoomIn size={32} className="text-accent" />
                      <span className="mt-3 font-heading font-bold">{g.title}</span>
                      <span className="text-xs text-white/70">{g.category}</span>
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
          {!loading && !items.length && <EmptyState title="No images yet" />}
        </div>
      </section>
      <AnimatePresence>{open !== null && items[open] && <Lightbox items={items} index={open} onClose={close} onNav={nav} />}</AnimatePresence>
    </>
  );
}
