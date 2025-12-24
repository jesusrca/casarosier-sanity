import { Helmet } from 'react-helmet-async';
import { useContent } from '../contexts/ContentContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  structuredData?: object;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type,
  publishedTime,
  modifiedTime,
  author,
  structuredData,
  article,
}: SEOHeadProps) {
  const { settings } = useContent();

  // Usar valores proporcionados o caer en los valores globales
  const finalTitle = title || settings.seoTitle || settings.siteName || 'Casa Rosier';
  const finalDescription = description || settings.seoDescription || settings.siteDescription || '';
  const finalKeywords = keywords || settings.seoKeywords || '';
  const finalImage = image || settings.ogImage || '';
  
  // Open Graph - Prioridad corregida:
  // 1. Valores específicos de OG si existen
  // 2. Valores de la página si existen
  // 3. Valores por defecto
  const finalOgUrl = url || settings.ogUrl || window.location.href;
  const finalOgType = type || settings.ogType || 'website';
  
  // Para OG title y description: usar primero valores específicos de la página, 
  // luego OG personalizados, luego SEO generales
  const finalOgTitle = title || settings.ogTitle || settings.seoTitle || settings.siteName || 'Casa Rosier';
  const finalOgDescription = description || settings.ogDescription || settings.seoDescription || settings.siteDescription || '';

  // Construir URL completa de imagen si es relativa
  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Si la imagen es relativa, construir URL completa
    const baseUrl = settings.ogUrl || window.location.origin;
    return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const fullImageUrl = getFullImageUrl(finalImage);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      {finalDescription && <meta name="description" content={finalDescription} />}
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={finalOgType} />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:title" content={finalOgTitle} />
      {finalOgDescription && <meta property="og:description" content={finalOgDescription} />}
      {fullImageUrl && <meta property="og:image" content={fullImageUrl} />}
      {fullImageUrl && <meta property="og:image:secure_url" content={fullImageUrl} />}
      <meta property="og:site_name" content={settings.siteName || 'Casa Rosier'} />
      <meta property="og:locale" content="es_ES" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalOgUrl} />
      <meta name="twitter:title" content={finalOgTitle} />
      {finalOgDescription && <meta name="twitter:description" content={finalOgDescription} />}
      {fullImageUrl && <meta name="twitter:image" content={fullImageUrl} />}

      {/* Article specific meta tags */}
      {finalOgType === 'article' && (
        <>
          {(publishedTime || article?.publishedTime) && (
            <meta property="article:published_time" content={publishedTime || article?.publishedTime} />
          )}
          {(modifiedTime || article?.modifiedTime) && (
            <meta property="article:modified_time" content={modifiedTime || article?.modifiedTime} />
          )}
          {(author || article?.author) && (
            <meta property="article:author" content={author || article?.author} />
          )}
          {article?.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article?.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={finalOgUrl} />

      {/* Structured Data (Schema.org) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}