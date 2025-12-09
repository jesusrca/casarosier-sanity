import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, RotateCcw, X, Clock, Loader2 } from 'lucide-react';
import { historyAPI } from '../utils/api';

interface Version {
  versionId: string;
  savedAt: string;
  title: string;
  [key: string]: any;
}

interface VersionHistoryProps {
  itemId: string | undefined;
  onRestore: (version: any) => void;
}

export function VersionHistory({ itemId, onRestore }: VersionHistoryProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (showHistory && itemId) {
      loadHistory();
    }
  }, [showHistory, itemId]);

  const loadHistory = async () => {
    if (!itemId) return;
    
    try {
      setLoading(true);
      const response = await historyAPI.getHistory(itemId);
      setVersions(response.versions || []);
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: Version) => {
    if (!itemId) return;
    
    if (!confirm(`¿Restaurar esta versión guardada el ${formatDate(version.savedAt)}?`)) {
      return;
    }

    try {
      setRestoring(version.versionId);
      const response = await historyAPI.restoreVersion(itemId, version.versionId);
      
      if (response.success) {
        // Notificar al componente padre
        onRestore(response.item);
        
        // Mostrar mensaje de éxito
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
        successMessage.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Versión restaurada exitosamente</span>
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
        
        setShowHistory(false);
        loadHistory();
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('Error al restaurar la versión');
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!itemId) {
    return null;
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setShowHistory(true)}
        className="flex items-center gap-2 px-4 py-2 bg-foreground/5 text-foreground hover:bg-foreground/10 rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <History className="w-5 h-5" />
        Historial de versiones
      </motion.button>

      <AnimatePresence>
        {showHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 max-w-3xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-foreground/10">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-2xl">Historial de versiones</h2>
                    <p className="text-sm text-foreground/60">Últimos 30 días</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-foreground/60">Cargando historial...</p>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
                    <p className="text-foreground/60 mb-2">No hay versiones guardadas</p>
                    <p className="text-sm text-foreground/40">
                      Las versiones se guardan automáticamente cada vez que editas el contenido
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((version, index) => (
                      <motion.div
                        key={version.versionId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-foreground/10 rounded-lg p-4 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-foreground/40" />
                              <span className="text-sm text-foreground/60">
                                {formatDate(version.savedAt)}
                              </span>
                            </div>
                            <h3 className="font-medium mb-1">{version.title}</h3>
                            <p className="text-sm text-foreground/60 line-clamp-2">
                              {version.subtitle || version.shortDescription || 'Sin descripción'}
                            </p>
                            {version.visible !== undefined && (
                              <div className="mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  version.visible 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {version.visible ? 'Visible' : 'Borrador'}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRestore(version)}
                            disabled={restoring !== null}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {restoring === version.versionId ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Restaurando...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-4 h-4" />
                                Restaurar
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
