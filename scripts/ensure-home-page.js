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

async function run() {
  const home = await client.fetch(`*[_type == "page" && slug.current == "home"][0]{_id}`);
  if (home?._id) {
    console.log('Home page already exists:', home._id);
    return;
  }

  const doc = {
    _type: 'page',
    title: 'Inicio',
    slug: { _type: 'slug', current: 'home' },
    content: '',
    sections: [
      { _type: 'aboutSection', type: 'about', title: 'Sobre Nosotros', content: '' },
      { _type: 'coursesSection', type: 'courses', title: 'Cursos y workshops', titleLine1: 'CURSOS Y', titleLine2: 'WORKSHOPS', courses: [] },
      { _type: 'courses2Section', type: 'courses2', titleLine1: 'WORKSHOP CERÁMICA', titleLine2: 'EN BARCELONA', courses: [] },
      { _type: 'bannerSection', type: 'banner', title: '', description: '', link: '' }
    ]
  };

  const created = await client.create(doc);
  console.log('Home page created:', created._id);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
