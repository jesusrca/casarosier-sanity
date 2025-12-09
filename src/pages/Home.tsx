import image_22346adf60f3b116e6667b47c39143747df28d93 from 'figma:asset/22346adf60f3b116e6667b47c39143747df28d93.png';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { HeroHome } from '../components/HeroHome';
import { CourseCard } from '../components/CourseCard';
import { ClickableBanner } from '../components/ClickableBanner';
import { pagesAPI } from '../utils/api';
import logoImage from "figma:asset/28612bd890b3dcd85d8f93665d63bdc17b7bfea3.png";

export function Home() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      const response = await pagesAPI.getPage('home');
      if (response.page) {
        setPageData(response.page);
      }
    } catch (error) {
      // If page doesn't exist yet, just use default content
      console.log('Using default home content');
    } finally {
      setLoading(false);
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

  // Default images if not loaded
  const defaultImages = [
    'https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1668840306122-526500331070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pYyUyMGJvd2wlMjBjbGF5fGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1595351298005-4d29bb980ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljc3xlbnwxfHx8fDE3NjUwODY1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1673436765901-6327d8030e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
  ];

  const aboutImages = aboutSection?.images || defaultImages;
  const aboutContent = aboutSection?.content || 'Ya sea en clases mensuales o en talleres intensivos de fin de semana, te acompañaremos para que descubras todas las posibilidades del barro.\\n\\nTambién puedes crear un evento privado totalmente personalizado.';
  const aboutMainImage = aboutSection?.mainImage || defaultImages[0];
  
  const defaultCourses = [
    {
      title: 'Clases Regulares',
      subtitle: 'Modelado',
      image: 'https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/clases'
    },
    {
      title: 'Formación de Esmaltes',
      subtitle: 'Octave via zoom',
      image: 'https://images.unsplash.com/photo-1668840306122-526500331070?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwY2VyYW1pYyUyMGJvd2wlMjBjbGF5fGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/workshops'
    },
    {
      title: 'Laboratorio Cerámico',
      subtitle: 'Workshop Esmaltes',
      image: 'https://images.unsplash.com/photo-1673436765901-6327d8030e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTE1MDI4OHww&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/workshops'
    },
    {
      title: 'Iniciación al Torno',
      subtitle: 'Química cerámica',
      image: 'https://images.unsplash.com/photo-1595351298005-4d29bb980ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljc3xlbnwxfHx8fDE3NjUwODY1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      link: '/clases'
    }
  ];

  const courses = coursesSection?.courses || defaultCourses;
  const coursesTitle = coursesSection?.title || 'Cursos y workshops';
  const coursesTitleLine1 = coursesSection?.titleLine1 || 'CURSOS Y';
  const coursesTitleLine2 = coursesSection?.titleLine2 || 'WORKSHOPS';

  // Get second courses section data - no defaults
  const courses2 = courses2Section?.courses;
  const courses2TitleLine1 = courses2Section?.titleLine1;
  const courses2TitleLine2 = courses2Section?.titleLine2;

  // Split content by line breaks
  const contentParagraphs = aboutContent.split('\\n').filter((p: string) => p.trim());

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroHome />

      {/* About Section */}
      <section id="about-section" className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Single Large Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={aboutMainImage}
                alt="Casa Rosier Cerámica"
                className="w-full h-[500px] lg:h-[600px] object-cover rounded-lg shadow-lg"
              />
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                {contentParagraphs.map((paragraph: string, index: number) => (
                  <p key={index} className="text-lg leading-relaxed text-[#6B6B6B] text-left font-serif font-light">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="flex justify-center pt-4">
                <img src={image_22346adf60f3b116e6667b47c39143747df28d93} alt="Casa Rosier" className="h-16 w-auto opacity-80" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses Section - Cursos y workshops */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {courses.map((course: any, index: number) => (
              <CourseCard key={index} {...course} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section 2 - Más opciones */}
      {courses2 && courses2.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {courses2.map((course: any, index: number) => (
                <CourseCard key={index} {...course} index={index} />
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