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
  const drafts = await client.fetch('*[_id in path("drafts.**")]{_id}');
  if (!drafts.length) {
    console.log('No drafts found.');
    return;
  }

  for (const draft of drafts) {
    const publishedId = draft._id.replace(/^drafts\./, '');
    const doc = await client.fetch('*[_id == $id][0]', { id: draft._id });
    if (!doc) continue;
    await client.createOrReplace({ ...doc, _id: publishedId });
    console.log(`Published ${publishedId}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
