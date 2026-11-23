// Config for every content type managed through the generic ResourceManager.
const seo = [
  { section: 'SEO' },
  { name: 'seoTitle', label: 'SEO title', help: 'Leave empty to use the title' },
  { name: 'seoDescription', label: 'Meta description', type: 'textarea', rows: 2, help: 'Ideal length: 120–160 characters' },
  { name: 'seoKeywords', label: 'Keywords', help: 'Comma separated' },
];
const activeFilter = { name: 'active', label: 'Status', options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Hidden' }] };

export const resources = {
  slides: {
    endpoint: '/admin/slides', title: 'Hero Slideshow', singular: 'slide', orderable: true, filters: [activeFilter],
    subtitle: 'Slides shown in the home page hero. Use wide images (at least 1920×1080).',
    defaults: { active: true, buttonText: 'Our Services', buttonLink: '/services', button2Text: 'Contact Us', button2Link: '/contact' },
    columns: [{ key: 'image', label: 'Image', type: 'image' }, { key: 'title', label: 'Title', strong: true }, { key: 'subtitle', label: 'Subtitle' }, { key: 'active', label: 'Visible', type: 'bool', toggle: true }],
    fields: [
      { name: 'image', label: 'Background image', type: 'image', required: true },
      { name: 'title', label: 'Heading', required: true },
      { name: 'subtitle', label: 'Small label above heading' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'buttonText', label: 'Primary button text', half: true },
      { name: 'buttonLink', label: 'Primary button link', half: true },
      { name: 'button2Text', label: 'Secondary button text', half: true },
      { name: 'button2Link', label: 'Secondary button link', half: true },
      { name: 'active', label: 'Visible on website', type: 'switch' },
    ],
  },

  services: {
    endpoint: '/admin/services', title: 'Services', singular: 'service', orderable: true, filters: [activeFilter],
    viewUrl: (r) => `/services/${r.slug}`, defaults: { active: true, featured: true, icon: 'ShieldCheck', features: [] },
    columns: [{ key: 'icon', label: 'Icon', type: 'icon' }, { key: 'title', label: 'Title', strong: true }, { key: 'featured', label: 'On home page', type: 'bool', yes: 'Yes', no: 'No' }, { key: 'active', label: 'Visible', type: 'bool', toggle: true }],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'slug', label: 'URL slug', help: 'Auto-generated from the title if empty', half: true },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'shortDescription', label: 'Short description', type: 'textarea', rows: 2 },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'content', label: 'Full description', type: 'richtext' },
      { name: 'features', label: 'Key features (one per line)', type: 'list' },
      { name: 'featured', label: 'Show on home page', type: 'switch', half: true },
      { name: 'active', label: 'Visible on website', type: 'switch', half: true },
      ...seo,
    ],
  },

  posts: {
    endpoint: '/admin/posts', title: 'Blog Posts', singular: 'post', viewUrl: (r) => `/blog/${r.slug}`,
    filters: [{ name: 'status', label: 'Status', options: ['published', 'draft'] }],
    defaults: { status: 'draft', tags: [], author: 'RITA Editorial Team' },
    columns: [{ key: 'coverImage', label: 'Cover', type: 'image' }, { key: 'title', label: 'Title', strong: true }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'views', label: 'Views' }, { key: 'publishedAt', label: 'Published', type: 'date' }],
    fields: (categories = []) => [
      { name: 'title', label: 'Title', required: true },
      { name: 'slug', label: 'URL slug', help: 'Auto-generated if empty', half: true },
      { name: 'category', label: 'Category', type: 'select', options: categories, half: true },
      { name: 'excerpt', label: 'Excerpt / summary', type: 'textarea', rows: 2 },
      { name: 'coverImage', label: 'Cover image', type: 'image' },
      { name: 'content', label: 'Content', type: 'richtext' },
      { name: 'tags', label: 'Tags', type: 'tags', half: true },
      { name: 'author', label: 'Author', half: true },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true, half: true },
      { name: 'publishedAt', label: 'Publish date (future = scheduled)', type: 'datetime', half: true },
      { name: 'featured', label: 'Featured (pinned to top)', type: 'switch' },
      ...seo,
    ],
  },

  categories: {
    endpoint: '/admin/categories', title: 'Blog Categories', singular: 'category',
    columns: [{ key: 'name', label: 'Name', strong: true }, { key: 'slug', label: 'Slug' }, { key: 'description', label: 'Description' }],
    fields: [{ name: 'name', label: 'Name', required: true }, { name: 'slug', label: 'Slug' }, { name: 'description', label: 'Description', type: 'textarea' }],
  },

  jobs: {
    endpoint: '/admin/jobs', title: 'Job Openings', singular: 'job', filters: [activeFilter], viewUrl: (r) => `/careers/${r.slug}`,
    defaults: { active: true, type: 'Full-time', openings: 1, responsibilities: [], requirements: [] },
    columns: [{ key: 'title', label: 'Title', strong: true }, { key: 'department', label: 'Department' }, { key: 'location', label: 'Location' }, { key: 'type', label: 'Type' }, { key: 'active', label: 'Open', type: 'bool', toggle: true }],
    fields: [
      { name: 'title', label: 'Job title', required: true },
      { name: 'department', label: 'Department', half: true },
      { name: 'location', label: 'Location', half: true },
      { name: 'type', label: 'Job type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'], half: true },
      { name: 'experience', label: 'Experience', half: true },
      { name: 'salary', label: 'Salary', half: true },
      { name: 'openings', label: 'Openings', type: 'number', half: true },
      { name: 'deadline', label: 'Application deadline', type: 'date', half: true },
      { name: 'description', label: 'Description', type: 'richtext' },
      { name: 'responsibilities', label: 'Responsibilities (one per line)', type: 'list' },
      { name: 'requirements', label: 'Requirements (one per line)', type: 'list' },
      { name: 'active', label: 'Accepting applications', type: 'switch' },
    ],
  },

  gallery: {
    endpoint: '/admin/gallery', title: 'Gallery', singular: 'image', orderable: true, filters: [activeFilter], defaults: { active: true, category: 'General' },
    columns: [{ key: 'image', label: 'Image', type: 'image' }, { key: 'title', label: 'Title', strong: true }, { key: 'category', label: 'Category' }, { key: 'active', label: 'Visible', type: 'bool', toggle: true }],
    fields: [
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'title', label: 'Title', half: true },
      { name: 'category', label: 'Category (used as filter tab)', half: true },
      { name: 'description', label: 'Caption', type: 'textarea', rows: 2 },
      { name: 'active', label: 'Visible', type: 'switch' },
    ],
  },

  clients: {
    endpoint: '/admin/clients', title: 'Clients', singular: 'client', orderable: true, viewUrl: () => '/clients',
    subtitle: 'Client logos and profiles shown in the home page marquee and on the Clients page.',
    filters: [activeFilter, { name: 'featured', label: 'Featured', options: [{ value: 'true', label: 'Featured' }, { value: 'false', label: 'Not featured' }] }],
    defaults: { active: true, featured: false, services: [] },
    columns: [{ key: 'logo', label: 'Logo', type: 'image' }, { key: 'name', label: 'Name', strong: true }, { key: 'industry', label: 'Industry' }, { key: 'location', label: 'Location' }, { key: 'featured', label: 'Featured', type: 'bool', yes: 'Yes', no: 'No' }, { key: 'active', label: 'Visible', type: 'bool', toggle: true }],
    fields: [
      { section: 'Identity' },
      { name: 'name', label: 'Client name', required: true },
      { name: 'logo', label: 'Logo (transparent PNG/SVG, at least 300px wide)', type: 'image' },
      { name: 'industry', label: 'Industry / sector', half: true, placeholder: 'Metro, Signalling, Rolling Stock…' },
      { name: 'location', label: 'Location', half: true, placeholder: 'Hyderabad, Telangana' },
      { name: 'website', label: 'Website URL', half: true, placeholder: 'https://' },
      { name: 'since', label: 'Client since (year)', half: true },
      { section: 'Profile (shown when a visitor opens the client)' },
      { name: 'about', label: 'About this engagement', type: 'textarea', rows: 3 },
      { name: 'projects', label: 'Project(s)', placeholder: 'e.g. Metro corridor ISA, 3 projects' },
      { name: 'services', label: 'Services delivered (one per line)', type: 'list', rows: 4 },
      { name: 'quote', label: 'Client quote (optional)', type: 'textarea', rows: 2 },
      { name: 'quoteBy', label: 'Quote attributed to', placeholder: 'Name, Designation' },
      { section: 'Display' },
      { name: 'featured', label: 'Featured (large card on Clients page)', type: 'switch', half: true },
      { name: 'active', label: 'Visible on website', type: 'switch', half: true },
    ],
  },

  locations: {
    endpoint: '/admin/locations', title: 'Areas We Serve (Local SEO)', singular: 'service area', orderable: true, filters: [activeFilter],
    subtitle: 'Each area gets its own landing page (/locations/…) targeting searches like "railway safety assessment Hyderabad". Write unique content for each.',
    viewUrl: (r) => `/locations/${r.slug}`, defaults: { active: true, region: 'Telangana', highlights: [] },
    columns: [{ key: 'image', label: 'Image', type: 'image' }, { key: 'name', label: 'Area', strong: true }, { key: 'region', label: 'Region' }, { key: 'slug', label: 'URL' }, { key: 'active', label: 'Visible', type: 'bool', toggle: true }],
    fields: [
      { name: 'name', label: 'City / area name', required: true, half: true, placeholder: 'Hyderabad' },
      { name: 'region', label: 'State / region', half: true },
      { name: 'slug', label: 'URL slug', help: 'Auto-generated from the name if empty', half: true },
      { name: 'image', label: 'Hero image', type: 'image' },
      { name: 'headline', label: 'Page heading (H1)', placeholder: 'Railway Safety Assessment & RAMS Consultants in Hyderabad' },
      { name: 'intro', label: 'Short introduction', type: 'textarea', rows: 2 },
      { name: 'highlights', label: 'Highlights (one per line)', type: 'list', rows: 4 },
      { name: 'content', label: 'Page content', type: 'richtext' },
      { name: 'latitude', label: 'Latitude', type: 'number', half: true },
      { name: 'longitude', label: 'Longitude', type: 'number', half: true },
      { name: 'active', label: 'Visible on website', type: 'switch' },
      ...seo,
    ],
  },

  testimonials: {
    endpoint: '/admin/testimonials', title: 'Testimonials', singular: 'testimonial', orderable: true, filters: [activeFilter], defaults: { active: true, rating: 5 },
    columns: [{ key: 'photo', label: 'Photo', type: 'avatar' }, { key: 'name', label: 'Name', strong: true }, { key: 'company', label: 'Company' }, { key: 'rating', label: 'Rating' }, { key: 'active', label: 'Visible', type: 'bool', toggle: true }],
    fields: [
      { name: 'name', label: 'Name', required: true, half: true },
      { name: 'designation', label: 'Designation', half: true },
      { name: 'company', label: 'Company', half: true },
      { name: 'rating', label: 'Rating (1–5)', type: 'number', min: 1, max: 5, half: true },
      { name: 'message', label: 'Testimonial', type: 'textarea', rows: 4, required: true },
      { name: 'photo', label: 'Photo', type: 'image' },
      { name: 'active', label: 'Visible', type: 'switch' },
    ],
  },

  team: {
    endpoint: '/admin/team', title: 'Team Members', singular: 'member', orderable: true, filters: [activeFilter], defaults: { active: true },
    columns: [{ key: 'photo', label: 'Photo', type: 'avatar' }, { key: 'name', label: 'Name', strong: true }, { key: 'designation', label: 'Designation' }, { key: 'active', label: 'Visible', type: 'bool', toggle: true }],
    fields: [
      { name: 'name', label: 'Name', required: true, half: true },
      { name: 'designation', label: 'Designation', half: true },
      { name: 'photo', label: 'Photo', type: 'image' },
      { name: 'bio', label: 'Short bio', type: 'textarea' },
      { name: 'linkedin', label: 'LinkedIn URL', half: true },
      { name: 'email', label: 'Email', half: true },
      { name: 'active', label: 'Visible', type: 'switch' },
    ],
  },

  subscribers: {
    endpoint: '/admin/subscribers', title: 'Newsletter Subscribers', singular: 'subscriber', canCreate: true, defaults: { active: true },
    filters: [{ name: 'active', label: 'Status', options: [{ value: 'true', label: 'Subscribed' }, { value: 'false', label: 'Unsubscribed' }] }],
    columns: [{ key: 'email', label: 'Email', strong: true }, { key: 'active', label: 'Subscribed', type: 'bool', toggle: true }, { key: 'createdAt', label: 'Joined', type: 'date' }],
    fields: [{ name: 'email', label: 'Email', required: true }, { name: 'active', label: 'Subscribed', type: 'switch' }],
    exportUrl: '/admin/subscribers/export/csv',
  },

  pageSeo: {
    endpoint: '/admin/page-seo', title: 'Page SEO', singular: 'page SEO entry',
    subtitle: 'Override the title, description and social image for any page path.',
    columns: [{ key: 'path', label: 'Path', strong: true }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description' }],
    fields: [
      { name: 'path', label: 'Page path (e.g. /about)', required: true },
      { name: 'title', label: 'Title' },
      { name: 'description', label: 'Meta description', type: 'textarea', rows: 3 },
      { name: 'keywords', label: 'Keywords' },
      { name: 'ogImage', label: 'Social share image', type: 'image' },
    ],
  },

  users: {
    endpoint: '/admin/users', title: 'Admin Users', singular: 'user', searchable: false, defaults: { role: 'editor', active: true },
    subtitle: 'Admins can manage everything. Editors manage content, enquiries and applications.',
    columns: [{ key: 'name', label: 'Name', strong: true }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role', type: 'badge' }, { key: 'active', label: 'Active', type: 'bool' }, { key: 'lastLogin', label: 'Last login', type: 'date' }],
    fields: (u) => [
      { name: 'name', label: 'Name', required: true, half: true },
      { name: 'email', label: 'Email', type: 'email', required: true, half: true },
      { name: 'role', label: 'Role', type: 'select', options: ['admin', 'editor'], required: true, half: true },
      { name: 'password', label: u._id ? 'New password (leave empty to keep)' : 'Password (min 8 chars)', type: 'password', half: true },
      { name: 'active', label: 'Account active', type: 'switch' },
    ],
  },
};
