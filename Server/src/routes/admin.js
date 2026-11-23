import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import {
  User, Slide, Service, Post, Category, Job, Application, Enquiry, GalleryItem,
  Client, Testimonial, TeamMember, Subscriber, PageSeo, Media, Visit, Feedback, Location, Activity,
} from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditWrites, passwordProblem } from '../middleware/security.js';
import { uploadImage, UPLOAD_DIR } from '../middleware/upload.js';
import { crudRouter, asyncH, toCsv } from '../utils/crud.js';
import { getSettings, updateSettings } from '../utils/settings.js';
import { sendMail, verifySmtp, layout, esc } from '../utils/email.js';

const r = Router();
r.use(protect, authorize('admin', 'editor'), auditWrites);
const adminOnly = authorize('admin');

// ---------- Generic content resources ----------
r.use('/slides', crudRouter(Slide, { searchFields: ['title', 'subtitle'], filterFields: ['active'] }));
r.use('/services', crudRouter(Service, { searchFields: ['title', 'shortDescription'], filterFields: ['active', 'featured'], slugFrom: 'title' }));
r.use('/posts', crudRouter(Post, {
  searchFields: ['title', 'excerpt', 'category'], filterFields: ['status', 'category', 'featured'],
  sort: { createdAt: -1 }, slugFrom: 'title',
  beforeSave: (data) => {
    if (data.status === 'published' && !data.publishedAt) data.publishedAt = new Date();
    if (data.status === 'draft' && data.publishedAt === '') data.publishedAt = undefined;
  },
}));
r.use('/categories', crudRouter(Category, { searchFields: ['name'], sort: { name: 1 }, slugFrom: 'name' }));
r.use('/jobs', crudRouter(Job, { searchFields: ['title', 'department', 'location'], filterFields: ['active'], sort: { createdAt: -1 }, slugFrom: 'title' }));
r.use('/gallery', crudRouter(GalleryItem, { searchFields: ['title', 'category'], filterFields: ['category', 'active'] }));
r.use('/clients', crudRouter(Client, { searchFields: ['name', 'industry', 'location'], filterFields: ['active', 'featured'] }));
r.use('/locations', crudRouter(Location, { searchFields: ['name', 'region', 'headline'], filterFields: ['active'], slugFrom: 'name' }));
r.use('/testimonials', crudRouter(Testimonial, { searchFields: ['name', 'company', 'message'], filterFields: ['active'] }));
r.use('/team', crudRouter(TeamMember, { searchFields: ['name', 'designation'], filterFields: ['active'] }));
r.use('/page-seo', crudRouter(PageSeo, { searchFields: ['path', 'title'], sort: { path: 1 } }));

// ---------- CSV exports (registered before generic routers so /export isn't treated as :id) ----------
const exportCsv = (Model, fields, name) =>
  asyncH(async (req, res) => {
    const rows = await Model.find().sort({ createdAt: -1 }).lean();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(toCsv(rows, fields));
  });
r.get('/enquiries/export/csv', exportCsv(Enquiry, ['createdAt', 'name', 'email', 'phone', 'company', 'service', 'subject', 'message', 'status', 'notes'], 'enquiries'));
r.get('/applications/export/csv', exportCsv(Application, ['createdAt', 'jobTitle', 'name', 'email', 'phone', 'experience', 'currentCompany', 'linkedin', 'resume', 'status', 'notes'], 'applications'));
r.get('/feedback/export/csv', exportCsv(Feedback, ['createdAt', 'name', 'email', 'phone', 'company', 'designation', 'category', 'service', 'rating', 'nps', 'message', 'consent', 'status', 'notes'], 'feedback'));
r.get('/subscribers/export/csv', exportCsv(Subscriber, ['createdAt', 'email', 'active'], 'subscribers'));

r.use('/enquiries', crudRouter(Enquiry, { searchFields: ['name', 'email', 'company', 'subject', 'message'], filterFields: ['status'], sort: { createdAt: -1 }, allowCreate: false }));
r.use('/applications', crudRouter(Application, { searchFields: ['name', 'email', 'jobTitle'], filterFields: ['status', 'jobTitle'], sort: { createdAt: -1 }, allowCreate: false }));
r.use('/feedback', crudRouter(Feedback, { searchFields: ['name', 'email', 'company', 'message', 'service'], filterFields: ['status', 'category'], sort: { createdAt: -1 }, allowCreate: false }));
r.use('/subscribers', crudRouter(Subscriber, { searchFields: ['email'], filterFields: ['active'], sort: { createdAt: -1 } }));

