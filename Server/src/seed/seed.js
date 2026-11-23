import 'dotenv/config';
import { pathToFileURL } from 'url';
import {
  User, Settings, Slide, Service, Post, Category, Job, GalleryItem,
  Client, Testimonial, TeamMember, PageSeo, Location,
} from '../models/index.js';
import {
  defaultSettings, defaultSlides, defaultServices, defaultPosts, defaultCategories, defaultJobs,
  defaultGallery, defaultClients, defaultTestimonials, defaultTeam, defaultPageSeo, defaultLocations,
} from './defaults.js';

const collections = [
  [Slide, defaultSlides],
  [Service, defaultServices],
  [Category, defaultCategories],
  [Post, defaultPosts],
  [Job, defaultJobs],
  [GalleryItem, defaultGallery],
  [Client, defaultClients],
  [Testimonial, defaultTestimonials],
  [TeamMember, defaultTeam],
  [PageSeo, defaultPageSeo],
  [Location, defaultLocations],
];

/** Seeds anything that is missing. Safe to run on every start. */
export async function ensureSeed({ reset = false } = {}) {
  if (reset) {
    await Promise.all([Settings.deleteMany({}), ...collections.map(([M]) => M.deleteMany({}))]);
    console.log('🧹 Content collections cleared');
  }

  if (!(await User.exists({}))) {
    const email = process.env.ADMIN_EMAIL || 'admin@rita.local';
    await User.create({
      name: process.env.ADMIN_NAME || 'Site Administrator',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`👤 Admin user created: ${email}  (change the password after first login)`);
  }

  if (!(await Settings.exists({ key: 'site' }))) {
    await Settings.create({ key: 'site', ...defaultSettings });
    console.log('⚙️  Default settings created');
  }

  // Existing installs: add page-SEO entries for newly introduced pages without touching edited ones
  for (const ps of defaultPageSeo) {
    if (!(await PageSeo.exists({ path: ps.path }))) await PageSeo.create(ps);
  }

  for (const [Model, data] of collections) {
    if (!(await Model.exists({}))) {
      // Use create() so pre-save hooks (reading time etc.) run
      for (const doc of data) await Model.create(doc);
      console.log(`🌱 Seeded ${Model.modelName} (${data.length})`);
    }
  }
}

// Run directly: npm run seed  /  npm run seed:reset
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { connectDB, disconnectDB } = await import('../config/db.js');
  await connectDB();
  await ensureSeed({ reset: process.argv.includes('--reset') });
  await disconnectDB();
  console.log('Done.');
}
