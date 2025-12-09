import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  structuredData?: object;
}

export function SEO({
  title = 'Casa Rosier - Taller de Cerámica en Barcelona',
  description = 'Descubre la cerámica en Casa Rosier. Clases, workshops y espacios para eventos en Barcelona.',
  keywords = 'cerámica, Barcelona, taller, clases, workshops, torno, pottery',
  image = '',
  url = window.location.href,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  structuredData,
}: SEOProps) {
  const siteName = 'Casa Rosier';
  const fullTitle = title.includes('Casa Rosier') ? title : `${title} | Casa Rosier`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Spanish" />
      <meta name="author" content={author || siteName} />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Helper to generate structured data for classes/workshops
export function generateCourseStructuredData(course: {
  name: string;
  description: string;
  provider: string;
  price: number;
  currency?: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": course.provider,
      "sameAs": window.location.origin
    },
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": course.currency || "EUR",
      "url": course.url,
      "availability": "https://schema.org/InStock"
    },
    ...(course.image && { "image": course.image })
  };
}

// Helper to generate structured data for blog posts
export function generateBlogPostStructuredData(post: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": post.publishedDate,
    "dateModified": post.modifiedDate || post.publishedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": post.url
    },
    ...(post.image && {
      "image": {
        "@type": "ImageObject",
        "url": post.image
      }
    })
  };
}

// Helper to generate structured data for organization
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Casa Rosier",
    "description": "Taller de cerámica en Barcelona",
    "url": window.location.origin,
    "telephone": "+34633788860",
    "email": "info@casarosierceramica.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Barcelona",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "41.3851",
      "longitude": "2.1734"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "10:00",
        "closes": "21:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "14:00"
      }
    ]
  };
}
