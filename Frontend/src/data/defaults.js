// ---------------------------------------------------------------------------
// Default website content for RITA System Assurance Private Limited.
// Used by the backend to seed an empty database AND copied to
// Frontend/src/data/defaults.js so the site still renders if the API is down.
// Keep both copies identical:  npm run sync-defaults  (from /Server)
// ---------------------------------------------------------------------------

const u = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  freight: u('1474487548417-781cb71495f3'),
  station: u('1532105956626-9569c03602f6'),
  viaduct: u('1505832018823-50331d70d237'),
  steamViaduct: u('1527684651001-731c474bbb5a'),
  autumnTrain: u('1541427468627-a89a96e5ca1d'),
  interior: u('1494515843206-f3117d3f51b7'),
  forestTrain: u('1535535112387-56ffe8db21ff'),
  industrial: u('1513828583688-c52646db42da', 1200),
  electronics: u('1555664424-778a1e5e1b48', 1200),
  code: u('1581094794329-c8112a89af12', 1200),
  circuit: u('1581092918056-0c4c3acd3789', 1200),
  lab: u('1581091012184-7e0cdfbb6797', 1200),
  engineer: u('1581092160562-40aa08e78837', 1200),
  engineer2: u('1581091226825-a6a2a5aee158', 1200),
  documents: u('1454165804606-c3d57bc86b40', 1200),
  analytics: u('1460925895917-afdab827c52f', 1200),
  meeting: u('1552664730-d307ca884978', 1200),
  team: u('1522071820081-009f0129c71c', 1200),
  handshake: u('1521791136064-7986c2920216', 1200),
  office: u('1497366216548-37526070297c', 1200),
  office2: u('1559136555-9303baea8ebd', 1200),
  building: u('1486406146926-c627a92ad1ab', 1200),
  welding: u('1504328345606-18bbc8c9d7d1', 1200),
  p1: u('1507003211169-0a1dd7228f2d', 400),
  p2: u('1494790108377-be9c29b29330', 400),
  p3: u('1500648767791-00dcc994a43e', 400),
  p4: u('1438761681033-6461ffad8d80', 400),
  p5: u('1472099645785-5658abf4ff4e', 400),
};

