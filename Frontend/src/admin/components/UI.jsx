import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Panel({ title, children, className = '', actions }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-heading font-bold text-slate-800">{title}</h3>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer, width = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return undefined;
    const on = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className={`fixed inset-y-0 right-0 z-[61] flex w-full ${width} flex-col bg-white shadow-2xl`} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 280 }}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold text-slate-900">{title}</h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t bg-slate-50 px-6 py-4">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Modal({ open, onClose, title, children, width = 'max-w-4xl' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className={`flex max-h-[90vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold">{title}</h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Two-step delete button: click once to arm, again to confirm. */
export function ConfirmButton({ onConfirm, children, className = '', label = 'Delete' }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); if (armed) { setArmed(false); onConfirm(); } else setArmed(true); }}
      className={`${className} ${armed ? '!bg-red-600 !text-white' : ''}`}
      title={label}
    >
      {armed ? 'Confirm?' : children || <><Trash2 size={15} /> {label}</>}
    </button>
  );
}

const BADGE = {
  new: 'bg-blue-100 text-blue-700', 'in-progress': 'bg-amber-100 text-amber-700', closed: 'bg-green-100 text-green-700',
  spam: 'bg-slate-200 text-slate-600', reviewing: 'bg-amber-100 text-amber-700', shortlisted: 'bg-violet-100 text-violet-700',
  interview: 'bg-cyan-100 text-cyan-700', rejected: 'bg-red-100 text-red-700', hired: 'bg-green-100 text-green-700',
  published: 'bg-green-100 text-green-700', draft: 'bg-slate-200 text-slate-600', reviewed: 'bg-amber-100 text-amber-700', archived: 'bg-slate-200 text-slate-500', true: 'bg-green-100 text-green-700',
  false: 'bg-slate-200 text-slate-600', admin: 'bg-violet-100 text-violet-700', editor: 'bg-blue-100 text-blue-700',
};
export function Badge({ value, label }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${BADGE[String(value)] || 'bg-slate-100 text-slate-600'}`}>{label ?? String(value)}</span>;
}

export const abtn = 'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50';
export const abtnPrimary = `${abtn} bg-primary text-white hover:brightness-110 shadow-sm`;
export const abtnGhost = `${abtn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
export const abtnDanger = `${abtn} border border-red-200 bg-white text-red-600 hover:bg-red-50`;
