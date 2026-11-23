import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { useSite } from '../../context/SiteContext.jsx';
import { Spinner } from '../ui/Loaders.jsx';

const empty = { name: '', email: '', phone: '', company: '', service: '', subject: '', message: '', website: '' };

export default function EnquiryForm({ defaultService = '', compact = false, source = 'contact' }) {
  const { services, settings } = useSite();
  const [form, setForm] = useState({ ...empty, service: defaultService });
  const [busy, setBusy] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/public/enquiries', { ...form, source, _t: startedAt });
      toast.success(data.message);
      setDone(true);
      setForm({ ...empty, service: defaultService });
    } catch (err) {
      toast.error(err.response && typeof err.response.data === 'object'
        ? errMsg(err)
        : `We couldn't send your message right now. Please email us at ${settings.contact?.email}.`);
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
        <CheckCircle2 className="mx-auto text-green-500" size={64} />
        <h3 className="mt-4 text-2xl font-bold text-secondary">Message sent!</h3>
        <p className="mt-2 text-slate-600">Thank you for reaching out. We'll get back to you within one business day.</p>
        <button onClick={() => setDone(false)} className="btn-ghost mt-6">Send another message</button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Honeypot — hidden from humans */}
      <input type="text" name="website" value={form.website} onChange={set('website')} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <div><label className="label" htmlFor="eq-name">Full name *</label><input id="eq-name" required className="input" value={form.name} onChange={set('name')} placeholder="Your name" /></div>
        <div><label className="label" htmlFor="eq-email">Email *</label><input id="eq-email" required type="email" className="input" value={form.email} onChange={set('email')} placeholder="you@company.com" /></div>
        <div><label className="label" htmlFor="eq-phone">Phone</label><input id="eq-phone" className="input" value={form.phone} onChange={set('phone')} placeholder="+91 …" /></div>
        {!compact && <div><label className="label" htmlFor="eq-company">Company</label><input id="eq-company" className="input" value={form.company} onChange={set('company')} placeholder="Organisation" /></div>}
      </div>
      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <div>
          <label className="label" htmlFor="eq-service">Service of interest</label>
          <select id="eq-service" className="input" value={form.service} onChange={set('service')}>
            <option value="">Select a service</option>
            {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
            <option value="Other">Other</option>
          </select>
        </div>
        {!compact && <div><label className="label" htmlFor="eq-subject">Subject</label><input id="eq-subject" className="input" value={form.subject} onChange={set('subject')} placeholder="How can we help?" /></div>}
      </div>
      <div><label className="label" htmlFor="eq-msg">Message *</label><textarea id="eq-msg" required rows={compact ? 4 : 6} className="input resize-none" value={form.message} onChange={set('message')} placeholder="Tell us about your project, system and timeline…" /></div>
      <button disabled={busy} className="btn-primary w-full sm:w-auto">{busy ? <Spinner className="h-4 w-4" /> : <Send size={16} />} Send enquiry</button>
    </form>
  );
}
