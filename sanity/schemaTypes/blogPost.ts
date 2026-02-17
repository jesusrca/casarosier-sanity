import { defineType, defineField } from 'sanity';

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'author', type: 'string' }),
    defineField({
      name: 'content',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        defineType({
          name: 'embed',
          type: 'object',
          fields: [
            defineField({ name: 'url', type: 'url' }),
            defineField({ name: 'caption', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({ name: 'excerpt', type: 'text' }),
    defineField({ name: 'featured', type: 'boolean' }),
    defineField({ name: 'createdAt', type: 'datetime' }),
    defineField({ name: 'updatedAt', type: 'datetime' }),
    defineField({
      name: 'seo',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', type: 'string' }),
        defineField({ name: 'metaDescription', type: 'text' }),
        defineField({ name: 'keywords', type: 'string' }),
      ],
    }),
    defineField({
      name: 'featuredImage',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string' })],
    }),
  ],
});
