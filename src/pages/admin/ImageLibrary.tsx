import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImagePlus, Trash2, Search, Copy, Check, X } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { uploadAPI } from '../../utils/api';
import { projectId } from '../../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0ba58e95`;

interface ImageMetadata {
  fileName: string;
  filePath: string;
  url: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export function ImageLibrary() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await uploadAPI.getImagesWithMetadata();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar los 10MB');
      return;
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos JPG, PNG, GIF y WebP');
      return;
    }

    setUploading(true);
    try {
      await uploadAPI.uploadImage(file);
      await loadImages();
      alert('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (image: ImageMetadata) => {
    if (!confirm(`¿Estás seguro de eliminar "${image.originalName}"?`)) {
      return;
    }

    try {
      await uploadAPI.deleteImage(image.fileName);
      await loadImages();
      alert('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error al eliminar la imagen');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredImages = images.filter(img =>
    img.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Biblioteca de Imágenes</h1>
          <p className="text-foreground/60">
            {images.length} {images.length === 1 ? 'imagen' : 'imágenes'} subidas
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
          <ImagePlus size={20} />
          <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
          <input
            type="text"
            placeholder="Buscar imágenes por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <ImagePlus className="mx-auto mb-4 text-foreground/40" size={48} />
          <p className="text-foreground/60">
            {searchTerm ? 'No se encontraron imágenes' : 'No hay imágenes subidas'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <motion.div
              key={image.fileName}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden group"
            >
              {/* Image Preview */}
              <div 
                className="aspect-square bg-muted relative cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <ImageWithFallback
                  src={image.url}
                  alt={image.originalName}
                  className="w-full h-full object-cover"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(image.url);
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Copiar URL"
                  >
                    {copiedUrl === image.url ? (
                      <Check size={20} className="text-white" />
                    ) : (
                      <Copy size={20} className="text-white" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image);
                    }}
                    className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-3">
                <p className="text-sm truncate mb-1" title={image.originalName}>
                  {image.originalName}
                </p>
                <p className="text-xs text-foreground/60">
                  {formatFileSize(image.size)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-foreground/10 flex items-center justify-between">
              <h3 className="text-xl">Detalles de la imagen</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Preview */}
              <div className="mb-6 bg-muted rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={selectedImage.url}
                  alt={selectedImage.originalName}
                  className="w-full max-h-96 object-contain"
                />
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground/60 mb-1">Nombre</label>
                  <p className="break-all">{selectedImage.originalName}</p>
                </div>

                <div>
                  <label className="block text-sm text-foreground/60 mb-1">Tamaño</label>
                  <p>{formatFileSize(selectedImage.size)}</p>
                </div>

                <div>
                  <label className="block text-sm text-foreground/60 mb-1">Tipo</label>
                  <p>{selectedImage.type}</p>
                </div>

                <div>
                  <label className="block text-sm text-foreground/60 mb-1">Subida</label>
                  <p>{formatDate(selectedImage.uploadedAt)}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-foreground/60 mb-1">URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedImage.url}
                      readOnly
                      className="flex-1 px-3 py-2 border border-foreground/20 rounded-lg bg-muted text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedImage.url)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      {copiedUrl === selectedImage.url ? (
                        <>
                          <Check size={16} />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-foreground/10 flex justify-end gap-3">
              <button
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 border border-foreground/20 rounded-lg hover:bg-muted transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedImage);
                  setSelectedImage(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}