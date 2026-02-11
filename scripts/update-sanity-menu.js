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

const mapPath = (path) => {
  if (!path) return path;
  return path
    .replace('/clases/clases-de-un-dia-iniciacion-en-ceramica', '/clases/iniciacion')
    .replace('/clases/cursos-ceramica-barcelona-modelado', '/clases/regular')
    .replace('/clases/cursos-ceramica-barcelona-torno', '/clases/torno')
    .replace('/clases/laboratorio-ceramico', '/clases/laboratorio');
};

async function run() {
  const menu = await client.fetch(`*[_type == "siteMenu"][0]`);
  if (!menu?._id) {
    console.log('No siteMenu document found.');
    return;
  }

  const items = (menu.items || []).map((item) => ({
    ...item,
    path: mapPath(item.path),
    submenu: item.submenu?.map((sub) => ({
      ...sub,
      path: mapPath(sub.path),
    })),
  }));

  await client.patch(menu._id).set({ items }).commit();
  console.log('Menu updated with legacy paths.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
