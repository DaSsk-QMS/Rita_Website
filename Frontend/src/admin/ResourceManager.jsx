import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDown, ArrowUp, Copy, Download, ExternalLink, Pencil, Plus, Search, Trash2, RefreshCw } from 'lucide-react';
import { api, errMsg, img, download } from '../lib/api.js';
import { useDebounce, formatDate } from '../lib/hooks.js';
import { DynIcon } from '../lib/icons.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { PageHeader, Drawer, Badge, ConfirmButton, abtnPrimary, abtnGhost, abtnDanger } from './components/UI.jsx';
import { FieldGrid, Switch } from './components/Fields.jsx';
import { Spinner } from '../components/ui/Loaders.jsx';

function Cell({ col, row }) {
  const v = col.key.split('.').reduce((o, k) => o?.[k], row);
  switch (col.type) {
    case 'image': return v ? <img src={img(v)} alt="" className="h-12 w-16 rounded-lg object-cover" /> : <span className="text-slate-300">—</span>;
    case 'avatar': return v ? <img src={img(v)} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 font-bold text-slate-500">{row.name?.[0]}</span>;
    case 'badge': return <Badge value={v} />;
    case 'bool': return <Badge value={!!v} label={v ? (col.yes || 'Active') : (col.no || 'Hidden')} />;
    case 'date': return <span className="whitespace-nowrap text-slate-500">{formatDate(v)}</span>;
    case 'icon': return <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><DynIcon name={v} size={18} /></span>;
    default: return <span className={col.strong ? 'font-semibold text-slate-800' : 'text-slate-600'}>{Array.isArray(v) ? v.join(', ') : String(v ?? '')}</span>;
  }
}

/**
 * Config-driven CRUD screen: list, search, filter, create/edit drawer, delete, bulk delete, reorder.
 */
