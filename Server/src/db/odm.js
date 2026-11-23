/**
 * Small Mongoose-compatible document layer on top of MySQL / MariaDB.
 *
 * Every model is stored in its own table:  _id CHAR(24) | createdAt DATETIME(3) | data LONGTEXT (JSON)
 * Queries use the same API and operators the app already used with Mongoose
 * (find/findOne/sort/select/lean, $in/$gte/$or/regex..., aggregate pipelines, $set/$inc updates),
 * so routes did not need to be rewritten. `_id` and `createdAt` filters are pushed down to SQL;
 * everything else is evaluated in Node (the site's content tables are small).
 *
 * A pure in-memory driver is available for local development (USE_MEMORY_DB=true).
 */
import crypto from 'crypto';

// ---------------------------------------------------------------- ids
let counter = crypto.randomInt(0, 0xffffff);
const machine = crypto.randomBytes(5).toString('hex');
export function newId() {
  counter = (counter + 1) % 0xffffff;
  const t = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  return t + machine + counter.toString(16).padStart(6, '0');
}
export const isValidObjectId = (v) => typeof v === 'string' ? /^[a-f0-9]{24}$/i.test(v) : !!(v && /^[a-f0-9]{24}$/i.test(String(v)));

// ---------------------------------------------------------------- schema
const ObjectIdType = function ObjectId() {};
export class Schema {
  constructor(def = {}, options = {}) {
    this.def = def;
    this.options = options;
    this.paths = {};
    for (const [k, v] of Object.entries(def)) this.paths[k] = Schema.normalize(v);
    this.pre_ = [];
    this.methods = {};
    this.indexes = [];
    this._toJSON = null;
    const ts = options.timestamps;
    this.ts = {
      createdAt: ts === true || (ts && ts.createdAt !== false),
      updatedAt: ts === true || (ts && ts.updatedAt !== false),
    };
  }

  static normalize(v) {
    if (Array.isArray(v)) return { type: Array, of: v[0] ? Schema.normalize(v[0]).type : null, default: () => [] };
    if (typeof v === 'function') return { type: v };
    if (v && typeof v === 'object' && 'type' in v) {
      const o = { ...v };
      if (Array.isArray(o.type)) { o.of = o.type[0]; o.type = Array; }
      return o;
    }
    return { type: Object };
  }

  pre(event, fn) { if (event === 'save') this.pre_.push(fn); return this; }
  index(fields, opts = {}) { this.indexes.push({ fields, opts }); return this; }
  set(key, val) { if (key === 'toJSON') this._toJSON = val; return this; }
}
Schema.Types = { ObjectId: ObjectIdType, Mixed: Object };

// ---------------------------------------------------------------- casting / validation
class ValidationError extends Error {
  constructor(errors) {
    super(Object.values(errors).map((e) => e.message).join(', '));
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

function castValue(p, v) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const t = p.type;
  if (t === String) {
    let s = typeof v === 'string' ? v : typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (p.trim) s = s.trim();
    if (p.lowercase) s = s.toLowerCase();
    return s;
  }
  if (t === Number) {
    if (v === '') return null;
    const n = Number(v);
    if (Number.isNaN(n)) throw new Error('number');
    return n;
  }
  if (t === Boolean) {
    if (v === 'true' || v === 1 || v === '1') return true;
    if (v === 'false' || v === 0 || v === '0' || v === '') return false;
    return !!v;
  }
  if (t === Date) {
    if (v === '') return null;
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) throw new Error('date');
    return d;
  }
  if (t === ObjectIdType) return String(v);
  if (t === Array) {
    const arr = Array.isArray(v) ? v : [v];
    if (!p.of) return arr;
    return arr.filter((x) => x !== undefined && x !== null).map((x) => castValue({ type: p.of }, x));
  }
  return v; // Object / Mixed
}

function reviveDates(schema, obj) {
  for (const [k, p] of Object.entries(schema.paths)) {
    if (p.type === Date && obj[k] != null && !(obj[k] instanceof Date)) obj[k] = new Date(obj[k]);
  }
  for (const k of ['createdAt', 'updatedAt']) if (obj[k] != null && !(obj[k] instanceof Date)) obj[k] = new Date(obj[k]);
  return obj;
}

// ---------------------------------------------------------------- matching
const isPlainObj = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof RegExp);
const norm = (v) => (v instanceof Date ? v.getTime() : v);
const eq = (a, b) => {
  if (a == null && b == null) return true;
  return norm(a) === norm(b) || (a != null && b != null && String(norm(a)) === String(norm(b)) && typeof norm(a) === typeof norm(b));
};
function getPath(obj, path) {
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
const cmp = (a, b) => {
  a = norm(a); b = norm(b);
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'boolean') a = +a;
  if (typeof b === 'boolean') b = +b;
  return a < b ? -1 : a > b ? 1 : 0;
};

