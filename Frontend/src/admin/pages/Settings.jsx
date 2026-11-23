import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Globe, Home, Menu as MenuIcon, Phone, Share2, Palette, PanelBottom, Search, AtSign, DatabaseBackup, Save, RotateCcw,
  GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Send, Download, Upload, Sparkles, ExternalLink, CheckCircle2,
} from 'lucide-react';
import { api, errMsg, img } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSite, applyTheme } from '../../context/SiteContext.jsx';
import { defaultSettings } from '../../data/defaults.js';
import { PageHeader, Panel, ConfirmButton, abtnGhost, abtnPrimary, abtnDanger } from '../components/UI.jsx';
import { FieldGrid, FieldInput, Switch } from '../components/Fields.jsx';
import { PageLoader, Spinner } from '../../components/ui/Loaders.jsx';

// ---------------------------------------------------------------- field definitions
const FONTS = ['Inter', 'Plus Jakarta Sans', 'Poppins', 'Montserrat', 'Manrope', 'DM Sans', 'Outfit', 'Sora', 'Space Grotesk', 'Lexend', 'Urbanist', 'Figtree', 'Raleway', 'Roboto', 'Open Sans', 'Lato', 'Nunito', 'Work Sans', 'Playfair Display', 'Merriweather', 'system-ui', 'Georgia', 'Arial'];

