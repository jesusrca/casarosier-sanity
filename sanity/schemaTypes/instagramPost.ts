import { defineType, defineField } from 'sanity';

export const instagramPost = defineType({
  name: 'instagramPost',
  title: 'Instagram Post',
  type: 'document',
  fields: [
    defineField({
      name: 'hidden',
      title: 'Ocultar',
      type: 'boolean',
      initialValue: false,
      description: 'Si está activo, este post no se mostrará en el carrusel del sitio.',
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Orden manual (menor = primero). Si está vacío, se ordena por fecha.',
    }),
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