// Resumes are not publicly served — download through this authenticated route
r.get(
  '/applications/:id/resume',
  asyncH(async (req, res) => {
    const a = await Application.findById(req.params.id).lean();
    if (!a?.resume) return res.status(404).json({ message: 'No resume' });
    const file = path.join(UPLOAD_DIR, 'resumes', path.basename(a.resume));
    if (!fs.existsSync(file)) return res.status(404).json({ message: 'File missing' });
    res.download(file, `${a.name.replace(/[^a-z0-9]+/gi, '_')}_resume${path.extname(file)}`);
  })
);

// Reply to an enquiry by email from the admin panel
r.post(
  '/enquiries/:id/reply',
  asyncH(async (req, res) => {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Not found' });
    const settings = await getSettings();
    const { subject, message } = req.body;
    const html = layout(settings, `Hello ${enquiry.name},`, `<div style="white-space:pre-wrap;font-size:14px;line-height:1.6">${esc(message || '')}</div>`);
    const result = await sendMail({ to: enquiry.email, subject: subject || `Re: ${enquiry.subject || 'Your enquiry'}`, html });
    if (!result.sent) return res.status(400).json({ message: result.skipped ? 'SMTP is not configured (Settings → Email).' : result.error });
    enquiry.status = enquiry.status === 'new' ? 'in-progress' : enquiry.status;
    enquiry.notes = `${enquiry.notes ? `${enquiry.notes}\n` : ''}[${new Date().toLocaleString()}] Replied by ${req.user.name}`;
    await enquiry.save();
    res.json({ message: 'Reply sent', item: enquiry, enquiry });
  })
);

// Turn a client's feedback into a public testimonial (only if they gave consent)
r.post(
  '/feedback/:id/publish',
  asyncH(async (req, res) => {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: 'Not found' });
    if (!fb.consent) return res.status(400).json({ message: 'This person did not give consent to publish their feedback.' });
    const t = await Testimonial.create({
      name: fb.name, designation: fb.designation, company: fb.company,
      message: String(req.body?.message || fb.message).slice(0, 1200), rating: fb.rating, active: true,
      order: (await Testimonial.countDocuments()) + 1,
    });
    fb.status = 'published';
    fb.notes = `${fb.notes ? `${fb.notes}\n` : ''}[${new Date().toLocaleString()}] Published as testimonial by ${req.user.name}`;
    await fb.save();
    res.json({ message: 'Published as a testimonial', item: fb, testimonial: t });
  })
);

r.post(
  '/feedback/:id/reply',
  asyncH(async (req, res) => {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: 'Not found' });
    const settings = await getSettings();
    const { subject, message } = req.body;
    const html = layout(settings, `Hello ${fb.name},`, `<div style="white-space:pre-wrap;font-size:14px;line-height:1.6">${esc(message || '')}</div>`);
    const result = await sendMail({ to: fb.email, subject: subject || 'Thank you for your feedback', html });
    if (!result.sent) return res.status(400).json({ message: result.skipped ? 'SMTP is not configured (Settings → Email).' : result.error });
    if (fb.status === 'new') fb.status = 'reviewed';
    fb.notes = `${fb.notes ? `${fb.notes}\n` : ''}[${new Date().toLocaleString()}] Replied by ${req.user.name}`;
    await fb.save();
    res.json({ message: 'Reply sent', item: fb });
  })
);

// ---------- Media library / uploads ----------
r.post(
  '/upload',
  uploadImage.single('file'),
  asyncH(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const media = await Media.create({
      url: `/uploads/${req.file.filename}`, filename: req.file.filename,
      originalName: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size,
    });
    res.status(201).json(media);
  })
);
r.get('/media', asyncH(async (req, res) => res.json(await Media.find().sort({ createdAt: -1 }).limit(500).lean())));
r.delete(
  '/media/:id',
  asyncH(async (req, res) => {
    const m = await Media.findByIdAndDelete(req.params.id);
    if (m?.filename) fs.promises.unlink(path.join(UPLOAD_DIR, m.filename)).catch(() => {});
    res.json({ ok: true });
  })
);

