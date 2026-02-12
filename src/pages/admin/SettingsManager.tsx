import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { settingsAPI, uploadAPI, contentAPI } from '../../utils/api';
import { Save, AlertCircle, CheckCircle, Upload, X, Plus, Trash2, RefreshCw, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { InstagramImageManager } from '../../components/InstagramImageManager';
import { NavigationBlocker } from '../../components/NavigationBlocker';
import { useContent } from '../../contexts/ContentContext';

export function SettingsManager() {
  const { classes, workshops, refreshContent } = useContent();
  const [settings, setSettings] = useState<any>({});
  const [initialSettingsSnapshot, setInitialSettingsSnapshot] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingInstagram, setUploadingInstagram] = useState(false);
  
  // Estado para modal de galería al agregar imagen de Instagram
  const [showInstagramGallery, setShowInstagramGallery] = useState(false);
  const [instagramGalleryImages, setInstagramGalleryImages] = useState<any[]>([]);
  const [loadingInstagramGallery, setLoadingInstagramGallery] = useState(false);
  
  // Estado local para el orden de items destacados
  const [featuredOrder, setFeaturedOrder] = useState<{
    courses: string[];
    workshops: string[];
  }>({ courses: [], workshops: [] });

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

  // Inicializar el orden de items destacados cuando se carga el contenido
  useEffect(() => {
    if (classes.length > 0 || workshops.length > 0) {
      const courses = getFeaturedCourses();
      const workshopsItems = getFeaturedWorkshops();
      
      setFeaturedOrder({
        courses: courses.map((item: any) => item.id),
        workshops: workshopsItems.map((item: any) => item.id)
      });
    }
  }, [classes, workshops]);

  const loadSettings = async () => {
    try {
      console.log('SettingsManager - Cargando settings...');
      const response = await settingsAPI.getSettings();
      console.log('SettingsManager - Response:', response);
      console.log('SettingsManager - Settings:', response.settings);
      
      // También cargar las imágenes disponibles para informar al usuario
      try {
        const imagesResponse = await uploadAPI.getImages();
        console.log('SettingsManager - Imágenes disponibles en storage:', imagesResponse.images?.length || 0);
        if (imagesResponse.images && imagesResponse.images.length > 0) {
          console.log('✅ Tus imágenes subidas anteriormente siguen disponibles en la galería');
        }
      } catch (err) {
        console.log('No se pudieron cargar las imágenes del storage');
      }
      
      // Inicializar settings con valores por defecto si están vacíos
      const defaultSettings = {
        siteName: 'Casa Rosier',
        siteDescription: 'Taller de cerámica en Barcelona',
        seoTitle: 'Casa Rosier - Taller de Cerámica en Barcelona',
        seoDescription: 'Descubre la cerámica en Casa Rosier. Clases, workshops y espacios para eventos en Barcelona.',
        seoKeywords: 'cerámica, Barcelona, taller, clases, workshops, torno',
        ogImage: '',
        ogUrl: 'https://casarosierceramica.com',
        ogType: 'website',
        ogTitle: '',
        ogDescription: '',
        contactEmail: 'info@casarosierceramica.com',
        contactEmail2: '',
        contactPhone: '+34 633788860',
        whatsappNumber: '34633788860',
        heroImageDesktop: '',
        heroImageMobile: '',
        heroTextImage1: '',
        heroTextImage2: '',
        blogHeroImage: '',
        blogTitleImage: '',
        clasesHeroTitleImage: '',
        homeCoursesDescription: '',
        homeWorkshopsDescription: '',
        instagramTitle: 'Y TÚ, ¿CUÁNDO TUVISTE TU ÚLTIMA IDEA?',
        instagramHandle: '@casarosier',
        instagramLink: 'https://instagram.com/casarosier',
        instagramImages: [],
        googleAnalyticsId: '',
        paymentMethods: {
          transferencia: false,
          paypal: false,
          tarjeta: false,
          efectivo: false,
          bizum: false
        },
        landingPages: []
      };
      
      // Verificar si faltan campos importantes
      const needsDefaultSettings = !response.settings.siteName || 
                                   !response.settings.contactEmail || 
                                   response.settings.instagramImages === undefined;
      
      // Combinar settings por defecto con los existentes (preservar landingPages y otros datos existentes)
      const mergedSettings = {
        ...defaultSettings,
        ...response.settings,
        // Asegurar que paymentMethods tenga estructura correcta
        paymentMethods: {
          ...defaultSettings.paymentMethods,
          ...(response.settings.paymentMethods || {})
        }
      };
      
      console.log('SettingsManager - Settings combinados con defaults:', mergedSettings);
      console.log('SettingsManager - ¿Necesita valores por defecto?:', needsDefaultSettings);
      
      setSettings(mergedSettings);
      setInitialSettingsSnapshot(JSON.stringify(mergedSettings));
      
      // Si necesitamos valores por defecto, mostrar un mensaje explicativo
      if (needsDefaultSettings) {
        setMessage({ 
          type: 'error', 
          text: '⚠️ La restauración borró la configuración guardada. BUENAS NOTICIAS: Tus imágenes siguen en la galería - solo necesitas volver a seleccionarlas. Haz clic en "Establecer imagen" y usa la galería.' 
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar la configuración. Por favor recarga la página.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Guardar configuración
      await settingsAPI.saveSettings(settings);
      
      // Guardar el orden de items destacados si ha cambiado
      const allItems = [...classes, ...workshops];
      
      // Actualizar orden de courses
      for (let i = 0; i < featuredOrder.courses.length; i++) {
        const itemId = featuredOrder.courses[i];
        const item = allItems.find((it: any) => it.id === itemId);
        if (item && item.homeOrder !== i) {
          await contentAPI.updateItem(itemId, {
            ...item,
            homeOrder: i
          });
        }
      }
      
      // Actualizar orden de workshops
      for (let i = 0; i < featuredOrder.workshops.length; i++) {
        const itemId = featuredOrder.workshops[i];
        const item = allItems.find((it: any) => it.id === itemId);
        if (item && item.homeOrder !== i) {
          await contentAPI.updateItem(itemId, {
            ...item,
            homeOrder: i
          });
        }
      }
      
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      setInitialSettingsSnapshot(JSON.stringify(settings));
      await refreshContent();
      setHasUnsavedChanges(false);
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

  const handleInstagramImageSelect = () => {
    // Abrir galería en lugar del selector de archivos
    setShowInstagramGallery(true);
    loadInstagramGallery();
  };
  
  const loadInstagramGallery = async () => {
    setLoadingInstagramGallery(true);
    try {
      const response = await uploadAPI.getImages();
      setInstagramGalleryImages(response.images || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoadingInstagramGallery(false);
    }
  };
  
  const handleSelectFromGalleryForNewInstagram = (url: string) => {
    const currentImages = settings.instagramImages || [];
    const newImage = {
      url: url,
      title: '',
      description: '',
      source: 'OKA // INSTAGRAM',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    };
    updateField('instagramImages', [...currentImages, newImage]);
    setShowInstagramGallery(false);
    setMessage({ type: 'success', text: 'Imagen agregada al carrusel. No olvides guardar los cambios.' });
  };
  
  const handleUploadNewForInstagram = async (file: File) => {
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
      setShowInstagramGallery(false);
      await loadInstagramGallery(); // Recargar galería
      setMessage({ type: 'success', text: 'Imagen subida y agregada al carrusel. No olvides guardar los cambios.' });
    } catch (error) {
      console.error('Error uploading Instagram image:', error);
      setMessage({ type: 'error', text: 'Error al subir la imagen' });
    } finally {
      setUploadingInstagram(false);
    }
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

  // Gestión de Clases y Workshops destacados en Home
  const getFeaturedCourses = () => {
    const allItems = [...classes, ...workshops];
    const featured = allItems.filter((item: any) => item.showInHome === true && item.visible === true);
    
    // Si tenemos un orden personalizado en el estado, usarlo
    if (featuredOrder.courses.length > 0) {
      return featuredOrder.courses
        .map(id => featured.find((item: any) => item.id === id))
        .filter(Boolean); // Eliminar items que ya no existen
    }
    
    // Si no, usar el orden del backend
    return featured.sort((a: any, b: any) => (a.homeOrder || 0) - (b.homeOrder || 0));
  };

  const getFeaturedWorkshops = () => {
    const allItems = [...classes, ...workshops];
    const featured = allItems.filter((item: any) => item.showInHomeWorkshops === true && item.visible === true);
    
    // Si tenemos un orden personalizado en el estado, usarlo
    if (featuredOrder.workshops.length > 0) {
      return featuredOrder.workshops
        .map(id => featured.find((item: any) => item.id === id))
        .filter(Boolean); // Eliminar items que ya no existen
    }
    
    // Si no, usar el orden del backend
    return featured.sort((a: any, b: any) => (a.homeOrder || 0) - (b.homeOrder || 0));
  };

  const moveFeaturedItem = (itemId: string, direction: 'up' | 'down', section: 'courses' | 'workshops') => {
    const currentOrder = section === 'courses' ? [...featuredOrder.courses] : [...featuredOrder.workshops];
    const index = currentOrder.indexOf(itemId);
    
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentOrder.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Intercambiar posiciones en el array
    [currentOrder[index], currentOrder[targetIndex]] = [currentOrder[targetIndex], currentOrder[index]];
    
    // Actualizar el estado local
    setFeaturedOrder({
      ...featuredOrder,
      [section]: currentOrder
    });
    
    // Marcar como cambio sin guardar
    setHasUnsavedChanges(true);
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

        {/* Home hero is now editable in Sanity: Page -> home */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Hero del Home</h3>
          <p className="text-sm text-foreground/60">
            Las imágenes del hero del Home ahora se editan en Sanity dentro de la página "home" (tipo Page).
          </p>
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
          <h3 className="text-xl mb-4">Imagen Hero de la Página Clases</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Imagen de título que se mostrará en la cabecera de la página de Clases
          </p>
          
          <div className="space-y-6">
            <ImageUploader
              currentImage={typeof settings.clasesHeroTitleImage === 'string' ? settings.clasesHeroTitleImage : settings.clasesHeroTitleImage?.url || ''}
              onImageSelect={(data) => {
                if (typeof data === 'string') {
                  updateField('clasesHeroTitleImage', { url: data, alt: '', description: '' });
                } else {
                  updateField('clasesHeroTitleImage', data);
                }
              }}
              label="Imagen de Título del Hero de Clases (recomendado: PNG transparente)"
              withMetadata={true}
              initialAlt={typeof settings.clasesHeroTitleImage === 'object' ? settings.clasesHeroTitleImage?.alt || '' : ''}
              initialDescription={typeof settings.clasesHeroTitleImage === 'object' ? settings.clasesHeroTitleImage?.description || '' : ''}
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>💡 Imagen de Título:</strong> Si subes una imagen, esta reemplazará el texto "Clases" en el hero. Si no se sube, se mostrará el texto normal.
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

            <div>
              <label className="block text-sm mb-2">ID de Google Analytics</label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX o UA-XXXXXXXXX-X"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Introduce tu ID de Google Analytics (formato: G-XXXXXXXXXX para GA4 o UA-XXXXXXXXX-X para Universal Analytics)
              </p>
            </div>

            <ImageUploader
              currentImage={settings.ogImage || ''}
              onImageSelect={(url) => updateField('ogImage', url)}
              label="Imagen Open Graph por Defecto (se muestra al compartir en redes sociales)"
            />

            {/* Open Graph Meta Tags */}
            <div className="border-t border-foreground/10 pt-4 mt-6">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                🌐 Open Graph (Redes Sociales)
              </h4>
              <p className="text-xs text-foreground/60 mb-4">
                Controla cómo se ve tu sitio cuando se comparte en Facebook, Twitter, LinkedIn, etc.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">og:url - URL del Sitio Web</label>
                  <input
                    type="url"
                    value={settings.ogUrl || ''}
                    onChange={(e) => updateField('ogUrl', e.target.value)}
                    placeholder="https://casarosier.com"
                    className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    La URL principal de tu sitio web
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-2">og:type - Tipo de Contenido</label>
                  <select
                    value={settings.ogType || 'website'}
                    onChange={(e) => updateField('ogType', e.target.value)}
                    className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="website">website - Sitio Web General</option>
                    <option value="article">article - Artículo/Blog</option>
                    <option value="business.business">business.business - Negocio</option>
                    <option value="profile">profile - Perfil</option>
                  </select>
                  <p className="text-xs text-foreground/60 mt-1">
                    Define el tipo de contenido para redes sociales
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-2">og:title - Título para Redes Sociales</label>
                  <input
                    type="text"
                    value={settings.ogTitle || ''}
                    onChange={(e) => updateField('ogTitle', e.target.value)}
                    placeholder="Casa Rosier - Taller de Cerámica en Barcelona"
                    className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    Si está vacío, usará el Meta Título por Defecto
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-2">og:description - Descripción para Redes Sociales</label>
                  <textarea
                    value={settings.ogDescription || ''}
                    onChange={(e) => updateField('ogDescription', e.target.value)}
                    placeholder="Descubre la cerámica con nuestras clases y workshops en Barcelona"
                    rows={3}
                    className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    Si está vacío, usará la Meta Descripción por Defecto
                  </p>
                </div>
              </div>
            </div>
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

        {/* Home section descriptions moved to Sanity: Page -> home -> sections */}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Clases Destacadas en Home (Sección 1)</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Orden de las clases que aparecen en la primera sección del home. Para agregar o quitar clases, edítalas desde el Gestor de Contenido.
          </p>
          
          {getFeaturedCourses().length > 0 ? (
            <div className="space-y-2">
              {getFeaturedCourses().map((item: any, index: number) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveFeaturedItem(item.id, 'up', 'courses')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      title="Mover arriba"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveFeaturedItem(item.id, 'down', 'courses')}
                      disabled={index === getFeaturedCourses().length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      title="Mover abajo"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {item.type === 'class' ? 'Clase' : 'Workshop'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-foreground/60">
                    Posición {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-foreground/60 bg-gray-50 rounded-lg p-4 text-center">
              No hay clases destacadas. Edita una clase o workshop y activa "Mostrar en sección 1 del Home".
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Workshops Destacados en Home (Sección 2)</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Orden de los workshops que aparecen en la segunda sección del home. Para agregar o quitar workshops, edítalos desde el Gestor de Contenido.
          </p>
          
          {getFeaturedWorkshops().length > 0 ? (
            <div className="space-y-2">
              {getFeaturedWorkshops().map((item: any, index: number) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveFeaturedItem(item.id, 'up', 'workshops')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      title="Mover arriba"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => moveFeaturedItem(item.id, 'down', 'workshops')}
                      disabled={index === getFeaturedWorkshops().length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      title="Mover abajo"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {item.type === 'class' ? 'Clase' : 'Workshop'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-foreground/60">
                    Posición {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-foreground/60 bg-gray-50 rounded-lg p-4 text-center">
              No hay workshops destacados. Edita una clase o workshop y activa "Mostrar en sección 2 del Home".
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl mb-4">Contacto</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email de Contacto Principal</label>
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
              <label className="block text-sm mb-2">Email de Contacto Secundario (Opcional)</label>
              <input
                type="email"
                value={settings.contactEmail2 || ''}
                onChange={(e) => updateField('contactEmail2', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="ejemplo@casarosier.com"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Si se configura, los mensajes también se enviarán a este segundo email
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

            <div>
              <label className="block text-sm mb-2">Número de WhatsApp (Por Defecto)</label>
              <input
                type="tel"
                value={settings.whatsappNumber || ''}
                onChange={(e) => updateField('whatsappNumber', e.target.value)}
                placeholder="34633788860"
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Número en formato internacional sin espacios (ej: 34633788860). Este número se usará en el botón flotante de WhatsApp y en los botones "Consultar" de clases/workshops que no tengan un número específico configurado.
              </p>
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
      
      {/* Modal de galería para Instagram */}
      <AnimatePresence>
        {showInstagramGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInstagramGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl">Agregar Imagen al Carrusel</h3>
                <button
                  type="button"
                  onClick={() => setShowInstagramGallery(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Botón de subir desde computadora */}
              <div className="mb-6">
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                  <Upload size={18} className={uploadingInstagram ? 'animate-spin' : ''} />
                  <span>
                    {uploadingInstagram ? 'Subiendo imagen...' : 'Subir nueva imagen desde computadora'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingInstagram}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleUploadNewForInstagram(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-4">
                <h4 className="font-medium mb-3">O selecciona de la galería:</h4>
              </div>

              {loadingInstagramGallery ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando imágenes...</p>
                </div>
              ) : instagramGalleryImages.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No hay imágenes en la galería. Sube una nueva imagen arriba.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {instagramGalleryImages.map((image) => (
                    <button
                      key={image.name}
                      type="button"
                      onClick={() => handleSelectFromGalleryForNewInstagram(image.url)}
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
