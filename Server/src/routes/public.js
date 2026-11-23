import { Router } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import UAParser from 'ua-parser-js';
import {
  Slide, Service, Post, Category, Job, Application, Enquiry, GalleryItem,
  Client, Testimonial, TeamMember, Subscriber, PageSeo, Visit, Feedback, Location,
} from '../models/index.js';
import { asyncH } from '../utils/crud.js';
import { getSettings, publicSettings } from '../utils/settings.js';
import { sendMail, layout, detailsTable, esc } from '../utils/email.js';
import { uploadResume } from '../middleware/upload.js';

const r = Router();
const formLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 15, message: { message: 'Too many submissions. Please try again later.' } });
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ''));
const str = (v, max = 5000) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const publishedQ = () => ({ status: 'published', publishedAt: { $lte: new Date() } });
const postCard = 'title slug excerpt coverImage category tags author publishedAt readingTime views featured';
// Bots usually submit forms instantly; humans need a few seconds. `_t` is the time the form was rendered.
const tooFast = (b) => b && b._t && Number.isFinite(Number(b._t)) && Date.now() - Number(b._t) < 2500;

// ---------- Layout bootstrap: settings, menu services, page SEO ----------
r.get(
  '/bootstrap',
  asyncH(async (req, res) => {
    const [settings, services, pageSeo, locations] = await Promise.all([
      getSettings(),
      Service.find({ active: true }).sort({ order: 1 }).select('title slug icon shortDescription').lean(),
      PageSeo.find().lean(),
      Location.find({ active: true }).sort({ order: 1 }).select('name slug region').lean(),
    ]);
    res.json({ settings: publicSettings(settings), services, pageSeo, locations });
  })
);

r.get(
  '/home',
  asyncH(async (req, res) => {
    const [slides, services, clients, testimonials, posts, locations] = await Promise.all([
      Slide.find({ active: true }).sort({ order: 1 }).lean(),
      Service.find({ active: true, featured: true }).sort({ order: 1 }).select('-content').lean(),
      Client.find({ active: true }).sort({ order: 1 }).lean(),
      Testimonial.find({ active: true }).sort({ order: 1 }).lean(),
      Post.find(publishedQ()).sort({ publishedAt: -1 }).limit(3).select(postCard).lean(),
      Location.find({ active: true }).sort({ order: 1 }).select('name slug region headline intro image').lean(),
    ]);
    res.json({ slides, services, clients, testimonials, posts, locations });
  })
);

// ---------- Simple list endpoints ----------
const list = (Model, filter = { active: true }, sort = { order: 1, createdAt: -1 }) =>
  asyncH(async (req, res) => res.json(await Model.find(filter).sort(sort).lean()));

r.get('/slides', list(Slide));
r.get('/services', list(Service));
r.get('/gallery', list(GalleryItem));
r.get('/clients', list(Client));
r.get('/testimonials', list(Testimonial));
r.get('/team', list(TeamMember));
r.get('/jobs', list(Job, { active: true }, { createdAt: -1 }));
r.get('/categories', list(Category, {}, { name: 1 }));
r.get('/locations', list(Location));

r.get(
  '/locations/:slug',
  asyncH(async (req, res) => {
    const item = await Location.findOne({ slug: req.params.slug, active: true }).lean();
    if (!item) return res.status(404).json({ message: 'Location not found' });
    const [others, services] = await Promise.all([
      Location.find({ active: true, _id: { $ne: item._id } }).sort({ order: 1 }).select('name slug region').lean(),
      Service.find({ active: true }).sort({ order: 1 }).select('title slug icon shortDescription').lean(),
    ]);
    res.json({ item, others, services });
  })
);

r.get(
  '/services/:slug',
  asyncH(async (req, res) => {
    const item = await Service.findOne({ slug: req.params.slug, active: true }).lean();
    if (!item) return res.status(404).json({ message: 'Service not found' });
    const others = await Service.find({ active: true, _id: { $ne: item._id } })
      .sort({ order: 1 }).select('title slug icon').lean();
    res.json({ item, others });
  })
);

r.get(
  '/jobs/:slug',
  asyncH(async (req, res) => {
    const item = await Job.findOne({ slug: req.params.slug, active: true }).lean();
    if (!item) return res.status(404).json({ message: 'Job not found' });
    res.json(item);
  })
);

