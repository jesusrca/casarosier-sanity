import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { Hero } from '../components/Hero';
import { SEOHead } from '../components/SEOHead';
import { NotFound } from './NotFound';
import { PageSection } from '../components/PageSection';
import { LoadingScreen } from '../components/LoadingScreen';
import { Navigation } from '../components/Navigation';
import { fetchLandingPage } from '../utils/sanityQueries';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  sections?: any[];
  heroImage?: string;
  visible: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[] | string;
  };
}

export function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getPageBySlug, loading, settings, pages } = useContent();
  const [showNotFound, setShowNotFound] = useState(false);
  const [landingPage, setLandingPage] = useState<any>(null);
  const [checkingLanding, setCheckingLanding] = useState(true);
  
  // Primero intentar cargar una landing page
  useEffect(() => {
    const checkLandingPage = async () => {
      try {
        const lp = await fetchLandingPage(slug!);
        if (lp && lp.visible) {
          
          // Transformar los campos hero en una sección si existen
          let transformedSections = [...(lp.sections || [])];
          
          // Si tiene heroImage/heroTitle pero no tiene una sección hero al inicio, crearla
          const hasHeroSection = transformedSections[0]?.type === 'hero';
          
          if ((lp.heroImage || lp.heroTitle) && !hasHeroSection) {
            // Crear sección hero al inicio
            const heroSection = {
              type: 'hero',
              image: lp.heroImage,
              title: lp.heroTitle || lp.title,
              subtitle: lp.heroSubtitle || ''
            };
            transformedSections = [heroSection, ...transformedSections];
          }
          
          // Actualizar el landing page con las secciones transformadas
          const transformedLandingPage = {
            ...lp,
            sections: transformedSections
          };
          
          console.log('✅ Landing page transformado:', {
            original: lp,
            transformed: transformedLandingPage,
            hasHeroImage: !!lp.heroImage,
            sectionsCount: transformedSections.length
          });
          
          setLandingPage(transformedLandingPage);
        }
      } catch (error) {
        console.log('No landing page found, checking custom pages');
      } finally {
        setCheckingLanding(false);
      }
    };

    if (slug) {
      checkLandingPage();
    }
  }, [slug]);
  
  const page = getPageBySlug(slug || '');

  // Debug logging
  useEffect(() => {
    console.log('🔍 DynamicPage Debug:', {
      slug,
      loading,
      pageFound: !!page,
      pageTitle: page?.title,
      totalPages: pages?.length,
      availablePages: pages?.map(p => ({ slug: p.slug, title: p.title }))
    });
  }, [slug, page, loading, pages]);

  // Control del delay antes de mostrar 404 para evitar flash durante transiciones
  useEffect(() => {
    if (!page && !loading && !checkingLanding) {
      // Dar un margen de tiempo más largo antes de mostrar 404
      const timer = setTimeout(() => {
        console.log('⚠️ Mostrando 404 para slug:', slug);
        setShowNotFound(true);
      }, 600); // Aumentado a 600ms
      return () => clearTimeout(timer);
    } else {
      setShowNotFound(false);
    }
  }, [page, loading, slug, checkingLanding]);

  // Si está cargando o esperando para mostrar 404, mostrar skeleton
  if (loading || (!page && !landingPage && !showNotFound && checkingLanding)) {
    return <LoadingScreen />;
  }

  // Si encontramos una landing page, renderizarla
  if (landingPage) {
    console.log('📄 Landing Page detectada:', {
      title: landingPage.title,
      slug: landingPage.slug,
      sectionsCount: landingPage.sections?.length || 0,
      sections: landingPage.sections
    });
    
    return (
      <div className="min-h-screen">
        <SEOHead
          title={landingPage.seo?.metaTitle || landingPage.title}
          description={landingPage.seo?.metaDescription}
          keywords={Array.isArray(landingPage.seo?.keywords) ? landingPage.seo?.keywords.join(', ') : landingPage.seo?.keywords}
          image={landingPage.heroImage}
          url={`${settings.ogUrl || window.location.origin}/${slug}`}
          type={settings.ogType || 'website'}
        />

        {landingPage.sections && landingPage.sections.length > 0 && landingPage.sections.map((section: any, index: number) => (
          <PageSection key={index} section={section} siteSettings={settings} isFirstSection={index === 0} />
        ))}
      </div>
    );
  }

  if (!page && showNotFound) {
    return <NotFound />;
  }

  // Safety check - if page is null/undefined, show loading
  if (!page) {
    return <LoadingScreen />;
  }

  // Si la página tiene secciones, renderizarlas directamente sin el contenedor blanco
  if (page.sections && page.sections.length > 0) {
    // Separar la primera sección si es de tipo 'hero' para usar el componente Hero completo
    const firstSection = page.sections[0];
    const isFirstSectionHero = firstSection?.type === 'hero';
    const heroSection = isFirstSectionHero ? firstSection : null;
    const remainingSections = isFirstSectionHero ? page.sections.slice(1) : page.sections;

    return (
      <div className="min-h-screen">
        {/* SEOHead with Open Graph */}
        <SEOHead
          title={page.seo?.metaTitle || page.title}
          description={page.seo?.metaDescription}
          keywords={Array.isArray(page.seo?.keywords) ? page.seo?.keywords.join(', ') : page.seo?.keywords}
          image={page.heroImage || heroSection?.image}
          url={`${settings.ogUrl || window.location.origin}/${slug}`}
          type={settings.ogType || 'website'}
        />

        {/* Si la primera sección es hero, usar el componente Hero completo con logo y menú */}
        {heroSection && (
          <Hero
            backgroundImage={heroSection.image || ''}
            title={heroSection.title || 'estudio Cerámica'}
            subtitle={heroSection.subtitle || 'creativa en Barcelona'}
            titleImage={heroSection.titleImage}
          />
        )}

        {/* Renderizar el resto de secciones */}
        {remainingSections.map((section: any, index: number) => (
          <PageSection key={index} section={section} siteSettings={settings} />
        ))}
      </div>
    );
  }

  // Si solo tiene contenido, mostrar el formato tradicional con caja blanca
  return (
    <div className="min-h-screen">
      {/* SEOHead with Open Graph */}
      <SEOHead
        title={page.seo?.metaTitle || page.title}
        description={page.seo?.metaDescription}
        keywords={Array.isArray(page.seo?.keywords) ? page.seo?.keywords.join(', ') : page.seo?.keywords}
        image={page.heroImage}
        url={`${settings.ogUrl || window.location.origin}/${slug}`}
        type={settings.ogType || 'website'}
      />

      {page.heroImage && (
        <Hero
          backgroundImage={page.heroImage}
          title="estudio Cerámica"
          subtitle="creativa en Barcelona"
        />
      )}

      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8 lg:p-12"
          >
            <h1 className="text-4xl lg:text-5xl mb-8 text-center">{page.title}</h1>
            {page.content ? (
              <div 
                className="prose prose-lg max-w-none text-foreground/80"
                style={{ 
                  whiteSpace: 'pre-wrap',
                }}
              >
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{page.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-foreground/60 mb-4">
                  Esta página aún no tiene contenido.
                </p>
                <p className="text-base text-foreground/40">
                  Puedes editarla desde el administrador agregando secciones o contenido.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
