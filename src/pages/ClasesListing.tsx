import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { Hero } from '../components/Hero';
import { SEO } from '../components/SEO';
import { Calendar, Clock, ArrowRight, SortAsc, SortDesc, Users } from 'lucide-react';

type SortOrder = 'newest' | 'oldest';

export function ClasesListing() {
  const { classes, loading } = useContent();
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Ordenar clases según el criterio seleccionado
  const sortedClasses = [...classes].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Clases de Cerámica - Casa Rosier"
        description="Descubre nuestras clases de cerámica en Barcelona. Aprende técnicas de modelado, torno y más."
        keywords="clases cerámica, taller cerámica Barcelona, curso cerámica, modelado, torno"
      />

      <Hero
        backgroundImage="https://images.unsplash.com/photo-1660958639203-cbc9bb56955b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwdmFzZSUyMG1pbmltYWx8ZW58MXx8fHwxNzY1MTQ4MzMxfDA&ixlib=rb-4.1.0&q=80&w=1080"
        title="Clases"
        subtitle="Aprende cerámica con nosotros"
        useTextTitle={true}
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
          ) : classes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No hay clases disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedClasses.map((clase, index) => (
                <motion.article
                  key={clase.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-border group"
                >
                  <Link to={`/clases/${clase.slug}`} className="block">
                    {clase.featuredImage ? (
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={clase.featuredImage}
                          alt={clase.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <span className="text-4xl text-primary/20">🎨</span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-6 space-y-4">
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60">
                      {clase.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{clase.duration}</span>
                        </div>
                      )}
                      {clase.level && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span className="capitalize">{clase.level}</span>
                        </div>
                      )}
                    </div>

                    <Link to={`/clases/${clase.slug}`}>
                      <h3 className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {clase.title}
                      </h3>
                    </Link>

                    {clase.subtitle && (
                      <p className="text-sm text-primary/80 line-clamp-1">
                        {clase.subtitle}
                      </p>
                    )}

                    {clase.shortDescription && (
                      <p className="text-foreground/70 text-sm leading-relaxed line-clamp-3">
                        {clase.shortDescription}
                      </p>
                    )}

                    {/* Precio */}
                    {clase.price && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-lg text-primary">
                          {clase.price}€
                          {clase.priceDetails && (
                            <span className="text-sm text-foreground/60 ml-2">
                              {clase.priceDetails}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    <Link
                      to={`/clases/${clase.slug}`}
                      className="inline-flex items-center gap-2 text-primary text-sm hover:gap-3 transition-all pt-2"
                    >
                      Ver detalles
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
