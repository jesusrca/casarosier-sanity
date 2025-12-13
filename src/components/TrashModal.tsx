import { motion } from 'motion/react';
import { X, RotateCcw, Trash } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TrashModalProps {
  trashedItems: any[];
  onRestore: (item: any) => void;
  onPermanentDelete: (item: any) => void;
  onClose: () => void;
}

export function TrashModal({ trashedItems, onRestore, onPermanentDelete, onClose }: TrashModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl mb-1">Papelera</h2>
            <p className="text-sm text-foreground/60">
              {trashedItems.length} {trashedItems.length === 1 ? 'elemento eliminado' : 'elementos eliminados'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {trashedItems.length === 0 ? (
            <div className="text-center py-12">
              <Trash className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60 mb-2">La papelera está vacía</p>
              <p className="text-sm text-foreground/40">
                Los elementos eliminados aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {trashedItems.map((item, index) => (
                <motion.div
                  key={`trash-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-foreground/5 rounded-lg p-4 flex items-center gap-4"
                >
                  {item.images?.[0] && (
                    <ImageWithFallback
                      src={item.images[0]}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="mb-1">{item.title}</h3>
                    <p className="text-sm text-foreground/60">{item.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          item.type === 'class'
                            ? 'bg-blue-100 text-blue-700'
                            : item.type === 'workshop'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.type === 'class' ? 'Clase' : item.type === 'workshop' ? 'Workshop' : 'Privada'}
                      </span>
                      <span className="text-xs text-foreground/40">
                        Eliminado {item.deletedDate ? new Date(item.deletedDate).toLocaleDateString() : 'recientemente'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onRestore(item)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      title="Restaurar"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Restaurar</span>
                    </button>
                    <button
                      onClick={() => onPermanentDelete(item)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      title="Eliminar permanentemente"
                    >
                      <Trash className="w-4 h-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {trashedItems.length > 0 && (
          <div className="p-4 border-t border-foreground/10 bg-foreground/5">
            <p className="text-sm text-foreground/60 text-center">
              Los elementos permanecen en la papelera hasta que los restaures o los elimines permanentemente
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
