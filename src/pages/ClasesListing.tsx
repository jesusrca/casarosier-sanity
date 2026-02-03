import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { Hero } from '../components/Hero';
import { SEO } from '../components/SEO';
import { Calendar, Clock, ArrowRight, SortAsc, SortDesc, Users } from 'lucide-react';

type SortOrder = 'newest' | 'oldest';

export function ClasesListing() {
  const { classes, workshops, privates, loading, settings } = useContent();
  const [sortOrder, setSortOrder] = useState<SortOrder>('oldest');

  // Combinar solo clases y workshops (excluir privates)
  const allItems = [...classes, ...workshops];

  // Debug: Ver qué datos están llegando
  console.log('📊 ClasesListing - Datos cargados:', {
    classes: classes.length,
    workshops: workshops.length,
    privates: privates.length,
    allItems: allItems.length,
    sampleItem: allItems[0]
  });

  // Ordenar según el criterio seleccionado
  const sortedItems = [...allItems].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Extraer la imagen del título desde settings
  const titleImageUrl = typeof settings.clasesHeroTitleImage === 'string' 
    ? settings.clasesHeroTitleImage 
    : settings.clasesHeroTitleImage?.url || '';

  // Función para obtener el label del tipo
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'class':
        return 'Clase';
      case 'workshop':
        return 'Workshop';
      case 'private':
        return 'Clase Privada';
      default:
        return 'Clase';
    }
  };

  // Función para obtener el color del tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-primary text-white';
      case 'workshop':
        return 'bg-secondary text-white';
      case 'private':
        return 'bg-foreground text-background';
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Clases de Cerámica - Casa Rosier"
        description="Descubre nuestras clases de cerámica en Barcelona. Aprende técnicas de modelado, torno y más."
        keywords="clases cerámica, taller cerámica Barcelona, curso cerámica, modelado, torno"
      />

      <Hero
        title="Clases"
        subtitle="Aprende cerámica con nosotros"
        useTextTitle={!titleImageUrl}
        titleImage={titleImageUrl}
      />

      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controles de ordenamiento */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-left">Nuestras Clases</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/60">Ordenar:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                {sortOrder === 'newest' ? (
                  <>
                    <SortDesc className="w-4 h-4" />
                    Más recientes
                  </>
                ) : (
                  <>
                    <SortAsc className="w-4 h-4" />
                    Más antiguos
                  </>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No hay clases disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedItems.map((item, index) => {
                // Obtener la imagen: featuredImage o primera del array de images
                // Manejar tanto strings como objetos con propiedad 'url'
                let imageUrl = null;
                
                if (item.featuredImage) {
                  imageUrl = typeof item.featuredImage === 'string' 
                    ? item.featuredImage 
                    : item.featuredImage?.url;
                } else if (item.images && item.images.length > 0) {
                  const firstImage = item.images[0];
                  imageUrl = typeof firstImage === 'string' 
                    ? firstImage 
                    : firstImage?.url;
                }
                
                console.log('🖼️ Imagen para', item.title, ':', {
                  featuredImage: item.featuredImage,
                  images: item.images,
                  imageUrl
                });
                
                // Crear una key única combinando tipo, id y slug
                const uniqueKey = item.id || `${item.type}-${item.slug || index}`;
                
                // Determinar la ruta correcta según el tipo
                const itemPath = item.type === 'class' 
                  ? `/clases/${item.slug}`
                  : item.type === 'workshop'
                  ? `/workshops/${item.slug}`
                  : `/privada/${item.slug}`;
                
                return (
                  <motion.article
                    key={uniqueKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border group"
                  >
                    <Link to={itemPath} className="block relative">
                      {imageUrl ? (
                        <div className="relative aspect-[4/3.5] overflow-hidden bg-muted">
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Etiqueta de tipo */}
                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[4/3.5] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                          <span className="text-4xl text-primary/20">🎨</span>
                          {/* Etiqueta de tipo */}
                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                        </div>
                      )}
                    </Link>
                    
                    <div className="p-6 space-y-4">
                      <Link to={itemPath}>
                        <h3 className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>

                      <Link
                        to={itemPath}
                        className="inline-flex items-center gap-2 text-primary text-sm hover:gap-3 transition-all pt-2"
                      >
                        Ver detalles
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}