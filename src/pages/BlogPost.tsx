import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { SEO, generateBlogPostStructuredData } from '../components/SEO';
import { Hero } from '../components/Hero';
import { Calendar, User, ArrowLeft, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { getBlogPostBySlug, loading } = useContent();
  const post = getBlogPostBySlug(slug || '');

  // Si está cargando y no hay post, mostrar skeleton
  if (loading && !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/60">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (!post || !post.published) {
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

  return (
    <div className="min-h-screen bg-background">
      <SEO
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

      {/* Hero similar al resto de la web */}
      <Hero
        backgroundImage={post.featuredImage || "https://images.unsplash.com/photo-1638341840302-a2d9579b821e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTEwOTMwOHww&ixlib=rb-4.1.0&q=80&w=1080"}
        title={post.title}
        subtitle={post.excerpt}
        useTextTitle={true}
        showScrollIndicator={false}
      />

      {/* Contenido del artículo - Minimalista, sobre el fondo */}
      <article className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Volver al blog */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all mb-12 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al blog
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            {/* Metadata del artículo */}
            <div className="flex flex-wrap items-center gap-6 text-foreground/60 pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm">
                  {new Date(post.publishedDate || post.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-sm">Por {post.author}</span>
                </div>
              )}
            </div>

            {/* Contenido del artículo */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-6 text-base leading-relaxed text-foreground/80" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className="mt-12 mb-6 first:mt-0" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="mt-12 mb-6 first:mt-0" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="mt-10 mb-4 first:mt-0" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 mb-6 space-y-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-base text-foreground/80 leading-relaxed" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote 
                      className="border-l-4 border-primary pl-6 py-4 my-8 italic text-foreground/70 bg-white/50 rounded-r-lg" 
                      {...props} 
                    />
                  ),
                  code: ({ node, inline, ...props }) => 
                    inline ? (
                      <code className="bg-white/80 px-2 py-1 rounded text-sm font-mono text-primary border border-border" {...props} />
                    ) : (
                      <code className="block bg-white/80 p-4 rounded-lg text-sm font-mono overflow-x-auto my-6 border border-border shadow-sm" {...props} />
                    ),
                  a: ({ node, ...props }) => (
                    <a className="text-primary hover:underline font-medium underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  img: ({ node, ...props }) => (
                    <img className="rounded-lg shadow-lg my-8 max-w-full mx-auto border border-border" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-foreground" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic" {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="my-12 border-border" {...props} />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
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