function matchOp(val, cond) {
  const vals = Array.isArray(val) ? val : [val];
  if (cond instanceof RegExp) return vals.some((v) => typeof v === 'string' && cond.test(v));
  if (!isPlainObj(cond) || !Object.keys(cond).some((k) => k.startsWith('$'))) {
    if (Array.isArray(val) && !Array.isArray(cond)) return val.some((v) => eq(v, cond));
    if (Array.isArray(cond)) return JSON.stringify(val) === JSON.stringify(cond);
    return eq(val, cond);
  }
  for (const [op, arg] of Object.entries(cond)) {
    switch (op) {
      case '$eq': if (!matchOp(val, arg)) return false; break;
      case '$ne': if (matchOp(val, arg)) return false; break;
      case '$in': if (!arg.some((a) => matchOp(val, a))) return false; break;
      case '$nin': if (arg.some((a) => matchOp(val, a))) return false; break;
      case '$gt': if (!vals.some((v) => v != null && cmp(v, arg) > 0)) return false; break;
      case '$gte': if (!vals.some((v) => v != null && cmp(v, arg) >= 0)) return false; break;
      case '$lt': if (!vals.some((v) => v != null && cmp(v, arg) < 0)) return false; break;
      case '$lte': if (!vals.some((v) => v != null && cmp(v, arg) <= 0)) return false; break;
      case '$exists': if ((val !== undefined && val !== null) !== !!arg) return false; break;
      case '$not': if (matchOp(val, arg)) return false; break;
      case '$regex': if (!matchOp(val, new RegExp(arg, cond.$options || ''))) return false; break;
      case '$options': break;
      case '$size': if (!Array.isArray(val) || val.length !== arg) return false; break;
      default: throw new Error(`Unsupported query operator ${op}`);
    }
  }
  return true;
}

export function matches(doc, filter = {}) {
  for (const [k, cond] of Object.entries(filter || {})) {
    if (k === '$or') { if (!cond.some((f) => matches(doc, f))) return false; continue; }
    if (k === '$and') { if (!cond.every((f) => matches(doc, f))) return false; continue; }
    if (k === '$nor') { if (cond.some((f) => matches(doc, f))) return false; continue; }
    if (k === '$text' || k === '$where') continue;
    if (!matchOp(getPath(doc, k), cond)) return false;
  }
  return true;
}

function sortRows(rows, sort) {
  const keys = Object.entries(sort || {});
  if (!keys.length) return rows;
  return rows.sort((a, b) => {
    for (const [k, dir] of keys) {
      const c = cmp(getPath(a, k), getPath(b, k));
      if (c) return dir < 0 || dir === 'desc' ? -c : c;
    }
    return 0;
  });
}

// ---------------------------------------------------------------- projection
function parseSelect(sel) {
  const out = { include: [], exclude: [], plus: [] };
  if (!sel) return out;
  const list = typeof sel === 'string' ? sel.split(/\s+/).filter(Boolean) : Object.entries(sel).map(([k, v]) => (v ? k : `-${k}`));
  for (const f of list) {
    if (f.startsWith('+')) out.plus.push(f.slice(1));
    else if (f.startsWith('-')) out.exclude.push(f.slice(1));
    else out.include.push(f);
  }
  return out;
}
function project(schema, obj, sel) {
  const hidden = Object.entries(schema.paths).filter(([, p]) => p.select === false).map(([k]) => k);
  let out;
  if (sel.include.length) {
    out = { _id: obj._id };
    for (const f of [...sel.include, ...sel.plus]) if (obj[f] !== undefined) out[f] = obj[f];
  } else {
    out = { ...obj };
    for (const f of hidden) if (!sel.plus.includes(f)) delete out[f];
    for (const f of sel.exclude) delete out[f];
  }
  return out;
}

// ---------------------------------------------------------------- update operators
function applyUpdate(obj, update, schema) {
  const hasOps = Object.keys(update).some((k) => k.startsWith('$'));
  const set = hasOps ? update.$set || {} : update;
  const castPath = (k, v) => (schema.paths[k] ? castValue(schema.paths[k], v) : v);
  for (const [k, v] of Object.entries(set)) obj[k] = castPath(k, v);
  for (const k of Object.keys(update.$unset || {})) delete obj[k];
  for (const [k, v] of Object.entries(update.$inc || {})) obj[k] = (Number(obj[k]) || 0) + Number(v);
  for (const [k, v] of Object.entries(update.$push || {})) obj[k] = [...(obj[k] || []), v];
  for (const [k, v] of Object.entries(update.$setOnInsert || {})) if (obj[k] === undefined) obj[k] = castPath(k, v);
  return obj;
}