const F = {
  general: [
    { section: 'Brand' },
    { name: 'siteName', label: 'Company / site name', required: true },
    { name: 'shortName', label: 'Short name', half: true },
    { name: 'tagline', label: 'Tagline', half: true },
    { name: 'logoText', label: 'Logo text (used when no logo image)', half: true },
    { name: 'logoSubText', label: 'Logo sub-text', half: true },
    { name: 'logo', label: 'Logo (on light background)', type: 'image' },
    { name: 'logoDark', label: 'Logo for dark backgrounds (header over hero, footer)', type: 'image' },
    { name: 'favicon', label: 'Favicon (square PNG/SVG/ICO)', type: 'image' },
    { section: 'Header' },
    { name: 'headerCtaText', label: 'Header button text (empty = hidden)', half: true },
    { name: 'headerCtaLink', label: 'Header button link', half: true },
    { name: 'showTopbar', label: 'Show top contact bar', type: 'switch', half: true },
    { name: 'showAnnouncement', label: 'Show announcement strip', type: 'switch', half: true },
    { name: 'announcement', label: 'Announcement text' },
    { section: 'About content' },
    { name: 'aboutTitle', label: 'About heading' },
    { name: 'aboutShort', label: 'Short introduction (home page)', type: 'textarea', rows: 3 },
    { name: 'aboutContent', label: 'Full about text (About page)', type: 'richtext' },
    { name: 'aboutImage', label: 'Main about image', type: 'image' },
    { name: 'aboutImage2', label: 'Secondary image', type: 'image' },
    { name: 'experienceYears', label: 'Experience badge (e.g. 15+)', half: true },
    { name: 'mission', label: 'Mission', type: 'textarea', rows: 2 },
    { name: 'vision', label: 'Vision', type: 'textarea', rows: 2 },
    { name: 'values', label: 'Values', type: 'textarea', rows: 2 },
    { section: 'Website features' },
    { name: 'showPreloader', label: 'Animated preloader', type: 'switch', half: true },
    { name: 'showBackToTop', label: 'Back-to-top button', type: 'switch', half: true },
    { name: 'showWhatsappButton', label: 'Floating WhatsApp button', type: 'switch', half: true },
    { name: 'showFloatingSocial', label: 'Floating social bar (desktop)', type: 'switch', half: true },
    { name: 'showCookieBanner', label: 'Cookie notice', type: 'switch', half: true },
    { name: 'cookieText', label: 'Cookie notice text', type: 'textarea', rows: 2 },
    { name: 'showVisitorCounter', label: 'Public visitor counter in footer', type: 'switch', half: true },
    { name: 'showAdminLink', label: 'Show "Login" button (header, top bar, footer)', type: 'switch', half: true },
    { name: 'visitorCounterLabel', label: 'Visitor counter label', half: true },
    { name: 'visitorCounterOffset', label: 'Add to counter (visits before analytics started)', type: 'number', min: 0, half: true },
    { section: 'Feedback page (/feedback)' },
    { name: 'feedbackTitle', label: 'Heading' },
    { name: 'feedbackText', label: 'Introduction', type: 'textarea', rows: 2 },
    { section: 'Maintenance' },
    { name: 'maintenanceMode', label: 'Maintenance mode — hide the public website (admin stays available)', type: 'switch' },
    { name: 'maintenanceMessage', label: 'Maintenance message', type: 'textarea', rows: 2 },
  ],
  home: [
    { section: 'Hero slideshow' },
    { name: 'sliderAutoplay', label: 'Autoplay', type: 'switch', half: true },
    { name: 'sliderDelay', label: 'Delay per slide (ms)', type: 'number', min: 2000, max: 20000, half: true },
    { name: 'sliderEffect', label: 'Transition effect', type: 'select', required: true, options: [{ value: 'fade', label: 'Cross-fade' }, { value: 'slide', label: 'Slide' }, { value: 'creative', label: 'Creative parallax' }], half: true },
    { section: 'Services' },
    { name: 'servicesTitle', label: 'Services heading', half: true },
    { name: 'servicesSubtitle', label: 'Services sub-heading', half: true },
    { section: 'Stats counter' },
    { name: 'stats', label: 'Counters', type: 'repeater', itemLabel: 'Counter', fields: [{ name: 'label', label: 'Label' }, { name: 'value', label: 'Number', type: 'number' }, { name: 'suffix', label: 'Suffix (+, %, k)' }] },
    { section: 'Why choose us' },
    { name: 'whyUsTitle', label: 'Heading' },
    { name: 'whyUs', label: 'Reasons', type: 'repeater', itemLabel: 'Reason', fields: [{ name: 'title', label: 'Title' }, { name: 'text', label: 'Text', type: 'textarea', rows: 2 }, { name: 'icon', label: 'Icon', type: 'icon' }] },
    { section: 'Process' },
    { name: 'processTitle', label: 'Heading' },
    { name: 'process', label: 'Steps', type: 'repeater', itemLabel: 'Step', fields: [{ name: 'title', label: 'Title' }, { name: 'text', label: 'Text', type: 'textarea', rows: 2 }] },
    { section: 'Standards' },
    { name: 'standardsTitle', label: 'Heading' },
    { name: 'standards', label: 'Standards (also used in the scrolling ticker)', type: 'repeater', itemLabel: 'Standard', fields: [{ name: 'code', label: 'Code' }, { name: 'title', label: 'Title' }, { name: 'text', label: 'Description', type: 'textarea', rows: 2 }] },
    { section: 'Other headings' },
    { name: 'clientsTitle', label: 'Clients heading', half: true },
    { name: 'testimonialsTitle', label: 'Testimonials heading', half: true },
    { name: 'blogTitle', label: 'Blog heading', half: true },
    { section: 'Call to action banner' },
    { name: 'ctaTitle', label: 'Heading' },
    { name: 'ctaText', label: 'Text', type: 'textarea', rows: 2 },
    { name: 'ctaButton', label: 'Button text', half: true },
    { name: 'ctaImage', label: 'Background image', type: 'image' },
    { section: 'Areas we serve (local SEO)' },
    { name: 'locationsTitle', label: 'Heading' },
    { name: 'locationsSubtitle', label: 'Text', type: 'textarea', rows: 2 },
  ],
  menu: {
    name: 'menu', label: 'Navigation items', type: 'repeater', itemLabel: 'Menu item',
    fields: [
      { name: 'label', label: 'Label' },
      { name: 'path', label: 'Link (e.g. /about or https://…)' },
      { name: 'autoServices', label: 'Auto dropdown with all services', type: 'switch' },
      { name: 'hidden', label: 'Hide this item', type: 'switch' },
      { name: 'children', label: 'Custom dropdown links', type: 'repeater', itemLabel: 'Sub-link', fields: [{ name: 'label', label: 'Label' }, { name: 'path', label: 'Link' }] },
    ],
  },
  contact: [
    { name: 'email', label: 'Primary email', type: 'email', half: true },
    { name: 'email2', label: 'Secondary / careers email', type: 'email', half: true },
    { name: 'phone', label: 'Phone', half: true },
    { name: 'phone2', label: 'Second phone', half: true },
    { name: 'whatsapp', label: 'WhatsApp number (country code, digits only)', half: true },
    { name: 'workingHours', label: 'Working hours', half: true },
    { name: 'address', label: 'Address', type: 'textarea', rows: 2 },
    { name: 'mapEmbed', label: 'Google Maps embed URL', help: 'Google Maps → Share → Embed a map → copy the src="…" URL (pasting the whole <iframe> code also works).' },
  ],
  social: [
    { name: 'linkedin', label: 'LinkedIn URL', half: true },
    { name: 'facebook', label: 'Facebook URL', half: true },
    { name: 'twitter', label: 'X (Twitter) URL', half: true },
    { name: 'instagram', label: 'Instagram URL', half: true },
    { name: 'youtube', label: 'YouTube URL', half: true },
    { name: 'whatsapp', label: 'WhatsApp link (https://wa.me/…)', half: true },
  ],
  theme: [
    { section: 'Colours' },
    { name: 'primary', label: 'Primary', type: 'color', half: true },
    { name: 'secondary', label: 'Secondary (dark)', type: 'color', half: true },
    { name: 'accent', label: 'Accent', type: 'color', half: true },
    { name: 'text', label: 'Body text', type: 'color', half: true },
    { name: 'background', label: 'Page background', type: 'color', half: true },
    { name: 'surface', label: 'Section surface', type: 'color', half: true },
    { section: 'Typography & shape' },
    { name: 'headingFont', label: 'Heading font', type: 'select', required: true, options: FONTS, half: true },
    { name: 'bodyFont', label: 'Body font', type: 'select', required: true, options: FONTS, half: true },
    { name: 'radius', label: 'Card corner radius (px)', type: 'number', min: 0, max: 40, half: true },
    { name: 'buttonStyle', label: 'Button shape', type: 'select', required: true, options: [{ value: 'pill', label: 'Pill' }, { value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }], half: true },
    { name: 'headerStyle', label: 'Header style', type: 'select', required: true, options: [{ value: 'transparent', label: 'Transparent over hero' }, { value: 'solid', label: 'Always solid' }], half: true },
    { name: 'heroOverlay', label: 'Hero image darkness (0–100)', type: 'number', min: 0, max: 100, half: true },
    { section: 'Motion' },
    { name: 'animations', label: 'Enable animations', type: 'switch', half: true },
    { name: 'spotlight', label: 'Cursor glow on cards', type: 'switch', half: true },
    { name: 'animationStyle', label: 'Scroll reveal style', type: 'select', required: true, half: true, options: [{ value: 'up', label: 'Fade up' }, { value: 'zoom', label: 'Zoom in' }, { value: 'fade', label: 'Fade' }, { value: 'left', label: 'Slide from left' }, { value: 'blur', label: 'Blur in' }, { value: 'flip', label: '3D flip' }] },
    { name: 'animationSpeed', label: 'Animation speed', type: 'select', required: true, half: true, options: [{ value: 0.6, label: 'Fast' }, { value: 1, label: 'Normal' }, { value: 1.4, label: 'Relaxed' }, { value: 2, label: 'Slow' }] },
  ],
  footer: [
    { name: 'about', label: 'Footer about text', type: 'textarea', rows: 3 },
    { name: 'copyright', label: 'Copyright line', help: '{year} is replaced with the current year' },
    { name: 'showNewsletter', label: 'Show newsletter signup', type: 'switch' },
    { name: 'newsletterTitle', label: 'Newsletter heading', half: true },
    { name: 'newsletterText', label: 'Newsletter text', half: true },
    { name: 'showLocations', label: 'Show "Areas we serve" links (good for local SEO)', type: 'switch', half: true },
    { name: 'locationsTitle', label: 'Areas heading', half: true },
    { name: 'bottomLinks', label: 'Bottom links', type: 'repeater', itemLabel: 'Link', fields: [{ name: 'label', label: 'Label' }, { name: 'path', label: 'Link' }] },
  ],
  pages: [
    { name: 'privacy', label: 'Privacy policy page', type: 'richtext' },
    { name: 'terms', label: 'Terms of use page', type: 'richtext' },
  ],
  seo: [
    { name: 'siteUrl', label: 'Live website URL', help: 'Used in the sitemap, canonical links and emails, e.g. https://www.yourdomain.com' },
    { name: 'metaTitle', label: 'Home page title' },
    { name: 'titleSuffix', label: 'Suffix added to other page titles' },
    { name: 'metaDescription', label: 'Default meta description', type: 'textarea', rows: 3 },
    { name: 'keywords', label: 'Default keywords', type: 'textarea', rows: 2 },
    { name: 'ogImage', label: 'Default social share image (1200×630)', type: 'image' },
    { name: 'googleAnalyticsId', label: 'Google Analytics 4 ID (G-XXXX)', half: true },
    { name: 'googleSiteVerification', label: 'Google Search Console verification code', half: true },
    { name: 'bingSiteVerification', label: 'Bing Webmaster verification code', half: true },
    { name: 'allowIndexing', label: 'Allow search engines to index the site', type: 'switch' },
    { section: 'Local SEO — business location (must match your Google Business Profile exactly)' },
    { name: 'businessType', label: 'Business type (schema.org)', type: 'select', required: true, half: true, options: [{ value: 'ProfessionalService', label: 'Professional service' }, { value: 'LocalBusiness', label: 'Local business' }, { value: 'Organization', label: 'Organization' }] },
    { name: 'foundingYear', label: 'Year founded', half: true },
    { name: 'streetAddress', label: 'Street address', help: 'Building, street, area — e.g. "Plot 12, HITEC City, Madhapur"' },
    { name: 'localCity', label: 'City', half: true },
    { name: 'localRegion', label: 'State', half: true },
    { name: 'postalCode', label: 'PIN code', half: true },
    { name: 'regionCode', label: 'Region code (geo tag)', half: true, help: 'IN-TG = Telangana' },
    { name: 'latitude', label: 'Latitude', type: 'number', half: true, help: 'Google Maps → right-click your office → copy coordinates' },
    { name: 'longitude', label: 'Longitude', type: 'number', half: true },
    { name: 'areaServed', label: 'Cities / districts served', type: 'textarea', rows: 2, help: 'Comma separated. Added to structured data; create landing pages in Areas We Serve.' },
    { name: 'openingHours', label: 'Opening hours (schema format)', half: true, help: 'e.g. Mo-Fr 09:30-18:30' },
    { name: 'languages', label: 'Languages spoken', half: true },
  ],
  smtp: [
    { section: 'Server' },
    { name: 'host', label: 'SMTP host', half: true, placeholder: 'smtp.gmail.com' },
    { name: 'port', label: 'Port', type: 'number', half: true },
    { name: 'user', label: 'Username', half: true },
    { name: 'pass', label: 'Password / app password', type: 'password', half: true },
    { name: 'secure', label: 'Use SSL/TLS (port 465)', type: 'switch' },
    { section: 'Sender & notifications' },
    { name: 'fromName', label: 'From name', half: true },
    { name: 'fromEmail', label: 'From email', type: 'email', half: true },
    { name: 'notifyEmail', label: 'Send new enquiry/application alerts to', type: 'email' },
    { section: 'Auto-reply to visitors' },
    { name: 'autoReply', label: 'Send automatic confirmation email', type: 'switch' },
    { name: 'autoReplySubject', label: 'Subject' },
    { name: 'autoReplyMessage', label: 'Message', type: 'textarea', rows: 4 },
  ],
};

