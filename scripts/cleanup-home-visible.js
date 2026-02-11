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
  const ids = await client.fetch(`*[_type == "page" && slug.current == "home"]._id`);
  if (!ids.length) {
    console.log('No home page found.');
    return;
  }

  for (const id of ids) {
    await client.patch(id).unset(['visible', 'deleted']).commit();
    console.log(`Removed visible/deleted from ${id}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
