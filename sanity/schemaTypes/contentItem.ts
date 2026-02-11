import { defineType, defineField } from 'sanity';

export const contentItem = defineType({
  name: 'contentItem',
  title: 'Content Item',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'type', type: 'string' }),
    defineField({ name: 'subtitle', type: 'string' }),
    defineField({ name: 'shortDescription', type: 'text' }),
    defineField({ name: 'excerpt', type: 'text' }),
    defineField({ name: 'description', type: 'text' }),
    defineField({
      name: 'content',
      type: 'object',
      fields: [
        defineField({ name: 'html', type: 'text' }),
        defineField({ name: 'additionalInfo', type: 'text' }),
        defineField({ name: 'paymentMethods', type: 'text' }),
        defineField({ name: 'contactPhone', type: 'string' }),
        defineField({ name: 'contactEmail', type: 'string' }),
        defineField({ name: 'whatYouWillLearn', type: 'text' }),
        defineField({ name: 'whoCanParticipate', type: 'text' }),
        defineField({ name: 'modules', type: 'array', of: [{ type: 'object', fields: [
          defineField({ name: 'title', type: 'string' }),
          defineField({ name: 'description', type: 'text' }),
        ]}] }),
        defineField({ name: 'activities', type: 'array', of: [{ type: 'object', fields: [
          defineField({ name: 'title', type: 'string' }),
          defineField({ name: 'description', type: 'text' }),
          defineField({ name: 'link', type: 'string' }),
        ]}] }),
      ],
    }),
    defineField({ name: 'price', type: 'number' }),
    defineField({
      name: 'priceOptions',
      type: 'array',
      of: [
        defineType({
          name: 'priceOption',
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string' }),
            defineField({ name: 'price', type: 'number' }),
          ],
        }),
      ],
    }),
    defineField({ name: 'duration', type: 'string' }),
    defineField({ name: 'includes', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'schedule',
      type: 'object',
      fields: [
        defineField({ name: 'description', type: 'text' }),
        defineField({ name: 'enabled', type: 'boolean' }),
        defineField({
          name: 'slots',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'day', type: 'string' }),
                defineField({
                  name: 'times',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        defineField({ name: 'time', type: 'string' }),
                        defineField({ name: 'availablePlaces', type: 'number' }),
                      ],
                    },
                  ],
                }),
              ],
            },
          ],
        }),
      ],
    }),
    defineField({ name: 'menuLocations', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'whatsappNumber', type: 'string' }),
    defineField({ name: 'visible', type: 'boolean' }),
    defineField({ name: 'showInHome', type: 'boolean' }),
    defineField({ name: 'showInHomeWorkshops', type: 'boolean' }),
    defineField({ name: 'createdAt', type: 'datetime' }),
    defineField({ name: 'updatedAt', type: 'datetime' }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string' }),
        defineField({ name: 'description', type: 'string' }),
      ],
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string' }),
        defineField({ name: 'description', type: 'string' }),
      ],
    }),
    defineField({
      name: 'images',
      type: 'array',
      of: [
        defineType({
          name: 'contentImage',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string' }),
            defineField({ name: 'caption', type: 'string' }),
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
  ],
});