// ---------- Settings ----------
r.get(
  '/settings',
  asyncH(async (req, res) => {
    const s = await getSettings();
    if (s.smtp.pass) s.smtp.pass = '********';
    res.json(s);
  })
);
r.put(
  '/settings/:section',
  asyncH(async (req, res) => {
    if (req.params.section === 'smtp' && req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const s = await updateSettings(req.params.section, req.body);
    if (s.smtp.pass) s.smtp.pass = '********';
    res.json(s);
  })
);
r.post(
  '/settings/test-email',
  adminOnly,
  asyncH(async (req, res) => {
    try {
      const cfg = await verifySmtp();
      const to = req.body.to || cfg.notify || req.user.email;
      const result = await sendMail({ to, subject: 'Test email from your website', html: layout(cfg.settings, 'SMTP is working', '<p>Your email settings are configured correctly.</p>') });
      if (!result.sent) throw new Error(result.error || 'Send failed');
      res.json({ message: `Test email sent to ${to}` });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  })
);

// ---------- Users (admin only) ----------
const users = Router();
users.use(adminOnly);
users.get('/', asyncH(async (req, res) => res.json({ items: await User.find().sort({ createdAt: 1 }).lean() })));
users.post(
  '/',
  asyncH(async (req, res) => {
    const { name, email, password, role, active } = req.body;
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });
    const u = await User.create({ name, email, password, role, active });
    res.status(201).json(u.toJSON());
  })
);
users.put(
  '/:id',
  asyncH(async (req, res) => {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    const { name, email, role, active, password } = req.body;
    if (String(u._id) === String(req.user._id) && (role !== 'admin' || active === false))
      return res.status(400).json({ message: 'You cannot demote or deactivate yourself' });
    const revoke = (role && role !== u.role) || (active === false && u.active) || !!password;
    Object.assign(u, { name, email, role, active });
    if (password) {
      const problem = passwordProblem(password);
      if (problem) return res.status(400).json({ message: problem });
      u.password = password;
      u.passwordChangedAt = new Date();
    }
    if (revoke) u.tokenVersion = (u.tokenVersion || 0) + 1; // force re-login with the new rights
    await u.save();
    res.json(u.toJSON());
  })
);
users.delete(
  '/:id',
  asyncH(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);
users.post(
  '/:id/unlock',
  asyncH(async (req, res) => {
    const u = await User.findByIdAndUpdate(req.params.id, { $set: { failedLogins: 0 }, $unset: { lockUntil: 1 } }, { new: true });
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json({ message: `${u.name} unlocked` });
  })
);
users.post(
  '/:id/revoke-sessions',
  asyncH(async (req, res) => {
    const u = await User.findByIdAndUpdate(req.params.id, { $inc: { tokenVersion: 1 } }, { new: true });
    if (!u) return res.status(404).json({ message: 'Not found' });
    res.json({ message: `${u.name} has been signed out of all devices` });
  })
);
r.use('/users', users);

// ---------- Security centre (admin only) ----------
r.get(
  '/security',
  adminOnly,
  asyncH(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 30;
    const q = {};
    if (req.query.type === 'logins') q.action = /^login\./;
    if (req.query.type === 'failed') q.success = false;
    if (req.query.type === 'changes') q.action = { $not: /^(login|account)\./ };
    const day = new Date(Date.now() - 864e5);
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@rita.local').toLowerCase();
    const [items, total, failed24h, success24h, locked, userList, ips, defaultAdmin] = await Promise.all([
      Activity.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Activity.countDocuments(q),
      Activity.countDocuments({ action: 'login.failed', createdAt: { $gte: day } }),
      Activity.countDocuments({ action: 'login.success', createdAt: { $gte: day } }),
      User.find({ lockUntil: { $gt: new Date() } }).select('name email lockUntil').lean(),
      User.find().select('name email role active lastLogin lastLoginIp passwordChangedAt lockUntil createdAt').sort({ lastLogin: -1 }).lean(),
      Activity.aggregate([
        { $match: { action: 'login.failed', createdAt: { $gte: new Date(Date.now() - 7 * 864e5) } } },
        { $group: { _id: '$ip', count: { $sum: 1 }, last: { $max: '$createdAt' } } }, { $sort: { count: -1 } }, { $limit: 8 },
      ]),
      User.findOne({ email: adminEmail }).select('+password'),
    ]);
    const secret = process.env.JWT_SECRET || '';
    res.json({
      items, total, page, pages: Math.ceil(total / limit) || 1,
      stats: { failed24h, success24h, locked: locked.length, users: userList.length },
      locked, users: userList, suspiciousIps: ips,
      checks: {
        strongSecret: secret.length >= 32 && !/change|dev-only/i.test(secret),
        production: process.env.NODE_ENV === 'production',
        https: req.secure || req.headers['x-forwarded-proto'] === 'https',
        defaultPasswordChanged: defaultAdmin ? !(await defaultAdmin.matchPassword(process.env.ADMIN_PASSWORD || 'Admin@12345')) : true,
        smtp: !!(await getSettings()).smtp?.host || !!process.env.SMTP_HOST,
      },
    });
  })
);

