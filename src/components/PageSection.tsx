import { motion } from 'motion/react';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScheduleDisplay } from './ScheduleDisplay';
import { Hero } from './Hero';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface PageSectionProps {
  section: any;
  siteSettings?: any;
  isFirstSection?: boolean;
}

// Componente para renderizar contenido rico (HTML/Markdown)
function RichContent({ content }: { content: string }) {
  return (
    <div className="prose prose-lg max-w-none text-foreground/80">
      <ReactMarkdown 
        rehypePlugins={[rehypeRaw]}
        components={{
          iframe: ({ node, ...props }) => {
            // Convertir atributos string a booleanos para iframe
            const iframeProps = { ...props };
            
            // Convertir allowfullscreen string a allowFullScreen boolean
            if ('allowfullscreen' in iframeProps || 'allowFullScreen' in iframeProps) {
              delete iframeProps.allowfullscreen;
              iframeProps.allowFullScreen = true;
            }
            
            return <iframe {...iframeProps} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Componente para el layout de clase/workshop con galería
function ClassLayoutSection({ section }: { section: any }) {
  return (
    <section className="bg-background px-[0px] py-[70px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">
          {/* Columna Izquierda - Imagen */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {section.image && (
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={section.image}
                  alt={section.title || 'Imagen'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </motion.div>

          {/* Columna Derecha - Contenido */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 flex flex-col justify-center"
          >
            {/* Título */}
            {section.title && (
              <h2>{section.title}</h2>
            )}

            {/* Subtítulo */}
            {section.subtitle && (
              <p className="text-lg leading-relaxed mb-4 text-[#7B7269] text-center uppercase tracking-[0.1em] font-light">{section.subtitle}</p>
            )}

            {/* Descripción con soporte HTML */}
            {section.description && (
              <RichContent content={section.description} />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function PageSection({ section, siteSettings, isFirstSection }: PageSectionProps) {
  switch (section.type) {
    case 'hero':
      // Si es la primera sección de un landing page, usar el componente Hero completo
      if (isFirstSection) {
        console.log('🎨 Renderizando Hero de landing page:', {
          hasImage: !!section.image,
          image: section.image,
          title: section.title,
          subtitle: section.subtitle
        });
        
        return (
          <Hero
            backgroundImage={section.image}
            title={section.title || 'Casa Rosier'}
            subtitle={section.subtitle}
            useTextTitle={true}
            showScrollIndicator={true}
            reducedHeight={false}
          />
        );
      }
      
      // Si NO es la primera sección, usar el hero simple sin menú
      return (
        <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
          {section.image && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${section.image})` }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          )}
          <div className="relative h-full flex items-center justify-center text-center px-4">
            <div className="max-w-4xl">
              {section.title && (
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl lg:text-6xl text-white mb-4"
                >
                  {section.title}
                </motion.h1>
              )}
              {section.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl lg:text-2xl text-white/90"
                >
                  {section.subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </section>
      );

    case 'text':
      // Detectar si es la sección de métodos de pago
      const isPaymentMethods = section.title?.toUpperCase().includes('MÉTODOS DE PAGO') || 
                               section.title?.toUpperCase().includes('METODOS DE PAGO');
      
      return (
        <section className="py-12 lg:py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {section.title && (
                <h2 className="text-3xl lg:text-4xl mb-6">{section.title}</h2>
              )}
              
              {isPaymentMethods && siteSettings?.paymentMethods ? (
                <div className="space-y-6">
                  {section.content && (
                    <RichContent content={section.content} />
                  )}
                  {Object.values(siteSettings.paymentMethods).some((enabled: any) => enabled) && (
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
              ) : (
                section.content && (
                  <RichContent content={section.content} />
                )
              )}
            </motion.div>
          </div>
        </section>
      );

    case 'pricing':
      return (
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-background rounded-2xl p-8 lg:p-12 shadow-lg"
            >
              {section.title && (
                <h2 className="text-2xl lg:text-3xl mb-4 text-center">{section.title}</h2>
              )}
              {section.price && (
                <div className="text-center mb-6">
                  <div className="text-4xl lg:text-5xl text-primary mb-2">
                    {section.price}
                  </div>
                  {section.subtitle && (
                    <div className="text-foreground/60">{section.subtitle}</div>
                  )}
                </div>
              )}

              {section.includes && section.includes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl mb-4">Incluye:</h3>
                  <ul className="space-y-2">
                    {section.includes.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.extras && section.extras.length > 0 && (
                <div>
                  <h3 className="text-xl mb-4">Opcionales:</h3>
                  <ul className="space-y-2">
                    {section.extras.map((extra: any, index: number) => (
                      <li key={index} className="flex items-center justify-between py-2 border-b border-foreground/10 last:border-0">
                        <span className="text-foreground/80">{extra.name}</span>
                        <span className="text-primary font-medium">{extra.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      );

    case 'list':
      return (
        <section className="py-12 lg:py-16 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {section.title && (
              <h2 className="text-3xl lg:text-4xl mb-12 text-center">{section.title}</h2>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              {section.items && section.items.map((item: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-md"
                >
                  <h3 className="text-xl mb-3">{item.title}</h3>
                  <p className="text-foreground/70">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'about':
      return (
        <section className="py-12 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={!section.mainImage ? '' : 'grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12'}>
              {/* Columna Izquierda - Imagen */}
              {section.mainImage && (
                <div>
                  <div className="relative w-full">
                    <img
                      src={section.mainImage}
                      alt={section.title || 'Imagen'}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Columna Derecha - Contenido */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`space-y-6 flex flex-col justify-center ${!section.mainImage ? 'text-center items-center w-full' : ''}`}
              >
                {/* Título */}
                {section.title && (
                  <h2>{section.title}</h2>
                )}

                {/* Contenido con soporte HTML */}
                {section.content && (
                  <RichContent content={section.content} />
                )}
              </motion.div>
            </div>
          </div>
        </section>
      );

    case 'courses':
      return (
        <section className="py-12 lg:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {section.title && (
              <h2 className="text-3xl lg:text-4xl mb-12 text-center">{section.title}</h2>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {section.courses && section.courses.map((course: any, index: number) => (
                <motion.a
                  key={index}
                  href={course.link}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl mb-1">{course.title}</h3>
                    <p className="text-sm text-white/80">{course.subtitle}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      );

    case 'class-layout':
      return <ClassLayoutSection section={section} />;

    case 'gift-cards':
      return (
        <section className="bg-background pt-[20px] pb-[20px]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {section.title && (
              <h2 className="mb-8 text-center">{section.title}</h2>
            )}
            
            {/* Subtítulo */}
            {section.subtitle && (
              <p className="text-lg text-foreground/70 text-center mb-8">{section.subtitle}</p>
            )}
            
            <div className="flex flex-wrap gap-6 justify-center">
              {section.giftCards && section.giftCards.map((card: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-sm md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  {/* Imagen */}
                  {card.image && (
                    <div className="w-full h-64 overflow-hidden">
                      <img 
                        src={card.image} 
                        alt={card.title || 'Tarjeta de regalo'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6 lg:p-8">
                    {/* Título */}
                    {card.title && (
                      <h3 className="mb-4 text-primary">{card.title}</h3>
                    )}
                    
                    {/* Descripción */}
                    {card.description && (
                      <div 
                        className="text-sm text-foreground/70 mb-6 leading-relaxed rich-content"
                        dangerouslySetInnerHTML={{ __html: card.description }}
                      />
                    )}
                    
                    {/* Información de clases y personas */}
                    <div className="space-y-2 mb-6 pb-6 border-b border-foreground/10">
                      {card.classes && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground/60">Clases:</span>
                          <span className="font-medium text-foreground/80">{card.classes}</span>
                        </div>
                      )}
                      {card.people && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground/60">Personas:</span>
                          <span className="font-medium text-foreground/80">{card.people}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Precio */}
                    {card.price && (
                      <div className="text-center">
                        <div className="text-3xl lg:text-4xl text-primary">
                          {card.price}€
                        </div>
                      </div>
                    )}
                    
                    {/* CTA opcional */}
                    {card.ctaText && card.ctaLink && (() => {
                      // Detectar si es un link externo (URL completa) o interno (ruta relativa)
                      const isExternal = card.ctaLink.startsWith('http://') || 
                                        card.ctaLink.startsWith('https://') || 
                                        card.ctaLink.startsWith('//');
                      
                      // Estilo compartido del botón
                      const buttonClass = "block w-full bg-primary text-white text-center py-3 rounded-xl hover:bg-primary/90 transition-colors mt-6";
                      
                      // Si es externo, usar <a> con target="_blank"
                      if (isExternal) {
                        return (
                          <a
                            href={card.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonClass}
                          >
                            {card.ctaText}
                          </a>
                        );
                      }
                      
                      // Si es interno, usar Link de react-router-dom para navegación SPA
                      return (
                        <Link
                          to={card.ctaLink}
                          className={buttonClass}
                        >
                          {card.ctaText}
                        </Link>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'team':
      return (
        <section className="py-12 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12 lg:space-y-16">
              {section.members && section.members.map((member: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 lg:gap-16 items-start"
                >
                  {/* Photo Left */}
                  <div className="relative w-full">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name || 'Profesor'}
                        className="w-full h-[425px] lg:h-[510px] object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-[500px] lg:h-[600px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-lg">
                        <span className="text-6xl text-primary/30">👤</span>
                      </div>
                    )}
                  </div>

                  {/* Text Right */}
                  <div className="flex flex-col justify-center space-y-6">
                    {member.name && (
                      <h3 className="text-4xl lg:text-5xl text-[#70482C]">{member.name}</h3>
                    )}
                    {member.role && (
                      <p className="text-sm tracking-[0.2em] uppercase text-[#70482C]">{member.role}</p>
                    )}
                    {member.bio && (
                      <div className="prose prose-lg max-w-none text-[#7B7269] leading-relaxed whitespace-pre-wrap font-light">
                        {member.bio}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'image-text':
      return (
        <section className="py-12 lg:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
              section.layout === 'right' ? 'lg:grid-flow-dense' : ''
            }`}>
              {/* Imagen */}
              <motion.div
                initial={{ opacity: 0, x: section.layout === 'right' ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={section.layout === 'right' ? 'lg:col-start-2' : ''}
              >
                {section.image && (
                  <img
                    src={section.image}
                    alt={section.title || 'Imagen'}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                )}
              </motion.div>

              {/* Contenido */}
              <motion.div
                initial={{ opacity: 0, x: section.layout === 'right' ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={section.layout === 'right' ? 'lg:col-start-1 lg:row-start-1' : ''}
              >
                {section.title && (
                  <h2 className="mb-6">{section.title}</h2>
                )}
                {section.content && (
                  <RichContent content={section.content} />
                )}
              </motion.div>
            </div>
          </div>
        </section>
      );

    case 'features':
      return (
        <section className="py-12 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {section.title && (
              <h2 className="mb-12 text-center">{section.title}</h2>
            )}
            {section.content && (
              <div className="mb-12 text-center">
                <RichContent content={section.content} />
              </div>
            )}
            {section.features && section.features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.features.map((feature: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    {feature.icon && (
                      <div className="text-4xl mb-4">{feature.icon}</div>
                    )}
                    {feature.title && (
                      <h3 className="text-xl mb-3">{feature.title}</h3>
                    )}
                    {feature.description && (
                      <p className="text-foreground/70">{feature.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
}
