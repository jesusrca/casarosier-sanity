import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Facebook, Mail, Link as LinkIcon } from 'lucide-react';
import { Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InstagramImage {
  url: string;
  title?: string;
  description?: string;
  source?: string;
  date?: string;
}

interface InstagramLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: InstagramImage[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  instagramLink?: string;
}

export function InstagramLightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  instagramLink = 'https://instagram.com/casarosier'
}: InstagramLightboxProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);
  
  if (!isOpen || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(currentImage.title || 'Casa Rosier');
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${text}&body=${url}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section */}
            <div className="relative w-full lg:w-3/5 bg-foreground/5 flex items-center justify-center overflow-hidden">
              <img
                src={currentImage.url}
                alt={currentImage.title || `Instagram image ${currentIndex + 1}`}
                className="w-full h-full object-contain max-h-[50vh] lg:max-h-[90vh]"
              />
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-2/5 bg-white flex flex-col">
              {/* Header with Navigation */}
              <div className="flex items-center justify-between p-4 lg:p-6">
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    className="p-2 hover:bg-foreground/5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground/60" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className="p-2 hover:bg-foreground/5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground/60" />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-foreground/60" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                {currentImage.title && (
                  <h3 className="text-xl lg:text-2xl mb-4 text-foreground">
                    {currentImage.title}
                  </h3>
                )}
                
                {currentImage.description && (
                  <div className="text-sm lg:text-base text-foreground/70 leading-relaxed whitespace-pre-wrap mb-6">
                    {currentImage.description}
                  </div>
                )}

                {/* Source and Date */}
                {(currentImage.source || currentImage.date) && (
                  <div className="text-xs lg:text-sm text-foreground/50 mb-6 pt-4">
                    {currentImage.source && (
                      <div className="mb-1">{currentImage.source}</div>
                    )}
                    {currentImage.date && (
                      <div>{currentImage.date}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer with Social Share */}
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                    aria-label="Compartir en Facebook"
                  >
                    <Facebook className="w-4 h-4 text-foreground/60" />
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                    aria-label="Compartir por email"
                  >
                    <Mail className="w-4 h-4 text-foreground/60" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                    aria-label="Compartir en Twitter"
                  >
                    <svg className="w-4 h-4 text-foreground/60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                  <a
                    href={instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-foreground/5 rounded-full transition-colors"
                    aria-label="Ver en Instagram"
                  >
                    <Instagram className="w-4 h-4 text-foreground/60" />
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 hover:bg-foreground/5 rounded-full transition-colors relative"
                    aria-label="Copiar enlace"
                  >
                    <LinkIcon className="w-4 h-4 text-foreground/60" />
                    {copySuccess && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                        ¡Copiado!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}