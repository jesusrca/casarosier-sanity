import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ClickableBannerProps {
  image?: string;
  title?: string;
  description?: string;
  link?: string;
}

export function ClickableBanner({
  image = 'https://images.unsplash.com/photo-1610701596295-4dc5d6289214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwZ2lmdCUyMGNhcmR8ZW58MXx8fHwxNzY1MjE4MTExfDA&ixlib=rb-4.1.0&q=80&w=1080',
  title = 'Experiencia Cerámica Gift Card',
  description = 'Este cupón de regalo para taller ofrece una clase privada de cerámica. Ideal para un amigo o ser querido creativo. Celebrará su vínculo probando juntos el torno, o modelado a mano.',
  link = '/tarjeta-regalo'
}: ClickableBannerProps) {
  const handleClick = () => {
    if (link) {
      if (link.startsWith('http')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = link;
      }
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onClick={handleClick}
          className={`overflow-hidden grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr] gap-0 ${link ? 'cursor-pointer' : ''}`}
        >
          {/* Image Section */}
          <div className="relative w-full aspect-square">
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4"
            >
              {title}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-foreground/80 leading-relaxed"
            >
              {description}
            </motion.p>

            {link && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6 inline-flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                <span className="mr-2">Más información</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}