// ---------------------------------------------------------------- aggregation
function expr(e, doc) {
  if (typeof e === 'string' && e.startsWith('$')) return getPath(doc, e.slice(1));
  if (isPlainObj(e)) {
    if (e.$dateToString) {
      const { date, timezone = 'UTC' } = e.$dateToString;
      const d = expr(date, doc);
      return d ? new Date(d).toLocaleDateString('en-CA', { timeZone: timezone }) : null;
    }
    if (e.$hour) {
      const spec = isPlainObj(e.$hour) ? e.$hour : { date: e.$hour };
      const d = expr(spec.date, doc);
      if (!d) return null;
      return Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: spec.timezone || 'UTC' }).format(new Date(d))) % 24;
    }
    if (e.$size) { const a = expr(e.$size, doc); return Array.isArray(a) ? a.length : 0; }
    const out = {};
    for (const [k, v] of Object.entries(e)) out[k] = expr(v, doc);
    return out;
  }
  return e;
}

export function aggregateRows(rows, pipeline) {
  let data = rows;
  for (const stage of pipeline) {
    const [op, arg] = Object.entries(stage)[0];
    if (op === '$match') data = data.filter((d) => matches(d, arg));
    else if (op === '$sort') data = sortRows([...data], arg);
    else if (op === '$limit') data = data.slice(0, arg);
    else if (op === '$skip') data = data.slice(arg);
    else if (op === '$unwind') {
      const f = String(typeof arg === 'string' ? arg : arg.path).slice(1);
      data = data.flatMap((d) => (Array.isArray(d[f]) ? d[f].map((x) => ({ ...d, [f]: x })) : d[f] == null ? [] : [d]));
    } else if (op === '$group') {
      const groups = new Map();
      for (const d of data) {
        const id = expr(arg._id, d);
        const key = JSON.stringify(id ?? null);
        if (!groups.has(key)) groups.set(key, { id: id ?? null, docs: [] });
        groups.get(key).docs.push(d);
      }
      data = [...groups.values()].map(({ id, docs }) => {
        const out = { _id: id };
        for (const [k, acc] of Object.entries(arg)) {
          if (k === '_id') continue;
          const [aop, aexp] = Object.entries(acc)[0];
          const vals = docs.map((d) => expr(aexp, d));
          const nums = vals.filter((v) => typeof v === 'number');
          if (aop === '$sum') out[k] = typeof aexp === 'number' ? aexp * docs.length : nums.reduce((s, v) => s + v, 0);
          else if (aop === '$avg') out[k] = nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : null;
          else if (aop === '$max') out[k] = vals.filter((v) => v != null).reduce((m, v) => (m == null || cmp(v, m) > 0 ? v : m), null);
          else if (aop === '$min') out[k] = vals.filter((v) => v != null).reduce((m, v) => (m == null || cmp(v, m) < 0 ? v : m), null);
          else if (aop === '$first') out[k] = vals[0];
          else if (aop === '$last') out[k] = vals[vals.length - 1];
          else if (aop === '$push') out[k] = vals;
          else if (aop === '$addToSet') {
            const seen = new Map();
            for (const v of vals) seen.set(JSON.stringify(v), v);
            out[k] = [...seen.values()];
          } else throw new Error(`Unsupported accumulator ${aop}`);
        }
        return out;
      });
    } else if (op === '$project') {
      data = data.map((d) => {
        const out = arg._id === 0 || arg._id === false ? {} : { _id: d._id };
        for (const [k, v] of Object.entries(arg)) {
          if (k === '_id') continue;
          if (v === 1 || v === true) out[k] = d[k];
          else if (v !== 0 && v !== false) out[k] = expr(v, d);
        }
        return out;
      });
    } else if (op === '$count') data = [{ [arg]: data.length }];
    else throw new Error(`Unsupported aggregation stage ${op}`);
  }
  return data;
}

// ---------------------------------------------------------------- drivers
/** Extracts the parts of a filter that SQL can answer (by _id and createdAt range). */
function sqlHints(filter = {}) {
  const h = {};
  const id = filter._id;
  if (typeof id === 'string') h.id = id;
  else if (isPlainObj(id) && Array.isArray(id.$in) && !Object.keys(id).some((k) => k !== '$in')) h.ids = id.$in.map(String);
  const c = filter.createdAt;
  if (isPlainObj(c)) {
    for (const op of ['$gte', '$gt', '$lt', '$lte']) if (c[op] instanceof Date) h[op] = c[op];
  }
  return h;
}

