import { Hero } from '../components/Hero';
import { SEOHead } from '../components/SEOHead';
import { PageSection } from '../components/PageSection';
import { useContent } from '../contexts/ContentContext';

const DEFAULT_STUDIO_SECTIONS = [
  {
    type: 'hero',
    title: 'estudio Ceramica',
    subtitle: 'creativa en Barcelona',
    image: '',
  },
  {
    type: 'about',
    title: 'El Estudio',
    content:
      'Casa Rosier es un espacio para aprender, crear y experimentar con la ceramica en Barcelona. Aqui trabajamos modelado, torno y acabados en un entorno cuidado y cercano.',
    images: [],
  },
  {
    type: 'text',
    title: 'Un espacio para crear sin prisa',
    content:
      'Encontraras un ambiente tranquilo, grupos reducidos y acompanamiento personalizado para que avances a tu ritmo. Tanto si empiezas desde cero como si ya tienes experiencia, el estudio esta pensado para que disfrutes del proceso.',
  },
];

export function ElEstudio() {
  const { getPageBySlug, settings } = useContent();
  const studioPage = getPageBySlug('el-estudio');
  const studioSections =
    studioPage?.sections && studioPage.sections.length > 0
      ? studioPage.sections
      : DEFAULT_STUDIO_SECTIONS;

  const firstSection = studioSections[0];
  const hasHero = firstSection?.type === 'hero';
  const heroSection = hasHero ? firstSection : null;
  const remainingSections = hasHero ? studioSections.slice(1) : studioSections;

  return (
    <div className="min-h-screen">
      <SEOHead
        title={studioPage?.seo?.metaTitle || studioPage?.title || 'El Estudio'}
        description={studioPage?.seo?.metaDescription}
        keywords={
          Array.isArray(studioPage?.seo?.keywords)
            ? studioPage?.seo?.keywords.join(', ')
            : studioPage?.seo?.keywords
        }
        image={heroSection?.image}
        url={`${settings.ogUrl || window.location.origin}/el-estudio`}
        type={settings.ogType || 'website'}
      />

      {heroSection ? (
        <Hero
          backgroundImage={heroSection.image || ''}
          title={heroSection.title || 'estudio Ceramica'}
          subtitle={heroSection.subtitle || 'creativa en Barcelona'}
          titleImage={heroSection.titleImage}
        />
      ) : (
        <Hero
          title="estudio Ceramica"
          subtitle="creativa en Barcelona"
        />
      )}

      {remainingSections.map((section: any, index: number) => (
        <PageSection key={index} section={section} siteSettings={settings} />
      ))}
    </div>
  );
}

