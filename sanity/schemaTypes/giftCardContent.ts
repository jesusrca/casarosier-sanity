import { defineType } from 'sanity';
import { buildContentFields } from './contentItem';

export const giftCardContent = defineType({
  name: 'giftCardContent',
  title: 'Tarjetas de regalo',
  type: 'document',
  fields: buildContentFields('gift-card'),
});
