import { createClient } from '@sanity/client';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'ghh7ehj6';
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-15',
  useCdn: true,
});

export async function sanityFetch<T>(query: string, params: Record<string, any> = {}) {
  return sanityClient.fetch<T>(query, params);
}
