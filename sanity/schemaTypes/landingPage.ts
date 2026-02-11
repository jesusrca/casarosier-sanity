import { defineType, defineField } from 'sanity';

export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'visible', type: 'boolean' }),
    defineField({ name: 'heroTitle', type: 'string' }),
    defineField({ name: 'heroSubtitle', type: 'string' }),
    defineField({ name: 'heroCta', type: 'string' }),
    defineField({ name: 'heroCtaLink', type: 'string' }),
    defineField({ name: 'valueTitle', type: 'string' }),
    defineField({ name: 'valueSubtitle', type: 'string' }),
    defineField({ name: 'benefitsTitle', type: 'string' }),
    defineField({ name: 'galleryTitle', type: 'string' }),
    defineField({ name: 'testimonialsTitle', type: 'string' }),
    defineField({ name: 'faqTitle', type: 'string' }),
    defineField({ name: 'finalCtaTitle', type: 'string' }),
    defineField({ name: 'finalCtaSubtitle', type: 'string' }),
    defineField({ name: 'finalCtaButton', type: 'string' }),
    defineField({ name: 'finalCtaLink', type: 'string' }),
    defineField({ name: 'contactFormTitle', type: 'string' }),
    defineField({ name: 'contactFormSubtitle', type: 'string' }),
    defineField({ name: 'showContactForm', type: 'boolean' }),
    defineField({ name: 'showContactInfo', type: 'boolean' }),
    defineField({ name: 'contactEmail', type: 'string' }),
    defineField({ name: 'contactPhone', type: 'string' }),
    defineField({ name: 'contactHours', type: 'string' }),
    defineField({ name: 'contactAddress', type: 'string' }),
    defineField({
      name: 'seo',
      type: 'object',
      fields: [
        defineField({ name: 'title', type: 'string' }),
        defineField({ name: 'description', type: 'text' }),
        defineField({ name: 'keywords', type: 'string' }),
        defineField({ name: 'ogImage', type: 'string' }),
      ],
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'galleryImages',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'benefits',
      type: 'array',
      of: [
        defineType({
          name: 'benefit',
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'description', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'valuePoints',
      type: 'array',
      of: [
        defineType({
          name: 'valuePoint',
          type: 'object',
          fields: [
            defineField({ name: 'icon', type: 'string' }),
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'description', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'testimonials',
      type: 'array',
      of: [
        defineType({
          name: 'testimonial',
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'role', type: 'string' }),
            defineField({ name: 'text', type: 'text' }),
            defineField({ name: 'rating', type: 'number' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      of: [
        defineType({
          name: 'faq',
          type: 'object',
          fields: [
            defineField({ name: 'question', type: 'string' }),
            defineField({ name: 'answer', type: 'text' }),
          ],
        }),
      ],
    }),
  ],
});
