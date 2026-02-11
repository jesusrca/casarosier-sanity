import { StructureBuilder } from 'sanity/desk';

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Home')
        .child(
          S.document()
            .schemaType('page')
            .documentId('page-home')
        ),
      S.divider(),
      S.documentTypeListItem('curso').title('Cursos'),
      S.documentTypeListItem('blogPost').title('Blog Post'),
      S.documentTypeListItem('landingPage').title('Landing Page'),
      S.documentTypeListItem('siteMenu').title('Site Menu'),
      S.documentTypeListItem('siteSettings').title('Site Settings'),
      S.documentTypeListItem('instagramPost').title('Instagram Post'),
    ]);
