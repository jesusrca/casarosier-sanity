import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useMemo } from 'react';

export function NotFound() {
  const location = useLocation();
  const { classes, workshops, privates, blogPosts } = useContent();

  // Analizar la URL para sugerir contenido relacionado
  const relatedContent = useMemo(() => {
    const path = location.pathname.toLowerCase();
    const allContent = [...classes, ...workshops, ...privates, ...blogPosts];
    
    // Palabras clave en la URL
    const keywords = path.split('/').filter(segment => segment && segment.length > 2);
    
    // Buscar contenido relacionado basándose en las palabras clave
    const related = allContent
      .filter(item => {
        const itemText = `${item.title} ${item.slug} ${item.subtitle || ''} ${item.shortDescription || ''}`.toLowerCase();
        return keywords.some(keyword => itemText.includes(keyword));
      })
      .slice(0, 3);

    // Si no hay coincidencias específicas, mostrar contenido destacado
    if (related.length === 0) {
      // Priorizar clases y workshops más recientes
      const recent = [...classes, ...workshops]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 3);
      
      return recent;
    }
    
    return related;
  }, [location.pathname, classes, workshops, privates, blogPosts]);

  // Determinar el tipo de contenido que se buscaba
  const suggestedSection = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('clase') || path.includes('class')) return { name: 'Clases', path: '/clases' };
    if (path.includes('workshop') || path.includes('taller')) return { name: 'Workshops', path: '/workshops' };
    if (path.includes('privad') || path.includes('private')) return { name: 'Espacios Privados', path: '/privada/taller-para-grupos' };
    if (path.includes('blog') || path.includes('post')) return { name: 'Blog', path: '/blog' };
    if (path.includes('gift') || path.includes('regalo')) return { name: 'Tarjeta Regalo', path: '/tarjeta-regalo' };
    return { name: 'Clases', path: '/clases' };
  }, [location.pathname]);

  // Función para obtener la ruta correcta según el tipo
  const getItemPath = (item: any) => {
    if (item.type === 'class') return `/clases/${item.slug}`;
    if (item.type === 'workshop') return `/workshops/${item.slug}`;
    if (item.type === 'private') return `/privada/${item.slug}`;
    return `/blog/${item.slug}`; // BlogPost
  };

  // Función para obtener la imagen del item
  const getItemImage = (item: any) => {
    if (item.featuredImage) {
      return typeof item.featuredImage === 'string' ? item.featuredImage : item.featuredImage?.url;
    }
    if (item.images && item.images.length > 0) {
      const firstImage = item.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage?.url;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl lg:text-8xl mb-4 text-primary">404</h1>
          <h2 className="text-2xl lg:text-4xl mb-6">Página no encontrada</h2>
          <p className="text-lg text-foreground/70 mb-8 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Home size={20} />
              Volver al inicio
            </Link>
            <Link
              to={suggestedSection.path}
              className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Ver {suggestedSection.name}
              <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>

        {/* Contenido relacionado o destacado */}
        {relatedContent.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            <h3 className="text-2xl text-center mb-8">
              {location.pathname.split('/').some(s => s) ? 'Quizás te interese' : 'Explora nuestras clases'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedContent.map((item, index) => {
                const imageUrl = getItemImage(item);
                const itemPath = getItemPath(item);
                
                return (
                  <motion.article
                    key={item.id || item.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border group"
                  >
                    <Link to={itemPath} className="block">
                      {imageUrl ? (
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <span className="text-4xl text-primary/20">🎨</span>
                        </div>
                      )}
                      <div className="p-6">
                        <h4 className="text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        {item.shortDescription && (
                          /<\/?[a-z][\s\S]*>/i.test(item.shortDescription) ? (
                            <p
                              className="text-foreground/70 text-sm line-clamp-2 mb-4"
                              dangerouslySetInnerHTML={{ __html: item.shortDescription }}
                            />
                          ) : (
                            <p className="text-foreground/70 text-sm line-clamp-2 mb-4">
                              {item.shortDescription}
                            </p>
                          )
                        )}
                        <span className="inline-flex items-center gap-2 text-primary text-sm hover:gap-3 transition-all">
                          Ver detalles
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
