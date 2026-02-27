import { StructureBuilder } from 'sanity/desk';

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('Home')
                .child(
                  S.document()
                    .schemaType('page')
                    .documentId('page-home')
                ),
              S.listItem()
                .title('El Estudio')
                .child(
                  S.document()
                    .schemaType('page')
                    .documentId('page-el-estudio')
                ),
              S.listItem()
                .title('Tarjeta de regalo (lista)')
                .child(
                  S.document()
                    .schemaType('page')
                    .documentId('page-tarjeta-regalo')
                ),
              S.listItem()
                .title('Clases (lista)')
                .child(
                  S.document()
                    .schemaType('page')
                    .documentId('page-clases')
                ),
              S.listItem()
                .title('Workshops (lista)')
                .child(
                  S.document()
                    .schemaType('page')
                    .documentId('page-workshops')
                ),
              S.listItem()
                .title('Blog (lista)')
                .child(
                  S.document()
                    .schemaType('page')
                    .documentId('page-blog')
                ),
            ])
        ),
      S.divider(),
      S.documentTypeListItem('classContent').title('1) Clases'),
      S.documentTypeListItem('workshopContent').title('2) Workshop'),
      S.documentTypeListItem('privateReservationContent').title('3) Reservas Privadas'),
      S.documentTypeListItem('giftCardContent').title('4) Tarjetas de regalo'),
      S.documentTypeListItem('blogPost').title('Blog Post'),
      S.documentTypeListItem('landingPage').title('Landing Page'),
      S.documentTypeListItem('siteMenu').title('Site Menu'),
      S.documentTypeListItem('siteSettings').title('Site Settings'),
      S.documentTypeListItem('instagramPost').title('Instagram Post'),
    ]);
