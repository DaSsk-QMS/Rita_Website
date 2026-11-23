import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Upload, Send, FileText } from 'lucide-react';
import { api, errMsg } from '../../lib/api.js';
import { useSite } from '../../context/SiteContext.jsx';
import { Spinner } from '../ui/Loaders.jsx';

const empty = { name: '', email: '', phone: '', experience: '', currentCompany: '', linkedin: '', coverLetter: '' };

export default function ApplicationForm({ job }) {
  const { settings } = useSite();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pick = (f) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error('File must be under 5 MB');
    if (!/\.(pdf|doc|docx)$/i.test(f.name)) return toast.error('Please upload a PDF or Word document');
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please attach your resume');
    setBusy(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (job) { fd.append('jobId', job._id); fd.append('jobTitle', job.title); }
    fd.append('resume', file);
    try {
      const { data } = await api.post('/public/applications', fd, { onUploadProgress: (p) => setProgress(Math.round((p.loaded / (p.total || 1)) * 100)) });
      toast.success(data.message);
      setDone(true);
    } catch (err) {
      toast.error(err.response && typeof err.response.data === 'object' ? errMsg(err) : `Unable to submit right now. Please email your CV to ${settings.contact?.email2 || settings.contact?.email}.`);
    } finally { setBusy(false); setProgress(0); }
  };

  if (done) {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto text-green-500" size={64} />
        <h3 className="mt-4 text-2xl font-bold text-secondary">Application received!</h3>
        <p className="mt-2 text-slate-600">Thank you for your interest. We'll be in touch if your profile matches.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="ap-name">Full name *</label><input id="ap-name" required className="input" value={form.name} onChange={set('name')} /></div>
        <div><label className="label" htmlFor="ap-email">Email *</label><input id="ap-email" required type="email" className="input" value={form.email} onChange={set('email')} /></div>
        <div><label className="label" htmlFor="ap-phone">Phone</label><input id="ap-phone" className="input" value={form.phone} onChange={set('phone')} /></div>
        <div><label className="label" htmlFor="ap-exp">Total experience</label><input id="ap-exp" className="input" value={form.experience} onChange={set('experience')} placeholder="e.g. 5 years" /></div>
        <div><label className="label" htmlFor="ap-co">Current company</label><input id="ap-co" className="input" value={form.currentCompany} onChange={set('currentCompany')} /></div>
        <div><label className="label" htmlFor="ap-li">LinkedIn profile</label><input id="ap-li" className="input" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/…" /></div>
      </div>
      <div><label className="label" htmlFor="ap-cl">Cover letter</label><textarea id="ap-cl" rows={4} className="input resize-none" value={form.coverLetter} onChange={set('coverLetter')} placeholder="Tell us briefly about yourself" /></div>
      <div>
        <span className="label">Resume / CV * (PDF or Word, max 5 MB)</span>
        <button
          type="button" onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm transition ${file ? 'border-primary bg-primary/5 text-primary' : 'border-slate-300 text-slate-500 hover:border-primary hover:text-primary'}`}
        >
          {file ? <><FileText size={28} /> {file.name}</> : <><Upload size={28} /> Click or drag your file here</>}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => pick(e.target.files[0])} />
      </div>
      {busy && progress > 0 && <div className="h-2 overflow-hidden rounded bg-slate-100"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>}
      <button disabled={busy} className="btn-primary">{busy ? <Spinner className="h-4 w-4" /> : <Send size={16} />} Submit application</button>
    </form>
  );
}
