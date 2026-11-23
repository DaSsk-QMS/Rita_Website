import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUp, Wrench, Cookie } from 'lucide-react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { useSite } from '../../context/SiteContext.jsx';
import { SOCIAL_ICONS } from '../../lib/icons.jsx';
import { trackPageView } from '../../lib/analytics.js';
import { PageLoader } from '../ui/Loaders.jsx';
import { Logo } from '../ui/Common.jsx';
import { SiteSchema } from '../ui/Seo.jsx';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-gradient-to-r from-accent to-primary" />;
}

function FloatingSocial() {
  const { settings } = useSite();
  const social = settings.social || {};
  const items = Object.entries(SOCIAL_ICONS).filter(([k]) => social[k] && k !== 'whatsapp');
  if (!settings.general?.showFloatingSocial || !items.length) return null;
  return (
    <div className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col overflow-hidden rounded-r-2xl shadow-xl lg:flex">
      {items.map(([k, Icon]) => (
        <a key={k} href={social[k]} target="_blank" rel="noreferrer" aria-label={k} className="group flex h-11 w-11 items-center justify-center bg-secondary/90 text-white backdrop-blur transition-all hover:w-14 hover:bg-primary">
          <Icon size={17} />
        </a>
      ))}
    </div>
  );
}

function FloatingButtons() {
  const { settings } = useSite();
  const g = settings.general || {};
  const wa = settings.contact?.whatsapp || settings.social?.whatsapp;
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const WA = SOCIAL_ICONS.whatsapp;
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {g.showBackToTop && show && (
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition hover:-translate-y-1">
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
      {g.showWhatsappButton && wa && (
        <a href={wa.startsWith('http') ? wa : `https://wa.me/${wa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-600/40 transition hover:scale-110">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
          <WA size={28} />
        </a>
      )}
    </div>
  );
}

function Preloader() {
  const { settings, loaded } = useSite();
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1800);
    if (loaded) { const t2 = setTimeout(() => setDone(true), 350); return () => { clearTimeout(t); clearTimeout(t2); }; }
    return () => clearTimeout(t);
  }, [loaded]);
  if (!settings.general?.showPreloader) return null;
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-secondary" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
            <Logo light />
            <div className="h-1 w-40 overflow-hidden rounded bg-white/10">
              <motion.div className="h-full w-1/2 bg-accent" animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Maintenance() {
  const { settings } = useSite();
  return (
    <div className="grid min-h-screen place-items-center bg-secondary p-6 text-center text-white">
      <div>
        <Logo light className="justify-center" />
        <Wrench className="mx-auto mt-10 text-accent" size={48} />
        <h1 className="mt-6 text-4xl font-extrabold">We'll be back soon</h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">{settings.general?.maintenanceMessage || 'Our website is undergoing scheduled maintenance.'}</p>
        {settings.contact?.email && <a href={`mailto:${settings.contact.email}`} className="btn-accent mt-8">{settings.contact.email}</a>}
      </div>
    </div>
  );
}

function CookieBanner() {
  const { settings } = useSite();
  const g = settings.general || {};
  const [show, setShow] = useState(() => { try { return localStorage.getItem('rita_cookie_ok') !== '1'; } catch { return false; } });
  if (!g.showCookieBanner || !show) return null;
  const accept = () => { try { localStorage.setItem('rita_cookie_ok', '1'); } catch { /* ignore */ } setShow(false); };
  return (
    <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5, type: 'spring', damping: 22 }} className="fixed inset-x-4 bottom-4 z-[45] mx-auto flex max-w-2xl flex-col items-start gap-3 rounded-2xl border border-white/10 bg-secondary/95 p-4 text-sm text-white/80 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:pr-4">
      <Cookie size={22} className="shrink-0 text-accent" />
      <p className="flex-1">{g.cookieText} <Link to="/privacy-policy" className="font-semibold text-accent hover:underline">Privacy policy</Link></p>
      <button onClick={accept} className="btn-accent !px-5 !py-2">Got it</button>
    </motion.div>
  );
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  const { settings } = useSite();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    trackPageView(pathname);
  }, [pathname]);

  if (settings.general?.maintenanceMode) return <Maintenance />;

  return (
    <>
      <SiteSchema />
      <Preloader />
      <ScrollProgress />
      <Header />
      <main className="min-h-screen">
        <Suspense fallback={<div className="pt-40"><PageLoader /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <FloatingSocial />
      <FloatingButtons />
      <CookieBanner />
    </>
  );
}
