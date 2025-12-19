import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { settingsAPI, uploadAPI } from '../../utils/api';
import { Save, AlertCircle, CheckCircle, Upload, X, Plus, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { InstagramImageManager } from '../../components/InstagramImageManager';
import { NavigationBlocker } from '../../components/NavigationBlocker';

export function SettingsManager() {
  const [settings, setSettings] = useState<any>({});
  const [initialSettingsSnapshot, setInitialSettingsSnapshot] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingInstagram, setUploadingInstagram] = useState(false);

  // Detectar cambios no guardados
  useEffect(() => {
    const currentSnapshot = JSON.stringify(settings);
    if (initialSettingsSnapshot && currentSnapshot !== initialSettingsSnapshot) {
      setHasUnsavedChanges(true);
    } else if (initialSettingsSnapshot) {
      setHasUnsavedChanges(false);
    }
  }, [settings, initialSettingsSnapshot]);

  // Prevenir cierre de ventana con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.settings);
      setInitialSettingsSnapshot(JSON.stringify(response.settings));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await settingsAPI.saveSettings(settings);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      setInitialSettingsSnapshot(JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleImageUpload = async (field: string, file: File, setUploading: (val: boolean) => void) => {
    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      updateField(field, response.url);
      setMessage({ type: 'success', text: 'Imagen subida correctamente. No olvides guardar los cambios.' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Error al subir la imagen' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (field: string, setUploading: (val: boolean) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(field, file, setUploading);
      }
    };
    input.click();
  };

  const handleInstagramImageUpload = async (file: File) => {
    setUploadingInstagram(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const currentImages = settings.instagramImages || [];
      const newImage = {
        url: response.url,
        title: '',
        description: '',
        source: 'OKA // INSTAGRAM',
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
      };
      updateField('instagramImages', [...currentImages, newImage]);
      setMessage({ type: 'success', text: 'Imagen agregada al carrusel. No olvides guardar los cambios.' });
    } catch (error) {
      console.error('Error uploading Instagram image:', error);
      setMessage({ type: 'error', text: 'Error al subir la imagen' });
    } finally {
      setUploadingInstagram(false);
    }
  };

  const handleInstagramImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        handleInstagramImageUpload(file);
      }
    };
    input.click();
  };

  const removeInstagramImage = (index: number) => {
    const currentImages = settings.instagramImages || [];
    const newImages = currentImages.filter((_: any, i: number) => i !== index);
    updateField('instagramImages', newImages);
  };

  const updateInstagramImageMeta = (index: number, field: string, value: string) => {
    const currentImages = settings.instagramImages || [];
    const updatedImages = [...currentImages];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    updateField('instagramImages', updatedImages);
  };

  const replaceInstagramImage = async (index: number, file: File) => {
    setUploadingInstagram(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const currentImages = settings.instagramImages || [];
      const updatedImages = [...currentImages];
      const currentImage = typeof updatedImages[index] === 'string' 
        ? { url: updatedImages[index], title: '', description: '', source: 'OKA // INSTAGRAM', date: '' }
        : updatedImages[index];
      
      updatedImages[index] = {
        ...currentImage,
        url: response.url
      };
      updateField('instagramImages', updatedImages);
      setMessage({ type: 'success', text: 'Imagen reemplazada correctamente. No olvides guardar los cambios.' });
    } catch (error) {
      console.error('Error replacing Instagram image:', error);
      setMessage({ type: 'error', text: 'Error al reemplazar la imagen' });
    } finally {
      setUploadingInstagram(false);
    }
  };

  const handleReplaceInstagramImage = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        replaceInstagramImage(index, file);
      }
    };
    input.click();
  };

  const selectFromGalleryForInstagram = async (index: number, url: string) => {
    const currentImages = settings.instagramImages || [];
    const updatedImages = [...currentImages];
    const currentImage = typeof updatedImages[index] === 'string' 
      ? { url: updatedImages[index], title: '', description: '', source: 'OKA // INSTAGRAM', date: '' }
      : updatedImages[index];
    
    updatedImages[index] = {
      ...currentImage,
      url: url
    };
    updateField('instagramImages', updatedImages);
    setMessage({ type: 'success', text: 'Imagen seleccionada desde la galería. No olvides guardar los cambios.' });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl mb-8">Configuración del Sitio</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Información General</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Nombre del Sitio</label>
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={(e) => updateField('siteName', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Descripción del Sitio</label>
              <textarea
                value={settings.siteDescription || ''}
                onChange={(e) => updateField('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Imágenes Hero del Home</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Personaliza las imágenes de fondo del Hero en la página principal. Haz clic sobre las imágenes para agregar información SEO.
          </p>
          
          <div className="space-y-6">
            {/* Desktop Hero Image */}
            <ImageUploader
              currentImage={typeof settings.heroImageDesktop === 'string' ? settings.heroImageDesktop : settings.heroImageDesktop?.url || ''}
              onImageSelect={(data) => {
                if (typeof data === 'string') {
                  updateField('heroImageDesktop', { url: data, alt: '', description: '' });
                } else {
                  updateField('heroImageDesktop', data);
                }
              }}
              label="Imagen Hero Desktop (recomendado: 1920x1080px o superior)"
              withMetadata={true}
              initialAlt={typeof settings.heroImageDesktop === 'object' ? settings.heroImageDesktop?.alt || '' : ''}
              initialDescription={typeof settings.heroImageDesktop === 'object' ? settings.heroImageDesktop?.description || '' : ''}
            />

            {/* Mobile Hero Image */}
            <ImageUploader
              currentImage={typeof settings.heroImageMobile === 'string' ? settings.heroImageMobile : settings.heroImageMobile?.url || ''}
              onImageSelect={(data) => {
                if (typeof data === 'string') {
                  updateField('heroImageMobile', { url: data, alt: '', description: '' });
                } else {
                  updateField('heroImageMobile', data);
                }
              }}
              label="Imagen Hero Mobile (recomendado: 768x1024px o superior, orientación vertical)"
              withMetadata={true}
              initialAlt={typeof settings.heroImageMobile === 'object' ? settings.heroImageMobile?.alt || '' : ''}
              initialDescription={typeof settings.heroImageMobile === 'object' ? settings.heroImageMobile?.description || '' : ''}
            />

            {/* Hero Text Image 1 */}
            <ImageUploader
              currentImage={typeof settings.heroTextImage1 === 'string' ? settings.heroTextImage1 : settings.heroTextImage1?.url || ''}
              onImageSelect={(data) => {
                if (typeof data === 'string') {
                  updateField('heroTextImage1', { url: data, alt: '', description: '' });
                } else {
                  updateField('heroTextImage1', data);
                }
              }}
              label="Imagen de Texto del Hero 1 (recomendado: PNG transparente)"
              withMetadata={true}
              initialAlt={typeof settings.heroTextImage1 === 'object' ? settings.heroTextImage1?.alt || '' : ''}
              initialDescription={typeof settings.heroTextImage1 === 'object' ? settings.heroTextImage1?.description || '' : ''}
            />

            {/* Hero Text Image 2 */}
            <ImageUploader
              currentImage={typeof settings.heroTextImage2 === 'string' ? settings.heroTextImage2 : settings.heroTextImage2?.url || ''}
              onImageSelect={(data) => {
                if (typeof data === 'string') {
                  updateField('heroTextImage2', { url: data, alt: '', description: '' });
                } else {
                  updateField('heroTextImage2', data);
                }
              }}
              label="Imagen de Texto del Hero 2 (opcional, para efecto fade)"
              withMetadata={true}
              initialAlt={typeof settings.heroTextImage2 === 'object' ? settings.heroTextImage2?.alt || '' : ''}
              initialDescription={typeof settings.heroTextImage2 === 'object' ? settings.heroTextImage2?.description || '' : ''}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>💡 Efecto Fade:</strong> Si subes ambas imágenes de texto, se mostrará un efecto de transición automática cada 5 segundos entre ellas. Si solo subes la primera imagen, se mostrará sin animación.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Imagen Hero del Blog</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Imagen de portada que se mostrará en la cabecera de la página del Blog
          </p>
          
          <div className="space-y-6">
            <ImageUploader
              currentImage={typeof settings.blogHeroImage === 'string' ? settings.blogHeroImage : settings.blogHeroImage?.url || ''}
              onImageSelect={(data) => {
                if (typeof data === 'string') {
                  updateField('blogHeroImage', { url: data, alt: '', description: '' });
                } else {
                  updateField('blogHeroImage', data);
                }
              }}
              label="Imagen Hero del Blog (recomendado: 1920x600px o superior)"
              withMetadata={true}
              initialAlt={typeof settings.blogHeroImage === 'object' ? settings.blogHeroImage?.alt || '' : ''}
              initialDescription={typeof settings.blogHeroImage === 'object' ? settings.blogHeroImage?.description || '' : ''}
            />
            
            <ImageUploader
              currentImage={typeof settings.blogTitleImage === 'string' ? settings.blogTitleImage : settings.blogTitleImage?.url || ''}
              onImageSelect={(data) => {
                if (typeof data === 'string') {
                  updateField('blogTitleImage', { url: data, alt: '', description: '' });
                } else {
                  updateField('blogTitleImage', data);
                }
              }}
              label="Imagen de Título del Blog (opcional - PNG transparente que reemplaza el texto)"
              withMetadata={true}
              initialAlt={typeof settings.blogTitleImage === 'object' ? settings.blogTitleImage?.alt || '' : ''}
              initialDescription={typeof settings.blogTitleImage === 'object' ? settings.blogTitleImage?.description || '' : ''}
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>💡 Imagen de Título:</strong> Si subes una imagen de título (PNG transparente recomendado), esta reemplazará el texto "Blog" en el hero. Si no se sube, se mostrará el texto normal.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">SEO Global</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Meta Título por Defecto</label>
              <input
                type="text"
                value={settings.seoTitle || ''}
                onChange={(e) => updateField('seoTitle', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Máximo 60 caracteres recomendados
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2">Meta Descripción por Defecto</label>
              <textarea
                value={settings.seoDescription || ''}
                onChange={(e) => updateField('seoDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Máximo 160 caracteres recomendados
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2">Palabras Clave por Defecto</label>
              <input
                type="text"
                value={settings.seoKeywords || ''}
                onChange={(e) => updateField('seoKeywords', e.target.value)}
                placeholder="Separadas por comas"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <ImageUploader
              currentImage={settings.ogImage || ''}
              onImageSelect={(url) => updateField('ogImage', url)}
              label="Imagen Open Graph por Defecto (se muestra al compartir en redes sociales)"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Carrusel de Instagram</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Configura el carrusel de imágenes de Instagram que aparece en la página principal
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Título del Carrusel</label>
              <textarea
                value={settings.instagramTitle || ''}
                onChange={(e) => updateField('instagramTitle', e.target.value)}
                placeholder="Y TÚ, ¿CUÁNDO TUVISTE TU ÚLTIMA IDEA?"
                rows={3}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Handle de Instagram</label>
              <input
                type="text"
                value={settings.instagramHandle || ''}
                onChange={(e) => updateField('instagramHandle', e.target.value)}
                placeholder="@casarosier"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Enlace de Instagram</label>
              <input
                type="url"
                value={settings.instagramLink || ''}
                onChange={(e) => updateField('instagramLink', e.target.value)}
                placeholder="https://instagram.com/casarosier"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Imágenes del Carrusel</label>
              <p className="text-xs text-foreground/60 mb-3">
                Agrega imágenes que se mostrarán en el carrusel con información detallada para el lightbox
              </p>

              {/* Image Cards with Metadata */}
              {settings.instagramImages && settings.instagramImages.length > 0 && (
                <div className="space-y-4 mb-4">
                  {settings.instagramImages.map((image: any, index: number) => (
                    <InstagramImageManager
                      key={index}
                      image={image}
                      index={index}
                      onImageReplace={(url) => selectFromGalleryForInstagram(index, url)}
                      onImageDelete={() => removeInstagramImage(index)}
                      onMetaUpdate={(field, value) => updateInstagramImageMeta(index, field, value)}
                    />
                  ))}
                </div>
              )}

              <motion.button
                onClick={handleInstagramImageSelect}
                disabled={uploadingInstagram}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                whileHover={{ scale: uploadingInstagram ? 1 : 1.02 }}
                whileTap={{ scale: uploadingInstagram ? 1 : 0.98 }}
              >
                <Plus className="w-4 h-4" />
                {uploadingInstagram ? 'Subiendo...' : 'Agregar Imagen'}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Contacto</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email de Contacto</label>
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Los mensajes del formulario de contacto se enviarán a este email
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2">Teléfono de Contacto</label>
              <input
                type="tel"
                value={settings.contactPhone || ''}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Métodos de Pago</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Selecciona los métodos de pago que aceptas en tus clases y workshops
          </p>
          
          <div className="space-y-3">
            {[
              { id: 'transferencia', label: 'Transferencia bancaria' },
              { id: 'paypal', label: 'PayPal' },
              { id: 'tarjeta', label: 'Tarjeta de crédito' },
              { id: 'efectivo', label: 'Efectivo' },
              { id: 'bizum', label: 'Bizum' },
            ].map((method) => (
              <label key={method.id} className="flex items-center gap-3 p-3 border border-foreground/10 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods?.[method.id] || false}
                  onChange={(e) => {
                    const current = settings.paymentMethods || {};
                    updateField('paymentMethods', {
                      ...current,
                      [method.id]: e.target.checked
                    });
                  }}
                  className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded"
                />
                <span className="text-sm">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </motion.button>
        </div>
      </div>

      {/* Bloqueador de navegación */}
      <NavigationBlocker
        when={hasUnsavedChanges}
        onSave={async () => {
          await handleSave();
        }}
        onDiscard={() => {
          setHasUnsavedChanges(false);
        }}
      />
    </div>
  );
}