export const defaultSettings = {
  general: {
    siteName: 'RITA System Assurance Private Limited',
    shortName: 'RITA',
    logoText: 'RITA',
    logoSubText: 'System Assurance',
    tagline: 'Independent Assurance. Engineering Confidence.',
    logo: '',
    logoDark: '',
    favicon: '',
    aboutTitle: 'Independent safety assurance for railways that people trust',
    aboutShort:
      'RITA System Assurance Private Limited is an independent engineering assurance company based in Hyderabad, Telangana. We help railway operators, suppliers and integrators prove that their signalling, rolling stock and safety-related systems are safe, reliable and compliant with CENELEC and international standards.',
    aboutContent:
      '<p>RITA System Assurance Private Limited provides Independent Safety Assessment (ISA), RAMS engineering, verification and validation, and management-systems consultancy for the railway sector.</p><p>Our assessors and engineers work across the full system lifecycle defined in EN 50126, from concept and hazard analysis to safety case acceptance and operation. We combine deep standards knowledge with practical project experience, so our clients reach approval with fewer surprises and less rework.</p><p>Independence is at the core of what we do. Our assessments are objective, evidence-based and documented to the level expected by safety authorities and notified bodies.</p>',
    aboutImage: IMG.engineer,
    aboutImage2: IMG.station,
    experienceYears: '15+',
    mission:
      'To give railway owners, operators and suppliers independent, evidence-based confidence that their systems are safe, reliable and compliant.',
    vision:
      'To be the most trusted independent assurance partner for rail and safety-critical engineering in India and worldwide.',
    values: 'Independence · Integrity · Technical Excellence · Transparency · Safety First',
    announcement: 'Now accepting ISA and RAMS assignments for metro, mainline and rolling stock projects.',
    showAnnouncement: true,
    showTopbar: true,
    showFloatingSocial: true,
    showWhatsappButton: true,
    showBackToTop: true,
    showPreloader: true,
    maintenanceMode: false,
    maintenanceMessage: 'Our website is undergoing scheduled maintenance. We will be back shortly.',
    headerCtaText: 'Get a Quote',
    headerCtaLink: '/contact',
    showCookieBanner: true,
    cookieText: 'We use essential cookies and anonymous statistics to improve this website.',
    showVisitorCounter: true,
    visitorCounterLabel: 'Visitors',
    visitorCounterOffset: 0,
    showAdminLink: true,
    feedbackTitle: 'Share your experience',
    feedbackText: 'Your feedback helps us improve our assessments, reports and service. It goes directly to our management team.',
  },
  contact: {
    email: 'info@yourdomain.com',
    email2: 'careers@yourdomain.com',
    phone: '+91 00000 00000',
    phone2: '',
    whatsapp: '910000000000',
    address: 'Hyderabad, Telangana, India',
    workingHours: 'Mon – Fri: 9:30 AM – 6:30 PM',
    mapEmbed:
      'https://www.google.com/maps?q=Hyderabad,Telangana&output=embed',
  },
  social: {
    linkedin: 'https://www.linkedin.com/',
    facebook: 'https://www.facebook.com/',
    twitter: 'https://x.com/',
    instagram: 'https://www.instagram.com/',
    youtube: 'https://www.youtube.com/',
    whatsapp: '',
  },
  theme: {
    primary: '#0b4fa8',
    secondary: '#0a1a33',
    accent: '#f5a524',
    background: '#ffffff',
    surface: '#f4f7fb',
    text: '#1d2939',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    radius: 14,
    headerStyle: 'transparent', // transparent | solid
    buttonStyle: 'pill', // pill | rounded | square
    animations: true,
    animationStyle: 'up', // up | zoom | fade | left | blur | flip
    animationSpeed: 1, // 0.5 (fast) – 2 (slow)
    spotlight: true, // cursor glow on cards
    heroOverlay: 85, // 0–100 darkness of hero image overlay
    darkFooter: true,
  },
  seo: {
    siteUrl: 'http://localhost:5173',
    metaTitle: 'Railway ISA & RAMS Consultants in Hyderabad, Telangana | RITA',
    titleSuffix: ' | RITA System Assurance',
    metaDescription:
      'Hyderabad-based Independent Safety Assessor (ISA) for railways. RAMS engineering, EN 50126/50128/50129 compliance, signalling & rolling stock assurance, V&V and ISO 22163 across Telangana and India.',
    keywords:
      'Independent Safety Assessment Hyderabad, ISA Telangana, railway RAMS consultant Hyderabad, EN 50126 consultant India, EN 50128 EN 50129 compliance, railway signalling assurance Telangana, rolling stock assurance India, verification and validation Hyderabad, railway safety audit Telangana, ISO 22163 consultant Hyderabad, functional safety IEC 61508 India, metro rail safety assessment, CBTC interlocking assurance',
    ogImage: IMG.freight,
    googleAnalyticsId: '',
    googleSiteVerification: '',
    bingSiteVerification: '',
    allowIndexing: true,
    // Local SEO (Google Business Profile / LocalBusiness schema) — keep identical to your Google Business listing
    businessType: 'ProfessionalService',
    streetAddress: '',
    localCity: 'Hyderabad',
    localRegion: 'Telangana',
    regionCode: 'IN-TG',
    postalCode: '',
    countryCode: 'IN',
    latitude: 17.385,
    longitude: 78.4867,
    areaServed: 'Hyderabad, Secunderabad, Warangal, Kazipet, Karimnagar, Nizamabad, Khammam, Rangareddy, Medchal-Malkajgiri',
    openingHours: 'Mo-Fr 09:30-18:30',
    foundingYear: '',
    languages: 'English, Hindi, Telugu',
    priceRange: '',
  },
  smtp: {
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    fromName: 'RITA System Assurance',
    fromEmail: '',
    notifyEmail: '',
    autoReply: true,
    autoReplySubject: 'Thank you for contacting RITA System Assurance',
    autoReplyMessage:
      'Thank you for your enquiry. Our team has received your message and will get back to you within one business day.',
  },
  menu: [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services', autoServices: true },
    { label: 'Clients', path: '/clients' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Insights', path: '/blog' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
  ],
  home: {
    sectionOrder: ['slider', 'ticker', 'about', 'services', 'stats', 'whyUs', 'process', 'standards', 'clients', 'testimonials', 'locations', 'blog', 'cta'],
    showSlider: true,
    showTicker: true,
    showAbout: true,
    showServices: true,
    showStats: true,
    showWhyUs: true,
    showProcess: true,
    showStandards: true,
    showClients: true,
    showTestimonials: true,
    showBlog: true,
    showLocations: true,
    showCta: true,
    locationsTitle: 'Serving rail projects across Telangana and India',
    locationsSubtitle: 'From our base in Hyderabad we support metro, mainline and rolling stock projects throughout Telangana — and nationwide.',
    sliderAutoplay: true,
    sliderDelay: 6000,
    sliderEffect: 'fade', // fade | slide | creative
    servicesTitle: 'What we assure',
    servicesSubtitle: 'End-to-end assurance services across the railway system lifecycle.',
    stats: [
      { label: 'Years of combined experience', value: 15, suffix: '+' },
      { label: 'Assessments & audits delivered', value: 120, suffix: '+' },
      { label: 'Railway projects supported', value: 40, suffix: '+' },
      { label: 'Standards we work to', value: 12, suffix: '' },
    ],
    whyUsTitle: 'Why clients choose RITA',
    whyUs: [
      { icon: 'ShieldCheck', title: 'Truly independent', text: 'Organisational and financial independence from designers and suppliers, as required for ISA under CENELEC.' },
      { icon: 'Award', title: 'Standards experts', text: 'Hands-on experience with EN 50126, EN 50128/EN 50716, EN 50129, EN 50657 and ISO 22163.' },
      { icon: 'Timer', title: 'Early engagement', text: 'We engage from concept phase, so findings arrive when they are cheap to fix — not at the end.' },
      { icon: 'FileCheck2', title: 'Authority-ready evidence', text: 'Reports and safety case reviews written to the level expected by safety authorities.' },
    ],
    processTitle: 'How an assessment works',
    process: [
      { title: 'Scoping', text: 'Agree the system boundary, applicable standards, SIL targets and the assessment plan.' },
      { title: 'Lifecycle review', text: 'Review plans, requirements, hazard logs and design evidence at each lifecycle phase.' },
      { title: 'Audit & witness', text: 'Process audits, technical sampling and witnessing of key tests and validation activities.' },
      { title: 'Findings & closure', text: 'Track findings to closure with clear, prioritised observations and recommendations.' },
      { title: 'Assessment report', text: 'Issue the independent safety assessment report supporting safety acceptance.' },
    ],
    standardsTitle: 'Standards we work with',
    standards: [
      { code: 'EN 50126', title: 'RAMS', text: 'Specification and demonstration of Reliability, Availability, Maintainability and Safety.' },
      { code: 'EN 50128 / EN 50716', title: 'Railway software', text: 'Software for railway control and protection systems.' },
      { code: 'EN 50129', title: 'Signalling safety', text: 'Safety-related electronic systems for signalling and the safety case.' },
      { code: 'EN 50657', title: 'Rolling stock software', text: 'Software on board rolling stock.' },
      { code: 'ISO 22163', title: 'Rail quality', text: 'Quality management system for the railway sector.' },
      { code: 'IEC 61508', title: 'Functional safety', text: 'Functional safety of E/E/PE safety-related systems.' },
    ],
    clientsTitle: 'Trusted across the rail ecosystem',
    testimonialsTitle: 'What our clients say',
    blogTitle: 'Latest insights',
    ctaTitle: 'Planning a safety approval? Talk to an independent assessor.',
    ctaText: 'Tell us about your system, the standards you need to meet and your timeline. We will respond within one business day.',
    ctaButton: 'Send an enquiry',
    ctaImage: IMG.forestTrain,
  },
  footer: {
    about:
      'Independent Safety Assessment, RAMS engineering and verification & validation for railway signalling, rolling stock and safety-critical systems.',
    copyright: '© {year} RITA System Assurance Private Limited. All rights reserved.',
    showNewsletter: true,
    newsletterTitle: 'Stay informed',
    newsletterText: 'Standards updates and assurance insights, a few times a year.',
    showLocations: true,
    locationsTitle: 'Areas we serve in Telangana',
    bottomLinks: [
      { label: 'Share Feedback', path: '/feedback' },
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Terms of Use', path: '/terms' },
      { label: 'Sitemap', path: '/sitemap.xml' },
    ],
  },
  pages: {
    privacy:
      '<h2>Privacy Policy</h2><p>We collect only the information you submit through our forms (such as your name, email, phone and message) and anonymous usage statistics. We use it to respond to your enquiry, process job applications and improve this website. We do not sell your data. To request access to or deletion of your data, contact us using the details on the Contact page.</p>',
    terms:
      '<h2>Terms of Use</h2><p>The content of this website is provided for general information only and does not constitute professional advice for a specific project. All trademarks and content remain the property of their respective owners.</p>',
  },
};

export const defaultSlides = [
  {
    title: 'Independent Safety Assessment for Railways',
    subtitle: 'Independent Assurance. Engineering Confidence.',
    description:
      'CENELEC-compliant ISA for signalling, rolling stock and railway systems — from concept to safety acceptance.',
    image: IMG.freight,
    buttonText: 'Our Services',
    buttonLink: '/services',
    button2Text: 'Talk to an Assessor',
    button2Link: '/contact',
    order: 1,
    active: true,
  },
  {
    title: 'RAMS Engineering Across the Lifecycle',
    subtitle: 'EN 50126 · EN 50128 · EN 50129',
    description:
      'Hazard analysis, reliability modelling, safety cases and compliance evidence that stands up to authority review.',
    image: IMG.station,
    buttonText: 'RAMS Services',
    buttonLink: '/services/railway-rams-engineering-and-safety-assurance',
    button2Text: 'Get a Proposal',
    button2Link: '/contact',
    order: 2,
    active: true,
  },
  {
    title: 'Verification, Validation & Safety Audits',
    subtitle: 'Evidence you can rely on',
    description:
      'Independent V&V, process audits and technical reviews for safety-related hardware and software.',
    image: IMG.viaduct,
    buttonText: 'Learn More',
    buttonLink: '/services/verification-validation-and-safety-audits',
    button2Text: 'Contact Us',
    button2Link: '/contact',
    order: 3,
    active: true,
  },
  {
    title: 'Signalling & Rolling Stock Assurance',
    subtitle: 'Safety-critical expertise',
    description:
      'Assurance for CBTC, interlocking, train control and on-board systems for metro and mainline projects.',
    image: IMG.autumnTrain,
    buttonText: 'Explore',
    buttonLink: '/services/railway-signalling-and-rolling-stock-assurance',
    button2Text: 'Careers',
    button2Link: '/careers',
    order: 4,
    active: true,
  },
];

export const defaultServices = [
  {
    title: 'Independent Safety Assessment (ISA)',
    slug: 'independent-safety-assessment',
    seoTitle: 'Independent Safety Assessor (ISA) for Railways in Hyderabad, Telangana',
    seoDescription: 'CENELEC-compliant Independent Safety Assessment for signalling, metro and rolling stock projects from a Hyderabad-based ISA team serving Telangana and India.',
    seoKeywords: 'independent safety assessment Hyderabad, ISA railway Telangana, independent safety assessor India, EN 50129 safety case assessment, CENELEC ISA',
    icon: 'ShieldCheck',
    shortDescription:
      'Objective, CENELEC-compliant assessment of your system, process and safety case to support safety acceptance.',
    image: IMG.freight,
    features: [
      'ISA to EN 50126, EN 50128/EN 50716 and EN 50129',
      'Independent assessment plans and reports',
      'Generic product, generic application and specific application safety cases',
      'Assessment of cross-acceptance and change',
      'Support for safety authority and notified body interfaces',
    ],
    content:
      '<p>An Independent Safety Assessor gives the safety authority, the operator and the supplier an objective judgement on whether a system meets its safety requirements and has been developed using an adequate process.</p><h3>What we assess</h3><p>We review the safety management process, the technical safety evidence and the safety case argument at each lifecycle phase. Our assessment is risk-based and focuses on the issues that matter for safety acceptance.</p><h3>Deliverables</h3><ul><li>Independent Safety Assessment Plan</li><li>Phase assessment reports and findings register</li><li>Final Independent Safety Assessment Report</li></ul>',
    order: 1,
    featured: true,
    active: true,
  },
  {
    title: 'Railway RAMS Engineering and Safety Assurance',
    slug: 'railway-rams-engineering-and-safety-assurance',
    seoTitle: 'Railway RAMS Engineering & Safety Assurance – Hyderabad, Telangana',
    seoDescription: 'EN 50126 RAMS planning, hazard analysis, FMECA, FTA and safety cases for railway and metro projects in Hyderabad, Telangana and across India.',
    seoKeywords: 'railway RAMS consultant Hyderabad, RAMS engineering Telangana, EN 50126 RAMS India, hazard log management, FMECA FTA railway',
    icon: 'Activity',
    shortDescription:
      'RAMS planning, hazard analysis, reliability modelling and safety case development across the system lifecycle.',
    image: IMG.station,
    features: [
      'RAMS plans and safety plans',
      'PHA, SHA, FMEA / FMECA, FTA and HAZOP',
      'Hazard log management',
      'Reliability, availability and maintainability analysis',
      'Safety case preparation',
    ],
    content:
      '<p>We plan and deliver RAMS activities in line with EN 50126 so that safety and reliability targets are set early, allocated correctly and demonstrated with traceable evidence.</p><h3>Typical activities</h3><ul><li>System definition and risk analysis</li><li>Safety requirements specification and SIL allocation</li><li>Hazard identification workshops and hazard log management</li><li>RAM prediction and demonstration</li></ul>',
    order: 2,
    featured: true,
    active: true,
  },
  {
    title: 'EN 50126, EN 50128 and EN 50129 Compliance',
    slug: 'en-50126-50128-50129-compliance',
    seoTitle: 'EN 50126, EN 50128 & EN 50129 Compliance Consultants – Hyderabad',
    seoDescription: 'Gap analysis and compliance support for CENELEC railway standards (EN 50126, EN 50128/EN 50716, EN 50129) for suppliers in Hyderabad, Telangana and India.',
    seoKeywords: 'EN 50126 consultant Hyderabad, EN 50128 compliance India, EN 50129 Telangana, EN 50716 transition, CENELEC compliance consultant',
    icon: 'FileCheck2',
    shortDescription:
      'Gap analysis, process definition and compliance evidence for CENELEC railway standards.',
    image: IMG.code,
    features: [
      'Compliance gap analysis against CENELEC standards',
      'Software and hardware lifecycle process definition',
      'SIL-appropriate techniques and measures',
      'Compliance matrices and traceability',
      'Transition support to EN 50716',
    ],
    content:
      '<p>Meeting CENELEC standards is about more than documents — it requires a lifecycle, roles and techniques that match the safety integrity level of your system.</p><p>We assess where you stand today, define practical processes and help your teams produce evidence that an assessor and an authority will accept.</p>',
    order: 3,
    featured: true,
    active: true,
  },
  {
    title: 'Railway Signalling and Rolling Stock Assurance',
    slug: 'railway-signalling-and-rolling-stock-assurance',
    seoTitle: 'Railway Signalling & Rolling Stock Assurance – Telangana, India',
    seoDescription: 'Independent assurance for interlocking, CBTC, ETCS/Kavach-class train control and rolling stock systems for metro and mainline projects in Telangana and India.',
    seoKeywords: 'railway signalling assurance Telangana, rolling stock assurance Hyderabad, CBTC interlocking safety, train control assurance India, EN 50657',
    icon: 'TrainFront',
    shortDescription:
      'Assurance for interlocking, CBTC, ETCS/train control and on-board rolling stock systems.',
    image: IMG.autumnTrain,
    features: [
      'Interlocking, CBTC and ETCS assurance',
      'On-board train control and TCMS',
      'Rolling stock safety and EN 50657 software',
      'Integration and interface hazard management',
      'Testing and commissioning assurance',
    ],
    content:
      '<p>Signalling and rolling stock systems are among the most safety-critical parts of a railway. We provide assurance across design, integration, testing and commissioning, with particular attention to interfaces between subsystems.</p>',
    order: 4,
    featured: true,
    active: true,
  },
  {
    title: 'Verification, Validation and Safety Audits',
    slug: 'verification-validation-and-safety-audits',
    seoTitle: 'Independent Verification, Validation & Safety Audits – Hyderabad',
    seoDescription: 'Independent V&V, requirements traceability reviews, safety management audits and test witnessing for safety-critical railway systems in Hyderabad and Telangana.',
    seoKeywords: 'verification and validation Hyderabad, railway safety audit Telangana, independent V&V India, test witnessing railway, safety management system audit',
    icon: 'ClipboardCheck',
    shortDescription:
      'Independent verification and validation, process audits and technical safety audits.',
    image: IMG.documents,
    features: [
      'Independent verification and validation',
      'Requirements and test traceability reviews',
      'Safety management system audits',
      'Supplier and subcontractor audits',
      'Test witnessing',
    ],
    content:
      '<p>Our V&V and audit teams check that the right system has been built and that it has been built right — with evidence that is complete, consistent and traceable.</p>',
    order: 5,
    featured: true,
    active: true,
  },
  {
    title: 'ISO 22163 and Management Systems Consultancy',
    slug: 'iso-22163-and-management-systems-consultancy',
    seoTitle: 'ISO 22163 Consultant in Hyderabad, Telangana | Railway Quality (IRIS)',
    seoDescription: 'ISO 22163 (IRIS) implementation, gap analysis and certification readiness for railway suppliers in Hyderabad, Telangana, plus ISO 9001/14001/45001 integration.',
    seoKeywords: 'ISO 22163 consultant Hyderabad, IRIS certification Telangana, railway quality management India, ISO 9001 consultant Hyderabad',
    icon: 'Award',
    shortDescription:
      'Implementation and certification readiness for ISO 22163, ISO 9001 and integrated management systems.',
    image: IMG.meeting,
    features: [
      'ISO 22163 gap analysis and implementation',
      'ISO 9001 / 14001 / 45001 integration',
      'Process mapping and documentation',
      'Internal audits and management review',
      'Certification audit readiness',
    ],
    content:
      '<p>ISO 22163 builds on ISO 9001 with railway-specific requirements for project management, configuration management, RAMS/LCC and first article inspection. We help suppliers implement it efficiently and prepare for certification.</p>',
    order: 6,
    featured: true,
    active: true,
  },
  {
    title: 'Functional Safety and Engineering Consultancy',
    slug: 'functional-safety-and-engineering-consultancy',
    seoTitle: 'Functional Safety (IEC 61508) Consultancy – Hyderabad, Telangana',
    seoDescription: 'IEC 61508 functional safety management, SIL determination and safety engineering for safety-related systems in Hyderabad, Telangana and across India.',
    seoKeywords: 'functional safety consultant Hyderabad, IEC 61508 Telangana, SIL assessment India, safety engineering consultancy',
    icon: 'Cpu',
    shortDescription:
      'IEC 61508-based functional safety and engineering support for safety-related systems.',
    image: IMG.circuit,
    features: [
      'Functional safety management',
      'SIL determination and verification',
      'Safety requirements engineering',
      'Hardware and software safety analysis',
      'Training and competence development',
    ],
    content:
      '<p>Beyond rail, we support safety-related electrical, electronic and programmable systems using IEC 61508 and related sector standards, from concept to operation.</p>',
    order: 7,
    featured: false,
    active: true,
  },
];

export const defaultCategories = [
  { name: 'Safety Assessment', slug: 'safety-assessment', description: 'Independent safety assessment topics.' },
  { name: 'RAMS', slug: 'rams', description: 'Reliability, availability, maintainability and safety.' },
  { name: 'Standards', slug: 'standards', description: 'CENELEC, ISO and IEC standards.' },
  { name: 'Company News', slug: 'company-news', description: 'News from RITA.' },
];

export const defaultPosts = [
  {
    title: 'Railway safety assurance in Telangana: what suppliers in Hyderabad should plan for',
    slug: 'railway-safety-assurance-telangana-hyderabad-suppliers',
    excerpt:
      'Metro expansion, signalling upgrades and new rolling-stock capacity are creating demand for safety evidence across Telangana. Here is how suppliers can prepare.',
    coverImage: IMG.station,
    category: 'Safety Assessment',
    tags: ['Telangana', 'Hyderabad', 'ISA', 'RAMS'],
    author: 'RITA Editorial Team',
    status: 'published',
    featured: false,
    publishedAt: '2026-11-05T09:00:00.000Z',
    content:
      '<p>Telangana’s railway landscape is changing quickly. Hyderabad’s metro and suburban networks continue to grow, mainline routes through Secunderabad, Kazipet and Khammam are being upgraded for more capacity, and rolling-stock activity around Kazipet is expanding. For suppliers based in Hyderabad and across the state, that means more customers asking for structured safety evidence.</p><h2>1. Expect CENELEC-style evidence</h2><p>Operators and integrators increasingly expect a RAMS lifecycle aligned with EN 50126 and, for software and electronics, EN 50128/EN 50716 and EN 50129. Plan your lifecycle, roles and independence early.</p><h2>2. Keep a living hazard log</h2><p>A hazard log that links hazards to mitigations, safety requirements and verification evidence is usually the first thing an assessor asks to see.</p><h2>3. Engage your Independent Safety Assessor early</h2><p>Engaging an ISA at concept or system-definition phase is far cheaper than discovering gaps just before commissioning.</p><h2>4. Get your quality system rail-ready</h2><p>ISO 22163 (IRIS) is becoming a common qualification requirement. Suppliers in Hyderabad who already hold ISO 9001 can often close the gap in a few months.</p><p>If you are planning a project in Hyderabad or elsewhere in Telangana, our local team can help you scope the assurance activities you will need.</p>',
    seoTitle: 'Railway Safety Assurance in Telangana – Guide for Hyderabad Suppliers',
    seoDescription: 'What Hyderabad and Telangana railway suppliers should plan for: CENELEC evidence, hazard logs, early ISA engagement and ISO 22163.',
    seoKeywords: 'railway safety Telangana, ISA Hyderabad, railway suppliers Hyderabad, RAMS Telangana, ISO 22163 Hyderabad',
  },
  {
    title: 'What does an Independent Safety Assessor actually do?',
    slug: 'what-does-an-independent-safety-assessor-do',
    excerpt:
      'An ISA is not a second designer or a tester. Here is what the role covers under CENELEC, and how to get the most value from it.',
    coverImage: IMG.freight,
    category: 'Safety Assessment',
    tags: ['ISA', 'EN 50129', 'Safety Case'],
    author: 'RITA Editorial Team',
    status: 'published',
    featured: true,
    publishedAt: '2026-10-20T09:00:00.000Z',
    content:
      '<p>The Independent Safety Assessor (ISA) forms a judgement, based on evidence, on whether a system is fit for its intended purpose and meets its safety requirements. The ISA does not design, verify or validate the system — they assess the work of those who do.</p><h2>Independence matters</h2><p>CENELEC standards require the assessor to be independent from the project and, for higher safety integrity levels, from the supplier organisation. That independence is what gives the safety authority confidence in the assessment.</p><h2>What is assessed</h2><ul><li>The safety management process and its application</li><li>Hazard identification and risk control</li><li>Technical safety evidence for hardware and software</li><li>The safety case argument and its supporting evidence</li></ul><h2>Engage early</h2><p>The most effective assessments start at the concept and system definition phases. Late engagement often means expensive rework when gaps are found close to commissioning.</p>',
    seoTitle: 'What does an Independent Safety Assessor (ISA) do?',
    seoDescription: 'The role of the Independent Safety Assessor under CENELEC EN 50126 and EN 50129, explained.',
  },
  {
    title: 'EN 50126 explained: the RAMS lifecycle in practice',
    slug: 'en-50126-rams-lifecycle-explained',
    excerpt:
      'EN 50126 defines a lifecycle for specifying and demonstrating RAMS. We walk through the phases and the evidence each one should produce.',
    coverImage: IMG.station,
    category: 'RAMS',
    tags: ['EN 50126', 'RAMS', 'Lifecycle'],
    author: 'RITA Editorial Team',
    status: 'published',
    featured: false,
    publishedAt: '2026-09-28T09:00:00.000Z',
    content:
      '<p>EN 50126 provides railway authorities and suppliers with a common process for managing reliability, availability, maintainability and safety. Its lifecycle runs from concept through to decommissioning.</p><h2>Key phases</h2><ol><li><strong>Concept and system definition</strong> — understand the system, its environment and its interfaces.</li><li><strong>Risk analysis and evaluation</strong> — identify hazards and evaluate risk.</li><li><strong>Specification of system requirements</strong> — define RAMS requirements, including safety integrity.</li><li><strong>Architecture and apportionment</strong> — allocate requirements to subsystems.</li><li><strong>Design, implementation, integration</strong> — build the system with the required rigour.</li><li><strong>Validation and acceptance</strong> — demonstrate compliance and accept the system.</li></ol><h2>The hazard log is your backbone</h2><p>A well-maintained hazard log links hazards to mitigations, safety requirements and verification evidence. It is often the first thing an assessor asks to see.</p>',
    seoTitle: 'EN 50126 RAMS lifecycle explained',
    seoDescription: 'A practical walk-through of the EN 50126 RAMS lifecycle phases and evidence.',
  },
  {
    title: 'From EN 50128 to EN 50716: what changes for railway software',
    slug: 'en-50128-to-en-50716-railway-software',
    excerpt:
      'EN 50716:2023 replaces EN 50128 and EN 50657 with a single standard for railway software. Here is what suppliers should plan for.',
    coverImage: IMG.code,
    category: 'Standards',
    tags: ['EN 50128', 'EN 50716', 'Software'],
    author: 'RITA Editorial Team',
    status: 'published',
    featured: false,
    publishedAt: '2026-08-15T09:00:00.000Z',
    content:
      '<p>EN 50716 brings software for railway control and protection systems and software on board rolling stock under one standard. For many suppliers the core principles are familiar, but there are practical changes to plan for.</p><h2>What to review</h2><ul><li>Your software lifecycle and quality plans</li><li>Tool qualification and tool classification</li><li>Techniques and measures tables for your SIL</li><li>Roles, competence and independence arrangements</li></ul><h2>Plan the transition</h2><p>Start with a gap analysis of your current process against the new standard, agree the transition approach with your assessor, and update templates before the next project starts.</p>',
    seoTitle: 'EN 50128 to EN 50716 transition guide',
    seoDescription: 'What EN 50716 means for railway software suppliers moving from EN 50128 and EN 50657.',
  },
  {
    title: 'ISO 22163: why railway suppliers are adopting it',
    slug: 'iso-22163-why-railway-suppliers-adopt-it',
    excerpt:
      'ISO 22163 extends ISO 9001 with requirements specific to the rail industry. Here is how it helps suppliers win and deliver projects.',
    coverImage: IMG.meeting,
    category: 'Standards',
    tags: ['ISO 22163', 'Quality', 'Management Systems'],
    author: 'RITA Editorial Team',
    status: 'published',
    featured: false,
    publishedAt: '2026-07-10T09:00:00.000Z',
    content:
      '<p>ISO 22163 specifies quality management system requirements for organisations that design, develop, produce and maintain railway products. It builds on ISO 9001 and adds sector-specific requirements.</p><h2>Rail-specific additions</h2><ul><li>Project management and configuration management</li><li>RAMS and life cycle cost considerations</li><li>First article inspection</li><li>Management of obsolescence and tender processes</li></ul><p>Many rail operators and integrators now expect their supply chain to hold ISO 22163 certification.</p>',
    seoTitle: 'ISO 22163 for railway suppliers',
    seoDescription: 'Why ISO 22163 matters for railway suppliers and how it extends ISO 9001.',
  },
];

export const defaultJobs = [
  {
    title: 'Senior Independent Safety Assessor',
    slug: 'senior-independent-safety-assessor',
    department: 'Safety Assessment',
    location: 'Hyderabad, Telangana (Hybrid)',
    type: 'Full-time',
    experience: '10+ years',
    salary: 'As per industry standards',
    openings: 1,
    description:
      '<p>Lead independent safety assessments for signalling and rolling stock projects in accordance with CENELEC standards.</p>',
    responsibilities: [
      'Plan and lead ISA assignments',
      'Review safety cases, hazard logs and lifecycle evidence',
      'Conduct audits and witness tests',
      'Write assessment reports and present findings to clients and authorities',
    ],
    requirements: [
      'Degree in Electrical, Electronics or related engineering',
      'Strong knowledge of EN 50126, EN 50128/50716 and EN 50129',
      'Experience with SIL 4 signalling or train control systems',
      'Excellent written English',
    ],
    active: true,
  },
  {
    title: 'RAMS Engineer',
    slug: 'rams-engineer',
    department: 'RAMS Engineering',
    location: 'Hyderabad, Telangana (On-site / Hybrid)',
    type: 'Full-time',
    experience: '3–7 years',
    salary: 'As per industry standards',
    openings: 2,
    description:
      '<p>Deliver RAMS analyses and safety documentation for railway projects.</p>',
    responsibilities: [
      'Prepare RAMS plans, FMECA, FTA and hazard analyses',
      'Maintain hazard logs and safety requirement traceability',
      'Support RAM prediction and demonstration',
    ],
    requirements: [
      'Engineering degree',
      'Working knowledge of EN 50126',
      'Experience with reliability tools is an advantage',
    ],
    active: true,
  },
  {
    title: 'Software Verification & Validation Engineer',
    slug: 'software-verification-validation-engineer',
    department: 'Verification & Validation',
    location: 'Hyderabad, Telangana (Hybrid)',
    type: 'Full-time',
    experience: '2–6 years',
    salary: 'As per industry standards',
    openings: 2,
    description:
      '<p>Perform independent verification and validation of safety-related railway software.</p>',
    responsibilities: [
      'Review requirements, design and code against EN 50128/EN 50716',
      'Develop and review test specifications and reports',
      'Analyse traceability and coverage',
    ],
    requirements: [
      'Degree in Computer Science, Electronics or similar',
      'Familiarity with C/C++ and static analysis tools',
      'Interest in safety-critical software',
    ],
    active: true,
  },
];

export const defaultGallery = [
  { title: 'Mainline freight operations', image: IMG.freight, category: 'Rail', order: 1 },
  { title: 'Metro station assessment', image: IMG.station, category: 'Rail', order: 2 },
  { title: 'Viaduct infrastructure', image: IMG.viaduct, category: 'Rail', order: 3 },
  { title: 'Heritage line review', image: IMG.steamViaduct, category: 'Rail', order: 4 },
  { title: 'Electronics review', image: IMG.electronics, category: 'Engineering', order: 5 },
  { title: 'Hardware analysis', image: IMG.circuit, category: 'Engineering', order: 6 },
  { title: 'Software V&V', image: IMG.code, category: 'Engineering', order: 7 },
  { title: 'Laboratory testing', image: IMG.lab, category: 'Engineering', order: 8 },
  { title: 'Hazard workshop', image: IMG.meeting, category: 'Team', order: 9 },
  { title: 'Our team', image: IMG.team, category: 'Team', order: 10 },
  { title: 'Industrial systems', image: IMG.industrial, category: 'Engineering', order: 11 },
  { title: 'Rolling stock in service', image: IMG.autumnTrain, category: 'Rail', order: 12 },
];

// Sample client entries — replace with your real clients in the admin panel.
export const defaultClients = [
  { name: 'Metro Rail Corporation', industry: 'Metro', location: 'Hyderabad, Telangana', since: '2022', projects: 'Metro corridor ISA', services: ['Independent Safety Assessment (ISA)', 'Verification, Validation and Safety Audits'], about: 'Urban metro operator. Independent safety assessment of signalling and platform screen door interfaces through to safety acceptance.', featured: true, order: 1 },
  { name: 'Signalling Systems Supplier', industry: 'Signalling', location: 'Hyderabad, Telangana', since: '2021', projects: 'Interlocking generic product', services: ['EN 50126, EN 50128 and EN 50129 Compliance', 'Independent Safety Assessment (ISA)'], about: 'Supplier of electronic interlocking. Gap analysis and assessment of the generic product safety case to EN 50129 SIL 4.', featured: true, order: 2 },
  { name: 'Rolling Stock Manufacturer', industry: 'Rolling Stock', location: 'Telangana', since: '2023', projects: 'ISO 22163 readiness', services: ['ISO 22163 and Management Systems Consultancy'], about: 'Rolling stock sub-system manufacturer. ISO 22163 implementation and certification readiness.', featured: true, order: 3 },
  { name: 'Mainline Railway Operator', industry: 'Mainline', location: 'India', services: ['Railway RAMS Engineering and Safety Assurance'], about: 'Mainline operator. RAMS planning and hazard log management for a signalling upgrade.', order: 4 },
  { name: 'Systems Integrator', industry: 'Integration', order: 5 },
  { name: 'Train Control Supplier', industry: 'Train Control', order: 6 },
  { name: 'Infrastructure Developer', industry: 'Infrastructure', order: 7 },
  { name: 'Electronics Manufacturer', industry: 'Electronics', order: 8 },
];

// Sample testimonials — replace with real ones in the admin panel.
export const defaultTestimonials = [
  {
    name: 'Project Safety Manager',
    designation: 'Metro Rail Project',
    company: 'Sample client',
    message:
      'RITA engaged early and kept findings practical. Their assessment reports were clear and well received by the authority.',
    photo: IMG.p1,
    rating: 5,
    order: 1,
  },
  {
    name: 'Head of Quality',
    designation: 'Rolling Stock Supplier',
    company: 'Sample client',
    message:
      'Their ISO 22163 support helped us structure our processes and prepare for certification without unnecessary paperwork.',
    photo: IMG.p2,
    rating: 5,
    order: 2,
  },
  {
    name: 'Engineering Director',
    designation: 'Signalling Integrator',
    company: 'Sample client',
    message:
      'Strong knowledge of EN 50128 and EN 50129. The V&V review found issues our internal process had missed.',
    photo: IMG.p3,
    rating: 5,
    order: 3,
  },
];

// Sample team entries — replace in the admin panel.
export const defaultTeam = [
  { name: 'Lead Assessor', designation: 'Independent Safety Assessment', photo: IMG.p5, order: 1 },
  { name: 'RAMS Lead', designation: 'RAMS Engineering', photo: IMG.p4, order: 2 },
  { name: 'V&V Lead', designation: 'Verification & Validation', photo: IMG.p1, order: 3 },
  { name: 'Quality Lead', designation: 'Management Systems', photo: IMG.p2, order: 4 },
];

// Service-area landing pages for local SEO. Edit freely in Admin › Areas We Serve.
export const defaultLocations = [
  {
    name: 'Hyderabad', slug: 'hyderabad', region: 'Telangana', order: 1, image: IMG.station, latitude: 17.385, longitude: 78.4867,
    headline: 'Railway Safety Assessment & RAMS Consultants in Hyderabad',
    intro: 'Independent Safety Assessment, RAMS engineering and CENELEC compliance support for metro, suburban and rail-electronics projects in Hyderabad.',
    highlights: ['Hyderabad-based assessors — on site within hours', 'Metro, MMTS suburban and mainline experience', 'Support for rail-electronics suppliers in the city’s industrial clusters', 'Reports written to the level safety authorities expect'],
    content: '<p>Hyderabad is home to one of India’s largest elevated metro networks, the MMTS suburban rail service and a growing base of railway electronics, signalling and software suppliers. Each of these needs safety evidence that will stand up to independent review.</p><h2>How we help teams in Hyderabad</h2><ul><li><strong>Independent Safety Assessment (ISA)</strong> to EN 50126, EN 50128/EN 50716 and EN 50129 for signalling, train control and platform systems.</li><li><strong>RAMS engineering</strong> — hazard analysis, FMECA, FTA, hazard log management and RAM demonstration.</li><li><strong>Verification &amp; validation</strong> of safety-related software and hardware developed in Hyderabad’s engineering centres.</li><li><strong>ISO 22163 (IRIS)</strong> readiness for suppliers seeking to qualify with Indian and international rail customers.</li></ul><p>Because our team is based in Hyderabad, we can attend design reviews, hazard workshops and test witnessing in person, keeping your schedule on track.</p>',
    seoTitle: 'Railway ISA & RAMS Consultants in Hyderabad, Telangana',
    seoDescription: 'Hyderabad-based Independent Safety Assessor for metro, MMTS and rail-electronics projects. RAMS, EN 50126/50128/50129, V&V and ISO 22163 support.',
  },
  {
    name: 'Secunderabad', slug: 'secunderabad', region: 'Telangana', order: 2, image: IMG.freight, latitude: 17.4399, longitude: 78.4983,
    headline: 'Railway Safety Assurance Services in Secunderabad',
    intro: 'Safety assessment, RAMS and audit support for railway projects and suppliers around Secunderabad, the headquarters of South Central Railway.',
    highlights: ['Close to South Central Railway headquarters', 'Signalling and electrification upgrade experience', 'Safety audits and test witnessing on site', 'Support for RDSO and CENELEC requirements'],
    content: '<p>Secunderabad is the headquarters of South Central Railway and one of the busiest rail hubs in southern India. Upgrades to signalling, electrification and station systems in the region require structured safety management and independent evidence.</p><h2>Services for Secunderabad projects</h2><ul><li>Independent Safety Assessment of signalling, interlocking and train control changes</li><li>Hazard identification workshops and hazard log management</li><li>Safety management system and supplier audits</li><li>Test and commissioning witnessing</li></ul><p>Our assessors can be on site in Secunderabad quickly, supporting both operators and the suppliers who deliver to them.</p>',
    seoTitle: 'Railway Safety Assessment & RAMS in Secunderabad, Telangana',
    seoDescription: 'Independent safety assessment, RAMS engineering and safety audits for railway projects and suppliers in Secunderabad, Telangana.',
  },
  {
    name: 'Warangal & Kazipet', slug: 'warangal-kazipet', region: 'Telangana', order: 3, image: IMG.autumnTrain, latitude: 17.9784, longitude: 79.6008,
    headline: 'Rolling Stock & Railway Assurance in Warangal and Kazipet',
    intro: 'RAMS, ISO 22163 and independent assessment for rolling stock and railway industry around Kazipet Junction and Warangal.',
    highlights: ['Kazipet — a key junction on the Delhi–Chennai trunk route', 'Rolling stock and maintenance-facility expertise', 'ISO 22163 for railway suppliers and vendors', 'EN 50657 / EN 50716 on-board software assurance'],
    content: '<p>Kazipet Junction is one of the most important rail junctions in Telangana, and the Warangal–Kazipet area is seeing growing rolling-stock manufacturing and maintenance activity. Suppliers and workshops here increasingly need railway-specific quality and safety evidence.</p><h2>What we offer</h2><ul><li>ISO 22163 gap analysis, implementation and certification readiness</li><li>RAMS analysis for rolling stock sub-systems</li><li>Assurance of on-board software to EN 50657 / EN 50716</li><li>First article inspection and configuration management support</li></ul>',
    seoTitle: 'Rolling Stock Assurance & ISO 22163 in Warangal, Kazipet',
    seoDescription: 'RAMS, ISO 22163 and independent safety assessment for rolling stock and railway suppliers in Warangal and Kazipet, Telangana.',
  },
  {
    name: 'Karimnagar', slug: 'karimnagar', region: 'Telangana', order: 4, image: IMG.viaduct, latitude: 18.4386, longitude: 79.1288,
    headline: 'Railway Safety & RAMS Consultancy for Karimnagar',
    intro: 'Safety assurance for new lines, signalling and infrastructure projects serving Karimnagar and north Telangana.',
    highlights: ['New line and doubling project support', 'Signalling and level-crossing safety analysis', 'Construction-phase safety audits', 'Remote reviews with on-site visits when needed'],
    content: '<p>New line, doubling and electrification work across north Telangana brings new signalling, level crossing and interface hazards. We help project teams identify, control and evidence those risks.</p><h2>Our support</h2><ul><li>Preliminary and system hazard analysis</li><li>Interface hazard management between civil, track, signalling and power</li><li>Independent review of safety documentation</li><li>Safety audits during construction and commissioning</li></ul>',
    seoTitle: 'Railway Safety & RAMS Consultancy in Karimnagar, Telangana',
    seoDescription: 'Hazard analysis, RAMS and independent safety assessment for railway line, signalling and infrastructure projects in Karimnagar, Telangana.',
  },
  {
    name: 'Nizamabad', slug: 'nizamabad', region: 'Telangana', order: 5, image: IMG.steamViaduct, latitude: 18.6725, longitude: 78.094,
    headline: 'Railway Assurance Services for Nizamabad',
    intro: 'RAMS engineering and independent safety assessment for railway upgrades in Nizamabad and north-west Telangana.',
    highlights: ['Signalling modernisation support', 'RAMS plans and safety cases', 'Supplier quality audits', 'Clear, practical findings'],
    content: '<p>Nizamabad sits on important routes connecting Telangana with Maharashtra. Signalling modernisation and capacity upgrades in the region need RAMS evidence and independent assessment that meet both RDSO and CENELEC expectations.</p><h2>Services</h2><ul><li>RAMS plans, safety plans and safety cases</li><li>Independent Safety Assessment</li><li>Supplier and subcontractor audits</li><li>Verification &amp; validation reviews</li></ul>',
    seoTitle: 'Railway Safety Assessment & RAMS in Nizamabad, Telangana',
    seoDescription: 'Independent safety assessment, RAMS plans and safety cases for railway signalling and upgrade projects in Nizamabad, Telangana.',
  },
  {
    name: 'Khammam', slug: 'khammam', region: 'Telangana', order: 6, image: IMG.forestTrain, latitude: 17.2473, longitude: 80.1514,
    headline: 'Railway Safety Assurance for Khammam',
    intro: 'Independent assessment, RAMS and V&V for signalling and electrification work on the busy Kazipet–Vijayawada corridor through Khammam.',
    highlights: ['Experience on high-density trunk routes', 'Automatic block signalling and train protection', 'Electrification interface hazards', 'Test witnessing and commissioning assurance'],
    content: '<p>Khammam lies on the high-density Kazipet–Vijayawada section of the Delhi–Chennai route. Capacity upgrades such as automatic block signalling and train protection systems need rigorous safety evidence before they enter service.</p><h2>How we help</h2><ul><li>Independent Safety Assessment of signalling and train protection changes</li><li>Hazard analysis for electrification and signalling interfaces</li><li>Test witnessing and commissioning assurance</li><li>Safety case review</li></ul>',
    seoTitle: 'Railway Safety Assessment & Signalling Assurance in Khammam',
    seoDescription: 'Independent safety assessment, RAMS and V&V for signalling, train protection and electrification projects in Khammam, Telangana.',
  },
];

export const defaultPageSeo = [
  { path: '/', title: 'Railway ISA & RAMS Consultants in Hyderabad, Telangana', description: defaultSettings.seo.metaDescription },
  { path: '/about', title: 'About Us – Independent Railway Safety Assessors, Hyderabad', description: 'About RITA System Assurance — a Hyderabad, Telangana based independent railway safety assessment and RAMS engineering company.' },
  { path: '/services', title: 'Railway Safety Assurance Services in Hyderabad & India', description: 'ISA, RAMS, EN 50126/50128/50129 compliance, signalling and rolling stock assurance, V&V, audits and ISO 22163 consultancy from Hyderabad, Telangana.' },
  { path: '/locations', title: 'Areas We Serve in Telangana', description: 'Railway safety assessment and RAMS services in Hyderabad, Secunderabad, Warangal, Kazipet, Karimnagar, Nizamabad, Khammam and across India.' },
  { path: '/blog', title: 'Railway Safety & RAMS Insights', description: 'Articles on railway safety assessment, RAMS, CENELEC standards and ISO 22163 from our Hyderabad team.' },
  { path: '/careers', title: 'Railway Safety Jobs in Hyderabad', description: 'Join RITA System Assurance in Hyderabad, Telangana — careers in railway safety assessment, RAMS and V&V engineering.' },
  { path: '/gallery', title: 'Gallery', description: 'Projects, engineering and team gallery of RITA System Assurance, Hyderabad.' },
  { path: '/clients', title: 'Our Clients', description: 'Metro, mainline, signalling and rolling stock organisations we support in Telangana and across India.' },
  { path: '/feedback', title: 'Client Feedback', description: 'Share your experience of working with RITA System Assurance.' },
  { path: '/contact', title: 'Contact Us – Hyderabad, Telangana', description: 'Contact our Hyderabad, Telangana office for Independent Safety Assessment, RAMS and V&V enquiries.' },
];
