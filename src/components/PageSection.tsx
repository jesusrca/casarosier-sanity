import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { ScheduleDisplay } from './ScheduleDisplay';

interface PageSectionProps {
  section: any;
}

// Componente para el layout de clase/workshop con galería
function ClassLayoutSection({ section }: { section: any }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = section.images || [];

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-12">
          {/* Columna Izquierda - Galería de Imágenes */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {images.length > 0 ? (
              <>
                {/* Imagen Principal */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={images[selectedImage]}
                    alt={section.title || 'Imagen principal'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.slice(0, 3).map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden transition-all ${
                          selectedImage === index
                            ? 'ring-4 ring-primary shadow-lg scale-105'
                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-foreground/5 flex items-center justify-center">
                <p className="text-foreground/40">Sin imágenes</p>
              </div>
            )}
          </motion.div>

          {/* Columna Derecha - Contenido */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Título */}
            {section.title && (
              <div>
                <h1 className="text-3xl sm:text-4xl mb-4 break-words">{section.title}</h1>
                {section.subtitle && (
                  <p className="text-lg text-foreground/70">{section.subtitle}</p>
                )}
              </div>
            )}

            {/* Descripción */}
            {section.description && (
              <div className="prose prose-lg max-w-none text-foreground/80">
                <p className="whitespace-pre-wrap break-words">{section.description}</p>
              </div>
            )}

            {/* Tarjeta de Precio */}
            {section.price && (
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg space-y-6">
                <div className="text-center pb-6 border-b border-foreground/10">
                  <div className="text-4xl lg:text-5xl text-primary mb-2">
                    {section.price}
                  </div>
                  {section.priceSubtitle && (
                    <p className="text-foreground/60">{section.priceSubtitle}</p>
                  )}
                </div>

                {/* Incluye */}
                {section.includes && section.includes.length > 0 && (
                  <div>
                    <h3 className="text-lg mb-3">Incluye:</h3>
                    <ul className="space-y-2">
                      {section.includes.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/80 break-words">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extras/Opcionales */}
                {section.extras && section.extras.length > 0 && (
                  <div className="pt-6 border-t border-foreground/10">
                    <h3 className="text-lg mb-3">Opcionales:</h3>
                    <ul className="space-y-3">
                      {section.extras.map((extra: any, index: number) => (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <span className="text-foreground/70 break-words flex-1">{extra.name}</span>
                          <span className="text-primary font-medium whitespace-nowrap">{extra.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botón CTA */}
                {section.ctaText && section.ctaLink && (
                  <a
                    href={section.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-primary text-white text-center py-4 rounded-xl hover:bg-primary/90 transition-colors text-lg"
                  >
                    {section.ctaText}
                  </a>
                )}
              </div>
            )}

            {/* Horarios */}
            {section.schedule && (
              <ScheduleDisplay
                schedules={section.schedule}
                showPlaces={section.showPlaces !== false}
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function PageSection({ section }: PageSectionProps) {
  switch (section.type) {
    case 'hero':
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
      return (
        <section className="py-12 lg:py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {section.title && (
                <h2 className="text-3xl lg:text-4xl mb-6">{section.title}</h2>
              )}
              {section.content && (
                <div className="prose prose-lg max-w-none text-foreground/80 whitespace-pre-wrap">
                  {section.content}
                </div>
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
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {section.title && (
                  <h2 className="text-3xl lg:text-4xl mb-6">{section.title}</h2>
                )}
                {section.content && (
                  <div className="prose prose-lg max-w-none text-foreground/80 whitespace-pre-wrap">
                    {section.content}
                  </div>
                )}
              </motion.div>
              
              {section.images && section.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`grid gap-4 ${
                    section.images.length === 1 
                      ? 'grid-cols-1' 
                      : section.images.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2'
                  }`}
                >
                  {section.images.slice(0, 4).map((image: string, index: number) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-lg ${
                        section.images.length === 3 && index === 0 ? 'col-span-2' : ''
                      }`}
                      style={{ paddingBottom: '100%' }}
                    >
                      <img
                        src={image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
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

    default:
      return null;
  }
}