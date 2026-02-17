import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { SEOHead } from '../components/SEOHead';
import { generateBlogPostStructuredData } from '../components/SEO';
import { Navigation } from '../components/Navigation';
import { LoadingScreen } from '../components/LoadingScreen';
import { Calendar, ArrowLeft, ChevronUp, Clock } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// Función para calcular tiempo estimado de lectura
function extractTextFromPortable(blocks: any): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((block: any) => {
      if (block._type === 'block') {
        return block.children?.map((child: any) => child.text).join('') || '';
      }
      return '';
    })
    .join(' ');
}

function calculateReadingTime(content: any): number {
  const wordsPerMinute = 200;
  const text = typeof content === 'string' ? content : extractTextFromPortable(content);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { getBlogPostBySlug, loading } = useContent();
  const [showNotFound, setShowNotFound] = useState(false);
  const post = getBlogPostBySlug(slug || '');

  // Control del delay antes de mostrar 404 para evitar flash durante transiciones
  useEffect(() => {
    if (!post && !loading) {
      // Dar un pequeño margen de tiempo antes de mostrar 404
      const timer = setTimeout(() => {
        setShowNotFound(true);
      }, 300); // 300ms de delay, coincide con la duración de la transición
      return () => clearTimeout(timer);
    } else {
      setShowNotFound(false);
    }
  }, [post, loading, slug]);

  // Si está cargando o esperando para mostrar 404, mostrar skeleton
  if (loading || (!post && !showNotFound)) {
    return <LoadingScreen />;
  }

  if (!post && showNotFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl mb-4">Artículo no encontrado</h1>
          <Link to="/blog" className="text-primary hover:underline flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  const structuredData = generateBlogPostStructuredData({
    title: post.title,
    description: post.excerpt,
    author: post.author,
    publishedDate: post.publishedDate || post.createdAt,
    modifiedDate: post.updatedAt,
    image: post.featuredImage,
    url: window.location.href,
  });

  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.seo?.metaTitle || `${post.title} | Casa Rosier Blog`}
        description={post.seo?.metaDescription || post.excerpt}
        keywords={post.seo?.keywords || 'blog, cerámica, Casa Rosier'}
        image={post.featuredImage}
        type="article"
        publishedTime={post.publishedDate || post.createdAt}
        modifiedTime={post.updatedAt}
        author={post.author}
        structuredData={structuredData}
      />

      {/* Hero con menú pero contenido personalizado */}
      <div className="relative min-h-[60vh] bg-background flex flex-col">
        {/* Menú de navegación importado desde Hero */}
        <Navigation />

        {/* Contenido del hero - minimalista estilo blog */}
        <div className="flex-1 flex items-center justify-center py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              {/* Categoría */}
              {post.category && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="text-sm uppercase tracking-wider text-foreground/60">
                    {post.category}
                  </span>
                </motion.div>
              )}

              {/* Título */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-foreground text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
              >
                {post.title}
              </motion.h1>

              {/* Imagen destacada */}
              {post.featuredImage && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="w-full"
                >
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-auto rounded-lg shadow-lg object-cover"
                  />
                </motion.div>
              )}

              {/* Metadata: Tiempo de lectura y fecha */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center gap-6 text-sm text-foreground/60"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min de lectura</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(post.publishedDate || post.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenido del artículo */}
      <article className="pb-16 lg:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            {/* Contenido del artículo */}
            <div className="prose prose-lg max-w-none">
              {Array.isArray(post.content) ? (
                <PortableText
                  value={post.content}
                  components={{
                    block: {
                      normal: ({ children }) => (
                        <p className="mb-6 text-base leading-relaxed text-foreground/80">{children}</p>
                      ),
                      h1: ({ children }) => <h1 className="mt-12 mb-6 first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="mt-12 mb-6 first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="mt-10 mb-4 first:mt-0">{children}</h3>,
                    },
                    list: {
                      bullet: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>,
                      number: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>,
                    },
                    listItem: {
                      bullet: ({ children }) => <li className="text-base text-foreground/80 leading-relaxed">{children}</li>,
                      number: ({ children }) => <li className="text-base text-foreground/80 leading-relaxed">{children}</li>,
                    },
                    marks: {
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      link: ({ value, children }) => (
                        <a className="text-primary hover:underline font-medium underline-offset-2" target="_blank" rel="noopener noreferrer" href={value?.href}>
                          {children}
                        </a>
                      ),
                    },
                    types: {
                      image: ({ value }) => {
                        const imageUrl = value?.asset?.url;
                        if (!imageUrl) return null;
                        return (
                          <img
                            className="rounded-lg shadow-lg my-8 max-w-full mx-auto border border-border"
                            src={imageUrl}
                            alt={value.alt || ''}
                          />
                        );
                      },
                      embed: ({ value }) => (
                        <div className="my-8">
                          <div className="aspect-video w-full">
                            <iframe src={value.url} className="w-full h-full rounded-lg border" allowFullScreen />
                          </div>
                          {value.caption && <p className="mt-2 text-sm text-foreground/60">{value.caption}</p>}
                        </div>
                      ),
                    },
                  }}
                />
              ) : (
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {String(post.content || '')}
                </ReactMarkdown>
              )}
            </div>

            {/* Footer del artículo */}
            <div className="pt-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Ver más artículos
              </Link>
              
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white/60 hover:bg-white/80 border border-border rounded-lg transition-colors shadow-sm"
              >
                Volver arriba
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