class MemoryDriver {
  constructor() { this.tables = new Map(); }
  async ensureTable(name) { if (!this.tables.has(name)) this.tables.set(name, new Map()); }
  async load(name, filter) {
    const t = this.tables.get(name);
    const h = sqlHints(filter);
    if (h.id) return t.has(h.id) ? [structuredClone(t.get(h.id))] : [];
    return [...t.values()].map((r) => structuredClone(r));
  }
  async count(name) { return this.tables.get(name).size; }
  async insert(name, obj) {
    const t = this.tables.get(name);
    if (t.has(obj._id)) throw Object.assign(new Error('Duplicate _id'), { code: 11000, keyValue: { _id: obj._id } });
    t.set(obj._id, structuredClone(obj));
  }
  async update(name, obj) { this.tables.get(name).set(obj._id, structuredClone(obj)); }
  async remove(name, ids) {
    const t = this.tables.get(name);
    let n = 0;
    for (const id of ids) if (t.delete(id)) n++;
    return n;
  }
  async removeOlderThan(name, date) {
    const t = this.tables.get(name);
    for (const [id, r] of t) if (r.createdAt && new Date(r.createdAt) < date) t.delete(id);
  }
  async close() {}
  // Atomic counters
  async counterEnsure(key, start) { this.counters ??= new Map(); if (!this.counters.has(key)) this.counters.set(key, start); }
  async counterIncr(key, start) { await this.counterEnsure(key, start); const v = this.counters.get(key) + 1; this.counters.set(key, v); return v; }
  async counterGet(key, start) { await this.counterEnsure(key, start); return this.counters.get(key); }
}

const toSqlDate = (d) => (d ? new Date(d) : null);

class MySqlDriver {
  constructor(pool, prefix) {
    this.pool = pool;
    this.prefix = prefix;
    this.cache = new Map(); // short-lived read cache: identical reads within a request burst share one query
  }
  t(name) { return `\`${this.prefix}${name}\``; }
  async ensureTable(name) {
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS ${this.t(name)} (
        \`_id\` CHAR(24) NOT NULL PRIMARY KEY,
        \`createdAt\` DATETIME(3) NULL,
        \`data\` LONGTEXT NOT NULL,
        INDEX \`idx_createdAt\` (\`createdAt\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );
  }
  invalidate(name) { for (const k of this.cache.keys()) if (k.startsWith(`${name}|`)) this.cache.delete(k); }
  async load(name, filter) {
    const h = sqlHints(filter);
    const where = [];
    const params = [];
    if (h.id) { where.push('`_id` = ?'); params.push(h.id); }
    if (h.ids) {
      if (!h.ids.length) return [];
      where.push(`\`_id\` IN (${h.ids.map(() => '?').join(',')})`); params.push(...h.ids);
    }
    const ops = { $gte: '>=', $gt: '>', $lt: '<', $lte: '<=' };
    for (const [op, sym] of Object.entries(ops)) if (h[op]) { where.push(`\`createdAt\` ${sym} ?`); params.push(h[op]); }
    const sql = `SELECT \`data\` FROM ${this.t(name)}${where.length ? ` WHERE ${where.join(' AND ')}` : ''}`;
    const key = `${name}|${sql}|${params.map((p) => (p instanceof Date ? p.toISOString() : p)).join(',')}`;
    let entry = this.cache.get(key);
    if (!entry || Date.now() - entry.at > 1500) {
      entry = { at: Date.now(), p: this.pool.query(sql, params).then(([rows]) => rows.map((r) => r.data)) };
      this.cache.set(key, entry);
      entry.p.catch(() => this.cache.delete(key));
      if (this.cache.size > 200) this.cache.delete(this.cache.keys().next().value);
    }
    const raw = await entry.p;
    return raw.map((s) => JSON.parse(s));
  }
  async count(name) {
    const [rows] = await this.pool.query(`SELECT COUNT(*) AS n FROM ${this.t(name)}`);
    return Number(rows[0].n);
  }
  async insert(name, obj) {
    this.invalidate(name);
    try {
      await this.pool.query(`INSERT INTO ${this.t(name)} (\`_id\`, \`createdAt\`, \`data\`) VALUES (?, ?, ?)`, [obj._id, toSqlDate(obj.createdAt), JSON.stringify(obj)]);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') throw Object.assign(new Error('Duplicate _id'), { code: 11000, keyValue: { _id: obj._id } });
      throw e;
    }
  }
  async update(name, obj) {
    this.invalidate(name);
    await this.pool.query(`UPDATE ${this.t(name)} SET \`createdAt\` = ?, \`data\` = ? WHERE \`_id\` = ?`, [toSqlDate(obj.createdAt), JSON.stringify(obj), obj._id]);
  }
  async remove(name, ids) {
    if (!ids.length) return 0;
    this.invalidate(name);
    const [res] = await this.pool.query(`DELETE FROM ${this.t(name)} WHERE \`_id\` IN (${ids.map(() => '?').join(',')})`, ids);
    return res.affectedRows;
  }
  async removeOlderThan(name, date) {
    this.invalidate(name);
    await this.pool.query(`DELETE FROM ${this.t(name)} WHERE \`createdAt\` < ?`, [date]);
  }
  async close() { await this.pool.end(); }
  // Atomic counters: a single SQL statement per increment, safe with concurrent requests / multiple processes.
  async counterEnsure(key, start) {
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS ${this.t('site_counters')} (
        \`k\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`v\` BIGINT UNSIGNED NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );
    await this.pool.query(`INSERT IGNORE INTO ${this.t('site_counters')} (\`k\`, \`v\`) VALUES (?, ?)`, [key, start]);
  }
  async counterIncr(key, start) {
    // LAST_INSERT_ID(expr) hands the new value back on this connection without a second query.
    const [res] = await this.pool.query(`UPDATE ${this.t('site_counters')} SET \`v\` = LAST_INSERT_ID(\`v\` + 1) WHERE \`k\` = ?`, [key]);
    if (res.affectedRows) return Number(res.insertId);
    await this.counterEnsure(key, start);
    return this.counterIncr(key, start);
  }
  async counterGet(key, start) {
    const [rows] = await this.pool.query(`SELECT \`v\` FROM ${this.t('site_counters')} WHERE \`k\` = ?`, [key]);
    return rows.length ? Number(rows[0].v) : start;
  }
}

