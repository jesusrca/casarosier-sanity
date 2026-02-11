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
  const docs = await client.fetch(`*[_type == "contentItem"]{_id}`);
  if (!docs.length) {
    console.log('No contentItem docs found.');
    return;
  }

  const tx = client.transaction();
  for (const doc of docs) {
    tx.patch(doc._id, { set: { _type: 'curso' } });
  }
  await tx.commit();
  console.log(`Renamed ${docs.length} documents to type curso.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
