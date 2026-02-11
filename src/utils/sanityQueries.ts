import { sanityFetch } from './sanity';

export async function fetchContentItems() {
  const query = `*[_type == "curso"]{
    "id": _id,
    type,
    title,
    slug,
    subtitle,
    shortDescription,
    description,
    price,
    duration,
    includes,
    schedule,
    content,
    visible,
    seo,
    showInHome,
    showInHomeWorkshops,
    menuLocations,
    whatsappNumber,
    createdAt,
    updatedAt,
    "heroImage": heroImage.asset->url,
    "titleImage": titleImage.asset->url,
    "image": image.asset->url,
    "images": images[]{
      "url": asset->url,
      alt,
      caption
    }
  }`;
  return sanityFetch<any[]>(query);
}

export async function fetchBlogPosts(publishedOnly = false) {
  const filter = publishedOnly ? ' && published == true' : '';
  const query = `*[_type == "blogPost"${filter}]|order(createdAt desc){
    "id": _id,
    slug,
    title,
    content,
    excerpt,
    featured,
    published,
    createdAt,
    updatedAt,
    author,
    seo,
    "featuredImage": featuredImage.asset->url
  }`;
  return sanityFetch<any[]>(query);
}

export async function fetchMenu() {
  const query = `*[_type == "siteMenu"][0]{items}`;
  return sanityFetch<any>(query);
}

export async function fetchSettings() {
  const query = `*[_type == "siteSettings"][0]{
    siteName,
    siteDescription,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogUrl,
    ogType,
    ogTitle,
    ogDescription,
    contactEmail,
    contactEmail2,
    contactPhone,
    whatsappNumber,
    instagramTitle,
    instagramHandle,
    instagramLink,
    googleAnalyticsId,
    homeCoursesDescription,
    homeWorkshopsDescription,
    paymentMethods,
    redirects,
    "ogImage": ogImage.asset->url,
    "heroImageDesktop": heroImageDesktop.asset->url,
    "heroImageMobile": heroImageMobile.asset->url,
    "heroTextImage1": heroTextImage1.asset->url,
    "heroTextImage2": heroTextImage2.asset->url,
    "blogHeroImage": blogHeroImage.asset->url,
    "blogTitleImage": blogTitleImage.asset->url,
    "clasesHeroTitleImage": clasesHeroTitleImage.asset->url,
    instagramImages[]->{
      date,
      title,
      description,
      link,
      source,
      "image": image.asset->url
    }
  }`;
  return sanityFetch<any>(query);
}

export async function fetchPages() {
  const query = `*[_type == "page"]{
    "id": _id,
    "slug": slug.current,
    title,
    content,
    seo,
    "heroImage": heroImage.asset->url,
    sections[]{
      ...,
      "mainImage": mainImage.asset->url,
      "mainImageUrl": mainImage.asset->url,
      "image": image.asset->url,
      "images": images[]{ "url": asset->url },
      "courses": courses[]->{
        "id": _id,
        type,
        title,
        slug,
        excerpt,
        "image": coalesce(
          images[0].asset->url,
          image.asset->url,
          heroImage.asset->url
        )
      }
    },
    createdAt,
    updatedAt
  }`;
  return sanityFetch<any[]>(query);
}

export async function fetchLandingPage(slug: string) {
  const query = `*[_type == "landingPage" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    visible,
    heroTitle,
    heroSubtitle,
    heroCta,
    heroCtaLink,
    valueTitle,
    valueSubtitle,
    benefitsTitle,
    galleryTitle,
    testimonialsTitle,
    faqTitle,
    finalCtaTitle,
    finalCtaSubtitle,
    finalCtaButton,
    finalCtaLink,
    contactFormTitle,
    contactFormSubtitle,
    showContactForm,
    showContactInfo,
    contactEmail,
    contactPhone,
    contactHours,
    contactAddress,
    benefits,
    valuePoints,
    testimonials,
    faqs,
    seo,
    "heroImage": heroImage.asset->url,
    "galleryImages": galleryImages[]{"url": asset->url}
  }`;
  return sanityFetch<any>(query, { slug });
}
