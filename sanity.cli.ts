import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.SANITY_PROJECT_ID || 'ghh7ehj6';
const dataset = process.env.SANITY_DATASET || 'production';

export default defineCliConfig({
  api: { projectId, dataset },
});