// ---------------------------------------------------------------- connection
const state = { driver: null, models: new Map(), info: '', ttlTimer: null };

export async function connect({ memory = false, url, host, port, user, password, database, prefix = '' } = {}) {
  if (memory) {
    state.driver = new MemoryDriver();
    state.info = 'memory';
  } else {
    const mysql = (await import('mysql2/promise')).default;
    const pool = url
      ? mysql.createPool({ uri: url, connectionLimit: 8, timezone: 'Z', charset: 'utf8mb4', dateStrings: false })
      : mysql.createPool({ host, port: Number(port) || 3306, user, password, database, connectionLimit: 8, timezone: 'Z', charset: 'utf8mb4' });
    await pool.query('SELECT 1');
    state.driver = new MySqlDriver(pool, prefix);
    state.info = url ? new URL(url).host + new URL(url).pathname : `${host}/${database}`;
  }
  for (const m of state.models.values()) await m.init();
  // TTL cleanup (replaces MongoDB expireAfterSeconds indexes)
  const sweep = async () => {
    for (const m of state.models.values()) {
      for (const { fields, opts } of m.schema.indexes) {
        if (opts.expireAfterSeconds && fields.createdAt) {
          await state.driver.removeOlderThan(m.table, new Date(Date.now() - opts.expireAfterSeconds * 1000)).catch(() => {});
        }
      }
    }
  };
  sweep();
  state.ttlTimer = setInterval(sweep, 6 * 60 * 60 * 1000);
  state.ttlTimer.unref?.();
  return state.info;
}

export async function disconnect() {
  if (state.ttlTimer) clearInterval(state.ttlTimer);
  if (state.driver) await state.driver.close();
  state.driver = null;
}

const driver = () => {
  if (!state.driver) throw new Error('Database is not connected');
  return state.driver;
};

/** Persistent atomic counters (e.g. total site visits). `start` is the initial value. */
export const counters = {
  ensure: (key, start = 0) => driver().counterEnsure(key, start),
  incr: (key, start = 0) => driver().counterIncr(key, start),
  get: (key, start = 0) => driver().counterGet(key, start),
};

