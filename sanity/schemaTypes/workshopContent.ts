import { defineType } from 'sanity';
import { buildContentFields } from './contentItem';

export const workshopContent = defineType({
  name: 'workshopContent',
  title: 'Workshops',
  type: 'document',
  fields: buildContentFields('workshop'),
});
