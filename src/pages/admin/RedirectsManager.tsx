import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { settingsAPI } from '../../utils/api';
import { Save, AlertCircle, CheckCircle, Plus, Trash2, ArrowRight, Info } from 'lucide-react';

interface Redirect {
  from: string;
  to: string;
  type: '301' | '302';
}

export function RedirectsManager() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Detectar cambios no guardados
  useEffect(() => {
    const currentSnapshot = JSON.stringify(redirects);
    if (initialSnapshot && currentSnapshot !== initialSnapshot) {
      setHasUnsavedChanges(true);
    } else if (initialSnapshot) {
      setHasUnsavedChanges(false);
    }
  }, [redirects, initialSnapshot]);

  // Prevenir cierre de ventana con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    loadRedirects();
  }, []);

  const loadRedirects = async () => {
    try {
      const response = await settingsAPI.getSettings();
      const loadedRedirects = response.settings.redirects || [];
      setRedirects(loadedRedirects);
      setInitialSnapshot(JSON.stringify(loadedRedirects));
    } catch (error) {
      console.error('Error loading redirects:', error);
      setMessage({ type: 'error', text: 'Error al cargar las redirecciones' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Validar redirecciones antes de guardar
      const invalidRedirects = redirects.filter(r => !r.from || !r.to);
      if (invalidRedirects.length > 0) {
        setMessage({ type: 'error', text: 'Todas las redirecciones deben tener URL de origen y destino' });
        setSaving(false);
        return;
      }

      // Validar que las URLs comiencen con /
      const invalidUrls = redirects.filter(r => !r.from.startsWith('/') || !r.to.startsWith('/'));
      if (invalidUrls.length > 0) {
        setMessage({ type: 'error', text: 'Todas las URLs deben comenzar con "/" (ejemplo: /pagina)' });
        setSaving(false);
        return;
      }

      // Obtener configuración actual
      const currentSettings = await settingsAPI.getSettings();
      
      // Actualizar solo las redirecciones
      await settingsAPI.saveSettings({
        ...currentSettings.settings,
        redirects: redirects
      });

      setMessage({ type: 'success', text: 'Redirecciones guardadas correctamente' });
      setInitialSnapshot(JSON.stringify(redirects));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving redirects:', error);
      setMessage({ type: 'error', text: 'Error al guardar las redirecciones' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const addRedirect = () => {
    setRedirects([...redirects, { from: '', to: '', type: '301' }]);
  };

  const removeRedirect = (index: number) => {
    setRedirects(redirects.filter((_, i) => i !== index));
  };

  const updateRedirect = (index: number, field: keyof Redirect, value: string) => {
    const newRedirects = [...redirects];
    newRedirects[index] = { ...newRedirects[index], [field]: value };
    setRedirects(newRedirects);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Redirecciones de URLs</h1>
          <p className="text-foreground/60">
            Gestiona las redirecciones permanentes de URLs antiguas a nuevas
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasUnsavedChanges}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} />
              Guardar {hasUnsavedChanges && '*'}
            </>
          )}
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {hasUnsavedChanges && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
          <AlertCircle size={20} />
          <span>Tienes cambios sin guardar. No olvides hacer clic en "Guardar" antes de salir.</span>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">¿Qué son las redirecciones?</p>
            <p className="mb-2">
              Las redirecciones permiten enviar automáticamente a los visitantes desde una URL antigua a una nueva. 
              Esto es útil cuando cambias la estructura de tu sitio web y quieres mantener el SEO y evitar errores 404.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs mt-2">
              <li><strong>301 (Permanente)</strong>: Le dice a Google que la página se movió permanentemente. Transfiere el valor SEO.</li>
              <li><strong>302 (Temporal)</strong>: Le dice a Google que la página se movió temporalmente. No transfiere el valor SEO.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lista de Redirecciones */}
      <div className="space-y-4 mb-6">
        {redirects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ArrowRight className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg mb-2">No hay redirecciones configuradas</h3>
            <p className="text-foreground/60 mb-6">
              Comienza agregando tu primera redirección para mantener el SEO al cambiar URLs
            </p>
            <button
              onClick={addRedirect}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
            >
              <Plus className="w-5 h-5" />
              Agregar Primera Redirección
            </button>
          </div>
        ) : (
          <>
            {redirects.map((redirect, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Redirección #{index + 1}</h3>
                  <button
                    onClick={() => removeRedirect(index)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar redirección"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL Antigua <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={redirect.from}
                      onChange={(e) => updateRedirect(index, 'from', e.target.value)}
                      placeholder="/antigua-pagina"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-foreground/60 mt-1">
                      Ejemplo: /old-page, /blog/old-post
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL Nueva <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={redirect.to}
                      onChange={(e) => updateRedirect(index, 'to', e.target.value)}
                      placeholder="/nueva-pagina"
                      className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-foreground/60 mt-1">
                      Ejemplo: /new-page, /blog/new-post
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Redirección</label>
                  <select
                    value={redirect.type}
                    onChange={(e) => updateRedirect(index, 'type', e.target.value as '301' | '302')}
                    className="w-full md:w-auto px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="301">301 - Permanente (recomendado para SEO)</option>
                    <option value="302">302 - Temporal</option>
                  </select>
                </div>

                {/* Preview */}
                <div className="mt-4 p-3 bg-foreground/5 rounded-lg flex items-center gap-2 text-sm">
                  <span className="text-foreground/60">Vista previa:</span>
                  <code className="text-primary">{redirect.from || '/ejemplo'}</code>
                  <ArrowRight className="w-4 h-4 text-foreground/40" />
                  <code className="text-primary">{redirect.to || '/destino'}</code>
                  <span className="ml-auto text-foreground/60">({redirect.type})</span>
                </div>
              </motion.div>
            ))}

            <button
              onClick={addRedirect}
              className="w-full py-4 px-6 border-2 border-dashed border-foreground/20 rounded-lg text-foreground/60 hover:text-foreground hover:border-foreground/40 hover:bg-foreground/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Nueva Redirección
            </button>
          </>
        )}
      </div>

      {/* Tips Section */}
      {redirects.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-medium mb-3">💡 Consejos y Buenas Prácticas</h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Todas las URLs deben comenzar con <code className="bg-foreground/10 px-1 rounded">/</code> (ejemplo: <code className="bg-foreground/10 px-1 rounded">/antigua-pagina</code>)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Usa redirecciones <strong>301</strong> cuando el cambio es permanente - esto ayuda al SEO</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Evita cadenas de redirecciones (A → B → C). Mejor: redirecciona directamente de A → C</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Las redirecciones se aplican automáticamente en toda la web después de guardar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Revisa regularmente tus redirecciones y elimina las que ya no sean necesarias</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
