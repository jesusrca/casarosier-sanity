import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { deskStructure } from './sanity/deskStructure';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = process.env.SANITY_PROJECT_ID || 'ghh7ehj6';
const dataset = process.env.SANITY_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Casa Rosier',
  projectId,
  dataset,
  plugins: [deskTool({ structure: deskStructure })],
  schema: {
    types: schemaTypes,
  },
});
