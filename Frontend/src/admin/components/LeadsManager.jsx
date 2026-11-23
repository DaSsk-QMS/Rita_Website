import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Search, RefreshCw, Mail, Phone, Building2, Send, Trash2 } from 'lucide-react';
import { api, errMsg, download } from '../../lib/api.js';
import { useDebounce } from '../../lib/hooks.js';
import { PageHeader, Drawer, Badge, ConfirmButton, abtnGhost, abtnPrimary, abtnDanger } from './UI.jsx';
import { Spinner } from '../../components/ui/Loaders.jsx';

const fmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

/** Inbox-style manager for enquiries and job applications. */
export default function LeadsManager({ endpoint, title, subtitle, statuses, exportUrl, renderSummary, renderDetail, canReply, renderActions, renderAvatar, replySubject, searchPlaceholder = 'Search name, email, message…' }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState({ subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const term = useDebounce(q, 350);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint, { params: { q: term, status, page, limit: 20 } });
      setItems(data.items); setTotal(data.total); setPages(data.pages);
    } catch (e) { toast.error(errMsg(e)); } finally { setLoading(false); }
  }, [endpoint, term, status, page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [term, status]);

  const update = async (patch) => {
    try {
      const { data } = await api.put(`${endpoint}/${open._id}`, { ...open, ...patch });
      setOpen(data);
      setItems((list) => list.map((i) => (i._id === data._id ? data : i)));
      toast.success('Updated');
    } catch (e) { toast.error(errMsg(e)); }
  };
  const remove = async (id) => {
    try { await api.delete(`${endpoint}/${id}`); toast.success('Deleted'); setOpen(null); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const sendReply = async () => {
    if (!reply.message.trim()) return toast.error('Write a message first');
    setBusy(true);
    try {
      const { data } = await api.post(`${endpoint}/${open._id}/reply`, reply);
      toast.success(data.message);
      setOpen(data.item || data.enquiry);
      setReply({ subject: '', message: '' });
      load();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const openItem = (it) => {
    setOpen(it);
    setReply({ subject: replySubject ? replySubject(it) : `Re: ${it.subject || it.service || 'Your enquiry'}`, message: '' });
    if (it.status === 'new') {
      const next = statuses[1];
      api.put(`${endpoint}/${it._id}`, { ...it, status: next }).then(({ data }) => { setOpen(data); setItems((l) => l.map((i) => (i._id === data._id ? data : i))); }).catch(() => {});
    }
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle ? `${subtitle} · ${total} total` : `${total} total`}>
        <button onClick={load} className={abtnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
        <button onClick={() => download(exportUrl).catch((e) => toast.error(errMsg(e)))} className={abtnGhost}><Download size={15} /> Export CSV</button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...statuses].map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${status === s ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{s || 'All'}</button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b p-4">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="input !py-2 !pl-9" /></div>
        </div>
        {loading ? <div className="py-16 text-center text-primary"><Spinner /></div> : (
          <ul className="divide-y">
            {items.map((it) => (
              <li key={it._id}>
                <button onClick={() => openItem(it)} className={`flex w-full items-start gap-4 p-4 text-left transition hover:bg-slate-50 ${it.status === 'new' ? 'bg-primary/[0.03]' : ''}`}>
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${it.status === 'new' ? 'bg-primary' : 'bg-transparent'}`} />
                  {renderAvatar ? renderAvatar(it) : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">{it.name?.[0]?.toUpperCase()}</span>}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className={`truncate ${it.status === 'new' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{it.name} <span className="font-normal text-slate-400">&lt;{it.email}&gt;</span></span>
                      <span className="shrink-0 text-xs text-slate-400">{fmt(it.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">{renderSummary(it)}</span>
                  </span>
                  <Badge value={it.status} />
                </button>
              </li>
            ))}
            {!items.length && <li className="py-16 text-center text-slate-400">Nothing here yet</li>}
          </ul>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t p-4 text-sm">
            <span className="text-slate-500">Page {page} of {pages}</span>
            <div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={abtnGhost}>Previous</button><button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className={abtnGhost}>Next</button></div>
          </div>
        )}
      </div>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.name || ''} footer={open && <ConfirmButton onConfirm={() => remove(open._id)} className={abtnDanger}><Trash2 size={15} /> Delete</ConfirmButton>}>
        {open && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href={`mailto:${open.email}`} className="flex items-center gap-1.5 text-primary hover:underline"><Mail size={15} />{open.email}</a>
              {open.phone && <a href={`tel:${open.phone}`} className="flex items-center gap-1.5 text-primary hover:underline"><Phone size={15} />{open.phone}</a>}
              {open.company && <span className="flex items-center gap-1.5 text-slate-600"><Building2 size={15} />{open.company}</span>}
            </div>
            <p className="text-xs text-slate-400">Received {fmt(open.createdAt)}</p>
            {renderDetail(open)}
            {renderActions?.(open, (next) => { setOpen(next); setItems((list) => list.map((i) => (i._id === next._id ? next : i))); })}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Status</label>
                <select className="input" value={open.status} onChange={(e) => update({ status: e.target.value })}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Internal notes</label>
              <textarea className="input" rows={3} defaultValue={open.notes} key={open._id + (open.updatedAt || '')} onBlur={(e) => e.target.value !== (open.notes || '') && update({ notes: e.target.value })} placeholder="Only visible to admins. Saved when you click outside." />
            </div>
            {canReply && (
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="mb-3 font-heading font-bold text-slate-800">Reply by email</p>
                <input className="input mb-2" value={reply.subject} onChange={(e) => setReply((r) => ({ ...r, subject: e.target.value }))} placeholder="Subject" />
                <textarea className="input" rows={5} value={reply.message} onChange={(e) => setReply((r) => ({ ...r, message: e.target.value }))} placeholder={`Hello ${open.name},\n\n…`} />
                <button onClick={sendReply} disabled={busy} className={`${abtnPrimary} mt-3`}>{busy ? <Spinner className="h-4 w-4" /> : <Send size={15} />} Send reply</button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
