import image_22346adf60f3b116e6667b47c39143747df28d93 from 'figma:asset/22346adf60f3b116e6667b47c39143747df28d93.png';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { HeroHome } from '../components/HeroHome';
import { CourseCard } from '../components/CourseCard';
import { ClickableBanner } from '../components/ClickableBanner';
import { useContent } from '../contexts/ContentContext';
import logoImage from "figma:asset/28612bd890b3dcd85d8f93665d63bdc17b7bfea3.png";
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SEOHead } from '../components/SEOHead';

export function Home() {
  const { classes, workshops, settings, pages } = useContent(); // Usar el contexto de contenido
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [featuredWorkshops, setFeaturedWorkshops] = useState<any[]>([]);

  useEffect(() => {
    const homePage = pages.find((page: any) => page.slug === 'home');
    if (homePage) {
      setPageData(homePage);
    }
    setLoading(false);
  }, [pages]);

  // Recargar cursos destacados cuando cambien las clases/workshops del contexto
  useEffect(() => {
    loadFeaturedCourses();
    loadFeaturedWorkshops();
  }, [classes, workshops]);

  // Home page data is loaded from Sanity via ContentContext

  const loadFeaturedCourses = async () => {
    try {
      // Destacados de Home para bloque 1 (no workshops)
      const allItems = [...classes, ...workshops];
      const featured = allItems.filter(
        (item: any) =>
          item.featuredInHome === true &&
          item.visible !== false &&
          item.type !== 'workshop'
      );
      
      // Convertir a formato de CourseCard
      const formattedCourses = featured.map((item: any) => {
        // Determinar el link según el tipo
        const linkPrefix = item.type === 'class' ? '/clases/' : 
                          item.type === 'workshop' ? '/workshops/' : 
                          '/privada/';
        
        // Obtener la primera imagen (puede ser string u objeto)
        let imageUrl = '';
        if (item.images && item.images.length > 0) {
          const firstImage = item.images[0];
          imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url || '';
        }
        
        return {
          title: item.title || '',
          subtitle: item.excerpt || '', // Usar el nuevo campo excerpt
          image: imageUrl,
          link: linkPrefix + item.slug
        };
      });
      
      console.log('🏠 Featured courses loaded:', formattedCourses);
      setFeaturedCourses(formattedCourses);
    } catch (error) {
      console.error('Error loading featured courses:', error);
    }
  };

  const loadFeaturedWorkshops = async () => {
    try {
      // Destacados de Home para bloque 2 (solo workshops)
      const allItems = [...classes, ...workshops];
      const featured = allItems.filter(
        (item: any) =>
          item.featuredInHome === true &&
          item.visible !== false &&
          item.type === 'workshop'
      );
      
      // Convertir a formato de CourseCard
      const formattedWorkshops = featured.map((item: any) => {
        // Determinar el link según el tipo
        const linkPrefix = item.type === 'class' ? '/clases/' : 
                          item.type === 'workshop' ? '/workshops/' : 
                          '/privada/';
        
        // Obtener la primera imagen (puede ser string u objeto)
        let imageUrl = '';
        if (item.images && item.images.length > 0) {
          const firstImage = item.images[0];
          imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url || '';
        }
        
        return {
          title: item.title || '',
          subtitle: item.excerpt || '', // Usar el nuevo campo excerpt
          image: imageUrl,
          link: linkPrefix + item.slug
        };
      });
      
      console.log('🎨 Featured workshops loaded:', formattedWorkshops);
      setFeaturedWorkshops(formattedWorkshops);
    } catch (error) {
      console.error('Error loading featured workshops:', error);
    }
  };

  // Get sections
  const aboutSection = pageData?.sections?.find((s: any) => s.type === 'about');
  const coursesSection = pageData?.sections?.find((s: any) => s.type === 'courses');
  const courses2Section = pageData?.sections?.find((s: any) => s.type === 'courses2');
  const bannerSection = pageData?.sections?.find((s: any) => s.type === 'banner');

  // Debug log to see what data we're receiving
  console.log('🔍 Home Page Data:', {
    pageData,
    sections: pageData?.sections,
    courses2Section,
    courses2: courses2Section?.courses
  });

  const aboutImages = aboutSection?.images || [];
  const aboutContent = aboutSection?.content || 'Ya sea en clases mensuales o en talleres intensivos de fin de semana, te acompañaremos para que descubras todas las posibilidades del barro.\\n\\nTambién puedes crear un evento privado totalmente personalizado.';
  // Eliminar fallback - solo usar imagen del administrador o placeholder
  const aboutMainImage = aboutSection?.mainImageUrl || aboutSection?.mainImage || '';
  
  // Debug: ver qué imagen tenemos
  console.log('🖼️ About Main Image:', aboutMainImage);
  console.log('📦 About Section:', aboutSection);
  
  const defaultCourses = [];

  const courses = coursesSection?.courses || defaultCourses;
  const coursesTitle = coursesSection?.title || 'Cursos y workshops';
  const coursesTitleLine1 = coursesSection?.titleLine1 || 'CURSOS Y';
  const coursesTitleLine2 = coursesSection?.titleLine2 || 'WORKSHOPS';
  const coursesDescription =
    coursesSection?.description || settings.homeCoursesDescription || '';

  // Get second courses section data - no defaults
  const courses2 = courses2Section?.courses;
  const courses2TitleLine1 = courses2Section?.titleLine1;
  const courses2TitleLine2 = courses2Section?.titleLine2;
  const courses2Description =
    courses2Section?.description || settings.homeWorkshopsDescription || '';

  const toCourseCard = (item: any) => {
    if (!item) return null;
    if (item.link && item.image && item.title) return item;
    const linkPrefix = item.type === 'class' ? '/clases/' : 
                      item.type === 'workshop' ? '/workshops/' : 
                      item.type === 'private' ? '/privada/' :
                      '/tarjeta-regalo/';
    return {
      title: item.title || '',
      subtitle: item.excerpt || '',
      image: item.image || '',
      link: linkPrefix + item.slug,
    };
  };

  const coursesCards = (courses?.length ? courses : featuredCourses).map(toCourseCard).filter(Boolean);
  const courses2Cards = (courses2?.length ? courses2 : featuredWorkshops).map(toCourseCard).filter(Boolean);

  // Split content by line breaks
  const contentParagraphs = aboutContent.split('\\n').filter((p: string) => p.trim());

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <SEOHead
        title={settings.seoTitle || 'Casa Rosier - Taller de Cerámica en Barcelona'}
        description={settings.seoDescription}
        keywords={settings.seoKeywords}
        image={settings.ogImage}
        url={settings.ogUrl}
        type={settings.ogType || 'website'}
      />

      {/* Hero Section */}
      <HeroHome />

      {/* About Section */}
      <section id="about-section" className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
            {/* Single Large Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {aboutMainImage && (
                <img
                  src={aboutMainImage}
                  alt="Casa Rosier Cerámica"
                  className="w-full h-[343px] lg:h-[411px] object-cover lg:object-contain lg:object-right"
                />
              )}
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 max-w-2xl"
            >
              <div className="space-y-4 text-left">
                {contentParagraphs.map((paragraph: string, index: number) => (
                  <p key={index} className="text-lg lg:text-xl leading-relaxed text-[#7b7269] text-left font-serif font-light max-w-xs">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses Section - Cursos y workshops */}
      {coursesCards.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex flex-col items-center gap-2">
                <h2>
                  {coursesTitleLine1}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-8 lg:w-12 h-[1px] bg-[#7B7269]/40"></div>
                  <h2>
                    {coursesTitleLine2}
                  </h2>
                </div>
                {coursesDescription && (
                  <p className="mt-4 text-lg text-[#7b7269] max-w-2xl">
                    {coursesDescription}
                  </p>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {coursesCards.map((course: any, index: number) => (
                <CourseCard key={index} {...course} index={index} hideSubtitle={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses Section 2 - Workshops */}
      {courses2Cards.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex flex-col items-center gap-2">
                <h2>
                  {courses2TitleLine1}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-8 lg:w-12 h-[1px] bg-[#7B7269]/40"></div>
                  <h2>
                    {courses2TitleLine2}
                  </h2>
                </div>
                {courses2Description && (
                  <p className="mt-4 text-lg text-[#7b7269] max-w-2xl">
                    {courses2Description}
                  </p>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {courses2Cards.map((course: any, index: number) => (
                <CourseCard key={index} {...course} index={index} hideSubtitle={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clickable Banner */}
      <ClickableBanner
        image={bannerSection?.image}
        title={bannerSection?.title}
        description={bannerSection?.description}
        link={bannerSection?.link}
      />
    </div>
  );
}
