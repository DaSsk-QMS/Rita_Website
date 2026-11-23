import { Schema, model } from '../db/odm.js';
import bcrypt from 'bcryptjs';

const opts = { timestamps: true };
const seoFields = {
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: { type: String, default: '' },
};

// ---------- Users ----------
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
    avatar: { type: String, default: '' },
    active: { type: Boolean, default: true },
    lastLogin: Date,
    lastLoginIp: String,
    // Security: brute-force lockout and session revocation
    failedLogins: { type: Number, default: 0 },
    lockUntil: Date,
    tokenVersion: { type: Number, default: 0 },
    passwordChangedAt: Date,
    resetToken: { type: String, select: false },
    resetExpires: { type: Date, select: false },
  },
  opts
);
userSchema.pre('save', async function hash(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = function match(pw) {
  return bcrypt.compare(pw, this.password);
};
userSchema.methods.isLocked = function locked() {
  return !!(this.lockUntil && this.lockUntil > new Date());
};
userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.password; delete ret.resetToken; delete ret.resetExpires; return ret; },
});
export const User = model('User', userSchema);

// ---------- Site settings (single document) ----------
const settingsSchema = new Schema(
  {
    key: { type: String, default: 'site', unique: true },
    general: { type: Object, default: {} },
    contact: { type: Object, default: {} },
    social: { type: Object, default: {} },
    theme: { type: Object, default: {} },
    seo: { type: Object, default: {} },
    smtp: { type: Object, default: {} },
    menu: { type: Array, default: [] },
    home: { type: Object, default: {} },
    footer: { type: Object, default: {} },
    pages: { type: Object, default: {} },
  },
  { ...opts, minimize: false }
);
export const Settings = model('Settings', settingsSchema);

// ---------- Content ----------
export const Slide = model(
  'Slide',
  new Schema(
    {
      title: { type: String, required: true },
      subtitle: String,
      description: String,
      image: { type: String, required: true },
      buttonText: String,
      buttonLink: String,
      button2Text: String,
      button2Link: String,
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    opts
  )
);

export const Service = model(
  'Service',
  new Schema(
    {
      title: { type: String, required: true },
      slug: { type: String, unique: true, index: true },
      icon: { type: String, default: 'ShieldCheck' },
      shortDescription: String,
      content: String,
      image: String,
      features: [String],
      order: { type: Number, default: 0 },
      featured: { type: Boolean, default: true },
      active: { type: Boolean, default: true },
      ...seoFields,
    },
    opts
  )
);

export const Category = model(
  'Category',
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, unique: true },
      description: String,
    },
    opts
  )
);

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    excerpt: String,
    content: String,
    coverImage: String,
    category: String,
    tags: [String],
    author: { type: String, default: 'RITA Editorial Team' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    featured: { type: Boolean, default: false },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 },
    ...seoFields,
  },
  opts
);
postSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
postSchema.pre('save', function calc(next) {
  if (this.isModified('content')) {
    const words = (this.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    this.readingTime = Math.max(1, Math.round(words / 200));
  }
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  next();
});
export const Post = model('Post', postSchema);

export const Job = model(
  'Job',
  new Schema(
    {
      title: { type: String, required: true },
      slug: { type: String, unique: true, index: true },
      department: String,
      location: String,
      type: { type: String, default: 'Full-time' },
      experience: String,
      salary: String,
      openings: { type: Number, default: 1 },
      description: String,
      responsibilities: [String],
      requirements: [String],
      deadline: Date,
      active: { type: Boolean, default: true },
    },
    opts
  )
);

export const Application = model(
  'Application',
  new Schema(
    {
      job: { type: Schema.Types.ObjectId, ref: 'Job' },
      jobTitle: String,
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      experience: String,
      currentCompany: String,
      linkedin: String,
      coverLetter: String,
      resume: String,
      status: {
        type: String,
        enum: ['new', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired'],
        default: 'new',
      },
      notes: String,
    },
    opts
  )
);

export const Enquiry = model(
  'Enquiry',
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      company: String,
      subject: String,
      service: String,
      message: { type: String, required: true },
      status: { type: String, enum: ['new', 'in-progress', 'closed', 'spam'], default: 'new' },
      notes: String,
      source: { type: String, default: 'contact' },
      ip: String,
    },
    opts
  )
);

