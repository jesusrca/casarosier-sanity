import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { SEO } from '../components/SEO';
import { NotFound } from './NotFound';
import { AccordionSection } from '../components/AccordionSection';
import { Hero } from '../components/Hero';
import { PageSkeleton } from '../components/PageSkeleton';
import { Check } from 'lucide-react';
import { settingsAPI } from '../utils/api';

interface ContentItem {
  id: string;
  type: 'class' | 'workshop' | 'private';
  title: string;
  slug: string;
  subtitle?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  duration?: string;
  includes?: string[];
  images?: Array<string | { url: string; alt?: string; caption?: string }>;
  schedule?: {
    description?: string;
    slots?: Array<{
      day: string;
      times: Array<{
        time: string;
        availablePlaces: number;
      }>;
    }>;
  };
  content?: {
    whatYouWillLearn?: string;
    whoCanParticipate?: string;
    paymentMethods?: string;
    additionalInfo?: string;
    contactPhone?: string;
    contactEmail?: string;
    modules?: Array<{
      title: string;
      description: string;
    }>;
    modulesAccordionTitle?: string;
  };
  visible: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  heroImage?: string | { url: string; alt?: string; description?: string };
  titleImage?: string | { url: string; alt?: string; description?: string };
}

export function DynamicContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getClassBySlug, getWorkshopBySlug, getPrivateBySlug, loading: contentLoading } = useContent();
  const [images, setImages] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  // Load site settings for payment methods
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsAPI.getSettings();
        setSiteSettings(response.settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Detectar tipo basado en la URL actual
  const currentPath = window.location.pathname;
  const type = currentPath.startsWith('/clases') 
    ? 'class' 
    : currentPath.startsWith('/privada')
    ? 'private'
    : 'workshop';

  // Buscar el contenido en el contexto (datos ya cargados)
  const content = type === 'class' 
    ? getClassBySlug(slug || '')
    : type === 'private'
    ? getPrivateBySlug(slug || '')
    : getWorkshopBySlug(slug || '');

  // Debug: Ver qué datos tiene content.content
  useEffect(() => {
    if (content) {
      console.log('🔍 DEBUG - Datos del contenido:', {
        hasContent: !!content.content,
        contactPhone: content.content?.contactPhone,
        contactEmail: content.content?.contactEmail,
        additionalInfo: content.content?.additionalInfo,
        paymentMethods: content.content?.paymentMethods,
        includes: content.includes,
        includesLength: content.includes?.length,
        includesType: typeof content.includes,
        includesIsArray: Array.isArray(content.includes),
        includesRaw: JSON.stringify(content.includes),
        fullContent: content
      });
      
      // Log detallado de cada elemento del array includes
      if (content.includes) {
        console.log('🔍 DEBUG - Elementos de includes:');
        content.includes.forEach((item, index) => {
          console.log(`  [${index}]:`, {
            value: item,
            type: typeof item,
            length: item?.length,
            isEmpty: item === '' || item?.trim() === ''
          });
        });
      }
    }
  }, [content]);

  // Actualizar imágenes cuando cambie el contenido
  useEffect(() => {
    if (content?.images) {
      setImages(content.images.map(img => typeof img === 'string' ? img : img.url));
    }
  }, [content]);

  // Si está cargando y no hay contenido aún, mostrar skeleton
  if (contentLoading && !content) {
    return <PageSkeleton />;
  }

  // Si no está cargando y no hay contenido, mostrar 404
  if (!contentLoading && !content) {
    return <NotFound />;
  }

  const handleImageClick = (thumbnailIndex: number) => {
    if (images.length < 2) return;
    const newImages = [...images];
    const temp = newImages[0];
    newImages[0] = newImages[thumbnailIndex + 1];
    newImages[thumbnailIndex + 1] = temp;
    setImages(newImages);
  };

  const handleInscribirse = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConsultar = () => {
    window.open('https://wa.me/34633788860', '_blank');
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title={content.seo?.metaTitle || content.title}
        description={content.seo?.metaDescription || content.description}
        keywords={content.seo?.keywords}
      />

      <Hero
        backgroundImage={content.heroImage ? (typeof content.heroImage === 'string' ? content.heroImage : content.heroImage.url) : images[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1920'}
        title="estudio Cerámica"
        subtitle="creativa en Barcelona"
        titleImage={content.titleImage ? (typeof content.titleImage === 'string' ? content.titleImage : content.titleImage.url) : undefined}
      />

      <section className="pt-16 pb-8 lg:pt-24 lg:pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
              {images.length > 0 && (
                <>
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={images[0]}
                        src={images[0]}
                        alt={content.title}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>

                  {images.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="grid grid-cols-3 gap-4"
                    >
                      {images.slice(1, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${content.title} detalle ${index + 1}`}
                          onClick={() => handleImageClick(index)}
                          className="w-full h-32 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="mb-4 sm:mb-6">{content.title.toUpperCase()}</h2>
                {content.subtitle && (
                  <p className="text-lg leading-relaxed mb-4 text-[#7B7269] text-center uppercase tracking-[0.1em] font-light">
                    {content.subtitle}
                  </p>
                )}
                {content.description && (
                  <div 
                    className="text-base leading-relaxed text-foreground/80 space-y-4"
                    dangerouslySetInnerHTML={{ __html: content.description.replace(/\n/g, '<br/>') }}
                  />
                )}
              </div>

              {/* Two Column Layout: Price/Includes & Schedule */}
              {(content.price || content.includes || content.schedule) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Price and Includes */}
                  {(content.price || content.includes) && (
                    <div className="space-y-6">
                      {content.price && (
                        <>
                          <p className="text-lg text-primary">
                            {content.duration}
                          </p>
                          <p className="text-2xl">
                            {content.price}€
                          </p>
                        </>
                      )}

                      {content.includes && content.includes.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-lg">Incluye</h3>
                          <ul className="space-y-2 text-base text-foreground/80">
                            {content.includes.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <motion.button
                        onClick={handleConsultar}
                        className="border-2 border-primary text-primary px-6 py-2 rounded-lg text-sm overflow-hidden relative"
                        initial={{ backgroundColor: 'transparent' }}
                        whileHover={{ 
                          backgroundColor: '#FF5100',
                          color: '#FFFFFF',
                          transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Consultar
                      </motion.button>
                    </div>
                  )}

                  {/* Right Column: Schedule */}
                  {content.schedule && content.schedule.slots && content.schedule.slots.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg">Horarios</h3>
                      <div className="space-y-3">
                        {content.schedule.slots.map((slot, index) => (
                          <div key={index} className="space-y-1.5">
                            <p className="text-sm text-foreground/80 uppercase tracking-wide">{slot.day}</p>
                            <div className="space-y-1">
                              {slot.times.map((time, timeIndex) => (
                                <div key={timeIndex} className="text-sm text-foreground/60">
                                  Horario {time.time} ({time.availablePlaces} plazas)
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Syllabus and Additional Info */}
      {(content.content || content.content?.additionalInfo) && (
        <section className="pt-3 pb-8 lg:pt-5 lg:pb-12 bg-background">
          <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8">
            <div className="flex flex-col-reverse lg:grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">
              {/* Left Column: Payment Methods and Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Payment Methods */}
                {content.content?.paymentMethods && (
                  <div className="space-y-4">
                    <h3 className="text-xl mb-3">MÉTODOS DE PAGO</h3>
                    <div className="space-y-6">
                      <p className="text-base text-foreground/80">
                        {content.content.paymentMethods}
                      </p>
                      {siteSettings?.paymentMethods && Object.values(siteSettings.paymentMethods).some((enabled: any) => enabled) && (
                        <div className="flex flex-wrap gap-3 items-center">
                          {siteSettings.paymentMethods.transferencia && (
                            <>
                              <span className="text-sm text-foreground/60 border-b border-foreground/20 pb-1">
                                Transferencia bancaria
                              </span>
                              {(siteSettings.paymentMethods.paypal || siteSettings.paymentMethods.tarjeta || siteSettings.paymentMethods.efectivo || siteSettings.paymentMethods.bizum) && (
                                <span className="text-foreground/20">·</span>
                              )}
                            </>
                          )}
                          {siteSettings.paymentMethods.paypal && (
                            <>
                              <span className="text-sm text-foreground/60 border-b border-foreground/20 pb-1">
                                PayPal
                              </span>
                              {(siteSettings.paymentMethods.tarjeta || siteSettings.paymentMethods.efectivo || siteSettings.paymentMethods.bizum) && (
                                <span className="text-foreground/20">·</span>
                              )}
                            </>
                          )}
                          {siteSettings.paymentMethods.tarjeta && (
                            <>
                              <span className="text-sm text-foreground/60 border-b border-foreground/20 pb-1">
                                Tarjeta de crédito
                              </span>
                              {(siteSettings.paymentMethods.efectivo || siteSettings.paymentMethods.bizum) && (
                                <span className="text-foreground/20">·</span>
                              )}
                            </>
                          )}
                          {siteSettings.paymentMethods.efectivo && (
                            <>
                              <span className="text-sm text-foreground/60 border-b border-foreground/20 pb-1">
                                Efectivo
                              </span>
                              {siteSettings.paymentMethods.bizum && (
                                <span className="text-foreground/20">·</span>
                              )}
                            </>
                          )}
                          {siteSettings.paymentMethods.bizum && (
                            <span className="text-sm text-foreground/60 border-b border-foreground/20 pb-1">
                              Bizum
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {(content.content?.contactPhone || content.content?.contactEmail || content.content?.additionalInfo) && (
                  <div className="space-y-4">
                    <h3 className="text-xl mb-3">INFORMACIÓN ADICIONAL</h3>
                    <div className="bg-primary/3 rounded-lg p-6">
                      <p className="text-base leading-relaxed text-foreground/80 mb-4">
                        Cualquier consulta o información adicional que necesites me puedes escribir al WhatsApp{' '}
                        <a 
                          href={`https://wa.me/34${content.content?.contactPhone || '633788860'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {content.content?.contactPhone || '633788860'}
                        </a>{' '}
                        o al mail{' '}
                        <a 
                          href={`mailto:${content.content?.contactEmail || 'info@casarosierceramica.com'}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {content.content?.contactEmail || 'info@casarosierceramica.com'}
                        </a>
                      </p>
                      {content.content?.additionalInfo && (
                        <div 
                          className="text-sm leading-relaxed text-foreground/70 pt-3 border-t border-foreground/10"
                          dangerouslySetInnerHTML={{ __html: content.content.additionalInfo.replace(/\\n/g, '<br/>') }}
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {images.length > 4 && (
                  <img
                    src={images[4]}
                    alt="Estudio"
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                  />
                )}
              </motion.div>

              {/* Right Column: What You Will Learn, Who Can Participate, Modules */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* What You Will Learn */}
                {content.content?.whatYouWillLearn && (
                  <div className="space-y-4">
                    <h3 className="text-xl mb-3">¿QUÉ APRENDERÁS?</h3>
                    <div 
                      className="text-base leading-relaxed text-foreground/80 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: content.content.whatYouWillLearn }}
                    />
                  </div>
                )}

                {/* Who Can Participate */}
                {content.content?.whoCanParticipate && (
                  <div className="space-y-4">
                    <h3 className="text-xl mb-3">¿QUIÉN PUEDE PARTICIPAR?</h3>
                    <div 
                      className="text-base leading-relaxed text-foreground/80 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: content.content.whoCanParticipate }}
                    />
                  </div>
                )}

                {content.content && content.content.modules && content.content.modules.length > 0 && (
                  <>
                    <h3 className="text-xl mb-3">CONTENIDO DEL CURSO</h3>
                    <AccordionSection title={content.content.modulesAccordionTitle || "Ver programa completo"} defaultOpen={true}>
                      <div className="space-y-4">
                        {content.content.modules.map((item, index) => (
                          <AccordionSection key={index} title={item.title} defaultOpen={index === 0}>
                            <p className="text-base text-foreground/80">
                              {item.description}
                            </p>
                          </AccordionSection>
                        ))}
                      </div>
                    </AccordionSection>
                  </>
                )}

                <div className="pt-6">
                  <motion.button
                    onClick={handleInscribirse}
                    className="w-full border-2 border-primary text-primary px-8 py-4 rounded-lg text-base transition-colors"
                    whileHover={{ 
                      backgroundColor: '#FF5100',
                      color: '#FFFFFF',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Inscribirse
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}