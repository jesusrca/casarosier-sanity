import { Check, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useContent } from '../contexts/ContentContext';
import { SEOHead } from '../components/SEOHead';
import { NotFound } from './NotFound';
import { AccordionSection } from '../components/AccordionSection';
import { Hero } from '../components/Hero';
import { PageSkeleton } from '../components/PageSkeleton';
import { LoadingScreen } from '../components/LoadingScreen';
import { settingsAPI } from '../utils/api';

interface ContentItem {
  id: string;
  type: 'class' | 'workshop' | 'private' | 'gift-card';
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
    enabled?: boolean;
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
    whatYouWillLearnTitle?: string;
    whoCanParticipate?: string;
    whoCanParticipateTitle?: string;
    paymentMethods?: string;
    additionalInfo?: string;
    contactPhone?: string;
    contactEmail?: string;
    infoBlocks?: Array<{
      title: string;
      description: string;
    }>;
    modules?: Array<{
      title: string;
      description: string;
    }>;
    modulesAccordionTitle?: string;
    modulesSectionTitle?: string;
    showActivities?: boolean;
    activities?: Array<{
      title: string;
      description: string;
      link: string;
    }>;
    ctaButtonText?: string;
    showBottomCTA?: boolean;
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
  const { getClassBySlug, getWorkshopBySlug, getPrivateBySlug, getGiftCardBySlug, loading: contentLoading } = useContent();
  const [images, setImages] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [showNotFound, setShowNotFound] = useState(false);

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
    : currentPath.startsWith('/tarjeta-regalo')
    ? 'gift-card'
    : 'workshop';

  // Buscar el contenido en el contexto (datos ya cargados)
  const content = type === 'class' 
    ? getClassBySlug(slug || '')
    : type === 'private'
    ? getPrivateBySlug(slug || '')
    : type === 'gift-card'
    ? getGiftCardBySlug(slug || '')
    : getWorkshopBySlug(slug || '');

  // Control del delay antes de mostrar 404 para evitar flash durante transiciones
  useEffect(() => {
    if (!content && !contentLoading) {
      // Dar un pequeño margen de tiempo antes de mostrar 404
      const timer = setTimeout(() => {
        setShowNotFound(true);
      }, 300); // 300ms de delay, coincide con la duración de la transición
      return () => clearTimeout(timer);
    } else {
      setShowNotFound(false);
    }
  }, [content, contentLoading, slug]);

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

  // Si está cargando o esperando para mostrar 404, mostrar skeleton
  if (contentLoading || (!content && !showNotFound)) {
    return <PageSkeleton />;
  }