export const GalleryItem = model(
  'GalleryItem',
  new Schema(
    {
      title: String,
      image: { type: String, required: true },
      category: { type: String, default: 'General' },
      description: String,
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    opts
  )
);

export const Client = model(
  'Client',
  new Schema(
    {
      name: { type: String, required: true },
      logo: String,
      website: String,
      industry: String,
      location: String,
      about: String, // plain text profile shown on the Clients page
      services: [String], // services delivered to this client
      since: String, // e.g. "2021"
      projects: String, // e.g. "4 projects" / "Metro Phase II"
      quote: String, // short client quote
      quoteBy: String,
      featured: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    opts
  )
);

export const Testimonial = model(
  'Testimonial',
  new Schema(
    {
      name: { type: String, required: true },
      designation: String,
      company: String,
      message: { type: String, required: true },
      photo: String,
      rating: { type: Number, default: 5, min: 1, max: 5 },
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    opts
  )
);

export const TeamMember = model(
  'TeamMember',
  new Schema(
    {
      name: { type: String, required: true },
      designation: String,
      bio: String,
      photo: String,
      linkedin: String,
      email: String,
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
    },
    opts
  )
);

// ---------- Client / visitor feedback ----------
export const Feedback = model(
  'Feedback',
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      company: String,
      designation: String,
      category: { type: String, default: 'Service quality' },
      service: String,
      rating: { type: Number, min: 1, max: 5, required: true },
      nps: { type: Number, min: 0, max: 10 }, // "How likely are you to recommend us?"
      message: { type: String, required: true },
      consent: { type: Boolean, default: false }, // allowed to publish as testimonial
      status: { type: String, enum: ['new', 'reviewed', 'published', 'archived'], default: 'new' },
      notes: String,
      ip: String,
    },
    opts
  )
);

// ---------- Service areas (local SEO landing pages) ----------
export const Location = model(
  'Location',
  new Schema(
    {
      name: { type: String, required: true }, // e.g. Hyderabad
      slug: { type: String, unique: true, index: true },
      region: { type: String, default: 'Telangana' },
      headline: String,
      intro: String,
      content: String, // rich text
      highlights: [String],
      image: String,
      latitude: Number,
      longitude: Number,
      order: { type: Number, default: 0 },
      active: { type: Boolean, default: true },
      ...seoFields,
    },
    opts
  )
);

// ---------- Security audit log ----------
const activitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    email: String,
    action: { type: String, required: true }, // login.success, login.failed, settings.update ...
    target: String,
    ip: String,
    userAgent: String,
    success: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });
export const Activity = model('Activity', activitySchema);

export const Subscriber = model(
  'Subscriber',
  new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      active: { type: Boolean, default: true },
    },
    opts
  )
);

export const PageSeo = model(
  'PageSeo',
  new Schema(
    {
      path: { type: String, required: true, unique: true },
      title: String,
      description: String,
      keywords: String,
      ogImage: String,
    },
    opts
  )
);

export const Media = model(
  'Media',
  new Schema(
    {
      url: { type: String, required: true },
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
    },
    opts
  )
);

// ---------- Visitor analytics ----------
const visitSchema = new Schema(
  {
    path: String,
    title: String,
    referrer: String,
    visitorId: String,
    sessionId: String,
    device: String,
    browser: String,
    os: String,
    language: String,
    screen: String,
    timezone: String,
    country: String,
    isNewVisitor: { type: Boolean, default: false },
    ipHash: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
visitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 400 });
visitSchema.index({ path: 1, createdAt: -1 });
export const Visit = model('Visit', visitSchema);
