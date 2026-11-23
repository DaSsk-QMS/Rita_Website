import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { AppSecret } from './models/index.js';
import { ensureSeed } from './seed/seed.js';
import { UPLOAD_DIR } from './middleware/upload.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import seoRoutes, { spaWithSeo } from './routes/seo.js';
import { sanitizeInput, uploadHeaders } from './middleware/security.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../../Frontend/dist');
const PORT = process.env.PORT || 5000;

const isWeak = (v) => !v || v.length < 32 || /change|dev-only/i.test(v);
if (process.env.JWT_SECRET && isWeak(process.env.JWT_SECRET) && process.env.NODE_ENV === 'production') {
  console.error('❌ JWT_SECRET is weak. Use a random value of 32+ characters, or remove it to let the server generate one.');
  process.exit(1);
}

/** No JWT_SECRET configured: generate a strong one once and keep it in the database. */
async function ensureJwtSecret() {
  if (!isWeak(process.env.JWT_SECRET)) return;
  if (process.env.NODE_ENV !== 'production' && !process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev-only-secret-change-me';
    console.warn('⚠️  JWT_SECRET not set — using an insecure development secret.');
    return;
  }
  const key = 'jwtSecret';
  let row = await AppSecret.findOne({ key }).select('+value');
  if (!row) row = await AppSecret.create({ key, value: crypto.randomBytes(48).toString('hex') });
  process.env.JWT_SECRET = row.value;
  console.log('🔐 Using JWT secret stored in the database.');
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // the SPA loads Google Fonts/Maps/YouTube; a strict CSP is applied to uploads below
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
}));
app.use((req, res, next) => { res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'); next(); });
const origins = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(sanitizeInput);
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Uploaded files (resumes are private and only downloadable through the admin API)
app.use('/uploads/resumes', (req, res) => res.status(403).json({ message: 'Forbidden' }));
app.use('/uploads', uploadHeaders, express.static(UPLOAD_DIR, { maxAge: '7d', dotfiles: 'deny', index: false }));

// API
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 1500, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// SEO + production frontend (single-server deployment)
app.use(seoRoutes);
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false, maxAge: '30d' }));
  app.use(spaWithSeo(DIST_DIR));
}

// Errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.code === 11000) { status = 409; message = `Duplicate value: ${Object.keys(err.keyValue || {}).join(', ')}`; }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.name === 'MulterError') status = 400;
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
});

async function start() {
  try {
    await connectDB();
    await ensureJwtSecret();
    await ensureSeed();
    app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

// No top-level await: some hosts (e.g. Hostinger / LiteSpeed lsnode) load the entry file with require().
start();
