import { defineType, defineField } from 'sanity';

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    prepare({ title, slug }) {
      return {
        title: title || 'Página',
        subtitle: slug === 'home' ? 'Home (única)' : slug,
      };
    },
  },
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      readOnly: ({ document }) => document?.slug?.current === 'home',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      readOnly: true,
      options: { source: 'title' },
    }),
    defineField({
      name: 'sections',
      type: 'array',
      of: [
        defineType({
          name: 'aboutSection',
          title: 'About Section',
          type: 'object',
          fields: [
            defineField({ name: 'type', type: 'string', initialValue: 'about' }),
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'content', type: 'text' }),
            defineField({
              name: 'mainImage',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
            }),
          ],
        }),
        defineType({
          name: 'coursesSection',
          title: 'Courses Section',
          type: 'object',
          fields: [
            defineField({ name: 'type', type: 'string', initialValue: 'courses' }),
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'titleLine1', type: 'string' }),
            defineField({ name: 'titleLine2', type: 'string' }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              description: 'Texto descriptivo que aparece debajo del titulo en Home.',
            }),
            defineField({
              name: 'courses',
              type: 'array',
              of: [{ type: 'reference', to: [{ type: 'curso' }] }],
            }),
          ],
        }),
        defineType({
          name: 'courses2Section',
          title: 'Courses 2 Section',
          type: 'object',
          fields: [
            defineField({ name: 'type', type: 'string', initialValue: 'courses2' }),
            defineField({ name: 'titleLine1', type: 'string' }),
            defineField({ name: 'titleLine2', type: 'string' }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              description: 'Texto descriptivo que aparece debajo del titulo en Home.',
            }),
            defineField({
              name: 'courses',
              type: 'array',
              of: [{ type: 'reference', to: [{ type: 'curso' }] }],
            }),
          ],
        }),
        defineType({
          name: 'bannerSection',
          title: 'Banner Section',
          type: 'object',
          fields: [
            defineField({ name: 'type', type: 'string', initialValue: 'banner' }),
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'description', type: 'text' }),
            defineField({ name: 'link', type: 'string' }),
            defineField({
              name: 'image',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'seo',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', type: 'string' }),
        defineField({ name: 'metaDescription', type: 'text' }),
        defineField({ name: 'keywords', type: 'string' }),
      ],
    }),
    // Home-only hero controls live on the Home page document, not global settings.
    defineField({
      name: 'heroImageDesktop',
      title: 'Home Hero Image (Desktop)',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ document }) => document?.slug?.current !== 'home',
      fields: [
        defineField({ name: 'alt', type: 'string' }),
        defineField({ name: 'description', type: 'string' }),
      ],
    }),
    defineField({
      name: 'heroImageMobile',
      title: 'Home Hero Image (Mobile)',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ document }) => document?.slug?.current !== 'home',
      fields: [
        defineField({ name: 'alt', type: 'string' }),
        defineField({ name: 'description', type: 'string' }),
      ],
    }),
    defineField({
      name: 'heroTextImage1',
      title: 'Home Hero Text Image 1',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ document }) => document?.slug?.current !== 'home',
    }),
    defineField({
      name: 'heroTextImage2',
      title: 'Home Hero Text Image 2',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ document }) => document?.slug?.current !== 'home',
    }),
  ],
});
