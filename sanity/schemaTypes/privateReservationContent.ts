import { defineType } from 'sanity';
import { buildContentFields } from './contentItem';

export const privateReservationContent = defineType({
  name: 'privateReservationContent',
  title: 'Reservas Privadas',
  type: 'document',
  fields: buildContentFields('private'),
});
