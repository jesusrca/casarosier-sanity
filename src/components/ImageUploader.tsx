import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, Edit } from 'lucide-react';
import { uploadAPI } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';
import imageCompression from 'browser-image-compression';
import { ImageMetadataLightbox } from './ImageMetadataLightbox';

interface ImageUploaderProps {
  currentImage?: string;
  onImageSelect: (url: string | { url: string; alt: string; description: string }) => void;
  label?: string;
  compact?: boolean; // Para mostrar en formato compacto cuando hay múltiples imágenes
  withMetadata?: boolean; // Si true, devuelve objeto con metadata en lugar de solo URL
  initialAlt?: string;
  initialDescription?: string;
  aspectRatio?: string; // Proporción ideal recomendada (ej: "16:9", "1:1", "4:3")
}

export function ImageUploader({ currentImage, onImageSelect, label = 'Imagen', compact = false, withMetadata = false, initialAlt = '', initialDescription = '', aspectRatio = '16:9' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showMetadataLightbox, setShowMetadataLightbox] = useState(false);
  const [alt, setAlt] = useState(initialAlt);
  const [description, setDescription] = useState(initialDescription);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPreview(response.url);
      if (withMetadata) {
        onImageSelect({ url: response.url, alt: initialAlt, description: initialDescription });
      } else {
        onImageSelect(response.url);
      }
      
      // Cerrar el modal de galería y recargar imágenes si está abierto
      if (showGallery) {
        setShowGallery(false);
        // Opcional: recargar galería en segundo plano para futuros usos
        setTimeout(() => loadGallery(), 500);
      }
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

  const handleSelectFromGallery = (url: string) => {
    setPreview(url);
    if (withMetadata) {
      onImageSelect({ url: url, alt: initialAlt, description: initialDescription });
    } else {
      onImageSelect(url);
    }
    setShowGallery(false);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveMetadata = (newAlt: string, newDescription: string) => {
    setAlt(newAlt);
    setDescription(newDescription);
    if (withMetadata && preview) {
      onImageSelect({ url: preview, alt: newAlt, description: newDescription });
    }
  };

  const handleImageClick = () => {
    if (withMetadata && preview) {
      setShowMetadataLightbox(true);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-foreground/80">{label}</label>
        {aspectRatio && (
          <p className="text-xs text-primary/70 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Proporción ideal: {aspectRatio}</span>
          </p>
        )}
      </div>
      
      {preview ? (
        <div className="space-y-2">
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className={`w-full object-cover rounded-lg border-2 ${withMetadata ? 'border-primary/30 cursor-pointer hover:border-primary' : 'border-gray-300'} ${compact ? 'h-24' : 'h-48'} transition-all`}
              onClick={handleImageClick}
            />
            {withMetadata && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
                  <Edit size={16} className="text-primary" />
                  <span className="text-sm font-medium">Editar info SEO</span>
                </div>
              </div>
            )}
            {withMetadata && (alt || description) && (
              <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs flex items-center gap-1 shadow-md">
                <Edit size={12} />
                SEO
              </div>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShowGallery}
              disabled={uploading || compressing}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              <RefreshCw size={14} />
              <span>Cambiar</span>
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              title="Eliminar imagen"
            >
              <Trash2 size={14} />
              <span>Eliminar</span>
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
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-4">
            {compressing ? 'Comprimiendo imagen...' : uploading ? 'Subiendo imagen...' : 'Selecciona una imagen desde la galería'}
          </p>
          <button
            type="button"
            onClick={handleShowGallery}
            disabled={uploading || compressing}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {compressing ? 'Comprimiendo...' : uploading ? 'Subiendo...' : 'Establecer imagen'}
          </button>
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

              {/* Botón de subir desde computadora */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || compressing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Upload size={18} className={compressing ? 'animate-spin' : ''} />
                  <span>
                    {compressing ? 'Comprimiendo imagen...' : uploading ? 'Subiendo imagen...' : 'Subir desde computadora'}
                  </span>
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
                      onClick={() => handleSelectFromGallery(image.url)}
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

      {/* Metadata Lightbox */}
      <ImageMetadataLightbox
        isOpen={showMetadataLightbox}
        imageUrl={preview || ''}
        initialAlt={alt}
        initialDescription={description}
        onClose={() => setShowMetadataLightbox(false)}
        onSave={handleSaveMetadata}
      />
    </div>
  );
}