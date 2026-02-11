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
  const docs = await client.fetch(`*[_type == "contentItem" && !(_id in path('drafts.**'))]`);
  if (!docs.length) {
    console.log('No contentItem docs found.');
    return;
  }

  const idMap = {};
  // Create new docs
  for (const doc of docs) {
    const newId = doc._id.replace(/^contentItem-/, 'curso-');
    idMap[doc._id] = newId;
    const newDoc = { ...doc, _id: newId, _type: 'curso' };
    await client.createOrReplace(newDoc);
  }

  // Update references in pages
  const pages = await client.fetch(`*[_type == "page"]{_id, sections}`);
  for (const page of pages) {
    let changed = false;
    const sections = (page.sections || []).map((section) => {
      if (!section?.courses) return section;
      const courses = section.courses.map((ref) => {
        if (ref?._ref && idMap[ref._ref]) {
          changed = true;
          return { ...ref, _ref: idMap[ref._ref] };
        }
        return ref;
      });
      return { ...section, courses };
    });
    if (changed) {
      await client.patch(page._id).set({ sections }).commit();
    }
  }

  // Delete old docs (and drafts if they exist)
  for (const doc of docs) {
    await client.delete(doc._id);
    await client.delete(`drafts.${doc._id}`);
  }

  console.log(`Migrated ${docs.length} documents to type curso.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
