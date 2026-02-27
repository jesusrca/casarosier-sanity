const { getCliClient } = require('sanity/cli');

const client = getCliClient({ apiVersion: '2024-01-15', useCdn: false });

const dryRun = process.argv.includes('--dry-run');

const typeMap = {
  class: 'classContent',
  workshop: 'workshopContent',
  private: 'privateReservationContent',
  'gift-card': 'giftCardContent',
};

async function migrateLegacyCursoDocs() {
  const legacyDocs = await client.fetch('*[_type == "curso"]');

  if (!legacyDocs.length) {
    console.log('No legacy `curso` documents found.');
    return { migrated: 0, skipped: 0 };
  }

  const toMigrate = [];
  let skipped = 0;

  for (const doc of legacyDocs) {
    const nextType = typeMap[doc.type];
    if (!nextType) {
      skipped += 1;
      console.warn(
        `Skipping ${doc._id} (${doc.title || 'Untitled'}) - unknown type: ${doc.type}`
      );
      continue;
    }
    const baseId = doc._id.startsWith('drafts.') ? doc._id.slice(7) : doc._id;
    const targetId = `${nextType}-${baseId}`;
    const nextId = doc._id.startsWith('drafts.') ? `drafts.${targetId}` : targetId;

    const { _id, _type, _rev, _createdAt, _updatedAt, ...rest } = doc;
    toMigrate.push({
      id: doc._id,
      nextType,
      nextId,
      title: doc.title,
      slug: doc.slug?.current,
      payload: {
        _id: nextId,
        _type: nextType,
        ...rest,
        type: doc.type || 'class',
      },
    });
  }

  if (!toMigrate.length) {
    return { migrated: 0, skipped };
  }

  console.log(`Preparing to migrate ${toMigrate.length} legacy docs:`);
  for (const item of toMigrate) {
    console.log(`- ${item.id} -> ${item.nextId} [${item.nextType}] (${item.slug || 'no-slug'})`);
  }

  if (dryRun) {
    console.log('Dry-run mode: no mutations committed.');
    return { migrated: toMigrate.length, skipped };
  }

  let migrated = 0;
  for (const item of toMigrate) {
    await client.createOrReplace(item.payload);
    migrated += 1;
  }

  return { migrated, skipped };
}

async function ensureSingletonPage({ id, slug, title }) {
  const existingById = await client.fetch('*[_id == $id][0]{_id, title, slug, sections, seo}', {
    id,
  });

  if (existingById?._id) {
    console.log(`Singleton already exists: ${id}`);
    return;
  }

  const existingBySlug = await client.fetch(
    '*[_type == "page" && !(_id in path("drafts.**")) && slug.current == $slug][0]{_id, _type, title, slug, sections, seo}',
    { slug }
  );

  let nextDoc;

  if (existingBySlug?._id) {
    nextDoc = {
      ...existingBySlug,
      _id: id,
      _type: 'page',
      title: existingBySlug.title || title,
      slug: existingBySlug.slug || { _type: 'slug', current: slug },
      sections: existingBySlug.sections || [],
    };
    console.log(`Cloning page slug \"${slug}\" from ${existingBySlug._id} to singleton ${id}`);
  } else {
    nextDoc = {
      _id: id,
      _type: 'page',
      title,
      slug: { _type: 'slug', current: slug },
      sections: [],
    };
    console.log(`Creating missing singleton ${id} (slug: ${slug})`);
  }

  if (!dryRun) {
    await client.createOrReplace(nextDoc);
  }
}

async function ensureSingletonPages() {
  const pages = [
    { id: 'page-home', slug: 'home', title: 'Inicio' },
    { id: 'page-el-estudio', slug: 'el-estudio', title: 'El Estudio' },
    { id: 'page-tarjeta-regalo', slug: 'tarjeta-regalo', title: 'Tarjeta de regalo' },
    { id: 'page-clases', slug: 'clases', title: 'Clases' },
    { id: 'page-workshops', slug: 'workshops', title: 'Workshops' },
    { id: 'page-blog', slug: 'blog', title: 'Blog' },
  ];

  for (const page of pages) {
    await ensureSingletonPage(page);
  }
}

async function run() {
  console.log(`Running seed/migration${dryRun ? ' (dry-run)' : ''}...`);

  const migrationResult = await migrateLegacyCursoDocs();
  await ensureSingletonPages();

  console.log('\nDone.');
  console.log(`Migrated legacy docs: ${migrationResult.migrated}`);
  console.log(`Skipped legacy docs: ${migrationResult.skipped}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
