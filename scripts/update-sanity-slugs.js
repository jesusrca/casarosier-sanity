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

const mapping = {
  'clases-de-un-dia-iniciacion-en-ceramica': 'iniciacion',
  'cursos-ceramica-barcelona-modelado': 'regular',
  'cursos-ceramica-barcelona-torno': 'torno',
  'laboratorio-ceramico': 'laboratorio',
};

async function run() {
  const docs = await client.fetch(`*[_type == "contentItem" && type == "class"]{_id, slug}`);
  const tx = client.transaction();
  let changed = 0;

  for (const doc of docs) {
    const current = doc.slug?.current;
    const next = mapping[current];
    if (next && next !== current) {
      tx.patch(doc._id, { set: { slug: { _type: 'slug', current: next } } });
      changed++;
      console.log(`Will update ${doc._id}: ${current} -> ${next}`);
    }
  }

  if (changed === 0) {
    console.log('No slug updates needed.');
    return;
  }

  await tx.commit();
  console.log(`Updated ${changed} slugs.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
