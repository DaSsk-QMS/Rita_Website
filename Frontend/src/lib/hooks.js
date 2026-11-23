import { useEffect, useRef, useState } from 'react';
import { getPublic } from './api.js';

/** Fetch a public endpoint with automatic offline fallback. */
export function usePublic(path, params) {
  const key = path ? `${path}?${JSON.stringify(params || {})}` : null;
  const [state, setState] = useState({ data: null, loading: !!path, error: null, offline: false });
  useEffect(() => {
    if (!path) return undefined;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    getPublic(path, params)
      .then((r) => alive && setState({ data: r.data, loading: false, error: null, offline: r.offline }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e, offline: false }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

export function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > offset);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [offset]);
  return scrolled;
}

export function useOnClickOutside(handler) {
  const ref = useRef(null);
  useEffect(() => {
    const on = (e) => ref.current && !ref.current.contains(e.target) && handler();
    document.addEventListener('mousedown', on);
    return () => document.removeEventListener('mousedown', on);
  }, [handler]);
  return ref;
}

export const formatDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-IN', opts) : '';
