import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { Hero } from '../components/Hero';
import { SEO } from '../components/SEO';
import { NotFound } from './NotFound';
import { PageSection } from '../components/PageSection';
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
  const { getPageBySlug, loading } = useContent();
  
  const page = getPageBySlug(slug || '');

  // Si está cargando y no hay página, mostrar skeleton sutil
  if (loading && !page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/60">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return <NotFound />;
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
        <SEO 
          title={page.seo?.metaTitle || page.title}
          description={page.seo?.metaDescription}
          keywords={page.seo?.keywords}
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
          <PageSection key={index} section={section} />
        ))}
      </div>
    );
  }

  // Si solo tiene contenido, mostrar el formato tradicional con caja blanca
  return (
    <div className="min-h-screen">
      <SEO 
        title={page.seo?.metaTitle || page.title}
        description={page.seo?.metaDescription}
        keywords={page.seo?.keywords}
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