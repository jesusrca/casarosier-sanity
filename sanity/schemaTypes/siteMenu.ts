import { defineType, defineField } from 'sanity';

export const siteMenu = defineType({
  name: 'siteMenu',
  title: 'Site Menu',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineType({
          name: 'menuItem',
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'path', type: 'string' }),
            defineField({ name: 'order', type: 'number' }),
            defineField({
              name: 'submenu',
              type: 'array',
              of: [
                defineType({
                  name: 'submenuItem',
                  type: 'object',
                  fields: [
                    defineField({ name: 'name', type: 'string' }),
                    defineField({ name: 'path', type: 'string' }),
                    defineField({ name: 'order', type: 'number' }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});
