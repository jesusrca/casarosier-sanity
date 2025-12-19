import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { Hero } from '../components/Hero';
import { SEO } from '../components/SEO';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Slider from 'react-slick';

// Custom Arrow Components
function NextArrow({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-foreground rounded-full p-3 shadow-lg transition-all hover:scale-110"
    >
      <ChevronRight className="w-6 h-6" />
    </button>
  );
}

function PrevArrow({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-foreground rounded-full p-3 shadow-lg transition-all hover:scale-110"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
}

export function Blog() {
  const { blogPosts, loading, settings } = useContent();

  // Obtener la imagen del hero desde settings (ya cargado en ContentContext)
  const blogHeroImage = settings?.blogHeroImage 
    ? (typeof settings.blogHeroImage === 'string' 
        ? settings.blogHeroImage 
        : settings.blogHeroImage?.url)
    : 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920';

  // Obtener la imagen del título del blog si existe
  const blogTitleImage = settings?.blogTitleImage 
    ? (typeof settings.blogTitleImage === 'string' 
        ? settings.blogTitleImage 
        : settings.blogTitleImage?.url)
    : null;

  // Separar posts destacados y normales
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  // Ordenar cada grupo por fecha más reciente
  const sortedFeaturedPosts = [...featuredPosts].sort((a, b) => {
    const dateA = new Date(a.publishedDate || a.createdAt).getTime();
    const dateB = new Date(b.publishedDate || b.createdAt).getTime();
    return dateB - dateA;
  });

  const sortedRegularPosts = [...regularPosts].sort((a, b) => {
    const dateA = new Date(a.publishedDate || a.createdAt).getTime();
    const dateB = new Date(b.publishedDate || b.createdAt).getTime();
    return dateB - dateA;
  });

  // Configuración del carrusel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots blog-carousel-dots",
    customPaging: () => (
      <div className="w-3 h-3 rounded-full bg-foreground/20 hover:bg-foreground/40 transition-all" />
    ),
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Blog - Casa Rosier"
        description="Artículos, tutoriales y noticias sobre cerámica, técnicas y el mundo de la arcilla"
        keywords="blog cerámica, tutoriales torno, técnicas cerámica, esmaltes, Barcelona"
      />

      {/* No mostrar el Hero hasta que la imagen esté cargada */}
      {!loading && blogHeroImage && (
        <Hero
          backgroundImage={blogHeroImage}
          title="Blog"
          subtitle="Técnicas, historias y creaciones"
          useTextTitle={!blogTitleImage} // Si no hay imagen de título, usar texto
          titleImage={blogTitleImage || undefined} // Pasar la imagen del título si existe
          reducedHeight={true} // Reducir la altura del hero del blog un 30%
        />
      )}

      {/* Blog Posts Section */}
      <section className="py-16 lg:py-24 bg-background">
        {loading ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="aspect-[4/3] lg:aspect-square bg-gray-200"></div>
                    <div className="p-8 lg:p-12 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-foreground/60">No hay artículos publicados todavía</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Posts Carousel - Full Width */}
            {sortedFeaturedPosts.length > 0 && (
              <div className="mb-16 lg:mb-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                  <h2 className="text-center">DESTACADOS</h2>
                </div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="relative">
                    <Slider {...sliderSettings}>
                      {sortedFeaturedPosts.map((post) => (
                        <div key={post.slug}>
                          <Link to={`/blog/${post.slug}`} className="block group">
                            <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                {/* Image Left */}
                                <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden">
                                  {post.featuredImage ? (
                                    <img
                                      src={post.featuredImage}
                                      alt={post.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                      <span className="text-9xl text-primary/30">📝</span>
                                    </div>
                                  )}
                                </div>

                                {/* Content Right */}
                                <div className="p-8 lg:p-12 flex flex-col justify-center">
                                  {post.category && (
                                    <span className="inline-block text-xs uppercase tracking-wider text-[#4A90E2] font-medium mb-4 w-fit bg-[#4A90E2]/10 px-3 py-1 rounded">
                                      {post.category}
                                    </span>
                                  )}
                                  <h2 className="text-2xl lg:text-4xl mb-4 group-hover:text-primary transition-colors duration-300 text-[30px]">
                                    {post.title}
                                  </h2>
                                  {post.excerpt && (
                                    <p className="text-foreground/70 lg:text-lg leading-relaxed mb-6 line-clamp-3 text-[16px]">
                                      {post.excerpt}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm text-foreground/60">
                                    {post.author && (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                            {post.author.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="font-medium">{post.author}</span>
                                        </div>
                                        <span className="text-foreground/30">•</span>
                                      </>
                                    )}
                                    <span>
                                      {new Date(post.publishedDate || post.createdAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </Slider>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Posts - Narrower Width */}
            {sortedRegularPosts.length > 0 && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h3 className="text-center mb-12">MÁS ARTÍCULOS</h3>
                <div className="space-y-8">
                  {sortedRegularPosts.map((post, index) => (
                    <motion.article
                      key={post.slug}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_25px_rgba(0,0,0,0.1)] transition-all duration-300"
                    >
                      <Link to={`/blog/${post.slug}`} className="block">
                        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6">
                          {/* Image */}
                          <div className="relative aspect-[16/10] sm:aspect-square overflow-hidden group">
                            {post.featuredImage ? (
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <span className="text-4xl text-primary/30">📝</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-6 sm:py-4 sm:pr-6 sm:pl-0 flex flex-col justify-center">
                            {post.category && (
                              <span className="inline-block text-xs uppercase tracking-wider text-[#4A90E2] font-medium mb-2 w-fit">
                                {post.category}
                              </span>
                            )}
                            
                            <h3 className="text-xl lg:text-2xl mb-3 group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-foreground/70 text-sm leading-relaxed mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-xs text-foreground/60">
                              {post.author && (
                                <>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                      {post.author.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{post.author}</span>
                                  </div>
                                  <span className="text-foreground/30">•</span>
                                </>
                              )}
                              <span>
                                {new Date(post.publishedDate || post.createdAt).toLocaleDateString('es-ES', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}