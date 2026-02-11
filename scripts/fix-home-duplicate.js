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
  const drafts = await client.fetch('*[_type=="page" && slug.current=="home" && _id in path("drafts.**")]');
  if (!drafts.length) {
    console.log('No home drafts found.');
    return;
  }

  // Keep page-home draft if present, otherwise keep the first draft
  const keep = drafts.find(d => d._id === 'drafts.page-home') || drafts[0];
  const remove = drafts.filter(d => d._id !== keep._id);

  // Create/replace published page-home from the kept draft
  const published = { ...keep, _id: 'page-home' };
  await client.createOrReplace(published);
  console.log('Published page-home from draft:', keep._id);

  // Delete extra drafts
  for (const d of remove) {
    await client.delete(d._id);
    console.log('Deleted extra draft:', d._id);
  }

  // Keep draft.page-home so you can keep editing
  if (keep._id !== 'drafts.page-home') {
    // rename kept draft to drafts.page-home
    await client.createOrReplace({ ...keep, _id: 'drafts.page-home' });
    await client.delete(keep._id);
    console.log('Normalized draft to drafts.page-home');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
