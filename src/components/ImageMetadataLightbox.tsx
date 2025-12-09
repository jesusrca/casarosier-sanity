import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';

interface ImageMetadataLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  initialAlt?: string;
  initialDescription?: string;
  onClose: () => void;
  onSave: (alt: string, description: string) => void;
}

export function ImageMetadataLightbox({
  isOpen,
  imageUrl,
  initialAlt = '',
  initialDescription = '',
  onClose,
  onSave
}: ImageMetadataLightboxProps) {
  const [alt, setAlt] = useState(initialAlt);
  const [description, setDescription] = useState(initialDescription);

  // Update local state when props change
  useEffect(() => {
    setAlt(initialAlt);
    setDescription(initialDescription);
  }, [initialAlt, initialDescription, isOpen]);

  const handleSave = () => {
    onSave(alt, description);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
        onClick={onClose}
        onKeyDown={handleKeyDown}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
            <h3 className="text-xl font-semibold">Editar Información SEO de la Imagen</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={imageUrl}
                alt={alt || 'Preview'}
                className="w-full max-h-96 object-contain bg-gray-50"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto Alternativo (Alt Text) *
                </label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe la imagen de forma clara y concisa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Importante para SEO y accesibilidad. Describe qué se ve en la imagen (ej: "Taller de cerámica con piezas de arcilla")
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción / Caption (Opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Añade contexto adicional o información sobre la imagen"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Información adicional que se puede mostrar como pie de foto (ej: "Clase de iniciación - Febrero 2024")
                </p>
              </div>
            </div>

            {/* SEO Tips */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
              <h4 className="font-semibold text-sm mb-2 text-gray-800">💡 Consejos para SEO</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• El texto alternativo debe ser descriptivo pero conciso (máx. 125 caracteres)</li>
                <li>• Incluye palabras clave relevantes de forma natural</li>
                <li>• No empieces con "Imagen de..." o "Foto de...", ve directo al punto</li>
                <li>• Para decorativas o repetidas, puedes dejar el alt vacío</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={16} />
              Guardar Cambios
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