const TABS = [
  { id: 'general', label: 'General', icon: Globe, sections: ['general'] },
  { id: 'home', label: 'Home Page', icon: Home, sections: ['home'] },
  { id: 'menu', label: 'Menu', icon: MenuIcon, sections: ['menu'] },
  { id: 'contact', label: 'Contact', icon: Phone, sections: ['contact'] },
  { id: 'social', label: 'Social', icon: Share2, sections: ['social'] },
  { id: 'theme', label: 'Theme', icon: Palette, sections: ['theme'] },
  { id: 'footer', label: 'Footer & Legal', icon: PanelBottom, sections: ['footer', 'pages'] },
  { id: 'seo', label: 'SEO', icon: Search, sections: ['seo'] },
  { id: 'smtp', label: 'Email', icon: AtSign, sections: ['smtp'], role: 'admin' },
  { id: 'backup', label: 'Backup', icon: DatabaseBackup, sections: [], role: 'admin' },
];

const HOME_SECTIONS = {
  slider: ['Hero slideshow', 'showSlider'], ticker: ['Standards ticker', 'showTicker'], about: ['About', 'showAbout'],
  services: ['Services', 'showServices'], stats: ['Stats counter', 'showStats'], whyUs: ['Why choose us', 'showWhyUs'],
  process: ['Process steps', 'showProcess'], standards: ['Standards grid', 'showStandards'], clients: ['Clients marquee', 'showClients'],
  testimonials: ['Testimonials', 'showTestimonials'], locations: ['Areas we serve (Telangana)', 'showLocations'], blog: ['Latest posts', 'showBlog'], cta: ['Call to action', 'showCta'],
};

