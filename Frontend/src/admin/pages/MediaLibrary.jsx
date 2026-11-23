import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check, Download, Grid3X3, List, RefreshCw, Search, Trash2, Upload, ImageIcon, X } from 'lucide-react';
import { api, errMsg, img } from '../../lib/api.js';
import { formatDate } from '../../lib/hooks.js';
import { PageHeader, ConfirmButton, Modal, abtnGhost, abtnPrimary, abtnDanger } from '../components/UI.jsx';
import { uploadFile } from '../components/Fields.jsx';
import { Spinner } from '../../components/ui/Loaders.jsx';

const size = (b = 0) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const absolute = (u) => { const s = img(u); return s.startsWith('/') ? window.location.origin + s : s; };

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ done: 0, total: 0 });
  const [drag, setDrag] = useState(false);
  const [q, setQ] = useState('');
  const [view, setView] = useState('grid');
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/media').then(({ data }) => setItems(data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((m) => `${m.originalName} ${m.filename}`.toLowerCase().includes(t)) : items;
  }, [items, q]);
  const totalSize = useMemo(() => items.reduce((a, m) => a + (m.size || 0), 0), [items]);

  const upload = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return toast.error('Only image files can be uploaded');
    setUploading({ done: 0, total: list.length });
    let ok = 0;
    for (const f of list) {
      try { await uploadFile(f); ok++; } catch (e) { toast.error(`${f.name}: ${errMsg(e)}`); }
      setUploading((u) => ({ ...u, done: u.done + 1 }));
    }
    setUploading({ done: 0, total: 0 });
    if (ok) toast.success(`${ok} file${ok > 1 ? 's' : ''} uploaded`);
    load();
  };

  const remove = async (ids) => {
    try {
      await Promise.all(ids.map((id) => api.delete(`/admin/media/${id}`)));
      toast.success(`${ids.length} deleted`);
      setSelected([]);
      setPreview(null);
      load();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const copy = async (m) => {
    try { await navigator.clipboard.writeText(absolute(m.url)); setCopied(m._id); setTimeout(() => setCopied(''), 1500); toast.success('URL copied'); } catch { toast.error('Copy failed'); }
  };
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDrag(false); }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
      className="relative"
    >
      <PageHeader title="Media Library" subtitle={`${items.length} files · ${size(totalSize)}`}>
        <button onClick={load} className={abtnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
        {selected.length > 0 && <ConfirmButton onConfirm={() => remove(selected)} className={abtnDanger} label={`Delete ${selected.length}`} />}
        <label className={`${abtnPrimary} cursor-pointer`}>
          {uploading.total ? <Spinner className="h-4 w-4" /> : <Upload size={16} />}
          {uploading.total ? `Uploading ${uploading.done}/${uploading.total}` : 'Upload images'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
        </label>
      </PageHeader>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name…" className="input !py-2 !pl-9" />
          </div>
          {filtered.length > 0 && (
            <button onClick={() => setSelected(selected.length === filtered.length ? [] : filtered.map((m) => m._id))} className={abtnGhost}>
              {selected.length === filtered.length ? 'Clear selection' : 'Select all'}
            </button>
          )}
          <div className="flex rounded-lg border p-0.5">
            {[['grid', Grid3X3], ['list', List]].map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} className={`rounded-md p-1.5 ${view === v ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Icon size={16} /></button>
            ))}
          </div>
        </div>

        {uploading.total > 0 && <div className="h-1 bg-slate-100"><div className="h-full bg-primary transition-all" style={{ width: `${(uploading.done / uploading.total) * 100}%` }} /></div>}

        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="shimmer aspect-square rounded-xl" />)}</div>
          ) : !filtered.length ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 py-20 text-slate-500 hover:border-primary hover:text-primary">
              <ImageIcon size={40} />
              <span className="font-semibold">{q ? 'No files match your search' : 'Drop images here or click to upload'}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
            </label>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {filtered.map((m, i) => (
                <motion.div key={m._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 20) * 0.02 }} className={`group relative overflow-hidden rounded-xl border bg-slate-50 transition ${selected.includes(m._id) ? 'ring-4 ring-primary/40' : 'hover:shadow-lg'}`}>
                  <button onClick={() => setPreview(m)} className="block aspect-square w-full">
                    <img src={img(m.url)} alt={m.originalName} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </button>
                  <input type="checkbox" checked={selected.includes(m._id)} onChange={() => toggle(m._id)} aria-label="Select" className={`absolute left-2 top-2 h-4 w-4 accent-[var(--c-primary)] transition ${selected.includes(m._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 text-white transition group-hover:translate-y-0">
                    <span className="truncate text-[11px]">{m.originalName}</span>
                    <button onClick={() => copy(m)} className="shrink-0 rounded p-1 hover:bg-white/20" aria-label="Copy URL">{copied === m._id ? <Check size={14} /> : <Copy size={14} />}</button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-slate-500"><tr><th className="w-8 py-2" /><th className="py-2">File</th><th className="py-2">Size</th><th className="py-2">Uploaded</th><th className="py-2 text-right">Actions</th></tr></thead>
              <tbody className="divide-y">
                {filtered.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50">
                    <td className="py-2"><input type="checkbox" checked={selected.includes(m._id)} onChange={() => toggle(m._id)} aria-label="Select" /></td>
                    <td className="py-2"><button onClick={() => setPreview(m)} className="flex items-center gap-3 text-left"><img src={img(m.url)} alt="" className="h-10 w-14 rounded-lg object-cover" /><span className="font-medium text-slate-700">{m.originalName}</span></button></td>
                    <td className="py-2 text-slate-500">{size(m.size)}</td>
                    <td className="py-2 text-slate-500">{formatDate(m.createdAt)}</td>
                    <td className="py-2"><div className="flex justify-end gap-1">
                      <button onClick={() => copy(m)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Copy URL">{copied === m._id ? <Check size={15} /> : <Copy size={15} />}</button>
                      <ConfirmButton onConfirm={() => remove([m._id])} className="rounded-lg p-2 text-xs font-semibold text-red-500 hover:bg-red-50"><Trash2 size={15} /></ConfirmButton>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drag && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-primary/80 text-white backdrop-blur-sm">
            <div className="text-center"><Upload size={56} className="mx-auto animate-bounce" /><p className="mt-4 font-heading text-2xl font-bold">Drop images to upload</p></div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.originalName || ''} width="max-w-5xl">
        {preview && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="grid place-items-center rounded-xl bg-[repeating-conic-gradient(#f1f5f9_0_25%,#fff_0_50%)] bg-[length:20px_20px] p-4 lg:col-span-2">
              <img src={img(preview.url)} alt={preview.originalName} className="max-h-[60vh] rounded-lg object-contain" />
            </div>
            <div className="space-y-4 text-sm">
              <dl className="space-y-3">
                {[['File name', preview.filename], ['Type', preview.mimetype], ['Size', size(preview.size)], ['Uploaded', formatDate(preview.createdAt)]].map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="break-all font-medium text-slate-800">{v}</dd></div>
                ))}
              </dl>
              <div>
                <label className="label">Public URL</label>
                <div className="flex gap-2"><input readOnly value={absolute(preview.url)} className="input !py-2 text-xs" onFocus={(e) => e.target.select()} /><button onClick={() => copy(preview)} className={abtnGhost} aria-label="Copy URL"><Copy size={15} /></button></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={img(preview.url)} download={preview.originalName} target="_blank" rel="noreferrer" className={abtnGhost}><Download size={15} /> Open</a>
                <ConfirmButton onConfirm={() => remove([preview._id])} className={abtnDanger} label="Delete" />
                <button onClick={() => setPreview(null)} className={abtnGhost}><X size={15} /> Close</button>
              </div>
              <p className="text-xs text-slate-400">Deleting a file that is still used on the website will leave a broken image there.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
