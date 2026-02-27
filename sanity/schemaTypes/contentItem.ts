import { defineType, defineField } from 'sanity';

export type ContentDocKind = 'class' | 'workshop' | 'private' | 'gift-card';

export function buildContentFields(defaultKind: ContentDocKind) {
  return [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'type',
      title: 'Tipo',
      type: 'string',
      initialValue: defaultKind,
      readOnly: true,
      options: {
        list: [
          { title: 'Clase', value: 'class' },
          { title: 'Workshop', value: 'workshop' },
          { title: 'Privada', value: 'private' },
          { title: 'Tarjeta regalo', value: 'gift-card' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'subtitle', type: 'string' }),
    defineField({ name: 'shortDescription', type: 'text' }),
    defineField({ name: 'excerpt', type: 'text' }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'content',
      type: 'object',
      fields: [
        defineField({ name: 'additionalInfo', type: 'text' }),
        defineField({ name: 'contactPhone', type: 'string' }),
        defineField({ name: 'contactEmail', type: 'string' }),
        defineField({ name: 'whatYouWillLearn', type: 'text' }),
        defineField({ name: 'whoCanParticipate', type: 'text' }),
        defineField({
          name: 'modules',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'title', type: 'string' }),
              defineField({ name: 'description', type: 'text' }),
            ],
          }],
        }),
        defineField({
          name: 'activities',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'title', type: 'string' }),
              defineField({ name: 'description', type: 'text' }),
              defineField({ name: 'link', type: 'string' }),
            ],
          }],
        }),
      ],
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'Whatsapp Number',
      type: 'string',
      description: 'Número para consultas de este contenido. Si está vacío se usa el global.',
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
    defineField({
      name: 'visible',
      type: 'boolean',
      initialValue: true,
      hidden: true,
    }),
    defineField({
      name: 'showPaymentMethods',
      title: 'Mostrar métodos de pago',
      type: 'boolean',
      initialValue: true,
      description: 'Muestra u oculta la sección de métodos de pago configurada en Ajustes generales.',
    }),
    defineField({
      name: 'featuredInHome',
      title: 'Destacar en Home',
      type: 'boolean',
      initialValue: false,
      description:
        'Si es workshop se agrega al bloque Cursos 2. Otros tipos se agregan al bloque Cursos.',
    }),
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
      title: 'Imagen de lista',
      type: 'image',
      options: { hotspot: true },
      description: 'Se usa para mostrar el curso/taller en listados y tarjetas de otras páginas.',
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
    defineField({ name: 'createdAt', type: 'datetime' }),
    defineField({ name: 'updatedAt', type: 'datetime' }),
  ];
}

// Legacy schema for backward compatibility with already created documents.
export const contentItem = defineType({
  name: 'curso',
  title: 'Cursos (Legacy)',
  type: 'document',
  fields: buildContentFields('class'),
});