  // Si no hay contenido después de cargar, mostrar 404
  if (!content && showNotFound) {
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
      <SEOHead
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
                  <div className="relative aspect-[100/115] overflow-hidden rounded-lg shadow-lg">
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
                  <p className="text-lg leading-relaxed mb-4 text-[#7B7269] text-center uppercase tracking-[0.1em] font-light px-[10%]">
                    {content.subtitle}
                  </p>
                )}
                {content.shortDescription && (
                  <div 
                    className="text-lg leading-relaxed mb-6 text-[#FF5100] text-center font-light italic"
                    dangerouslySetInnerHTML={{ __html: content.shortDescription.replace(/\n/g, '<br/>') }}
                  />
                )}
                {content.description && (
                  <div 
                    className="text-base leading-relaxed text-foreground/80 space-y-4"
                    dangerouslySetInnerHTML={{ __html: content.description }}
                  />
                )}
              </div>

              {/* Two Column Layout: Price/Includes & Schedule */}
              {(content.price || content.includes || content.schedule) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Price and Includes */}
                  {(content.price || content.includes) && (
                    <div className="space-y-6">
                      {/* Opciones de precio adicionales - solo para NO privadas */}
                      {type !== 'private' && content.priceOptions && content.priceOptions.filter((opt: any) => opt.price && opt.price !== '0' && opt.price !== 0 && opt.label && opt.label.trim() !== '').length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm uppercase tracking-wider text-foreground/60 mb-2">
                            PRECIO
                          </p>
                          {content.priceOptions.filter((opt: any) => opt.price && opt.price !== '0' && opt.price !== 0 && opt.label && opt.label.trim() !== '').map((option: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-4 p-3 bg-foreground/5 rounded-lg border border-foreground/10"
                            >
                              <span className="text-sm text-foreground/80 flex-1">{option.label}</span>
                              <span className="text-lg text-primary font-medium whitespace-nowrap">{option.price}€</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {content.includes && content.includes.filter((item: string) => item && item.trim() !== '' && item !== '0').length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-lg">Incluye</h3>
                          <ul className="space-y-2 text-base text-foreground/80">
                            {content.includes.filter((item: string) => item && item.trim() !== '' && item !== '0').map((item: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {type !== 'private' && (
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
                      )}
                    </div>
                  )}

                  {/* Right Column: Schedule */}
                  {(content.duration || (content.schedule && (content.schedule.description || (content.schedule.enabled !== false && content.schedule.slots && content.schedule.slots.length > 0)))) && (
                    <div className="space-y-6">
                      {content.duration && content.duration.trim() && (
                        <div>
                          <p className="text-sm uppercase tracking-wider text-foreground/60 mb-2">
                            DURACIÓN
                          </p>
                          <p className="text-lg text-primary">
                            {content.duration}
                          </p>
                        </div>
                      )}
                      
                      {content.schedule && (
                        (content.schedule.description && content.schedule.description.trim()) || 
                        (content.schedule.enabled !== false && content.schedule.slots && content.schedule.slots.length > 0)
                      ) && (
                        <div className="space-y-3">
                          <h3 className="text-lg">Horarios</h3>
                          {content.schedule.description && content.schedule.description.trim() && (
                            <p className="text-sm text-foreground/70 leading-relaxed">
                              {content.schedule.description}
                            </p>
                          )}
                          {content.schedule.enabled !== false && content.schedule.slots && content.schedule.slots.length > 0 && (
                            <div className="space-y-3">
                              {content.schedule.slots.map((slot, index) => (
                                <div key={index} className="space-y-1.5">
                                  <p className="text-sm text-foreground/80 uppercase tracking-wide">{slot.day}</p>
                                  <div className="space-y-1">
                                    {slot.times.map((time, timeIndex) => (
                                      <div key={timeIndex} className="text-sm text-foreground/60">
                                        {time.time}{time.availablePlaces >= 0 ? ` (${time.availablePlaces} plazas)` : ''}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CTA Button for Private Classes */}
              {type === 'private' && (
                <div className="pt-4">
                  <motion.button
                    onClick={() => window.open('https://wa.me/34633788860', '_blank')}
                    className="border-2 border-primary text-primary px-6 py-3 rounded-lg text-sm transition-colors"
                    whileHover={{ 
                      backgroundColor: '#FF5100',
                      color: '#FFFFFF',
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {content.content?.ctaButtonText || 'Escríbenos'}
                  </motion.button>
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
                {(content.content?.contactPhone || content.content?.contactEmail || content.content?.additionalInfo || content.content?.infoBlocks?.length) && (
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
                      {/* Solo mostrar additionalInfo si NO es gift-card */}
                      {content.type !== 'gift-card' && content.content?.additionalInfo && (
                        <div 
                          className="text-sm leading-relaxed text-foreground/70 pt-3 border-t border-foreground/10"
                          dangerouslySetInnerHTML={{ __html: content.content.additionalInfo.replace(/\\n/g, '<br/>') }}
                        />
                      )}
                    </div>

                    {/* Info Blocks para Gift Cards */}
                    {content.type === 'gift-card' && content.content?.infoBlocks && content.content.infoBlocks.length > 0 && (
                      <div className="space-y-3 mt-[10px] mr-[0px] mb-[0px] ml-[0px]">
                        {content.content.infoBlocks.map((block: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="rounded-lg p-6"
                          >
                            {block.title && (
                              <h4 className="text-lg font-medium text-primary mb-3">
                                {block.title}
                              </h4>
                            )}
                            {block.description && (
                              <div 
                                className="text-sm leading-relaxed text-[#2D2520]/80 rich-content"
                                dangerouslySetInnerHTML={{ __html: block.description }}
                              />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
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
                    <h3 className="text-xl mb-3">{content.content.whatYouWillLearnTitle || '¿QUÉ APRENDERÁS?'}</h3>
                    <div 
                      className="text-base leading-relaxed text-foreground/80 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: content.content.whatYouWillLearn }}
                    />
                  </div>
                )}

                {/* Who Can Participate */}
                {content.content.whoCanParticipate && content.content.whoCanParticipate.replace(/<[^>]*>/g, '').trim() && (
                  <div className="space-y-4">
                    <h3 className="text-xl mb-3">{content.content.whoCanParticipateTitle || '¿QUIÉN PUEDE PARTICIPAR?'}</h3>
                    <div 
                      className="text-base leading-relaxed text-foreground/80 prose prose-sm max-w-none text-[rgba(45,37,32,0.85)]"
                      dangerouslySetInnerHTML={{ __html: content.content.whoCanParticipate }}
                    />
                  </div>
                )}

                {/* Activities Section */}
                {content.content?.showActivities && content.content?.activities && content.content.activities.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl mb-3">¿QUÉ TIPO DE ACTIVIDADES PUEDEN HACER?</h3>
                    <div className="space-y-6">
                      {content.content.activities.map((activity, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="text-base text-primary font-medium" style={{ fontSize: '1.1em' }}>{activity.title}</h4>
                          <p className="text-base leading-relaxed text-foreground/70">
                            {activity.description}{' '}
                            {activity.link && (
                              <Link 
                                to={activity.link} 
                                className="text-primary hover:underline inline-flex items-center"
                              >
                                Ver más
                              </Link>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {content.content && content.content.modules && content.content.modules.length > 0 && (
                  <>
                    <h3 className="text-xl mb-3">{content.content.modulesSectionTitle || 'CONTENIDO DEL CURSO'}</h3>
                    <AccordionSection title={content.content.modulesAccordionTitle || "Ver programa completo"} defaultOpen={true}>
                      <div className="space-y-4">
                        {content.content.modules.map((item, index) => (
                          <AccordionSection key={index} title={item.title} defaultOpen={index === 0}>
                            {item.description}
                          </AccordionSection>
                        ))}
                      </div>
                    </AccordionSection>
                  </>
                )}

                {/* Solo mostrar si está habilitado (por defecto true) */}
                {(content.content?.showBottomCTA !== false) && (
                  <div className="pt-6 flex justify-start">
                    <motion.button
                      onClick={() => window.open('https://wa.me/34633788860', '_blank')}
                      className="border-2 border-primary text-primary px-6 py-3 rounded-lg text-sm transition-colors"
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
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/34633788860"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.a>
    </div>
  );
}