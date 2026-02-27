import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { deskStructure } from './sanity/deskStructure';
import { schemaTypes } from './sanity/schemaTypes';
import { resolveDocumentActions } from './sanity/homeSyncActions';

const projectId = process.env.SANITY_PROJECT_ID || 'ghh7ehj6';
const dataset = process.env.SANITY_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Casa Rosier',
  projectId,
  dataset,
  plugins: [deskTool({ structure: deskStructure })],
  document: {
    actions: resolveDocumentActions,
  },
  schema: {
    types: schemaTypes,
  },
});
