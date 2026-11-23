import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Inbox, FileUser, Mail, Images, Layers, Newspaper, FolderTree, Briefcase, GalleryHorizontalEnd,
  Building2, MessageSquareQuote, Users, Search, ImageIcon, Settings, Home, Menu as MenuIcon, Palette, Share2, Phone,
  UserCog, LogOut, ExternalLink, X, ChevronDown, Globe, PanelBottom, AtSign, DatabaseBackup, MessageSquareHeart, MapPinned, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { api } from '../lib/api.js';
import { Logo } from '../components/ui/Common.jsx';
import { PageLoader } from '../components/ui/Loaders.jsx';

const NAV = [
  { group: 'Overview', items: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/analytics', label: 'Visitor Analytics', icon: BarChart3 },
  ] },
  { group: 'Leads', items: [
    { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: 'newEnquiries' },
    { to: '/admin/applications', label: 'Job Applications', icon: FileUser, badge: 'newApplications' },
    { to: '/admin/feedback', label: 'Client Feedback', icon: MessageSquareHeart, badge: 'newFeedback' },
    { to: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  ] },
  { group: 'Content', items: [
    { to: '/admin/slides', label: 'Hero Slideshow', icon: Images },
    { to: '/admin/services', label: 'Services', icon: Layers },
    { to: '/admin/posts', label: 'Blog Posts', icon: Newspaper },
    { to: '/admin/categories', label: 'Blog Categories', icon: FolderTree },
    { to: '/admin/jobs', label: 'Careers / Jobs', icon: Briefcase },
    { to: '/admin/gallery', label: 'Gallery', icon: GalleryHorizontalEnd },
    { to: '/admin/clients', label: 'Clients & Logos', icon: Building2 },
    { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { to: '/admin/team', label: 'Team', icon: Users },
    { to: '/admin/media', label: 'Media Library', icon: ImageIcon },
  ] },
  { group: 'Website', items: [
    { to: '/admin/settings/general', label: 'General', icon: Globe },
    { to: '/admin/settings/home', label: 'Home Page', icon: Home },
    { to: '/admin/settings/menu', label: 'Menu', icon: MenuIcon },
    { to: '/admin/settings/contact', label: 'Contact & Address', icon: Phone },
    { to: '/admin/settings/social', label: 'Social Media', icon: Share2 },
    { to: '/admin/settings/theme', label: 'Theme & Fonts', icon: Palette },
    { to: '/admin/settings/footer', label: 'Footer & Legal', icon: PanelBottom },
    { to: '/admin/settings/seo', label: 'SEO & Local SEO', icon: Search },
    { to: '/admin/locations', label: 'Areas We Serve', icon: MapPinned },
    { to: '/admin/page-seo', label: 'Page SEO', icon: Settings },
    { to: '/admin/settings/smtp', label: 'Email (SMTP)', icon: AtSign, role: 'admin' },
    { to: '/admin/settings/backup', label: 'Backup & Restore', icon: DatabaseBackup, role: 'admin' },
  ] },
  { group: 'Account', items: [
    { to: '/admin/users', label: 'Users', icon: UserCog, role: 'admin' },
    { to: '/admin/security', label: 'Security Centre', icon: ShieldCheck, role: 'admin' },
    { to: '/admin/profile', label: 'My Profile', icon: Settings },
  ] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSite();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setCounts(data.counts)).catch(() => {});
  }, [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0b1324] text-slate-300">
      <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
        <Link to="/admin"><Logo light className="scale-90 origin-left" /></Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 [scrollbar-width:thin]">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{g.group}</p>
            <div className="space-y-0.5">
              {g.items.filter((i) => !i.role || i.role === user?.role).map((i) => (
                <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-white/5 hover:text-white'}`}>
                  <i.icon size={17} /> <span className="flex-1">{i.label}</span>
                  {i.badge && counts[i.badge] > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-slate-900">{counts[i.badge]}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <a href="/" target="_blank" rel="noreferrer" className="m-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm hover:bg-white/5">
        <ExternalLink size={15} /> View website
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><MenuIcon /></button>
            <p className="hidden text-sm text-slate-500 sm:block">{settings.general?.siteName}</p>
          </div>
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-slate-100">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">{user?.name?.[0]}</span>
              <span className="hidden text-left sm:block"><span className="block text-sm font-semibold text-slate-800">{user?.name}</span><span className="block text-xs capitalize text-slate-500">{user?.role}</span></span>
              <ChevronDown size={16} />
            </button>
            {menu && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border bg-white py-1 shadow-xl">
                <Link to="/admin/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"><Settings size={15} /> My profile</Link>
                <button onClick={() => { logout(); navigate('/admin/login'); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut size={15} /> Log out</button>
              </div>
            )}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
        </main>
      </div>
    </div>
  );
}