const PRESETS = [
  { name: 'Rail Blue', primary: '#0b4fa8', secondary: '#0a1a33', accent: '#f5a524', surface: '#f4f7fb' },
  { name: 'Signal Red', primary: '#c81e1e', secondary: '#1a0b0b', accent: '#f8b400', surface: '#fbf5f4' },
  { name: 'Emerald', primary: '#047857', secondary: '#062925', accent: '#facc15', surface: '#f1f8f5' },
  { name: 'Royal Violet', primary: '#6d28d9', secondary: '#160b2e', accent: '#22d3ee', surface: '#f6f4fd' },
  { name: 'Ocean Teal', primary: '#0e7490', secondary: '#082f3a', accent: '#fb923c', surface: '#f1f8fa' },
  { name: 'Graphite', primary: '#334155', secondary: '#0f172a', accent: '#38bdf8', surface: '#f5f7fa' },
];

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const iframeSrc = (v) => (typeof v === 'string' && v.includes('<iframe') ? (v.match(/src=["']([^"']+)["']/) || [])[1] || v : v);

// ---------------------------------------------------------------- custom editors
function HomeSections({ home, setHome }) {
  const keys = Object.keys(HOME_SECTIONS);
  const order = [...new Set([...(home.sectionOrder || []), ...keys])].filter((k) => HOME_SECTIONS[k]);
  const [dragging, setDragging] = useState(null);
  const move = (from, to) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setHome((h) => ({ ...h, sectionOrder: next }));
  };
  return (
    <Panel title="Page sections" actions={<span className="text-xs text-slate-400">Drag to reorder · eye to show/hide</span>}>
      <ul className="space-y-2">
        {order.map((k, i) => {
          const [label, flag] = HOME_SECTIONS[k];
          const visible = (k === 'ticker' ? home.showTicker ?? home.showStandards : home[flag]) !== false;
          return (
            <motion.li
              layout key={k} draggable
              onDragStart={() => setDragging(i)} onDragEnd={() => setDragging(null)}
              onDragOver={(e) => { e.preventDefault(); if (dragging !== null && dragging !== i) { move(dragging, i); setDragging(i); } }}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${dragging === i ? 'border-primary bg-primary/5 shadow-lg' : 'border-slate-200 bg-white'} ${visible ? '' : 'opacity-50'}`}
            >
              <GripVertical size={16} className="cursor-grab text-slate-400" />
              <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
              <span className="flex-1 text-sm font-semibold text-slate-700">{label}</span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded p-1 hover:bg-slate-100 disabled:opacity-20" aria-label="Move up"><ArrowUp size={14} /></button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === order.length - 1} className="rounded p-1 hover:bg-slate-100 disabled:opacity-20" aria-label="Move down"><ArrowDown size={14} /></button>
              <button type="button" onClick={() => setHome((h) => ({ ...h, [flag]: !visible }))} className={`rounded-lg p-1.5 ${visible ? 'text-primary hover:bg-primary/10' : 'text-slate-400 hover:bg-slate-100'}`} aria-label={visible ? 'Hide section' : 'Show section'}>
                {visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Panel>
  );
}

function ThemePreview({ theme, setTheme }) {
  return (
    <div className="space-y-6">
      <Panel title={<span className="flex items-center gap-2"><Sparkles size={16} /> Colour presets</span>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRESETS.map((p) => {
            const active = p.primary === theme.primary && p.accent === theme.accent;
            return (
              <button type="button" key={p.name} onClick={() => setTheme((t) => ({ ...t, ...p, name: undefined }))} className={`group rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'}`}>
                <div className="flex h-8 overflow-hidden rounded-lg">{[p.secondary, p.primary, p.accent, p.surface].map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</div>
                <span className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-700">{p.name}{active && <CheckCircle2 size={14} className="text-primary" />}</span>
              </button>
            );
          })}
        </div>
      </Panel>
      <Panel title="Live preview" actions={<span className="flex items-center gap-1.5 text-xs text-green-600"><span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Updates as you edit</span>}>
        <div className="overflow-hidden rounded-brand border" style={{ background: theme.background, color: theme.text }}>
          <div className="relative overflow-hidden p-6 text-white" style={{ background: theme.secondary }}>
            <div className="absolute -right-8 -top-8 h-32 w-32 animate-aurora rounded-full blur-2xl" style={{ background: theme.primary, opacity: 0.6 }} />
            <p className="relative text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>Eyebrow label</p>
            <p className="relative mt-2 font-heading text-2xl font-extrabold">Independent assurance</p>
            <div className="relative mt-4 flex flex-wrap gap-2">
              <span className="btn-accent !px-4 !py-2 !text-xs">Primary action</span>
              <span className="btn-outline !px-4 !py-2 !text-xs">Secondary</span>
            </div>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2" style={{ background: theme.surface }}>
            {['Safety assessment', 'RAMS engineering'].map((t) => (
              <div key={t} className="rounded-brand bg-white p-4 shadow-sm">
                <span className="grid h-9 w-9 place-items-center rounded-lg text-white" style={{ background: theme.primary }}>✓</span>
                <p className="mt-3 font-heading font-bold" style={{ color: theme.secondary }}>{t}</p>
                <p className="mt-1 text-xs opacity-70">Body text in {theme.bodyFont}.</p>
              </div>
            ))}
          </div>
          <div className="p-5"><span className="btn-primary !px-4 !py-2 !text-xs">Button style: {theme.buttonStyle}</span></div>
        </div>
      </Panel>
    </div>
  );
}

