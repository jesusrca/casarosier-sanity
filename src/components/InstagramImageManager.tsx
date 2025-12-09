import { useState, useRef } from 'react';
import { RefreshCw, Image as ImageIcon, Trash2 } from 'lucide-react';
import { uploadAPI } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';

interface InstagramImageManagerProps {
  image: any;
  index: number;
  onImageReplace: (url: string) => void;
  onImageDelete: () => void;
  onMetaUpdate: (field: string, value: string) => void;
}

export function InstagramImageManager({ 
  image, 
  index, 
  onImageReplace, 
  onImageDelete,
  onMetaUpdate 
}: InstagramImageManagerProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = typeof image === 'string' ? image : image.url;
  const imageTitle = typeof image === 'string' ? '' : (image.title || '');
  const imageDescription = typeof image === 'string' ? '' : (image.description || '');
  const imageSource = typeof image === 'string' ? '' : (image.source || '');
  const imageDate = typeof image === 'string' ? '' : (image.date || '');

  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const response = await uploadAPI.getImages();
      setGalleryImages(response.images || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleShowGallery = () => {
    setShowGallery(true);
    loadGallery();
  };

  const handleSelectFromGallery = (url: string) => {
    onImageReplace(url);
    setShowGallery(false);
  };

  return (
    <>
      <div className="border border-border rounded-lg p-4 bg-foreground/5">
        <div className="flex gap-4 mb-3">
          <img
            src={imageUrl}
            alt={`Instagram ${index + 1}`}
            className="w-24 h-24 object-cover rounded-lg border border-border flex-shrink-0"
          />
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={imageTitle}
              onChange={(e) => onMetaUpdate('title', e.target.value)}
              placeholder="Título del post (opcional)"
              className="w-full px-3 py-2 text-sm border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={imageDescription}
              onChange={(e) => onMetaUpdate('description', e.target.value)}
              placeholder="Descripción del post (opcional)"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={imageSource}
                onChange={(e) => onMetaUpdate('source', e.target.value)}
                placeholder="Fuente (ej: OKA // INSTAGRAM)"
                className="w-full px-3 py-2 text-sm border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={imageDate}
                onChange={(e) => onMetaUpdate('date', e.target.value)}
                placeholder="Fecha (ej: 12 DE NOVIEMBRE 2025)"
                className="w-full px-3 py-2 text-sm border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs whitespace-nowrap"
              title="Cambiar imagen"
            >
              <RefreshCw size={14} />
              <span>Cambiar</span>
            </button>
            <button
              type="button"
              onClick={handleShowGallery}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs whitespace-nowrap"
              title="Galería"
            >
              <ImageIcon size={14} />
              <span>Galería</span>
            </button>
            <button
              type="button"
              onClick={onImageDelete}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs whitespace-nowrap"
              title="Eliminar"
            >
              <Trash2 size={14} />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              const response = await uploadAPI.uploadImage(file);
              onImageReplace(response.url);
            } catch (error) {
              console.error('Error uploading image:', error);
              alert('Error al subir la imagen');
            }
          }
        }}
        className="hidden"
      />

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl">Galería de Imágenes</h3>
                <button
                  type="button"
                  onClick={() => setShowGallery(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {loadingGallery ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando imágenes...</p>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No hay imágenes en la galería
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((galleryImage) => (
                    <button
                      key={galleryImage.name}
                      type="button"
                      onClick={() => handleSelectFromGallery(galleryImage.url)}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors"
                    >
                      <img
                        src={galleryImage.url}
                        alt={galleryImage.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                          Seleccionar
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
