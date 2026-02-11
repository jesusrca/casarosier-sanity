import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = process.env.SANITY_PROJECT_ID || 'ghh7ehj6';
const dataset = process.env.SANITY_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Casa Rosier',
  projectId,
  dataset,
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});
