import { defineType } from 'sanity';
import { buildContentFields } from './contentItem';

export const classContent = defineType({
  name: 'classContent',
  title: 'Clases',
  type: 'document',
  fields: buildContentFields('class'),
});