// ---------- Dashboard & analytics ----------
r.get(
  '/dashboard',
  asyncH(async (req, res) => {
    const [enquiries, newEnquiries, applications, newApplications, posts, services, subscribers, jobs, recentEnquiries, recentApplications,
      feedback, newFeedback, ratingAgg, locations, recentFeedback] =
      await Promise.all([
        Enquiry.countDocuments(), Enquiry.countDocuments({ status: 'new' }),
        Application.countDocuments(), Application.countDocuments({ status: 'new' }),
        Post.countDocuments(), Service.countDocuments(), Subscriber.countDocuments({ active: true }),
        Job.countDocuments({ active: true }),
        Enquiry.find().sort({ createdAt: -1 }).limit(6).lean(),
        Application.find().sort({ createdAt: -1 }).limit(6).lean(),
        Feedback.countDocuments({ status: { $ne: 'archived' } }), Feedback.countDocuments({ status: 'new' }),
        Feedback.aggregate([{ $match: { status: { $ne: 'archived' } } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
        Location.countDocuments({ active: true }),
        Feedback.find().sort({ createdAt: -1 }).limit(4).lean(),
      ]);
    res.json({
      counts: {
        enquiries, newEnquiries, applications, newApplications, posts, services, subscribers, jobs,
        feedback, newFeedback, locations,
        avgRating: ratingAgg[0]?.avg ? +ratingAgg[0].avg.toFixed(1) : 0,
      },
      recentEnquiries, recentApplications, recentFeedback,
    });
  })
);

r.get(
  '/analytics',
  asyncH(async (req, res) => {
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
    const since = new Date(Date.now() - days * 864e5);
    const prevSince = new Date(since.getTime() - days * 864e5);
    const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
    const match = { createdAt: { $gte: since } };
    const top = (field, limit = 8) => Visit.aggregate([
      { $match: { ...match, [field]: { $nin: [null, ''] } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: limit },
    ]);
    let tz = String(req.query.tz || 'UTC');
    try { new Intl.DateTimeFormat('en-CA', { timeZone: tz }); } catch { tz = 'UTC'; }
    const dayKey = (d) => d.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
    const [views, visitors, sessions, prevViews, prevVisitors, today, live, daily, pages, referrers, devices, browsers, os,
      hourly, newVisitors, timezones, countries, languages, entries, recent, allTime] = await Promise.all([
      Visit.countDocuments(match),
      Visit.distinct('visitorId', match).then((a) => a.length),
      Visit.distinct('sessionId', match).then((a) => a.length),
      Visit.countDocuments({ createdAt: { $gte: prevSince, $lt: since } }),
      Visit.distinct('visitorId', { createdAt: { $gte: prevSince, $lt: since } }).then((a) => a.length),
      Visit.countDocuments({ createdAt: { $gte: startToday } }),
      Visit.distinct('visitorId', { createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }).then((a) => a.length),
      Visit.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: tz } }, views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { _id: 0, date: '$_id', views: 1, visitors: { $size: '$visitors' } } },
        { $sort: { date: 1 } },
      ]).catch(() => []),
      top('path', 10), top('referrer'), top('device'), top('browser'), top('os'),
      Visit.aggregate([{ $match: match }, { $group: { _id: { $hour: { date: '$createdAt', timezone: tz } }, count: { $sum: 1 } } }]).catch(() => []),
      Visit.distinct('visitorId', { ...match, isNewVisitor: true }).then((a) => a.length),
      top('timezone'), top('country'), top('language', 6),
      Visit.aggregate([
        { $match: match }, { $sort: { createdAt: 1 } },
        { $group: { _id: '$sessionId', path: { $first: '$path' } } },
        { $group: { _id: '$path', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 },
      ]),
      Visit.find({ createdAt: { $gte: new Date(Date.now() - 864e5) } }).sort({ createdAt: -1 }).limit(25)
        .select('path title device browser os referrer timezone country createdAt isNewVisitor').lean(),
      Visit.estimatedDocumentCount(),
    ]);
    const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, views: hourly.find((x) => x._id === h)?.count || 0 }));
    // Fill empty days so the chart is continuous
    const map = Object.fromEntries(daily.map((d) => [d.date, d]));
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = dayKey(new Date(Date.now() - i * 864e5));
      series.push(map[d] || { date: d, views: 0, visitors: 0 });
    }
    res.json({
      days, views, visitors, sessions, today, live, prevViews, prevVisitors,
      pagesPerSession: sessions ? +(views / sessions).toFixed(2) : 0,
      series, pages, referrers, devices, browsers, os,
      hours, timezones, countries, languages, entries, recent, allTime,
      newVsReturning: [{ _id: 'New', count: newVisitors }, { _id: 'Returning', count: Math.max(0, visitors - newVisitors) }],
    });
  })
);

r.delete('/analytics', adminOnly, asyncH(async (req, res) => {
  await Visit.deleteMany({});
  res.json({ ok: true });
}));

export default r;