export default function ResourceManager({ config }) {
  const { endpoint, title, subtitle, columns, fields, defaults = {}, filters = [], orderable, viewUrl, searchable = true, canCreate = true } = config;
  const { reload: reloadSite } = useSite();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState({});
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const term = useDebounce(q, 350);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint, { params: { q: term, page, limit: 25, ...filter } });
      setItems(data.items || data);
      setTotal(data.total ?? (data.items || data).length);
      setPages(data.pages || 1);
    } catch (e) { toast.error(errMsg(e)); } finally { setLoading(false); }
  }, [endpoint, term, page, filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); setSelected([]); }, [term, filter, endpoint]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing._id) await api.put(`${endpoint}/${editing._id}`, editing);
      else await api.post(endpoint, editing);
      toast.success('Saved');
      setEditing(null);
      load();
      reloadSite();
    } catch (err) { toast.error(errMsg(err)); } finally { setSaving(false); }
  };

  const remove = async (id) => {
    try { await api.delete(`${endpoint}/${id}`); toast.success('Deleted'); load(); reloadSite(); } catch (e) { toast.error(errMsg(e)); }
  };
  const bulkRemove = async () => {
    try { await api.post(`${endpoint}/bulk-delete`, { ids: selected }); toast.success(`${selected.length} deleted`); setSelected([]); load(); reloadSite(); } catch (e) { toast.error(errMsg(e)); }
  };
  const toggle = async (row, key) => {
    try { await api.put(`${endpoint}/${row._id}`, { ...row, [key]: !row[key] }); load(); reloadSite(); } catch (e) { toast.error(errMsg(e)); }
  };
  const move = async (i, d) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    setItems(next);
    try { await api.patch(`${endpoint}/reorder/all`, next.map((it, idx) => ({ id: it._id, order: idx + 1 }))); reloadSite(); } catch (e) { toast.error(errMsg(e)); }
  };
  const duplicate = (row) => {
    const { _id, slug, createdAt, updatedAt, __v, ...rest } = row;
    setEditing({ ...rest, title: rest.title ? `${rest.title} (copy)` : rest.title, name: rest.name && !rest.title ? `${rest.name} (copy)` : rest.name });
  };

  const allSelected = items.length > 0 && selected.length === items.length;
  const toggleKey = useMemo(() => columns.find((c) => c.type === 'bool' && c.toggle)?.key, [columns]);

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle || `${total} item${total === 1 ? '' : 's'}`}>
        <button onClick={load} className={abtnGhost} aria-label="Refresh"><RefreshCw size={15} /></button>
        {config.exportUrl && <button onClick={() => download(config.exportUrl).catch((e) => toast.error(errMsg(e)))} className={abtnGhost}><Download size={15} /> Export CSV</button>}
        {selected.length > 0 && <ConfirmButton onConfirm={bulkRemove} className={abtnDanger} label={`Delete ${selected.length}`} />}
        {canCreate && <button onClick={() => setEditing({ ...defaults })} className={abtnPrimary}><Plus size={16} /> Add new</button>}
      </PageHeader>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          {searchable && (
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input !py-2 !pl-9" />
            </div>
          )}
          {filters.map((f) => (
            <select key={f.name} value={filter[f.name] || ''} onChange={(e) => setFilter((s) => ({ ...s, [f.name]: e.target.value }))} className="input !w-auto !py-2">
              <option value="">{f.label}: All</option>
              {f.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-10 px-4 py-3"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : items.map((i) => i._id))} aria-label="Select all" /></th>
                {orderable && <th className="w-16 px-2 py-3">Order</th>}
                {columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={columns.length + 3} className="py-16 text-center text-primary"><Spinner /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={columns.length + 3} className="py-16 text-center text-slate-400">No records found</td></tr>
              ) : items.map((row, i) => (
                <tr key={row._id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(row._id)} onChange={() => setSelected((s) => (s.includes(row._id) ? s.filter((x) => x !== row._id) : [...s, row._id]))} aria-label="Select row" /></td>
                  {orderable && (
                    <td className="px-2 py-3">
                      <div className="flex flex-col">
                        <button disabled={i === 0 || !!term} onClick={() => move(i, -1)} className="rounded p-0.5 hover:bg-slate-200 disabled:opacity-20" aria-label="Move up"><ArrowUp size={13} /></button>
                        <button disabled={i === items.length - 1 || !!term} onClick={() => move(i, 1)} className="rounded p-0.5 hover:bg-slate-200 disabled:opacity-20" aria-label="Move down"><ArrowDown size={13} /></button>
                      </div>
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className="max-w-xs truncate px-4 py-3" onClick={() => c.key === toggleKey && toggle(row, c.key)}>
                      {c.key === toggleKey ? <Switch checked={!!row[c.key]} onChange={() => {}} /> : <Cell col={c} row={row} />}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {viewUrl && <a href={viewUrl(row)} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="View on site"><ExternalLink size={15} /></a>}
                      {canCreate && <button onClick={() => duplicate(row)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Duplicate"><Copy size={15} /></button>}
                      <button onClick={() => setEditing({ ...row })} className="rounded-lg p-2 text-primary hover:bg-primary/10" title="Edit"><Pencil size={15} /></button>
                      <ConfirmButton onConfirm={() => remove(row._id)} className="rounded-lg p-2 text-xs font-semibold text-red-500 hover:bg-red-50"><Trash2 size={15} /></ConfirmButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between border-t p-4 text-sm">
            <span className="text-slate-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={abtnGhost}>Previous</button>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className={abtnGhost}>Next</button>
            </div>
          </div>
        )}
      </div>

      <Drawer
        open={!!editing} onClose={() => setEditing(null)} title={editing?._id ? `Edit ${config.singular || 'item'}` : `New ${config.singular || 'item'}`}
        footer={<><button onClick={() => setEditing(null)} className={abtnGhost}>Cancel</button><button form="resource-form" disabled={saving} className={abtnPrimary}>{saving && <Spinner className="h-4 w-4" />} Save</button></>}
      >
        {editing && (
          <form id="resource-form" onSubmit={save}>
            <FieldGrid fields={typeof fields === 'function' ? fields(editing) : fields} data={editing} setData={setEditing} />
          </form>
        )}
      </Drawer>
    </div>
  );
}
