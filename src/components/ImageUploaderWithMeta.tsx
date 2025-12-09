import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadAPI } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';

export interface ImageMetadata {
  url: string;
  alt?: string;
  caption?: string;
}

interface ImageUploaderWithMetaProps {
  currentImage?: ImageMetadata | string; // Support both old string format and new object format
  onImageSelect: (image: ImageMetadata) => void;
  label?: string;
  showCaptionField?: boolean;
}

export function ImageUploaderWithMeta({ 
  currentImage, 
  onImageSelect, 
  label = 'Imagen',
  showCaptionField = true 
}: ImageUploaderWithMetaProps) {
  // Convert old string format to object format
  const normalizedImage: ImageMetadata = typeof currentImage === 'string' 
    ? { url: currentImage, alt: '', caption: '' }
    : (currentImage || { url: '', alt: '', caption: '' });

  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [imageData, setImageData] = useState<ImageMetadata>(normalizedImage);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImageData = (field: keyof ImageMetadata, value: string) => {
    const updated = { ...imageData, [field]: value };
    setImageData(updated);
    onImageSelect(updated);
  };

  const compressImage = async (file: File): Promise<File> => {
    const maxSizeMB = 2;
    const fileSizeMB = file.size / 1024 / 1024;

    // Si la imagen ya es menor a 2MB, no comprimirla
    if (fileSizeMB <= maxSizeMB) {
      return file;
    }

    setCompressing(true);
    try {
      const options = {
        maxSizeMB: maxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type,
      };

      const compressedFile = await imageCompression(file, options);
      console.log(`Imagen comprimida: ${fileSizeMB.toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Error al comprimir la imagen');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const fileSizeMB = file.size / 1024 / 1024;

    // Si supera los 2MB, informar al usuario que se comprimirá
    if (fileSizeMB > 2) {
      const confirmed = confirm(
        `La imagen pesa ${fileSizeMB.toFixed(2)}MB. El límite es 2MB.\n\n` +
        '¿Deseas comprimirla automáticamente? (Recomendado)'
      );
      
      if (!confirmed) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    setUploading(true);
    try {
      // Comprimir la imagen si es necesario
      const processedFile = await compressImage(file);
      
      const response = await uploadAPI.uploadImage(processedFile);
      const updated = { 
        ...imageData, 
        url: response.url,
        // Auto-generate alt text suggestion from filename if empty
        alt: imageData.alt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      };
      setImageData(updated);
      onImageSelect(updated);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

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

  const handleSelectFromGallery = (url: string, name: string) => {
    const updated = { 
      ...imageData, 
      url,
      // Auto-generate alt text suggestion from filename if empty
      alt: imageData.alt || name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    };
    setImageData(updated);
    onImageSelect(updated);
    setShowGallery(false);
  };

  const handleRemoveImage = () => {
    const updated = { url: '', alt: '', caption: '' };
    setImageData(updated);
    onImageSelect(updated);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm text-foreground/80">{label}</label>}
      
      {imageData.url ? (
        <div className="space-y-3">
          <div className="relative group">
            <img
              src={imageData.url}
              alt={imageData.alt || 'Preview'}
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              <X size={16} />
            </button>
          </div>

          {/* SEO Metadata Fields */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-900">Optimización SEO</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-blue-900 mb-1">
                Texto alternativo (ALT) *
              </label>
              <input
                type="text"
                value={imageData.alt || ''}
                onChange={(e) => updateImageData('alt', e.target.value)}
                placeholder="Describe la imagen para accesibilidad y SEO"
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <p className="text-xs text-blue-700 mt-1">
                Importante para SEO y accesibilidad. Describe qué hay en la imagen.
              </p>
            </div>

            {showCaptionField && (
              <div>
                <label className="block text-xs font-medium text-blue-900 mb-1">
                  Leyenda / Pie de foto (opcional)
                </label>
                <input
                  type="text"
                  value={imageData.caption || ''}
                  onChange={(e) => updateImageData('caption', e.target.value)}
                  placeholder="Texto que se mostrará debajo de la imagen"
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <p className="text-xs text-blue-700 mt-1">
                  Opcional. Se mostrará como pie de foto si está presente.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Arrastra una imagen aquí o haz click para seleccionar
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Máximo 2MB · Se comprimirá automáticamente si es necesario
          </p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || compressing}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {compressing ? 'Comprimiendo...' : uploading ? 'Subiendo...' : 'Seleccionar archivo'}
            </button>
            <button
              type="button"
              onClick={handleShowGallery}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ImageIcon size={16} className="inline mr-2" />
              Galería
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

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
                  <X size={20} />
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
                  {galleryImages.map((image) => (
                    <button
                      key={image.name}
                      type="button"
                      onClick={() => handleSelectFromGallery(image.url, image.name)}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
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
    </div>
  );
}