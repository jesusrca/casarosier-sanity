/*
  Migrate data from .data/kv_export.json into Sanity.
  Requires env: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_TOKEN
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing SANITY_PROJECT_ID, SANITY_DATASET, or SANITY_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-15',
  useCdn: false,
});

const KV_PATH = path.resolve('.data/kv_export.json');
const IMG_MAP_PATH = path.resolve('.data/sanity-image-map.json');

function loadImageMap() {
  if (!fs.existsSync(IMG_MAP_PATH)) return {};
  return JSON.parse(fs.readFileSync(IMG_MAP_PATH, 'utf8'));
}

function saveImageMap(map) {
  fs.writeFileSync(IMG_MAP_PATH, JSON.stringify(map, null, 2));
}

function normalizeMaybeString(value) {
  if (!value) return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    const numeric = keys.every((k) => String(Number(k)) === k);
    if (numeric) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => value[k])
        .join('');
    }
  }
  return value;
}

function deepNormalize(value) {
  if (value == null) return value;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(deepNormalize);
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    const numeric = keys.length > 0 && keys.every((k) => String(Number(k)) === k);
    if (numeric) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => value[k])
        .join('');
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepNormalize(v);
    return out;
  }
  return value;
}

function normalizeContentField(value) {
  if (value == null) return value;
  if (typeof value === 'string') return { html: value };
  if (Array.isArray(value)) return value.map(deepNormalize);
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    const numericKeys = keys.filter((k) => String(Number(k)) === k);
    if (numericKeys.length > 50) {
      const html = numericKeys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => value[k])
        .join('');
      const nonNumeric = keys.filter((k) => String(Number(k)) !== k);
      if (!nonNumeric.length) return { html };
      const extras = {};
      for (const k of nonNumeric) extras[k] = deepNormalize(value[k]);
      return { html, ...extras };
    }
  }
  const normalized = deepNormalize(value);
  return typeof normalized === 'string' ? { html: normalized } : normalized;
}

function filenameFromUrl(url) {
  try {
    const u = new URL(url);
    const base = u.pathname.split('/').pop() || 'image';
    return base.split('?')[0];
  } catch {
    return 'image';
  }
}

function safeId(input) {
  if (!input) return 'unknown';
  return String(input).replace(/[^a-zA-Z0-9_-]/g, '-');
}

async function uploadImage(url, alt, caption) {
  if (!url) return null;
  const imageMap = loadImageMap();
  if (imageMap[url]) {
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: imageMap[url] },
      alt,
      caption,
    };
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`Failed to fetch image ${url}: ${res.status}`);
    return null;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload('image', buffer, {
    filename: filenameFromUrl(url),
  });
  imageMap[url] = asset._id;
  saveImageMap(imageMap);

  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt,
    caption,
  };
}

async function toImageField(value) {
  if (!value) return null;
  if (typeof value === 'string') return uploadImage(value);
  if (value.url) return uploadImage(value.url, value.alt, value.caption || value.description);
  return null;
}

async function migrate() {
  const kv = JSON.parse(fs.readFileSync(KV_PATH, 'utf8'));
  const byKey = new Map(kv.map((row) => [row.key, row.value]));

  const contentItems = kv.filter((r) => r.key.startsWith('content:')).map((r) => r.value);
  const posts = kv.filter((r) => r.key.startsWith('post:')).map((r) => r.value);
  const pages = kv.filter((r) => r.key.startsWith('page:')).map((r) => r.value);
  const landingPages = (byKey.get('landing_pages') || byKey.get('site:settings')?.landingPages || []);
  const menu = byKey.get('menu');
  const settings = byKey.get('site:settings');

  const docs = [];

  // Instagram posts (from settings)
  const instagramDocs = [];
  if (settings && Array.isArray(settings.instagramImages)) {
    for (const item of settings.instagramImages) {
      const image = await toImageField(item.url || item.image);
      const docId = `instagramPost-${safeId(item.date || item.title || item.url || Math.random().toString(36).slice(2))}`;
      instagramDocs.push({
        _id: docId,
        _type: 'instagramPost',
        date: item.date,
        title: item.title,
        description: item.description,
        link: item.link,
        source: item.source,
        image,
      });
    }
    docs.push(...instagramDocs);
  }

  // Landing pages
  for (const lp of landingPages || []) {
    const heroImage = await toImageField(lp.heroImage);
    const galleryImages = [];
    for (const img of lp.galleryImages || []) {
      const imageField = await toImageField(img);
      if (imageField) galleryImages.push(imageField);
    }
    docs.push({
      _id: `landingPage-${safeId(lp.id || lp.slug)}`,
      _type: 'landingPage',
      title: lp.heroTitle || lp.slug || 'Landing Page',
      slug: { _type: 'slug', current: lp.slug },
      visible: lp.visible,
      heroTitle: lp.heroTitle,
      heroSubtitle: lp.heroSubtitle,
      heroCta: lp.heroCta,
      heroCtaLink: lp.heroCtaLink,
      valueTitle: lp.valueTitle,
      valueSubtitle: lp.valueSubtitle,
      benefitsTitle: lp.benefitsTitle,
      galleryTitle: lp.galleryTitle,
      testimonialsTitle: lp.testimonialsTitle,
      faqTitle: lp.faqTitle,
      finalCtaTitle: lp.finalCtaTitle,
      finalCtaSubtitle: lp.finalCtaSubtitle,
      finalCtaButton: lp.finalCtaButton,
      finalCtaLink: lp.finalCtaLink,
      contactFormTitle: lp.contactFormTitle,
      contactFormSubtitle: lp.contactFormSubtitle,
      showContactForm: lp.showContactForm,
      showContactInfo: lp.showContactInfo,
      contactEmail: lp.contactEmail,
      contactPhone: lp.contactPhone,
      contactHours: lp.contactHours,
      contactAddress: lp.contactAddress,
      seo: lp.seo,
      heroImage,
      galleryImages,
      benefits: lp.benefits,
      valuePoints: lp.valuePoints,
      testimonials: lp.testimonials,
      faqs: lp.faqs,
    });
  }

  // Menu
  if (menu) {
    docs.push({
      _id: 'siteMenu',
      _type: 'siteMenu',
      items: menu.items || [],
    });
  }

  // Settings
  if (settings) {
    const settingsDoc = {
      _id: 'siteSettings',
      _type: 'siteSettings',
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      seoKeywords: settings.seoKeywords,
      ogUrl: settings.ogUrl,
      ogType: settings.ogType,
      ogTitle: settings.ogTitle,
      ogDescription: settings.ogDescription,
      contactEmail: settings.contactEmail,
      contactEmail2: settings.contactEmail2,
      contactPhone: settings.contactPhone,
      whatsappNumber: settings.whatsappNumber,
      instagramTitle: settings.instagramTitle,
      instagramHandle: settings.instagramHandle,
      instagramLink: settings.instagramLink,
      googleAnalyticsId: settings.googleAnalyticsId,
      homeCoursesDescription: settings.homeCoursesDescription,
      homeWorkshopsDescription: settings.homeWorkshopsDescription,
      paymentMethods: settings.paymentMethods,
      redirects: settings.redirects,
      landingPages: (landingPages || []).map((lp) => ({
        _type: 'reference',
        _ref: `landingPage-${safeId(lp.id || lp.slug)}`,
      })),
    };

    settingsDoc.ogImage = await toImageField(settings.ogImage);
    settingsDoc.heroImageDesktop = await toImageField(settings.heroImageDesktop);
    settingsDoc.heroImageMobile = await toImageField(settings.heroImageMobile);
    settingsDoc.heroTextImage1 = await toImageField(settings.heroTextImage1);
    settingsDoc.heroTextImage2 = await toImageField(settings.heroTextImage2);
    settingsDoc.blogHeroImage = await toImageField(settings.blogHeroImage);
    settingsDoc.blogTitleImage = await toImageField(settings.blogTitleImage);
    settingsDoc.clasesHeroTitleImage = await toImageField(settings.clasesHeroTitleImage);

    if (instagramDocs.length) {
      settingsDoc.instagramImages = instagramDocs.map((doc) => ({
        _type: 'reference',
        _ref: doc._id,
      }));
    }

    docs.push(settingsDoc);
  }

  // Content items
  for (const item of contentItems) {
    const images = [];
    for (const img of item.images || []) {
      const imageField = await toImageField(img);
      if (imageField) images.push(imageField);
    }

    const heroImage = await toImageField(item.heroImage);
    const mainImage = await toImageField(item.image);

    docs.push({
      _id: `contentItem-${safeId(item.id || item.slug)}`,
      _type: 'contentItem',
      title: item.title,
      slug: { _type: 'slug', current: item.slug },
      type: item.type,
      subtitle: item.subtitle,
      shortDescription: item.shortDescription,
      excerpt: item.excerpt,
      description: deepNormalize(item.description),
      content: normalizeContentField(item.content),
      price: item.price,
      priceOptions: item.priceOptions,
      duration: item.duration,
      includes: item.includes,
      schedule: item.schedule,
      menuLocations: item.menuLocations,
      whatsappNumber: item.whatsappNumber,
      visible: item.visible,
      showInHome: item.showInHome,
      showInHomeWorkshops: item.showInHomeWorkshops,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      heroImage,
      image: mainImage,
      images,
      seo: item.seo,
    });
  }

  // Pages
  for (const page of pages) {
    const heroImage = await toImageField(page.heroImage);
    docs.push({
      _id: `page-${safeId(page.slug)}`,
      _type: 'page',
      title: page.title,
      slug: { _type: 'slug', current: page.slug },
      content: normalizeContentField(page.content),
      visible: page.visible,
      deleted: page.deleted,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      seo: page.seo,
      heroImage,
    });
  }

  // Blog posts
  for (const post of posts) {
    const featuredImage = await toImageField(post.featuredImage);
    docs.push({
      _id: `blogPost-${safeId(post.slug)}`,
      _type: 'blogPost',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      author: post.author,
      content: normalizeContentField(post.content),
      excerpt: post.excerpt,
      featured: post.featured,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      seo: post.seo,
      featuredImage,
    });
  }

  // Write ndjson for review
  const ndjsonPath = path.resolve('.data/sanity_import.ndjson');
  fs.writeFileSync(ndjsonPath, docs.map((d) => JSON.stringify(d)).join('\n'));
  console.log(`Prepared ${docs.length} docs -> ${ndjsonPath}`);

  // Import into Sanity
  for (const doc of docs) {
    try {
      await client.createOrReplace(doc);
    } catch (err) {
      console.error(`Failed to import ${doc._id}:`, err?.message || err);
    }
  }
  console.log('Sanity migration completed.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