// ---------------------------------------------------------------- query objects
class Query {
  constructor(Model, kind, filter, extra = {}) {
    this.Model = Model;
    this.kind = kind; // find | findOne
    this.filter = filter || {};
    this.extra = extra;
    this._sort = null;
    this._skip = 0;
    this._limit = 0;
    this._select = null;
    this._lean = false;
  }
  sort(s) {
    if (typeof s === 'string') {
      s = Object.fromEntries(s.split(/\s+/).filter(Boolean).map((f) => (f.startsWith('-') ? [f.slice(1), -1] : [f, 1])));
    }
    this._sort = s; return this;
  }
  skip(n) { this._skip = Number(n) || 0; return this; }
  limit(n) { this._limit = Number(n) || 0; return this; }
  select(s) { this._select = s; return this; }
  lean() { this._lean = true; return this; }
  populate() { return this; }
  async exec() {
    const M = this.Model;
    let rows = (await M.rows(this.filter)).filter((r) => matches(r, this.filter));
    if (this._sort) rows = sortRows(rows, this._sort);
    if (this._skip) rows = rows.slice(this._skip);
    if (this.kind === 'findOne') rows = rows.slice(0, 1);
    else if (this._limit) rows = rows.slice(0, this._limit);
    const sel = parseSelect(this._select);
    const out = rows.map((r) => {
      const p = project(M.schema, r, sel);
      return this._lean ? p : M.hydrate(p, r);
    });
    return this.kind === 'findOne' ? out[0] || null : out;
  }
  then(res, rej) { return this.exec().then(res, rej); }
  catch(rej) { return this.exec().catch(rej); }
  finally(fn) { return this.exec().finally(fn); }
}

/** For findOneAndUpdate / findByIdAndUpdate / findByIdAndDelete: thenable with lean()/select(). */
class OpQuery {
  constructor(Model, fn) { this.Model = Model; this.fn = fn; this._lean = false; this._select = null; }
  lean() { this._lean = true; return this; }
  select(s) { this._select = s; return this; }
  populate() { return this; }
  async exec() {
    const r = await this.fn();
    if (!r) return null;
    const p = project(this.Model.schema, r, parseSelect(this._select));
    return this._lean ? p : this.Model.hydrate(p, r);
  }
  then(res, rej) { return this.exec().then(res, rej); }
  catch(rej) { return this.exec().catch(rej); }
}

// ---------------------------------------------------------------- documents & models
const INTERNAL = Symbol('doc');

