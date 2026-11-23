import toast from 'react-hot-toast';
import { FileDown } from 'lucide-react';
import LeadsManager from '../components/LeadsManager.jsx';
import { download, errMsg } from '../../lib/api.js';
import { abtnPrimary } from '../components/UI.jsx';

export default function Applications() {
  return (
    <LeadsManager
      endpoint="/admin/applications"
      title="Job Applications"
      statuses={['new', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired']}
      exportUrl="/admin/applications/export/csv"
      renderSummary={(a) => (
        <>
          <span className="shrink-0 rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">{a.jobTitle}</span>
          {a.experience && <span className="truncate text-sm text-slate-500">{a.experience} experience</span>}
        </>
      )}
      renderDetail={(a) => (
        <div className="space-y-4">
          <p className="font-heading text-lg font-bold text-slate-900">{a.jobTitle}</p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[['Experience', a.experience], ['Current company', a.currentCompany]].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>
            ))}
            {a.linkedin && <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2"><dt className="text-xs text-slate-500">LinkedIn</dt><dd><a href={a.linkedin} target="_blank" rel="noreferrer" className="break-all font-semibold text-primary hover:underline">{a.linkedin}</a></dd></div>}
          </dl>
          {a.coverLetter && <div className="whitespace-pre-wrap rounded-xl border p-4 text-sm leading-relaxed text-slate-700">{a.coverLetter}</div>}
          {a.resume && (
            <button onClick={() => download(`/admin/applications/${a._id}/resume`).catch((e) => toast.error(errMsg(e)))} className={abtnPrimary}>
              <FileDown size={16} /> Download resume
            </button>
          )}
        </div>
      )}
    />
  );
}
