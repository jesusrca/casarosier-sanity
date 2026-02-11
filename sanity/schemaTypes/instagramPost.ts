import { defineType, defineField } from 'sanity';

export const instagramPost = defineType({
  name: 'instagramPost',
  title: 'Instagram Post',
  type: 'document',
  fields: [
    defineField({ name: 'date', type: 'string' }),
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'link', type: 'string' }),
    defineField({ name: 'source', type: 'string' }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});