export function model(name, schema) {
  const table = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

  class Model {
    constructor(data = {}) {
      Object.defineProperty(this, INTERNAL, { value: { isNew: true, orig: {} }, enumerable: false, writable: true });
      if (data._id) this._id = String(data._id);
      for (const [k, p] of Object.entries(schema.paths)) {
        if (data[k] !== undefined) this[k] = data[k];
        else if (p.default !== undefined) this[k] = typeof p.default === 'function' ? p.default() : structuredClone(p.default);
      }
      if (data.createdAt && schema.ts.createdAt) this.createdAt = new Date(data.createdAt);
      if (data.updatedAt && schema.ts.updatedAt) this.updatedAt = new Date(data.updatedAt);
    }

    get isNew() { return this[INTERNAL].isNew; }
    get id() { return this._id; }

    isModified(path) {
      if (this[INTERNAL].isNew) return path ? this[path] !== undefined : true;
      const cur = (k) => JSON.stringify(this[k] === undefined ? null : this[k]);
      const was = (k) => JSON.stringify(this[INTERNAL].orig[k] === undefined ? null : this[INTERNAL].orig[k]);
      if (path) return cur(path) !== was(path);
      return Object.keys(schema.paths).some((k) => cur(k) !== was(k));
    }

    set(obj, val) {
      if (typeof obj === 'string') { this[obj] = val; return this; }
      for (const [k, v] of Object.entries(obj || {})) if (schema.paths[k]) this[k] = v;
      return this;
    }

    get(path) { return this[path]; }
    markModified() {}

    toObject({ all = false } = {}) {
      const out = {};
      if (this._id) out._id = this._id;
      for (const k of Object.keys(schema.paths)) {
        if (this[k] === undefined) continue;
        if (!all && !Object.prototype.propertyIsEnumerable.call(this, k)) continue; // hidden by select()
        out[k] = this[k];
      }
      if (this.createdAt) out.createdAt = this.createdAt;
      if (this.updatedAt) out.updatedAt = this.updatedAt;
      return out;
    }

    toJSON() {
      const ret = this.toObject();
      if (schema._toJSON?.transform) return schema._toJSON.transform(this, ret) || ret;
      return ret;
    }

    /** Casts all fields; collects validation errors. */
    castAll(validate = true) {
      const errors = {};
      for (const [k, p] of Object.entries(schema.paths)) {
        try {
          this[k] = castValue(p, this[k]);
        } catch {
          errors[k] = { message: `${k}: invalid value`, path: k };
          continue;
        }
        if (!validate) continue;
        const v = this[k];
        const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && p.type !== Array && !v.length);
        if (p.required && empty) { errors[k] = { message: `${k} is required`, path: k }; continue; }
        if (empty) continue;
        if (p.enum && !p.enum.includes(v)) errors[k] = { message: `\`${v}\` is not a valid value for ${k}`, path: k };
        if (p.min !== undefined && typeof v === 'number' && v < p.min) errors[k] = { message: `${k} must be at least ${p.min}`, path: k };
        if (p.max !== undefined && typeof v === 'number' && v > p.max) errors[k] = { message: `${k} must be at most ${p.max}`, path: k };
        if (p.minlength && typeof v === 'string' && v.length < p.minlength) errors[k] = { message: `${k} must be at least ${p.minlength} characters`, path: k };
        if (p.maxlength && typeof v === 'string' && v.length > p.maxlength) errors[k] = { message: `${k} is too long`, path: k };
      }
      if (Object.keys(errors).length) throw new ValidationError(errors);
    }

    async save(opts = {}) {
      const validate = opts.validateBeforeSave !== false;
      this.castAll(validate);
      for (const fn of schema.pre_) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve, reject) => {
          let done = false;
          const next = (err) => { if (done) return; done = true; err ? reject(err) : resolve(); };
          try {
            const r = fn.call(this, next);
            if (r && typeof r.then === 'function') r.then(() => next(), next);
            else if (fn.length === 0) next();
          } catch (e) { next(e); }
        });
      }
      this.castAll(false);
      await Model.checkUnique(this);
      const now = new Date();
      const isNew = this[INTERNAL].isNew;
      if (isNew) {
        if (!this._id) this._id = newId();
        if (schema.ts.createdAt && !this.createdAt) this.createdAt = now;
      }
      if (schema.ts.updatedAt) this.updatedAt = now;
      const obj = this.toObject({ all: true });
      if (isNew) await driver().insert(table, obj);
      else await driver().update(table, obj);
      this[INTERNAL].isNew = false;
      this[INTERNAL].orig = structuredClone(obj);
      return this;
    }

    async deleteOne() { await driver().remove(table, [this._id]); return this; }

    // ---------- statics
    static get modelName() { return name; }
    static get table() { return table; }
    static get schema() { return schema; }

    static async init() { await driver().ensureTable(table); }

    static async rows(filter) {
      return (await driver().load(table, filter)).map((r) => reviveDates(schema, r));
    }

    static hydrate(projected, full) {
      const d = new Model(projected);
      d[INTERNAL].isNew = false;
      d[INTERNAL].orig = structuredClone(full || projected);
      // keep fields the projection hid so saving a partial document doesn't wipe them
      for (const [k, v] of Object.entries(full || {})) {
        if (projected[k] === undefined && k !== '_id') Object.defineProperty(d, k, { value: v, enumerable: false, writable: true, configurable: true });
      }
      return d;
    }

    static async checkUnique(doc) {
      const uniques = Object.entries(schema.paths).filter(([, p]) => p.unique).map(([k]) => k);
      if (!uniques.length) return;
      const rows = await Model.rows({});
      for (const k of uniques) {
        const v = doc[k];
        if (v === undefined || v === null || v === '') continue;
        if (rows.some((r) => r._id !== doc._id && eq(r[k], v))) {
          throw Object.assign(new Error(`Duplicate value: ${k}`), { code: 11000, keyValue: { [k]: v } });
        }
      }
    }

    static find(filter = {}, projection) {
      const q = new Query(Model, 'find', filter);
      if (projection) q.select(projection);
      return q;
    }
    static findOne(filter = {}, projection) {
      const q = new Query(Model, 'findOne', filter);
      if (projection) q.select(projection);
      return q;
    }
    static findById(id, projection) {
      if (!isValidObjectId(id)) return new OpQuery(Model, async () => null);
      return Model.findOne({ _id: String(id) }, projection);
    }
    static async exists(filter = {}) {
      const r = await Model.findOne(filter).select('_id').lean();
      return r ? { _id: r._id } : null;
    }
    static async countDocuments(filter = {}) {
      if (!Object.keys(filter).length) return driver().count(table);
      return (await Model.rows(filter)).filter((r) => matches(r, filter)).length;
    }
    static async estimatedDocumentCount() { return driver().count(table); }
    static async distinct(field, filter = {}) {
      const seen = new Map();
      for (const r of (await Model.rows(filter)).filter((x) => matches(x, filter))) {
        const v = getPath(r, field);
        for (const x of Array.isArray(v) ? v : [v]) if (x !== undefined) seen.set(JSON.stringify(x), x);
      }
      return [...seen.values()];
    }
    static async create(data) {
      if (Array.isArray(data)) {
        const out = [];
        // eslint-disable-next-line no-await-in-loop
        for (const d of data) out.push(await Model.create(d));
        return out;
      }
      const doc = new Model(data);
      return doc.save();
    }
    static async insertMany(list) { return Model.create(list); }
    static async deleteMany(filter = {}) {
      const ids = (await Model.rows(filter)).filter((r) => matches(r, filter)).map((r) => r._id);
      return { deletedCount: await driver().remove(table, ids), acknowledged: true };
    }
    static async deleteOne(filter = {}) {
      const r = (await Model.rows(filter)).find((x) => matches(x, filter));
      return { deletedCount: r ? await driver().remove(table, [r._id]) : 0, acknowledged: true };
    }
    static findByIdAndDelete(id) {
      return new OpQuery(Model, async () => {
        if (!isValidObjectId(id)) return null;
        const [r] = await Model.rows({ _id: String(id) });
        if (r) await driver().remove(table, [r._id]);
        return r || null;
      });
    }
    static findOneAndDelete(filter) {
      return new OpQuery(Model, async () => {
        const r = (await Model.rows(filter)).find((x) => matches(x, filter));
        if (r) await driver().remove(table, [r._id]);
        return r || null;
      });
    }

    /** Applies an update to one stored row; returns [before, after] or null. */
    static async updateRow(filter, update, { upsert = false } = {}) {
      let r = (await Model.rows(filter)).find((x) => matches(x, filter));
      const now = new Date();
      if (!r) {
        if (!upsert) return null;
        const base = {};
        for (const [k, v] of Object.entries(filter)) if (!k.startsWith('$') && !isPlainObj(v) && !(v instanceof RegExp)) base[k] = v;
        const doc = new Model(base);
        applyUpdate(doc, update, schema);
        await doc.save({ validateBeforeSave: false });
        return [null, doc.toObject()];
      }
      const before = structuredClone(r);
      r = applyUpdate(r, update, schema);
      if (schema.ts.updatedAt) r.updatedAt = now;
      await driver().update(table, r);
      return [before, r];
    }
    static async updateOne(filter, update, opts = {}) {
      const res = await Model.updateRow(filter, update, opts);
      return { acknowledged: true, matchedCount: res && res[0] ? 1 : 0, modifiedCount: res ? 1 : 0, upsertedCount: res && !res[0] ? 1 : 0 };
    }
    static async updateMany(filter, update) {
      const rows = (await Model.rows(filter)).filter((x) => matches(x, filter));
      for (const r of rows) {
        applyUpdate(r, update, schema);
        if (schema.ts.updatedAt) r.updatedAt = new Date();
        // eslint-disable-next-line no-await-in-loop
        await driver().update(table, r);
      }
      return { acknowledged: true, matchedCount: rows.length, modifiedCount: rows.length };
    }
    static findOneAndUpdate(filter, update, opts = {}) {
      return new OpQuery(Model, async () => {
        const res = await Model.updateRow(filter, update, opts);
        if (!res) return null;
        return opts.new || opts.returnDocument === 'after' ? res[1] : res[0];
      });
    }
    static findByIdAndUpdate(id, update, opts = {}) {
      if (!isValidObjectId(id)) return new OpQuery(Model, async () => null);
      return Model.findOneAndUpdate({ _id: String(id) }, update, opts);
    }
    static async bulkWrite(ops = []) {
      let n = 0;
      for (const op of ops) {
        // eslint-disable-next-line no-await-in-loop
        if (op.updateOne) { await Model.updateOne(op.updateOne.filter, op.updateOne.update, op.updateOne); n++; }
        // eslint-disable-next-line no-await-in-loop
        else if (op.deleteOne) { await Model.deleteOne(op.deleteOne.filter); n++; }
        // eslint-disable-next-line no-await-in-loop
        else if (op.insertOne) { await Model.create(op.insertOne.document); n++; }
      }
      return { ok: 1, nModified: n };
    }
    static async aggregate(pipeline = []) {
      const first = pipeline[0]?.$match || {};
      const rows = await Model.rows(first);
      return aggregateRows(rows, pipeline);
    }
  }

  for (const [k, fn] of Object.entries(schema.methods)) Model.prototype[k] = fn;
  state.models.set(name, Model);
  if (state.driver) Model.init().catch((e) => console.error(`Table ${table}:`, e.message));
  return Model;
}

export default { Schema, model, connect, disconnect, isValidObjectId, Types: { ObjectId: String } };
