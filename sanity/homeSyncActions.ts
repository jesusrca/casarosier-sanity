import type { DocumentActionComponent, DocumentActionProps } from 'sanity';

const API_VERSION = '2024-01-15';

const CONTENT_TYPES = new Set([
  'classContent',
  'workshopContent',
  'privateReservationContent',
  'giftCardContent',
  'curso',
]);

function normalizeId(id: string | undefined): string | undefined {
  if (!id) return id;
  return id.replace(/^drafts\./, '');
}

function ensureHomeSection(sections: any[], sectionType: 'courses' | 'courses2') {
  const idx = sections.findIndex((s) => s?.type === sectionType);
  if (idx >= 0) return idx;

  const base =
    sectionType === 'courses'
      ? {
          _type: 'coursesSection',
          type: 'courses',
          title: 'Cursos y workshops',
          titleLine1: 'CURSOS Y',
          titleLine2: 'WORKSHOPS',
          courses: [],
        }
      : {
          _type: 'courses2Section',
          type: 'courses2',
          titleLine1: 'WORKSHOP CERÁMICA',
          titleLine2: 'EN BARCELONA',
          courses: [],
        };

  sections.push(base);
  return sections.length - 1;
}

function hasRef(list: any[], refId: string) {
  return (list || []).some((item) => item?._ref === refId);
}

function addRef(list: any[], refId: string) {
  if (hasRef(list, refId)) return list;
  return [...(list || []), { _type: 'reference', _ref: refId }];
}

function removeRef(list: any[], refId: string) {
  return (list || []).filter((item) => item?._ref !== refId);
}

async function syncContentDocumentToHome(client: any, doc: any) {
  const docId = normalizeId(doc?._id);
  const docType = doc?.type;
  const featured = !!doc?.featuredInHome;

  if (!docId || !docType) return;

  const home = await client.fetch(
    '*[_type == "page" && _id == "page-home"][0]{_id, sections}'
  );
  if (!home?._id) return;

  const nextSections = [...(home.sections || [])];
  const coursesIdx = ensureHomeSection(nextSections, 'courses');
  const courses2Idx = ensureHomeSection(nextSections, 'courses2');

  const isWorkshop = docType === 'workshop';
  const targetIdx = isWorkshop ? courses2Idx : coursesIdx;
  const otherIdx = isWorkshop ? coursesIdx : courses2Idx;

  const target = { ...nextSections[targetIdx] };
  const other = { ...nextSections[otherIdx] };

  target.courses = featured
    ? addRef(target.courses || [], docId)
    : removeRef(target.courses || [], docId);
  other.courses = removeRef(other.courses || [], docId);

  nextSections[targetIdx] = target;
  nextSections[otherIdx] = other;

  await client.patch('page-home').set({ sections: nextSections }).commit();
}

async function syncHomeToContentDocuments(client: any, homeDoc: any) {
  const sections = homeDoc?.sections || [];
  const coursesSection = sections.find((s: any) => s?.type === 'courses');
  const courses2Section = sections.find((s: any) => s?.type === 'courses2');

  const inCourses = new Set((coursesSection?.courses || []).map((r: any) => normalizeId(r?._ref)).filter(Boolean));
  const inCourses2 = new Set((courses2Section?.courses || []).map((r: any) => normalizeId(r?._ref)).filter(Boolean));

  const allRefs = new Set<string>([...Array.from(inCourses), ...Array.from(inCourses2)] as string[]);

  const docs = await client.fetch(
    '*[_type in ["classContent","workshopContent","privateReservationContent","giftCardContent","curso"]]{_id,type,featuredInHome}'
  );

  const tx = client.transaction();
  let hasMutations = false;

  for (const doc of docs) {
    const id = normalizeId(doc._id);
    if (!id) continue;

    const shouldBeFeatured = doc.type === 'workshop' ? inCourses2.has(id) : inCourses.has(id);

    if (doc.featuredInHome !== shouldBeFeatured) {
      tx.patch(id, { set: { featuredInHome: shouldBeFeatured } });
      hasMutations = true;
    }

    // Cleanup: ensure a workshop is not mistakenly left in courses and vice-versa by flags logic.
    if (allRefs.has(id) && doc.type === 'workshop' && inCourses.has(id)) {
      // keep boolean true because it is in courses2 expected block after manual correction.
      tx.patch(id, { set: { featuredInHome: inCourses2.has(id) } });
      hasMutations = true;
    }
  }

  if (hasMutations) {
    await tx.commit();
  }
}

function createPublishWithSyncAction(originalAction: DocumentActionComponent): DocumentActionComponent {
  return (props: DocumentActionProps) => {
    const originalResult = originalAction(props);
    if (!originalResult) return originalResult;

    const schemaType = props.schemaType;
    const documentId = props.id;

    return {
      ...originalResult,
      onHandle: async () => {
        await originalResult.onHandle?.();

        try {
          const client = props.getClient({ apiVersion: API_VERSION });
          const latest = await client.getDocument(normalizeId(documentId));

          if (!latest) {
            props.onComplete();
            return;
          }

          if (CONTENT_TYPES.has(schemaType)) {
            await syncContentDocumentToHome(client, latest);
          }

          if (schemaType === 'page' && latest?.slug?.current === 'home') {
            await syncHomeToContentDocuments(client, latest);
          }
        } catch (err) {
          // Do not block publishing if sync fails.
          // eslint-disable-next-line no-console
          console.error('[home-sync] publish sync failed', err);
        }

        props.onComplete();
      },
    };
  };
}

export function resolveDocumentActions(prev: DocumentActionComponent[]) {
  return prev.map((action) => {
    const maybeAction = action as unknown as { action?: string };
    if (maybeAction?.action === 'publish') {
      return createPublishWithSyncAction(action);
    }
    return action;
  });
}
