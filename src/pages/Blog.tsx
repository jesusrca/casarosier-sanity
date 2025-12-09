import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { Hero } from '../components/Hero';
import { SEO } from '../components/SEO';
import { Calendar, User, ArrowRight } from 'lucide-react';

export function Blog() {
  const { blogPosts, loading } = useContent();

  return (
    <div className="min-h-screen">
      <SEO
        title="Blog - Casa Rosier"
        description="Artículos, tutoriales y noticias sobre cerámica, técnicas y el mundo de la arcilla"
        keywords="blog cerámica, tutoriales torno, técnicas cerámica, esmaltes, Barcelona"
      />

      <Hero
        backgroundImage="https://images.unsplash.com/photo-1638341840302-a2d9579b821e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTEwOTMwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        title="Blog Cerámica"
        subtitle="creativa en Barcelona"
      />

      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No hay artículos publicados todavía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {post.featuredImage && (
                    <Link to={`/blog/${post.slug}`}>
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-foreground/60 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(post.publishedDate || post.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>

                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-xl mb-3 hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-foreground/70 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all"
                    >
                      Leer más
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