import crypto from 'crypto';
import { Activity } from '../models/index.js';

/**
 * Removes MongoDB operator keys ($gt, $where, ...) from user input so a request body
 * like {"email": {"$ne": null}} can never turn into a query operator (NoSQL injection).
 */
function strip(value, depth = 0) {
  if (depth > 12 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => strip(v, depth + 1));
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key === '__proto__' || key === 'constructor' || key === 'prototype') delete value[key];
    else value[key] = strip(value[key], depth + 1);
  }
  return value;
}

export function sanitizeInput(req, res, next) {
  if (req.body) strip(req.body);
  if (req.query) strip(req.query);
  if (req.params) strip(req.params);
  next();
}

/** Returns an error message, or '' when the password meets the policy. */
export function passwordProblem(pw) {
  const p = String(pw || '');
  if (p.length < 8) return 'Password must be at least 8 characters';
  if (p.length > 128) return 'Password is too long';
  if (!/[a-z]/.test(p) || !/[A-Z]/.test(p)) return 'Password must contain upper- and lower-case letters';
  if (!/\d/.test(p)) return 'Password must contain at least one number';
  if (/^(password|admin|welcome|qwerty)/i.test(p)) return 'Password is too easy to guess';
  return '';
}

export const ipHash = (req) => crypto.createHash('sha256').update(`${req.ip || ''}`).digest('hex').slice(0, 16);
const clientIp = (req) => (req.ip || '').replace(/^::ffff:/, '');

/** Fire-and-forget security/audit log entry. Never throws. */
export function audit(req, action, { user, email, target, success = true } = {}) {
  const u = user || req.user;
  Activity.create({
    user: u?._id,
    userName: u?.name,
    email: email || u?.email,
    action,
    target: target ? String(target).slice(0, 200) : undefined,
    ip: clientIp(req),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 250),
    success,
  }).catch(() => {});
}

/** Logs every successful admin write (POST/PUT/PATCH/DELETE) in the audit trail. */
export function auditWrites(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    const [resource, id, sub] = req.path.split('/').filter(Boolean);
    const verb = { POST: 'create', PUT: 'update', PATCH: 'reorder', DELETE: 'delete' }[req.method];
    const action = id === 'bulk-delete' ? `${resource}.bulk-delete` : sub ? `${resource}.${sub}` : `${resource}.${verb}`;
    const label = req.body?.title || req.body?.name || req.body?.email || (resource === 'settings' ? id : '') || id || '';
    audit(req, action, { target: label });
  });
  next();
}

/** Upload responses can't execute scripts even if someone uploads a crafted SVG. */
export function uploadHeaders(req, res, next) {
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}
