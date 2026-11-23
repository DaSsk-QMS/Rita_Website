import LeadsManager from '../components/LeadsManager.jsx';

export default function Enquiries() {
  return (
    <LeadsManager
      endpoint="/admin/enquiries"
      title="Enquiries"
      statuses={['new', 'in-progress', 'closed', 'spam']}
      exportUrl="/admin/enquiries/export/csv"
      canReply
      renderSummary={(e) => (
        <>
          {(e.service || e.subject) && <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{e.service || e.subject}</span>}
          <span className="truncate text-sm text-slate-500">{e.message}</span>
        </>
      )}
      renderDetail={(e) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            {e.service && <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">{e.service}</span>}
            {e.source && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Source: {e.source}</span>}
          </div>
          {e.subject && <p className="font-heading text-lg font-bold text-slate-900">{e.subject}</p>}
          <div className="whitespace-pre-wrap rounded-xl border bg-white p-4 text-sm leading-relaxed text-slate-700">{e.message}</div>
        </div>
      )}
    />
  );
}
