import { motion } from 'motion/react';
import Slider from 'react-slick';
import { useState } from 'react';
import { InstagramLightbox } from './InstagramLightbox';

export interface InstagramImageData {
  url: string;
  title?: string;
  description?: string;
  source?: string;
  date?: string;
}

interface InstagramCarouselProps {
  title?: string;
  instagramHandle?: string;
  instagramLink?: string;
  images?: (string | InstagramImageData)[];
}

export function InstagramCarousel({
  title = 'Y TÚ, ¿CUÁNDO TUVISTE TU ÚLTIMA IDEA?',
  instagramHandle = '@casarosier',
  instagramLink = 'https://instagram.com/casarosier',
  images = []
}: InstagramCarouselProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Default images if none provided
  const defaultImages: InstagramImageData[] = [
    { url: 'https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGhhbmRzJTIwd29ya3Nob3B8ZW58MXx8fHwxNzY1MTUwMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { url: 'https://images.unsplash.com/photo-1760764541302-e3955fbc6b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwc3R1ZGlvJTIwY2VyYW1pYyUyMGFydHxlbnwxfHx8fDE3NjUyMTgxMTB8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { url: 'https://images.unsplash.com/photo-1610701596295-4dc5d6289214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwYm93bHMlMjBoYW5kbWFkZSUyMHBvdHRlcnl8ZW58MXx8fHwxNzY1MjE4MTExfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { url: 'https://images.unsplash.com/photo-1693669365308-33c1b154cfec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd2hlZWwlMjBjZXJhbWljJTIwd29ya3xlbnwxfHx8fDE3NjUyMTgxMTF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { url: 'https://images.unsplash.com/photo-1763994679306-8f94ffdcf3f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcGxhdGVzJTIwYXJ0aXNhbnxlbnwxfHx8fDE3NjUyMTgxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { url: 'https://images.unsplash.com/photo-1662845114342-256fdc45981d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwdG9vbHMlMjBjbGF5JTIwd29ya3NwYWNlfGVufDF8fHx8MTc2NTIxODExMnww&ixlib=rb-4.1.0&q=80&w=1080' },
    { url: 'https://images.unsplash.com/photo-1761330439316-72229b71798f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwdmFzZXMlMjBtb2Rlcm4lMjBwb3R0ZXJ5fGVufDF8fHx8MTc2NTIxODExMnww&ixlib=rb-4.1.0&q=80&w=1080' },
    { url: 'https://images.unsplash.com/photo-1691071096270-ef5b34e0ed06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5JTIwd29ya3Nob3AlMjBpbnRlcmlvciUyMHNwYWNlfGVufDF8fHx8MTY1MjE4MTEzfDA&ixlib=rb-4.1.0&q=80&w=1080' }
  ];

  // Normalize images to InstagramImageData format
  const normalizedImages: InstagramImageData[] = (images && images.length > 0 ? images : defaultImages).map(img => 
    typeof img === 'string' ? { url: img } : img
  );

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="mb-4">
            {title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
            <span>síguenos en instagram</span>
            <span className="mx-2">—</span>
            <a 
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {instagramHandle}
            </a>
          </div>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="instagram-carousel"
        >
          <Slider {...settings}>
            {normalizedImages.map((image, index) => (
              <div key={index} className="px-2">
                <motion.button
                  onClick={() => handleImageClick(index)}
                  className="block w-full aspect-square overflow-hidden rounded-lg shadow-md cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={image.url}
                    alt={image.title || `Instagram post ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              </div>
            ))}
          </Slider>
        </motion.div>
      </div>

      {/* Lightbox */}
      <InstagramLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={normalizedImages}
        currentIndex={currentImageIndex}
        onNavigate={setCurrentImageIndex}
        instagramLink={instagramLink}
      />

      {/* Custom styles for the carousel */}
      <style>{`
        .instagram-carousel .slick-slide {
          padding: 0 4px;
        }
        .instagram-carousel .slick-track {
          display: flex;
          gap: 8px;
        }
        .instagram-carousel .slick-prev,
        .instagram-carousel .slick-next {
          display: none !important;
        }
      `}</style>
    </section>
  );
}