// ---------- Blog ----------
r.get(
  '/posts',
  asyncH(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(30, Number(req.query.limit) || 9);
    const q = { ...publishedQ() };
    if (req.query.category) q.category = str(req.query.category, 100);
    if (req.query.tag) q.tags = str(req.query.tag, 100);
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(str(req.query.q, 100)), 'i');
      q.$or = [{ title: rx }, { excerpt: rx }, { tags: rx }, { content: rx }];
    }
    const [items, total, categories, tags] = await Promise.all([
      Post.find(q).sort({ featured: -1, publishedAt: -1 }).skip((page - 1) * limit).limit(limit).select(postCard).lean(),
      Post.countDocuments(q),
      Post.aggregate([{ $match: publishedQ() }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Post.aggregate([{ $match: publishedQ() }, { $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1, categories, tags });
  })
);

r.get(
  '/posts/:slug',
  asyncH(async (req, res) => {
    const item = await Post.findOneAndUpdate({ slug: req.params.slug, ...publishedQ() }, { $inc: { views: 1 } }, { new: true }).lean();
    if (!item) return res.status(404).json({ message: 'Article not found' });
    const [related, recent] = await Promise.all([
      Post.find({ ...publishedQ(), _id: { $ne: item._id }, $or: [{ category: item.category }, { tags: { $in: item.tags || [] } }] })
        .sort({ publishedAt: -1 }).limit(3).select(postCard).lean(),
      Post.find({ ...publishedQ(), _id: { $ne: item._id } }).sort({ publishedAt: -1 }).limit(4).select(postCard).lean(),
    ]);
    res.json({ item, related, recent });
  })
);

// ---------- Site search ----------
r.get(
  '/search',
  asyncH(async (req, res) => {
    const term = str(req.query.q, 100);
    if (term.length < 2) return res.json({ services: [], posts: [], jobs: [] });
    const rx = new RegExp(escapeRegex(term), 'i');
    const [services, posts, jobs] = await Promise.all([
      Service.find({ active: true, $or: [{ title: rx }, { shortDescription: rx }, { content: rx }, { features: rx }] })
        .select('title slug shortDescription icon image').limit(10).lean(),
      Post.find({ ...publishedQ(), $or: [{ title: rx }, { excerpt: rx }, { content: rx }, { tags: rx }] })
        .select(postCard).limit(10).lean(),
      Job.find({ active: true, $or: [{ title: rx }, { department: rx }, { description: rx }] })
        .select('title slug location type department').limit(10).lean(),
    ]);
    res.json({ services, posts, jobs });
  })
);

// ---------- Enquiry form ----------
r.post(
  '/enquiries',
  formLimiter,
  asyncH(async (req, res) => {
    const b = req.body || {};
    if (b.website || tooFast(b)) return res.json({ message: 'Thank you!' }); // honeypot / timing trap — bots
    const data = {
      name: str(b.name, 120), email: str(b.email, 160).toLowerCase(), phone: str(b.phone, 40),
      company: str(b.company, 160), subject: str(b.subject, 200), service: str(b.service, 200),
      message: str(b.message, 5000), source: str(b.source, 50) || 'contact',
      ip: crypto.createHash('sha256').update(req.ip || '').digest('hex').slice(0, 16),
    };
    if (!data.name || !isEmail(data.email) || data.message.length < 5)
      return res.status(400).json({ message: 'Please provide your name, a valid email and a message.' });
    const enquiry = await Enquiry.create(data);

    const settings = await getSettings();
    const rows = [['Name', data.name], ['Email', data.email], ['Phone', data.phone], ['Company', data.company],
      ['Service', data.service], ['Subject', data.subject], ['Message', data.message]];
    sendMail({
      to: 'admin', replyTo: data.email,
      subject: `New enquiry: ${data.subject || data.service || data.name}`,
      html: layout(settings, 'New website enquiry', detailsTable(rows)),
    });
    if (settings.smtp.autoReply) {
      sendMail({
        to: data.email,
        subject: settings.smtp.autoReplySubject,
        html: layout(settings, `Hello ${data.name},`,
          `<p>${esc(settings.smtp.autoReplyMessage)}</p><p style="color:#667085;font-size:13px">A copy of your message:</p>${detailsTable(rows)}`),
      });
    }
    res.status(201).json({ message: 'Thank you! Your enquiry has been received.', id: enquiry._id });
  })
);

// ---------- Job application ----------
r.post(
  '/applications',
  formLimiter,
  uploadResume.single('resume'),
  asyncH(async (req, res) => {
    const b = req.body || {};
    const data = {
      name: str(b.name, 120), email: str(b.email, 160).toLowerCase(), phone: str(b.phone, 40),
      experience: str(b.experience, 60), currentCompany: str(b.currentCompany, 160),
      linkedin: str(b.linkedin, 300), coverLetter: str(b.coverLetter, 5000),
      resume: req.file ? `/uploads/resumes/${req.file.filename}` : '',
    };
    if (!data.name || !isEmail(data.email)) return res.status(400).json({ message: 'Name and a valid email are required.' });
    if (!data.resume) return res.status(400).json({ message: 'Please attach your resume.' });
    const job = b.jobId ? await Job.findById(b.jobId).catch(() => null) : null;
    data.job = job?._id;
    data.jobTitle = job?.title || str(b.jobTitle, 200) || 'General application';
    const appDoc = await Application.create(data);

    const settings = await getSettings();
    sendMail({
      to: 'admin', replyTo: data.email,
      subject: `New job application: ${data.jobTitle} – ${data.name}`,
      html: layout(settings, 'New job application', detailsTable([
        ['Position', data.jobTitle], ['Name', data.name], ['Email', data.email], ['Phone', data.phone],
        ['Experience', data.experience], ['Company', data.currentCompany], ['LinkedIn', data.linkedin], ['Cover letter', data.coverLetter],
      ])),
      attachments: req.file ? [{ filename: req.file.originalname, path: req.file.path }] : undefined,
    });
    sendMail({
      to: data.email,
      subject: `Application received – ${data.jobTitle}`,
      html: layout(settings, `Hello ${data.name},`,
        `<p>Thank you for applying for <strong>${esc(data.jobTitle)}</strong>. Our team will review your profile and contact you if it matches our requirements.</p>`),
    });
    res.status(201).json({ message: 'Application submitted successfully!', id: appDoc._id });
  })
);

// ---------- Feedback ----------
const FEEDBACK_CATEGORIES = ['Service quality', 'Communication', 'Technical expertise', 'Timeliness', 'Website', 'Other'];
r.get(
  '/feedback',
  asyncH(async (req, res) => {
    const [items, agg] = await Promise.all([
      Feedback.find({ status: 'published', consent: true }).sort({ createdAt: -1 }).limit(12)
        .select('name company designation rating message service createdAt').lean(),
      Feedback.aggregate([
        { $match: { status: { $in: ['reviewed', 'published'] } } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      items, categories: FEEDBACK_CATEGORIES,
      summary: { average: agg[0]?.avg ? +agg[0].avg.toFixed(1) : 0, count: agg[0]?.count || 0 },
    });
  })
);

r.post(
  '/feedback',
  formLimiter,
  asyncH(async (req, res) => {
    const b = req.body || {};
    if (b.website || tooFast(b)) return res.json({ message: 'Thank you for your feedback!' });
    const rating = Math.round(Number(b.rating));
    const nps = b.nps === '' || b.nps === undefined || b.nps === null ? undefined : Math.round(Number(b.nps));
    const data = {
      name: str(b.name, 120), email: str(b.email, 160).toLowerCase(), phone: str(b.phone, 40),
      company: str(b.company, 160), designation: str(b.designation, 120),
      category: FEEDBACK_CATEGORIES.includes(b.category) ? b.category : 'Other',
      service: str(b.service, 200), rating, nps: Number.isFinite(nps) ? Math.min(10, Math.max(0, nps)) : undefined,
      message: str(b.message, 3000), consent: b.consent === true || b.consent === 'true',
      ip: crypto.createHash('sha256').update(req.ip || '').digest('hex').slice(0, 16),
    };
    if (!data.name || !isEmail(data.email) || !(rating >= 1 && rating <= 5) || data.message.length < 5)
      return res.status(400).json({ message: 'Please give a rating, your name, a valid email and a short message.' });
    const fb = await Feedback.create(data);
    const settings = await getSettings();
    sendMail({
      to: 'admin', replyTo: data.email,
      subject: `New feedback (${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}) from ${data.name}`,
      html: layout(settings, 'New client feedback', detailsTable([
        ['Rating', `${rating} / 5`], ['Recommend (0–10)', data.nps ?? '—'], ['Name', data.name], ['Email', data.email],
        ['Company', data.company], ['Designation', data.designation], ['Category', data.category], ['Service', data.service],
        ['Message', data.message], ['Consent to publish', data.consent ? 'Yes' : 'No'],
      ])),
    });
    sendMail({
      to: data.email,
      subject: `Thank you for your feedback – ${settings.general.shortName}`,
      html: layout(settings, `Thank you, ${data.name}`, '<p>We appreciate you taking the time to share your experience. Your feedback goes directly to our management team and helps us improve.</p>'),
    });
    res.status(201).json({ message: 'Thank you! Your feedback has been received.', id: fb._id });
  })
);

// ---------- Public visitor counter (cached) ----------
let statsCache = { at: 0, data: null };
r.get(
  '/stats',
  asyncH(async (req, res) => {
    if (!statsCache.data || Date.now() - statsCache.at > 5 * 60 * 1000) {
      const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
      const [views, visitors, today, online] = await Promise.all([
        Visit.estimatedDocumentCount(),
        Visit.distinct('visitorId').then((a) => a.length),
        Visit.countDocuments({ createdAt: { $gte: startToday } }),
        Visit.distinct('visitorId', { createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }).then((a) => a.length),
      ]);
      const settings = await getSettings();
      const offset = Number(settings.general.visitorCounterOffset) || 0; // e.g. visits before this analytics existed
      statsCache = { at: Date.now(), data: { views: views + offset, visitors: visitors + offset, today, online: Math.max(1, online) } };
    }
    res.set('Cache-Control', 'public, max-age=120').json(statsCache.data);
  })
);

// ---------- Newsletter ----------
r.post(
  '/subscribe',
  formLimiter,
  asyncH(async (req, res) => {
    const email = str(req.body?.email, 160).toLowerCase();
    if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email.' });
    await Subscriber.updateOne({ email }, { $set: { email, active: true } }, { upsert: true });
    const settings = await getSettings();
    sendMail({
      to: email,
      subject: `Subscribed to ${settings.general.shortName} updates`,
      html: layout(settings, 'You are subscribed', '<p>Thank you for subscribing. We will send you occasional insights and updates.</p>'),
    });
    res.json({ message: 'Subscribed! Thank you.' });
  })
);

// ---------- Visitor analytics ----------
const BOT_RX = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor/i;
r.post(
  '/track',
  rateLimit({ windowMs: 60 * 1000, limit: 120 }),
  asyncH(async (req, res) => {
    const ua = req.headers['user-agent'] || '';
    const b = req.body || {};
    const path = str(b.path, 300);
    if (!path || path.startsWith('/admin') || BOT_RX.test(ua)) return res.status(204).end();
    const p = new UAParser(ua).getResult();
    let referrer = str(b.referrer, 300);
    try {
      const host = new URL(referrer).hostname;
      referrer = host === req.hostname ? '' : host.replace(/^www\./, '');
    } catch { referrer = ''; }
    await Visit.create({
      path, title: str(b.title, 200), referrer,
      visitorId: str(b.visitorId, 64), sessionId: str(b.sessionId, 64),
      device: p.device.type === 'mobile' ? 'Mobile' : p.device.type === 'tablet' ? 'Tablet' : 'Desktop',
      browser: p.browser.name || 'Other', os: p.os.name || 'Other',
      language: str(b.language, 20), screen: str(b.screen, 20),
      timezone: str(b.timezone, 60),
      country: str(req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || req.headers['x-country-code'], 4).toUpperCase(),
      isNewVisitor: b.isNew === true,
      ipHash: crypto.createHash('sha256').update(`${req.ip}${ua}`).digest('hex').slice(0, 16),
    });
    res.status(204).end();
  })
);

export default r;
