import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { SEO, generateBlogPostStructuredData } from '../components/SEO';
import { Calendar, User, ArrowLeft } from 'lucide-react';
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

      <article className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl mb-6">{post.title}</h1>

            <div className="flex items-center gap-6 text-foreground/60 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(post.publishedDate || post.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
            </div>

            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg mb-8"
              />
            )}

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-foreground/80 mb-8">{post.excerpt}</p>
              
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-4 text-base leading-relaxed text-foreground/80" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-4xl mb-6 mt-8" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-3xl mb-4 mt-6" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-2xl mb-3 mt-5" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                  li: ({ node, ...props }) => <li className="text-base text-foreground/80" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-foreground/70 my-6 bg-primary/5" {...props} />
                  ),
                  code: ({ node, inline, ...props }) => 
                    inline ? (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-primary" {...props} />
                    ) : (
                      <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto my-4" {...props} />
                    ),
                  a: ({ node, ...props }) => (
                    <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  img: ({ node, ...props }) => (
                    <img className="rounded-lg shadow-md my-6 max-w-full mx-auto" {...props} />
                  ),
                  strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                  em: ({ node, ...props }) => <em className="italic" {...props} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            <div className="mt-12 pt-8 border-t border-foreground/10">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Ver más artículos
              </Link>
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}