function LocalSeoChecklist({ seo, contact }) {
  const items = [
    ['Live website URL set', seo.siteUrl && !seo.siteUrl.includes('localhost')],
    ['Street address', !!seo.streetAddress],
    ['PIN code', !!seo.postalCode],
    ['City & state', !!seo.localCity && !!seo.localRegion],
    ['Map coordinates', !!seo.latitude && !!seo.longitude],
    ['Phone number (not placeholder)', !!contact?.phone && !/0000/.test(contact.phone)],
    ['Email (not placeholder)', !!contact?.email && !/yourdomain/.test(contact.email)],
    ['Google Search Console verified', !!seo.googleSiteVerification],
    ['Title mentions your city', new RegExp(seo.localCity || 'Hyderabad', 'i').test(seo.metaTitle || '')],
    ['Search engines allowed', seo.allowIndexing !== false],
  ];
  const done = items.filter(([, ok]) => ok).length;
  return (
    <Panel title="Local SEO readiness" actions={<span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${done === items.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{done}/{items.length}</span>}>
      <ul className="space-y-2">
        {items.map(([label, ok]) => (
          <li key={label} className={`flex items-center gap-2 text-sm ${ok ? 'text-slate-600' : 'font-medium text-amber-700'}`}>
            {ok ? <CheckCircle2 size={15} className="shrink-0 text-green-600" /> : <span className="grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border-2 border-amber-400" />}{label}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-slate-400">Tip: create a free Google Business Profile for your office using exactly the same name, address and phone (NAP) as entered here, then add service-area pages under <b>Areas We Serve</b>.</p>
    </Panel>
  );
}

function SeoPreview({ seo, contact }) {
  const desc = seo.metaDescription || '';
  return (
    <div className="space-y-6">
    <Panel title="Google search preview">
      <div className="rounded-xl border bg-white p-4 font-[arial,sans-serif]">
        <p className="truncate text-xs text-slate-600">{seo.siteUrl || 'https://www.yourdomain.com'}</p>
        <p className="mt-1 truncate text-lg text-[#1a0dab]">{seo.metaTitle || 'Page title'}</p>
        <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{desc}</p>
      </div>
      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        {[['Title', (seo.metaTitle || '').length, 30, 60], ['Description', desc.length, 120, 160]].map(([k, n, min, max]) => (
          <div key={k}>
            <div className="mb-1 flex justify-between"><span className="text-slate-500">{k} length</span><span className={n >= min && n <= max ? 'font-semibold text-green-600' : 'font-semibold text-amber-600'}>{n} / {max}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${n >= min && n <= max ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (n / max) * 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </Panel>
    <LocalSeoChecklist seo={seo} contact={contact} />
    </div>
  );
}

function SmtpTest() {
  const { user } = useAuth();
  const [to, setTo] = useState(user?.email || '');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    try { const { data } = await api.post('/admin/settings/test-email', { to }); toast.success(data.message); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Panel title="Send a test email">
      <p className="mb-3 text-sm text-slate-500">Save your settings first, then send a test to confirm delivery.</p>
      <div className="flex flex-wrap gap-2">
        <input type="email" value={to} onChange={(e) => setTo(e.target.value)} className="input !w-auto flex-1 !py-2" placeholder="recipient@example.com" />
        <button type="button" onClick={send} disabled={busy} className={abtnPrimary}>{busy ? <Spinner className="h-4 w-4" /> : <Send size={15} />} Send test</button>
      </div>
      <p className="mt-4 text-xs text-slate-400">Gmail: host smtp.gmail.com, port 465 with SSL on, and an app password (Google Account → Security → App passwords).</p>
    </Panel>
  );
}

function Backup({ saved, onImport }) {
  const fileRef = useRef(null);
  const exportJson = () => {
    const { smtp, updatedAt, ...rest } = saved;
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), settings: rest }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `website-settings-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const read = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        const s = json.settings || json;
        const sections = Object.keys(s).filter((k) => k in defaultSettings && k !== 'smtp');
        if (!sections.length) throw new Error('No recognised settings found in this file');
        onImport(Object.fromEntries(sections.map((k) => [k, s[k]])));
      } catch (e) { toast.error(`Invalid file: ${e.message}`); }
    };
    reader.readAsText(file);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Export settings">
        <p className="text-sm text-slate-500">Download every website setting (except email credentials) as a JSON file. Keep it as a backup or move it to another installation.</p>
        <button type="button" onClick={exportJson} className={`${abtnPrimary} mt-5`}><Download size={15} /> Download backup</button>
      </Panel>
      <Panel title="Import settings">
        <p className="text-sm text-slate-500">Load a backup file. The values are placed into the editor so you can review them, then click <b>Save changes</b>.</p>
        <button type="button" onClick={() => fileRef.current?.click()} className={`${abtnGhost} mt-5`}><Upload size={15} /> Choose backup file</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { read(e.target.files[0]); e.target.value = ''; }} />
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- page
export default function Settings() {
  const { tab = 'general' } = useParams();
  const { user } = useAuth();
  const site = useSite();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const siteTheme = useRef(site.settings.theme);
  siteTheme.current = site.settings.theme;

  const tabs = TABS.filter((t) => !t.role || t.role === user?.role);
  const current = tabs.find((t) => t.id === tab);

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => { setSaved(data); setDraft(data); }).catch((e) => toast.error(errMsg(e)));
  }, []);

  const dirty = useMemo(() => (saved && draft ? Object.keys(defaultSettings).filter((k) => !same(saved[k], draft[k])) : []), [saved, draft]);

  // Live theme preview, restored when leaving without saving
  useEffect(() => { if (draft?.theme) applyTheme(draft.theme); }, [draft?.theme]);
  useEffect(() => () => applyTheme(siteTheme.current), []);

  const save = useCallback(async () => {
    if (!dirty.length) return toast('No changes to save', { icon: 'ℹ️' });
    setSaving(true);
    try {
      let latest = saved;
      for (const section of dirty) {
        let value = draft[section];
        if (section === 'contact') value = { ...value, mapEmbed: iframeSrc(value.mapEmbed) };
        if (section === 'menu') value = value.filter((m) => m.label).map((m) => ({ ...m, children: (m.children || []).filter((c) => c.label && c.path) }));
        const { data } = await api.put(`/admin/settings/${section}`, value);
        latest = data;
      }
      setSaved(latest);
      setDraft(latest);
      await site.reload();
      toast.success(`Saved ${dirty.length} section${dirty.length > 1 ? 's' : ''}`);
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  }, [dirty, draft, saved, site]);

  // Ctrl/Cmd + S and unsaved-changes guard
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } };
    const onUnload = (e) => { if (dirty.length) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onUnload);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('beforeunload', onUnload); };
  }, [save, dirty.length]);

  if (!current) return <Navigate to="/admin/settings/general" replace />;
  if (!draft) return <PageLoader />;

  const setSection = (section) => (updater) => setDraft((d) => ({ ...d, [section]: typeof updater === 'function' ? updater(d[section]) : updater }));
  const resetSection = (section) => { setDraft((d) => ({ ...d, [section]: structuredClone(defaultSettings[section]) })); toast('Defaults loaded — click Save to apply', { icon: '↺' }); };
  const discard = () => { setDraft(saved); toast('Changes discarded'); };

  const titles = { general: 'General', home: 'Home page content', menu: 'Navigation menu', contact: 'Contact details', social: 'Social media', theme: 'Theme & style', footer: 'Footer', pages: 'Legal pages', seo: 'Search engine optimisation', smtp: 'Email (SMTP)' };

  return (
    <div className="pb-24">
      <PageHeader title="Website Settings" subtitle="Control the content, look and behaviour of the public website.">
        <a href="/" target="_blank" rel="noreferrer" className={abtnGhost}><ExternalLink size={15} /> Preview site</a>
      </PageHeader>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {tabs.map((t) => {
          const changed = t.sections.some((s) => dirty.includes(s));
          return (
            <NavLink key={t.id} to={`/admin/settings/${t.id}`} className={({ isActive }) => `relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="settingsTab" className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/30" transition={{ type: 'spring', damping: 26, stiffness: 300 }} />}
                  <t.icon size={15} className="relative" />
                  <span className="relative">{t.label}</span>
                  {changed && <span className="relative h-2 w-2 rounded-full bg-accent" title="Unsaved changes" />}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
        {tab === 'backup' && <Backup saved={saved} onImport={(patch) => { setDraft((d) => ({ ...d, ...patch })); toast.success(`${Object.keys(patch).length} sections loaded — review and save`); }} />}

        {tab === 'home' && <HomeSections home={draft.home} setHome={setSection('home')} />}

        {current.sections.map((section) => (
          <div key={section} className={tab === 'theme' || tab === 'seo' || tab === 'smtp' ? 'grid items-start gap-6 xl:grid-cols-5' : ''}>
            <Panel
              className={tab === 'theme' || tab === 'seo' || tab === 'smtp' ? 'xl:col-span-3' : ''}
              title={titles[section]}
              actions={<ConfirmButton onConfirm={() => resetSection(section)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100" label="Reset to defaults"><RotateCcw size={13} /> Defaults</ConfirmButton>}
            >
              {section === 'menu' ? (
                <>
                  <p className="mb-4 text-sm text-slate-500">Items appear in the header (and footer quick links) in this order. Turn on <b>Auto dropdown</b> to list all services under an item, or add custom dropdown links.</p>
                  <FieldInput field={F.menu} value={draft.menu} onChange={setSection('menu')} />
                </>
              ) : (
                <FieldGrid fields={F[section]} data={draft[section]} setData={setSection(section)} />
              )}
              {section === 'contact' && draft.contact.mapEmbed && (
                <div className="mt-5 overflow-hidden rounded-xl border"><iframe title="Map preview" src={iframeSrc(draft.contact.mapEmbed)} className="h-64 w-full border-0" loading="lazy" /></div>
              )}
              {section === 'general' && (draft.general.logo || draft.general.logoDark) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {draft.general.logo && <div className="grid h-24 place-items-center rounded-xl border bg-white"><img src={img(draft.general.logo)} alt="Logo" className="max-h-14" /></div>}
                  {draft.general.logoDark && <div className="grid h-24 place-items-center rounded-xl bg-secondary"><img src={img(draft.general.logoDark)} alt="Dark logo" className="max-h-14" /></div>}
                </div>
              )}
            </Panel>
            {tab === 'theme' && <div className="xl:sticky xl:top-20 xl:col-span-2"><ThemePreview theme={draft.theme} setTheme={setSection('theme')} /></div>}
            {tab === 'seo' && <div className="xl:sticky xl:top-20 xl:col-span-2"><SeoPreview seo={draft.seo} contact={draft.contact} /></div>}
            {tab === 'smtp' && <div className="xl:sticky xl:top-20 xl:col-span-2"><SmtpTest /></div>}
          </div>
        ))}

        {tab === 'general' && (
          <Panel title="Quick toggles overview">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[['showAnnouncement', 'Announcement'], ['showTopbar', 'Top bar'], ['showPreloader', 'Preloader'], ['showWhatsappButton', 'WhatsApp'], ['showCookieBanner', 'Cookie notice'], ['showVisitorCounter', 'Visitor counter'], ['showAdminLink', 'Login button'], ['maintenanceMode', 'Maintenance']].map(([k, l]) => (
                <div key={k} className="flex items-center justify-between rounded-xl border px-4 py-3"><span className="text-sm font-medium text-slate-700">{l}</span><Switch checked={!!draft.general[k]} onChange={(v) => setSection('general')((g) => ({ ...g, [k]: v }))} /></div>
              ))}
            </div>
          </Panel>
        )}
      </motion.div>

      {/* Sticky save bar */}
      <motion.div
        initial={false}
        animate={{ y: dirty.length ? 0 : 120, opacity: dirty.length ? 1 : 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        className="fixed inset-x-0 bottom-0 z-40 p-4 lg:left-64"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 shadow-2xl backdrop-blur">
          <p className="text-sm text-slate-600"><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />Unsaved changes in <b>{dirty.map((d) => titles[d] || d).join(', ')}</b></p>
          <div className="flex gap-2">
            <button type="button" onClick={discard} className={abtnDanger}>Discard</button>
            <button type="button" onClick={save} disabled={saving} className={abtnPrimary}>{saving ? <Spinner className="h-4 w-4" /> : <Save size={15} />} Save changes <kbd className="hidden rounded bg-white/20 px-1.5 text-[10px] sm:inline">Ctrl S</kbd></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
