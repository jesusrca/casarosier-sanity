import { sanityFetch } from './sanity';

export async function fetchContentItems() {
  const query = `*[_type in ["classContent", "workshopContent", "privateReservationContent", "giftCardContent"]]{
    "id": _id,
    "type": coalesce(
      type,
      select(
        _type == "classContent" => "class",
        _type == "workshopContent" => "workshop",
        _type == "privateReservationContent" => "private",
        _type == "giftCardContent" => "gift-card",
        "class"
      )
    ),
    title,
    "slug": slug.current,
    subtitle,
    shortDescription,
    description,
    price,
    duration,
    includes,
    schedule,
    content,
    visible,
    showPaymentMethods,
    seo,
    featuredInHome,
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

export async function fetchBlogPosts() {
  const query = `*[_type == "blogPost"]|order(createdAt desc){
    "id": _id,
    "slug": slug.current,
    title,
    "content": content[]{
      ...,
      asset->{
        _id,
        url
      }
    },
    excerpt,
    featured,
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
    "instagramImages": *[_type == "instagramPost" && hidden != true] | order(order asc, date desc)[0...12]{
      order,
      date,
      title,
      description,
      link,
      source,
      "url": image.asset->url
    }
  }`;
  return sanityFetch<any>(query);
}

export async function fetchPages() {
  const query = `*[_type == "page"]{
    "id": _id,
    "slug": slug.current,
    title,
    seo,
    "heroImageDesktop": heroImageDesktop.asset->url,
    "heroImageMobile": heroImageMobile.asset->url,
    "heroTextImage1": heroTextImage1.asset->url,
    "heroTextImage2": heroTextImage2.asset->url,
    sections[]{
      ...,
      "mainImage": mainImage.asset->url,
      "mainImageUrl": mainImage.asset->url,
      "image": image.asset->url,
      "titleImage": titleImage.asset->url,
      "images": images[]{ "url": asset->url },
      "members": members[]{
        name,
        role,
        bio,
        "photo": photo.asset->url
      },
      description,
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
  }`;
  return sanityFetch<any[]>(query);
}

export async function fetchHomePage() {
  const query = `*[_type == "page" && slug.current == "home"][0]{
    "id": _id,
    "slug": slug.current,
    title,
    "heroImageDesktop": heroImageDesktop.asset->url,
    "heroImageMobile": heroImageMobile.asset->url,
    "heroTextImage1": heroTextImage1.asset->url,
    "heroTextImage2": heroTextImage2.asset->url
  }`;
  return sanityFetch<any>(query);
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
