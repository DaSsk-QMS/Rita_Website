import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Clock, Mail, Menu, Phone, Search, X, ArrowRight, Megaphone, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSite } from '../../context/SiteContext.jsx';
import { useScrolled } from '../../lib/hooks.js';
import { DynIcon, SOCIAL_ICONS } from '../../lib/icons.jsx';
import { Logo } from '../ui/Common.jsx';
import SearchOverlay from './SearchOverlay.jsx';

export function SocialLinks({ className = '', itemClass = '', size = 16 }) {
  const { settings } = useSite();
  const social = settings.social || {};
  const items = Object.entries(SOCIAL_ICONS).filter(([k]) => social[k]);
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map(([k, Icon]) => (
        <a key={k} href={social[k]} target="_blank" rel="noreferrer" aria-label={k} className={itemClass}>
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}

function useMenu() {
  const { settings, services } = useSite();
  return (settings.menu || []).filter((m) => !m.hidden && m.label).map((m) =>
    m.autoServices ? { ...m, children: services.map((s) => ({ label: s.title, path: `/services/${s.slug}`, icon: s.icon, text: s.shortDescription })) } : m
  );
}

export default function Header() {
  const { settings } = useSite();
  const g = settings.general || {};
  const c = settings.contact || {};
  const menu = useMenu();
  const { user } = useAuth() || {};
  const showLogin = g.showAdminLink !== false;
  const loginTo = user ? '/admin' : '/admin/login';
  const loginLabel = user ? 'Dashboard' : 'Login';
  const LoginIcon = user ? LayoutDashboard : LogIn;
  const { pathname } = useLocation();
  const scrolled = useScrolled(30);
  const [mobile, setMobile] = useState(false);
  const [openSub, setOpenSub] = useState(null);
  const [search, setSearch] = useState(false);
  const [announce, setAnnounce] = useState(() => sessionStorage.getItem('rita_announce') !== 'off');
  const transparent = settings.theme?.headerStyle !== 'solid' && !scrolled;
  const closeSearch = useCallback(() => setSearch(false), []);

  useEffect(() => { setMobile(false); setOpenSub(null); }, [pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showAnnounce = g.showAnnouncement && g.announcement && announce;
  const linkBase = transparent ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-primary';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {showAnnounce && !scrolled && (
          <div className="relative bg-accent px-10 py-2 text-center text-xs font-semibold text-secondary sm:text-sm">
            <Megaphone size={14} className="mr-2 inline" />
            {g.announcement}
            <button aria-label="Dismiss" onClick={() => { setAnnounce(false); sessionStorage.setItem('rita_announce', 'off'); }} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

        {g.showTopbar && (
          <div className={`hidden overflow-hidden border-b border-white/10 bg-secondary text-white/80 transition-all duration-500 lg:block ${scrolled ? 'max-h-0 border-0' : 'max-h-12'}`}>
            <div className="container-x flex h-10 items-center justify-between text-xs">
              <div className="flex items-center gap-6">
                {c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-accent"><Phone size={13} /> {c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-accent"><Mail size={13} /> {c.email}</a>}
                {c.workingHours && <span className="flex items-center gap-1.5"><Clock size={13} /> {c.workingHours}</span>}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/60">{g.tagline}</span>
                <SocialLinks size={13} itemClass="grid h-6 w-6 place-items-center rounded-full transition hover:bg-accent hover:text-secondary" />
                {showLogin && (
                  <Link to={loginTo} className="ml-1 flex items-center gap-1.5 border-l border-white/15 pl-4 font-semibold text-white hover:text-accent">
                    <LoginIcon size={13} /> {user ? 'Admin Dashboard' : 'Admin Login'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`transition-all duration-500 ${transparent ? 'bg-transparent' : 'bg-white/90 shadow-[0_10px_40px_-15px_rgba(10,26,51,0.25)] backdrop-blur-xl'}`}>
          <div className={`container-x flex items-center justify-between gap-6 transition-all duration-500 ${scrolled ? 'h-[70px]' : 'h-[84px]'}`}>
            <Link to="/" aria-label="Home"><Logo light={transparent} /></Link>

            <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
              {menu.map((item) => (
                <div key={item.label} className="group relative">
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `relative flex items-center gap-1 px-3.5 py-2 text-[15px] font-semibold transition ${linkBase} ${isActive ? (transparent ? '!text-accent' : '!text-primary') : ''}`}
                  >
                    {item.label}
                    {item.children?.length > 0 && <ChevronDown size={15} className="transition group-hover:rotate-180" />}
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded bg-accent transition-transform duration-300 group-hover:scale-x-100" />
                  </NavLink>
                  {item.children?.length > 0 && (
                    <div className={`invisible absolute left-1/2 top-full z-50 ${item.children.length > 4 ? 'w-[640px]' : 'w-72'} -translate-x-1/2 translate-y-3 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100`}>
                      <div className={`grid ${item.children.length > 4 ? 'grid-cols-2' : 'grid-cols-1'} gap-1 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl shadow-secondary/15`}>
                        {item.children.map((ch) => (
                          <Link key={ch.path + ch.label} to={ch.path} className="group/item flex gap-3 rounded-xl p-3 transition hover:bg-surface">
                            {ch.icon && (
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover/item:bg-primary group-hover/item:text-white">
                                <DynIcon name={ch.icon} size={19} />
                              </span>
                            )}
                            <span>
                              <span className="block text-sm font-semibold text-secondary">{ch.label}</span>
                              {ch.text && <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">{ch.text}</span>}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => setSearch(true)} aria-label="Search" className={`grid h-11 w-11 place-items-center rounded-full transition ${transparent ? 'text-white hover:bg-white/10' : 'text-secondary hover:bg-surface'}`}>
                <Search size={20} />
              </button>
              {showLogin && (
                <Link to={loginTo} title={user ? 'Go to admin dashboard' : 'Admin login'}
                  className={`hidden items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition md:inline-flex ${transparent ? 'border-white/30 text-white hover:bg-white hover:text-secondary' : 'border-primary/20 text-primary hover:bg-primary hover:text-white'}`}>
                  <LoginIcon size={16} /> {loginLabel}
                </Link>
              )}
              {g.headerCtaText !== '' && (
                <Link to={g.headerCtaLink || '/contact'} className="btn-accent hidden !py-2.5 sm:inline-flex">
                  {g.headerCtaText || 'Get a Quote'} <ArrowRight size={16} />
                </Link>
              )}
              <button onClick={() => setMobile(true)} aria-label="Open menu" className={`grid h-11 w-11 place-items-center rounded-full xl:hidden ${transparent ? 'text-white' : 'text-secondary'}`}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className="fixed inset-0 z-[60] bg-secondary/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
            <motion.aside
              className="fixed inset-y-0 right-0 z-[61] flex w-[88%] max-w-sm flex-col bg-white shadow-2xl"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <div className="flex items-center justify-between border-b p-5">
                <Logo />
                <button onClick={() => setMobile(false)} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full bg-surface"><X size={20} /></button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                {menu.map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <NavLink to={item.path} end={item.path === '/'} className={({ isActive }) => `block flex-1 py-3.5 font-semibold ${isActive ? 'text-primary' : 'text-secondary'}`}>{item.label}</NavLink>
                      {item.children?.length > 0 && (
                        <button onClick={() => setOpenSub(openSub === i ? null : i)} className="p-2" aria-label="Expand">
                          <ChevronDown size={18} className={`transition ${openSub === i ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {openSub === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          {item.children.map((ch) => (
                            <Link key={ch.path + ch.label} to={ch.path} className="block py-2 pl-4 text-sm text-slate-600 hover:text-primary">{ch.label}</Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </nav>
              <div className="space-y-3 border-t p-5 text-sm">
                {c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-slate-600"><Phone size={16} className="text-primary" />{c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-slate-600"><Mail size={16} className="text-primary" />{c.email}</a>}
                <SocialLinks itemClass="grid h-9 w-9 place-items-center rounded-full bg-surface text-secondary hover:bg-primary hover:text-white" />
                <Link to={g.headerCtaLink || '/contact'} className="btn-primary w-full">{g.headerCtaText || 'Get a Quote'}</Link>
                {showLogin && <Link to={loginTo} className="btn-ghost w-full"><LoginIcon size={16} /> {user ? 'Admin Dashboard' : 'Admin Login'}</Link>}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={search} onClose={closeSearch} />
    </>
  );
}
