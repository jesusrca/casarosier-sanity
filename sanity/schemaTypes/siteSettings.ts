import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteName', type: 'string' }),
    defineField({ name: 'siteDescription', type: 'text' }),
    defineField({ name: 'seoTitle', type: 'string' }),
    defineField({ name: 'seoDescription', type: 'text' }),
    defineField({ name: 'seoKeywords', type: 'string' }),
    defineField({ name: 'ogUrl', type: 'string' }),
    defineField({ name: 'ogType', type: 'string' }),
    defineField({ name: 'ogTitle', type: 'string' }),
    defineField({ name: 'ogDescription', type: 'text' }),
    defineField({
      name: 'ogImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'contactEmail', type: 'string' }),
    defineField({ name: 'contactEmail2', type: 'string' }),
    defineField({ name: 'contactPhone', type: 'string' }),
    defineField({ name: 'whatsappNumber', type: 'string' }),
    defineField({ name: 'instagramTitle', type: 'string' }),
    defineField({ name: 'instagramHandle', type: 'string' }),
    defineField({ name: 'instagramLink', type: 'string' }),
    defineField({ name: 'googleAnalyticsId', type: 'string' }),
    // Deprecated: now editable in the Home page document (page.slug == "home").
    defineField({ name: 'homeCoursesDescription', type: 'text', hidden: true }),
    defineField({ name: 'homeWorkshopsDescription', type: 'text', hidden: true }),
    defineField({
      name: 'heroImageDesktop',
      type: 'image',
      options: { hotspot: true },
      // Deprecated: now editable in the Home page document.
      hidden: true,
      fields: [
        defineField({ name: 'alt', type: 'string' }),
        defineField({ name: 'description', type: 'string' }),
      ],
    }),
    defineField({
      name: 'heroImageMobile',
      type: 'image',
      options: { hotspot: true },
      // Deprecated: now editable in the Home page document.
      hidden: true,
      fields: [
        defineField({ name: 'alt', type: 'string' }),
        defineField({ name: 'description', type: 'string' }),
      ],
    }),
    defineField({
      name: 'heroTextImage1',
      type: 'image',
      options: { hotspot: true },
      // Deprecated: now editable in the Home page document.
      hidden: true,
    }),
    defineField({
      name: 'heroTextImage2',
      type: 'image',
      options: { hotspot: true },
      // Deprecated: now editable in the Home page document.
      hidden: true,
    }),
    defineField({
      name: 'blogHeroImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'blogTitleImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'clasesHeroTitleImage',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'instagramImages',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'instagramPost' }] }],
      hidden: true,
      description: 'Deprecated: el carrusel toma los items directamente de Instagram Post (orden y ocultar se manejan allí).',
    }),
    defineField({
      name: 'paymentMethods',
      type: 'object',
      fields: [
        defineField({ name: 'transferencia', type: 'boolean' }),
        defineField({ name: 'paypal', type: 'boolean' }),
        defineField({ name: 'tarjeta', type: 'boolean' }),
        defineField({ name: 'efectivo', type: 'boolean' }),
        defineField({ name: 'bizum', type: 'boolean' }),
      ],
    }),
    defineField({
      name: 'redirects',
      type: 'array',
      of: [
        defineType({
          name: 'redirect',
          type: 'object',
          fields: [
            defineField({ name: 'from', type: 'string' }),
            defineField({ name: 'to', type: 'string' }),
            defineField({ name: 'type', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'landingPages',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'landingPage' }] }],
    }),
  ],
});
