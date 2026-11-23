import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDown, ArrowUp, Image as ImageIcon, Link2, Plus, Trash2, Upload, X, Check } from 'lucide-react';
import { api, errMsg, img } from '../../lib/api.js';
import { ICONS } from '../../lib/icons.jsx';
import { Modal, abtnGhost } from './UI.jsx';
import { Spinner } from '../../components/ui/Loaders.jsx';

const RichEditor = lazy(() => import('./RichEditor.jsx'));

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/admin/upload', fd);
  return data;
}

export function MediaPicker({ open, onClose, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/media').then(({ data }) => setItems(data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (open) load(); }, [open, load]);
  const onUpload = async (files) => {
    setBusy(true);
    try {
      for (const f of files) await uploadFile(f);
      toast.success('Uploaded');
      load();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Media library">
      <label className="mb-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-6 text-sm text-slate-500 hover:border-primary hover:text-primary">
        {busy ? <Spinner className="h-5 w-5" /> : <Upload size={20} />} Upload new images
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload([...e.target.files])} />
      </label>
      {loading ? <div className="py-10 text-center"><Spinner /></div> : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {items.map((m) => (
            <button key={m._id} onClick={() => { onSelect(m.url); onClose(); }} className="group relative aspect-square overflow-hidden rounded-xl border hover:ring-4 hover:ring-primary/30">
              <img src={img(m.url)} alt={m.originalName} className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute inset-0 grid place-items-center bg-primary/60 text-white opacity-0 group-hover:opacity-100"><Check /></span>
            </button>
          ))}
          {!items.length && <p className="col-span-full py-10 text-center text-sm text-slate-500">No uploads yet.</p>}
        </div>
      )}
    </Modal>
  );
}

export function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState(false);
  const fileRef = useRef(null);
  const onFile = async (f) => {
    if (!f) return;
    setBusy(true);
    try { const m = await uploadFile(f); onChange(m.url); toast.success('Image uploaded'); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className="flex gap-3">
      <div
        className="relative grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border bg-slate-50 text-slate-400"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
      >
        {busy ? <Spinner /> : value ? <img src={img(value)} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={28} />}
        {value && !busy && <button type="button" onClick={() => onChange('')} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white" aria-label="Remove"><X size={13} /></button>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="relative">
          <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !py-2 !pl-9" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload" />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className={abtnGhost}><Upload size={15} /> Upload</button>
          <button type="button" onClick={() => setPicker(true)} className={abtnGhost}><ImageIcon size={15} /> Library</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
      </div>
      <MediaPicker open={picker} onClose={() => setPicker(false)} onSelect={onChange} />
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <button type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-primary' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </label>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div className="grid max-h-40 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border p-2 sm:grid-cols-10">
      {Object.entries(ICONS).map(([name, Icon]) => (
        <button type="button" key={name} title={name} onClick={() => onChange(name)} className={`grid aspect-square place-items-center rounded-lg transition ${value === name ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}

function Repeater({ value = [], onChange, fields, itemLabel = 'Item' }) {
  const list = Array.isArray(value) ? value : [];
  const update = (i, patch) => onChange(list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const move = (i, d) => {
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {list.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{itemLabel} {i + 1}</span>
            <div className="flex gap-1">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1.5 hover:bg-white disabled:opacity-30" aria-label="Move up"><ArrowUp size={14} /></button>
              <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="rounded p-1.5 hover:bg-white disabled:opacity-30" aria-label="Move down"><ArrowDown size={14} /></button>
              <button type="button" onClick={() => onChange(list.filter((_, idx) => idx !== i))} className="rounded p-1.5 text-red-500 hover:bg-white" aria-label="Remove"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.full || ['textarea', 'repeater', 'icon', 'image'].includes(f.type) ? 'sm:col-span-2' : ''}>
                <FieldInput field={f} value={item[f.name]} onChange={(v) => update(i, { [f.name]: v })} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, {}])} className={abtnGhost}><Plus size={15} /> Add {itemLabel.toLowerCase()}</button>
    </div>
  );
}

/** Renders a single field with label based on its config. */
export function FieldInput({ field: f, value, onChange }) {
  const label = f.label ?? f.name;
  const wrap = (input, inline = false) => (
    <div>
      {!inline && <label className="label">{label}{f.required && <span className="text-red-500"> *</span>}</label>}
      {input}
      {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
    </div>
  );
  switch (f.type) {
    case 'textarea':
      return wrap(<textarea className="input" rows={f.rows || 3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={f.required} placeholder={f.placeholder} />);
    case 'richtext':
      return wrap(<Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}><RichEditor value={value || ''} onChange={onChange} /></Suspense>);
    case 'image':
      return wrap(<ImageField value={value} onChange={onChange} />);
    case 'number':
      return wrap(<input type="number" className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} min={f.min} max={f.max} />);
    case 'switch':
      return wrap(<Switch checked={!!value} onChange={onChange} label={label} />, true);
    case 'select':
      return wrap(
        <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={f.required}>
          {!f.required && <option value="">—</option>}
          {(f.options || []).map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
      );
    case 'list':
      return wrap(<textarea className="input" rows={f.rows || 5} value={(value || []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} onBlur={() => onChange((value || []).map((s) => s.trim()).filter(Boolean))} placeholder="One item per line" />);
    case 'tags':
      return wrap(<input className="input" value={Array.isArray(value) ? value.join(', ') : value || ''} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trimStart()))} onBlur={() => onChange((value || []).map((s) => s.trim()).filter(Boolean))} placeholder="Comma separated" />);
    case 'date':
      return wrap(<input type="date" className="input" value={value ? String(value).slice(0, 10) : ''} onChange={(e) => onChange(e.target.value)} />);
    case 'datetime':
      return wrap(<input type="datetime-local" className="input" value={value ? new Date(new Date(value).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')} />);
    case 'color':
      return wrap(
        <div className="flex items-center gap-2">
          <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border" />
          <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case 'icon':
      return wrap(<IconPicker value={value} onChange={onChange} />);
    case 'repeater':
      return wrap(<Repeater value={value} onChange={onChange} fields={f.fields} itemLabel={f.itemLabel} />);
    case 'password':
      return wrap(<input type="password" autoComplete="new-password" className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />);
    default:
      return wrap(<input type={f.type === 'email' ? 'email' : f.type === 'url' ? 'text' : 'text'} className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={f.required} placeholder={f.placeholder} />);
  }
}

/** Grid of fields bound to an object. */
export function FieldGrid({ fields, data, setData }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) =>
        f.section ? (
          <h4 key={f.section} className="border-b pb-2 pt-3 font-heading text-sm font-bold uppercase tracking-wider text-slate-500 sm:col-span-2">{f.section}</h4>
        ) : (
          <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
            <FieldInput field={f} value={data?.[f.name]} onChange={(v) => setData((d) => ({ ...d, [f.name]: v }))} />
          </div>
        )
      )}
    </div>
  );
}
