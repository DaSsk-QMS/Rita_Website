import { Settings } from '../models/index.js';
import { defaultSettings } from '../seed/defaults.js';
import { cleanHtml } from './crud.js';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

export function deepMerge(base, override) {
  if (!isObj(base) || !isObj(override)) return override === undefined ? base : override;
  const out = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = isObj(v) && isObj(base[k]) ? deepMerge(base[k], v) : v;
  }
  return out;
}

const SECTIONS = ['general', 'contact', 'social', 'theme', 'seo', 'smtp', 'menu', 'home', 'footer', 'pages'];

export async function getSettings() {
  let doc = await Settings.findOne({ key: 'site' }).lean();
  if (!doc) doc = (await Settings.create({ key: 'site', ...defaultSettings })).toObject();
  const merged = {};
  for (const s of SECTIONS) {
    merged[s] =
      s === 'menu'
        ? doc.menu?.length ? doc.menu : defaultSettings.menu
        : deepMerge(defaultSettings[s], doc[s] || {});
  }
  merged.updatedAt = doc.updatedAt;
  return merged;
}

export function publicSettings(s) {
  const { smtp, ...rest } = s;
  return rest;
}

export async function updateSettings(section, data) {
  if (!SECTIONS.includes(section)) throw Object.assign(new Error('Unknown settings section'), { status: 400 });
  const current = await getSettings();
  let value = data;
  // Rich-text fields edited in the admin are sanitised before storage
  if (section === 'general' && typeof data?.aboutContent === 'string') value = { ...data, aboutContent: cleanHtml(data.aboutContent) };
  if (section === 'pages' && data && typeof data === 'object')
    value = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? cleanHtml(v) : v]));
  if (section === 'menu' && !Array.isArray(data)) throw Object.assign(new Error('Menu must be a list'), { status: 400 });
  if (section === 'smtp' && current.smtp?.pass && (!data.pass || data.pass === '********')) {
    value = { ...data, pass: current.smtp.pass }; // keep existing password when masked
  }
  await Settings.updateOne({ key: 'site' }, { $set: { [section]: value } }, { upsert: true });
  return getSettings();
}

export { SECTIONS };
