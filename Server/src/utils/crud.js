import { Router } from 'express';
import slugify from 'slugify';
import sanitizeHtml from 'sanitize-html';
import { isValidObjectId } from '../db/odm.js';

export const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const HTML_FIELDS = ['content', 'description', 'aboutContent'];
const sanitizeOpts = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'span', 'iframe', 'u', 's']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['class', 'style'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
    a: ['href', 'target', 'rel'],
  },
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com', 'www.google.com'],
};
export const cleanHtml = (html) => sanitizeHtml(html || '', sanitizeOpts);

export const makeSlug = (s) => slugify(String(s || ''), { lower: true, strict: true }).slice(0, 90) || 'item';

export async function uniqueSlug(Model, base, excludeId) {
  let slug = makeSlug(base);
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${makeSlug(base)}-${++i}`;
  }
  return slug;
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function buildListQuery(req, { searchFields = [], filterFields = [] }) {
  const q = {};
  if (req.query.q && searchFields.length) {
    const rx = new RegExp(escapeRegex(String(req.query.q).slice(0, 100)), 'i');
    q.$or = searchFields.map((f) => ({ [f]: rx }));
  }
  for (const f of filterFields) {
    const v = req.query[f];
    if (v === undefined || v === '' || v === 'all') continue;
    q[f] = v === 'true' ? true : v === 'false' ? false : String(v);
  }
  return q;
}

/**
 * Admin CRUD router for a data model.
 */
export function crudRouter(Model, options = {}) {
  const {
    searchFields = ['title'],
    filterFields = [],
    sort = { order: 1, createdAt: -1 },
    slugFrom = null,
    allowCreate = true,
    beforeSave = null,
  } = options;
  const r = Router();

  const prepare = async (body, id) => {
    const data = { ...body };
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    delete data.__v;
    for (const f of HTML_FIELDS) if (typeof data[f] === 'string') data[f] = cleanHtml(data[f]);
    if (slugFrom) {
      const base = data.slug || data[slugFrom];
      if (base) data.slug = await uniqueSlug(Model, base, id);
    }
    if (beforeSave) await beforeSave(data, id);
    return data;
  };

  r.get(
    '/',
    asyncH(async (req, res) => {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 50));
      const q = buildListQuery(req, { searchFields, filterFields });
      const [items, total] = await Promise.all([
        Model.find(q).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
        Model.countDocuments(q),
      ]);
      res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
    })
  );

  r.get(
    '/:id',
    asyncH(async (req, res) => {
      if (!isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Not found' });
      const item = await Model.findById(req.params.id).lean();
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    })
  );

  if (allowCreate) {
    r.post(
      '/',
      asyncH(async (req, res) => {
        const item = await Model.create(await prepare(req.body));
        res.status(201).json(item);
      })
    );
  }

  r.put(
    '/:id',
    asyncH(async (req, res) => {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      item.set(await prepare(req.body, req.params.id));
      await item.save();
      res.json(item);
    })
  );

  r.patch(
    '/reorder/all',
    asyncH(async (req, res) => {
      const list = Array.isArray(req.body) ? req.body : [];
      await Model.bulkWrite(list.map(({ id, order }) => ({ updateOne: { filter: { _id: id }, update: { order } } })));
      res.json({ ok: true });
    })
  );

  r.delete(
    '/:id',
    asyncH(async (req, res) => {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    })
  );

  r.post(
    '/bulk-delete',
    asyncH(async (req, res) => {
      const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
      const result = await Model.deleteMany({ _id: { $in: ids } });
      res.json({ deleted: result.deletedCount });
    })
  );

  return r;
}

export function toCsv(rows, fields) {
  const escape = (v) => {
    const s = v === undefined || v === null ? '' : v instanceof Date ? v.toISOString() : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => escape(r[f])).join(','))].join('\n');
}
