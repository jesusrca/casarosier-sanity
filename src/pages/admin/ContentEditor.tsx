import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Loader2, Eye, EyeOff, Calendar, Clock, Save, ExternalLink, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { menuAPI } from '../../utils/api';
import { ImageUploader } from '../../components/ImageUploader';
import { ImageUploaderWithMeta, ImageMetadata } from '../../components/ImageUploaderWithMeta';
import { slugify } from '../../utils/slugify';
import { VersionHistory } from '../../components/VersionHistory';
import { NavigationBlocker } from '../../components/NavigationBlocker';
import { RichTextEditor } from '../../components/RichTextEditor';

interface ContentEditorProps {
  item: any;
  onSave: (item: any) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function ContentEditor({ item: initialItem, onSave, onCancel, onDelete }: ContentEditorProps) {
  const [item, setItem] = useState(initialItem);
  const [initialItemSnapshot, setInitialItemSnapshot] = useState(JSON.stringify(initialItem));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'content' | 'seo'>('basic');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialItem.slug);
  const [menuStructure, setMenuStructure] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [saving, setSaving] = useState(false);

  // Detectar cambios no guardados
  useEffect(() => {
    const currentSnapshot = JSON.stringify(item);
    const hasChanges = currentSnapshot !== initialItemSnapshot;
    console.log('🔍 Detectando cambios:', {
      hasChanges,
      currentLength: currentSnapshot.length,
      initialLength: initialItemSnapshot.length
    });
    setHasUnsavedChanges(hasChanges);
  }, [item, initialItemSnapshot]);

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

  // Actualizar item cuando se restaura una versión
  const handleRestoreVersion = (restoredItem: any) => {
    setItem(restoredItem);
  };

  // Cargar estructura del menú
  useEffect(() => {
    loadMenuStructure();
  }, []);

  const loadMenuStructure = async () => {
    try {
      const response = await menuAPI.getMenu();
      setMenuStructure(response.menu?.items || []);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setItem({ ...item, [field]: value });
    
    // Auto-generar slug cuando se edita el título (solo si no se ha editado manualmente)
    if (field === 'title' && !slugManuallyEdited) {
      const baseSlug = slugify(value);
      // Agregar prefijo según el tipo
      const prefix = item.type === 'workshop' ? 'workshop/' : '';
      setItem(prev => ({ ...prev, [field]: value, slug: prefix + baseSlug }));
    }
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setItem({
      ...item,
      [parent]: { ...item[parent], [field]: value },
    });
  };

  const addToArray = (field: string, value: any) => {
    setItem({
      ...item,
      [field]: [...(item[field] || []), value],
    });
  };

  const removeFromArray = (field: string, index: number) => {
    setItem({
      ...item,
      [field]: item[field].filter((_: any, i: number) => i !== index),
    });
  };

  const updateArrayItem = (field: string, index: number, value: any) => {
    const newArray = [...item[field]];
    newArray[index] = value;
    setItem({ ...item, [field]: newArray });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Limpiar el array includes de strings vacíos antes de guardar
    const cleanedItem = {
      ...item,
      includes: (item.includes || []).filter((inc: string) => inc.trim() !== '')
    };
    
    console.log('💾 ContentEditor - Guardando item:', {
      originalIncludes: item.includes,
      cleanedIncludes: cleanedItem.includes,
      includesLength: cleanedItem.includes?.length
    });
    
    onSave(cleanedItem);
    // Actualizar el snapshot después de guardar
    setInitialItemSnapshot(JSON.stringify(cleanedItem));
    setHasUnsavedChanges(false);
    
    // Esperar un poco para que se complete el guardado antes de habilitar el botón
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
      setPendingAction(() => onCancel);
    } else {
      onCancel();
    }
  };

  const handleTabChange = (tab: 'basic' | 'schedule' | 'content' | 'seo') => {
    // Cambio de tab sin verificación - mantener flujo natural
    setActiveTab(tab);
  };

  const handlePreview = () => {
    // Construir la URL de vista previa
    const baseUrl = window.location.origin;
    const type = item.type === 'class' ? 'clases' : item.type === 'workshop' ? 'workshops' : item.type === 'giftcard' ? 'tarjeta-regalo' : 'privadas';
    const slug = item.slug || slugify(item.title);
    const previewUrl = `${baseUrl}/${type}/${slug}`;
    window.open(previewUrl, '_blank');
  };

  const handleDelete = () => {
    if (!item.id) {
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.')) {
      if (onDelete) {
        onDelete(item.id);
        // Cerrar el editor después de eliminar
        onCancel();
      }
    }
  };

  const tabs = [
    { id: 'basic', label: 'Información Básica' },
    { id: 'schedule', label: 'Horario' },
    { id: 'content', label: 'Contenido' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl">
            {item.id ? 'Editar' : 'Crear'} {item.type === 'class' ? 'Clase' : item.type === 'workshop' ? 'Workshop' : item.type === 'giftcard' ? 'Tarjeta de Regalo' : 'Privada'}
          </h1>
          {hasUnsavedChanges && (
            <p className="text-sm text-orange-600 mt-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Hay cambios sin guardar
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.id && (
            <motion.button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-5 h-5" />
              <span className="hidden sm:inline">Vista Previa</span>
            </motion.button>
          )}
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Botón Guardar Superior */}
        <div className="flex justify-end mb-6">
          <motion.button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={saving ? {} : { scale: 1.02 }}
            whileTap={saving ? {} : { scale: 0.98 }}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </motion.button>
        </div>

        {/* Layout con columnas: Principal (izquierda) + Menú (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal (2/3 del ancho) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 sm:gap-2 border-b border-foreground/10 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl mb-4">Información General</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Título *</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Slug (URL)</label>
                      <input
                        type="text"
                        value={item.slug || ''}
                        onChange={(e) => {
                          updateField('slug', e.target.value);
                          setSlugManuallyEdited(true);
                        }}
                        placeholder="ej: iniciacion-ceramica"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-foreground/60 mt-1">
                        Se usará en la URL: {item.type === 'class' ? '/clases/' : item.type === 'workshop' ? '/workshops/' : item.type === 'giftcard' ? '/tarjeta-regalo/' : '/privada/'}{item.slug || 'slug'}
                      </p>
                      <p className="text-xs text-primary/70 mt-1 italic">
                        💡 Si el slug ya existe, se agregará automáticamente un número al final
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Descripción corta (resaltada)</label>
                      <textarea
                        value={item.shortDescription || ''}
                        onChange={(e) => updateField('shortDescription', e.target.value)}
                        rows={2}
                        placeholder="Texto destacado que aparece justo después del título"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Descripción completa</label>
                      <RichTextEditor
                        value={item.description || ''}
                        onChange={(value) => updateField('description', value)}
                        placeholder="Descripción completa del curso. Puedes usar formato, enlaces, imágenes, etc."
                        height="300px"
                      />
                      <p className="text-xs text-foreground/60 mt-1">
                        Usa el editor para dar formato al texto, agregar enlaces e imágenes
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Precio (€)</label>
                        <input
                          type="number"
                          value={item.price || ''}
                          onChange={(e) => updateField('price', e.target.value ? parseFloat(e.target.value) : 0)}
                          className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-2">Duración</label>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => updateField('duration', e.target.value)}
                          placeholder="ej: 4 clases de 2 horas"
                          className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="visible"
                        checked={item.visible}
                        onChange={(e) => updateField('visible', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="visible" className="text-sm">
                        Visible en el sitio web
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl mb-4">Imágenes</h3>

                  <div className="space-y-6">
                    {/* Gallery Images */}
                    <div>
                      <h4 className="font-medium mb-3">Galería de Imágenes</h4>
                      <p className="text-sm text-foreground/60 mb-3">
                        Imágenes adicionales que se mostrarán en la galería de la página con información SEO
                      </p>
                      
                      {/* Grid container for images */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {(item.images || []).map((img: any, index: number) => {
                          // Support both old string format and new object format
                          const imageData = typeof img === 'string' ? { url: img, alt: '', caption: '' } : img;
                          
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Imagen {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFromArray('images', index)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                              <ImageUploaderWithMeta
                                currentImage={imageData}
                                onImageSelect={(image: ImageMetadata) => updateArrayItem('images', index, image)}
                                label=""
                                showCaptionField={true}
                                aspectRatio="4:3"
                              />
                            </div>
                          );
                        })}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => addToArray('images', { url: '', alt: '', caption: '' })}
                        className="flex items-center gap-2 text-primary hover:underline text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Añadir imagen a la galería
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl mb-4">¿Qué incluye?</h3>
                  
                  <div className="space-y-3">
                    {(item.includes || []).map((inc: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={inc}
                          onChange={(e) => updateArrayItem('includes', index, e.target.value)}
                          placeholder="ej: Material (arcilla)"
                          className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeFromArray('includes', index)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addToArray('includes', '')}
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir elemento
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl mb-4">Descripción del Horario</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Descripción general</label>
                      <textarea
                        value={item.schedule?.description || ''}
                        onChange={(e) => updateNestedField('schedule', 'description', e.target.value)}
                        rows={2}
                        placeholder="ej: El curso consta de 4 clases de 2 horas cada una, una vez por semana."
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl mb-4">Horarios Disponibles</h3>
                  
                  <div className="space-y-4">
                    {(item.schedule?.slots || []).map((slot: any, slotIndex: number) => (
                      <div key={slotIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm">Horario {slotIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newSlots = [...(item.schedule?.slots || [])];
                              newSlots.splice(slotIndex, 1);
                              updateNestedField('schedule', 'slots', newSlots);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={slot.day || ''}
                            onChange={(e) => {
                              const newSlots = [...(item.schedule?.slots || [])];
                              newSlots[slotIndex] = { ...slot, day: e.target.value };
                              updateNestedField('schedule', 'slots', newSlots);
                            }}
                            placeholder="Día (ej: Lunes, Próximas fechas)"
                            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />

                          <div>
                            <label className="block text-sm mb-2">Horarios del día</label>
                            {(slot.times || []).map((timeSlot: any, timeIndex: number) => (
                              <div key={timeIndex} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={timeSlot.time || ''}
                                  onChange={(e) => {
                                    const newSlots = [...(item.schedule?.slots || [])];
                                    const newTimes = [...(slot.times || [])];
                                    newTimes[timeIndex] = { ...timeSlot, time: e.target.value };
                                    newSlots[slotIndex] = { ...slot, times: newTimes };
                                    updateNestedField('schedule', 'slots', newSlots);
                                  }}
                                  placeholder="Horario (ej: 17:00 a 19:00)"
                                  className="flex-1 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <input
                                  type="number"
                                  value={timeSlot.availablePlaces || 0}
                                  onChange={(e) => {
                                    const newSlots = [...(item.schedule?.slots || [])];
                                    const newTimes = [...(slot.times || [])];
                                    newTimes[timeIndex] = { ...timeSlot, availablePlaces: e.target.value ? parseInt(e.target.value) : 0 };
                                    newSlots[slotIndex] = { ...slot, times: newTimes };
                                    updateNestedField('schedule', 'slots', newSlots);
                                  }}
                                  placeholder="Plazas"
                                  className="w-24 px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSlots = [...(item.schedule?.slots || [])];
                                    const newTimes = [...(slot.times || [])];
                                    newTimes.splice(timeIndex, 1);
                                    newSlots[slotIndex] = { ...slot, times: newTimes };
                                    updateNestedField('schedule', 'slots', newSlots);
                                  }}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newSlots = [...(item.schedule?.slots || [])];
                                const newTimes = [...(slot.times || []), { time: '', availablePlaces: 0 }];
                                newSlots[slotIndex] = { ...slot, times: newTimes };
                                updateNestedField('schedule', 'slots', newSlots);
                              }}
                              className="flex items-center gap-2 text-primary hover:underline text-sm mt-2"
                            >
                              <Plus className="w-4 h-4" />
                              Añadir horario
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newSlots = [...(item.schedule?.slots || []), { day: '', times: [] }];
                        updateNestedField('schedule', 'slots', newSlots);
                      }}
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir día
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl mb-4">Contenido del Curso</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">¿Qué aprenderás?</label>
                      <RichTextEditor
                        value={item.content?.whatYouWillLearn || ''}
                        onChange={(value) => updateNestedField('content', 'whatYouWillLearn', value)}
                        placeholder="Describe qué aprenderán los estudiantes..."
                        height="250px"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">¿Quién puede participar?</label>
                      <RichTextEditor
                        value={item.content?.whoCanParticipate || ''}
                        onChange={(value) => updateNestedField('content', 'whoCanParticipate', value)}
                        placeholder="Describe quién puede participar en este curso..."
                        height="200px"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Formas de pago</label>
                      <input
                        type="text"
                        value={item.content?.paymentMethods || ''}
                        onChange={(e) => updateNestedField('content', 'paymentMethods', e.target.value)}
                        placeholder="ej: Transferencia, tarjeta, efectivo, Bizum"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Información adicional</label>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-3">
                        <p className="text-sm text-foreground/60 mb-3">
                          📞 Este bloque muestra un mensaje de contacto estándar. Personaliza tu teléfono y email:
                        </p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs mb-1">Teléfono WhatsApp</label>
                            <input
                              type="text"
                              value={item.content?.contactPhone || ''}
                              onChange={(e) => updateNestedField('content', 'contactPhone', e.target.value)}
                              placeholder="633788860"
                              className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Email de contacto</label>
                            <input
                              type="email"
                              value={item.content?.contactEmail || ''}
                              onChange={(e) => updateNestedField('content', 'contactEmail', e.target.value)}
                              placeholder="info@casarosierceramica.com"
                              className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                          </div>
                          <div className="bg-white rounded p-3 border border-foreground/10 mt-3">
                            <p className="text-xs text-foreground/70 italic">
                              Vista previa: "Cualquier consulta o información adicional que necesites me puedes escribir al WhatsApp{' '}
                              <span className="font-medium text-primary">
                                {item.content?.contactPhone || '633788860'}
                              </span>{' '}
                              o al mail{' '}
                              <span className="font-medium text-primary">
                                {item.content?.contactEmail || 'info@casarosierceramica.com'}
                              </span>"
                            </p>
                          </div>
                        </div>
                      </div>
                      <label className="block text-xs mb-2 text-foreground/60">Información extra (opcional)</label>
                      <textarea
                        value={item.content?.additionalInfo || ''}
                        onChange={(e) => updateNestedField('content', 'additionalInfo', e.target.value)}
                        rows={3}
                        placeholder="Añade información adicional si es necesaria..."
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Course Modules/Lessons */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl mb-4">Módulos del Curso</h3>
                  
                  <div className="space-y-4">
                    {/* Título del acordeón principal */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <label className="block text-sm mb-2 font-medium">
                        Título del acordeón principal
                      </label>
                      <input
                        type="text"
                        value={item.content?.modulesAccordionTitle || 'Ver programa completo'}
                        onChange={(e) => updateNestedField('content', 'modulesAccordionTitle', e.target.value)}
                        placeholder="Ver programa completo"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-foreground/60 mt-1">
                        Este título aparece en el acordeón que agrupa todos los módulos
                      </p>
                    </div>

                    {(item.content?.modules || []).map((module: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm">Módulo {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newModules = [...(item.content?.modules || [])];
                              newModules.splice(index, 1);
                              updateNestedField('content', 'modules', newModules);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={module.title || ''}
                            onChange={(e) => {
                              const newModules = [...(item.content?.modules || [])];
                              newModules[index] = { ...module, title: e.target.value };
                              updateNestedField('content', 'modules', newModules);
                            }}
                            placeholder="Título del módulo (ej: Clase 01 | Técnica de pellizco)"
                            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          
                          <textarea
                            value={module.description || ''}
                            onChange={(e) => {
                              const newModules = [...(item.content?.modules || [])];
                              newModules[index] = { ...module, description: e.target.value };
                              updateNestedField('content', 'modules', newModules);
                            }}
                            placeholder="Descripción del módulo"
                            rows={3}
                            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newModules = [...(item.content?.modules || []), { title: '', description: '' }];
                        updateNestedField('content', 'modules', newModules);
                      }}
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir módulo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl mb-4">Optimización SEO</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Meta Título</label>
                      <input
                        type="text"
                        value={item.seo?.metaTitle || ''}
                        onChange={(e) => updateNestedField('seo', 'metaTitle', e.target.value)}
                        placeholder="Se genera automáticamente si se deja vacío"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-foreground/60 mt-1">
                        Máximo 60 caracteres recomendados
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Meta Descripción</label>
                      <textarea
                        value={item.seo?.metaDescription || ''}
                        onChange={(e) => updateNestedField('seo', 'metaDescription', e.target.value)}
                        rows={3}
                        placeholder="Se genera automáticamente si se deja vacío"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-foreground/60 mt-1">
                        Máximo 160 caracteres recomendados
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Palabras clave (separadas por comas)</label>
                      <input
                        type="text"
                        value={item.seo?.keywords || ''}
                        onChange={(e) => updateNestedField('seo', 'keywords', e.target.value)}
                        placeholder="ej: cerámica, torno, Barcelona"
                        className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna Menú (1/3 del ancho) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tipo de Contenido */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl mb-2">Tipo de Contenido</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Selecciona el tipo de contenido para esta página
              </p>
              <select
                value={item.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="class">Clase</option>
                <option value="workshop">Workshop</option>
                <option value="private">Privada</option>
              </select>
            </div>

            {/* Ubicación en el Menú */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl mb-2">Ubicación en el Menú</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Selecciona bajo qué categoría(s) principal(es) debe aparecer esta {item.type === 'class' ? 'clase' : item.type === 'workshop' ? 'workshop' : 'privada'}
              </p>

              {loadingMenu ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-foreground/60 mt-2">Cargando menú...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {menuStructure.map((menuItem: any) => {
                    const isChecked = item.menuLocations?.includes(menuItem.name) || false;
                    
                    return (
                      <label key={menuItem.name} className="flex items-center gap-3 cursor-pointer hover:bg-foreground/5 p-3 rounded-lg border border-foreground/10">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const menuLocations = item.menuLocations || [];
                            console.log('🔵 Checkbox clicked:', menuItem.name, 'checked:', e.target.checked);
                            console.log('🔵 Current menuLocations:', menuLocations);
                            
                            if (e.target.checked) {
                              const newLocations = [...menuLocations, menuItem.name];
                              console.log('🔵 Adding to menuLocations:', newLocations);
                              updateField('menuLocations', newLocations);
                            } else {
                              const newLocations = menuLocations.filter((loc: string) => loc !== menuItem.name);
                              console.log('🔵 Removing from menuLocations:', newLocations);
                              updateField('menuLocations', newLocations);
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">{menuItem.name}</span>
                      </label>
                    );
                  })}
                  
                  {menuStructure.length === 0 && (
                    <p className="text-sm text-foreground/60 text-center py-4">
                      No hay items de menú disponibles. 
                      Puedes crear items en la sección de Menú del administrador.
                    </p>
                  )}
                  
                  {/* Debug info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-1">Debug: Ubicaciones seleccionadas</p>
                    <p className="text-xs text-blue-700 font-mono">
                      {item.menuLocations?.length > 0 
                        ? JSON.stringify(item.menuLocations) 
                        : 'Ninguna seleccionada'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mostrar en Home */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl mb-2">Mostrar en Home</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Selecciona en qué sección(es) del Home debe aparecer este contenido
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-foreground/5 p-3 rounded-lg border border-foreground/10">
                  <input
                    type="checkbox"
                    checked={item.showInHome || false}
                    onChange={(e) => {
                      console.log('🏠 ShowInHome changed:', e.target.checked);
                      updateField('showInHome', e.target.checked);
                    }}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-medium block">Sección de Cursos</span>
                    <span className="text-xs text-foreground/60">Primera sección de cursos y talleres</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer hover:bg-foreground/5 p-3 rounded-lg border border-foreground/10">
                  <input
                    type="checkbox"
                    checked={item.showInHomeWorkshops || false}
                    onChange={(e) => {
                      console.log('🎨 ShowInHomeWorkshops changed:', e.target.checked);
                      updateField('showInHomeWorkshops', e.target.checked);
                    }}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-medium block">Sección de Workshops</span>
                    <span className="text-xs text-foreground/60">Segunda sección dedicada a workshops</span>
                  </div>
                </label>
              </div>
              
              {(item.showInHome || item.showInHomeWorkshops) && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700">
                    ✓ Este contenido aparecerá en: 
                    {item.showInHome && <span className="block ml-2">• Sección de Cursos</span>}
                    {item.showInHomeWorkshops && <span className="block ml-2">• Sección de Workshops</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Imágenes Destacadas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl mb-4">Imágenes Destacadas</h3>

              <div className="space-y-6">
                {/* Hero Image */}
                <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-medium">Imagen del Hero</h4>
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded">Banner</span>
                  </div>
                  <p className="text-xs text-foreground/60 mb-3">
                    Banner principal de la página
                  </p>
                  <ImageUploader
                    currentImage={typeof item.heroImage === 'string' ? item.heroImage : item.heroImage?.url || ''}
                    onImageSelect={(data) => {
                      if (typeof data === 'string') {
                        updateField('heroImage', { url: data, alt: '', description: '' });
                      } else {
                        updateField('heroImage', data);
                      }
                    }}
                    label=""
                    withMetadata={true}
                    initialAlt={typeof item.heroImage === 'object' ? item.heroImage?.alt || '' : ''}
                    initialDescription={typeof item.heroImage === 'object' ? item.heroImage?.description || '' : ''}
                  />
                </div>

                {/* Title Image */}
                <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-medium">Imagen del Título</h4>
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded">Hero</span>
                  </div>
                  <p className="text-xs text-foreground/60 mb-3">
                    Se mostrará sobre el banner
                  </p>
                  <ImageUploader
                    currentImage={typeof item.titleImage === 'string' ? item.titleImage : item.titleImage?.url || ''}
                    onImageSelect={(data) => {
                      if (typeof data === 'string') {
                        updateField('titleImage', { url: data, alt: '', description: '' });
                      } else {
                        updateField('titleImage', data);
                      }
                    }}
                    label=""
                    withMetadata={true}
                    initialAlt={typeof item.titleImage === 'object' ? item.titleImage?.alt || '' : ''}
                    initialDescription={typeof item.titleImage === 'object' ? item.titleImage?.description || '' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <motion.button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={saving ? {} : { scale: 1.02 }}
                whileTap={saving ? {} : { scale: 0.98 }}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </motion.button>
              
              {item.id && (
                <VersionHistory 
                  itemId={item.id} 
                  onRestore={handleRestoreVersion}
                />
              )}
              
              <button
                type="button"
                onClick={handleCancel}
                className="w-full px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                Cancelar
              </button>

              {/* Botón Eliminar - Solo visible si el item ya existe */}
              {item.id && onDelete && (
                <>
                  <div className="border-t border-foreground/10 my-2"></div>
                  <motion.button
                    type="button"
                    onClick={handleDelete}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-5 h-5" />
                    Eliminar
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Dialogo de cambios no guardados */}
      <AnimatePresence>
        {showUnsavedDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl">Cambios no guardados</h3>
              </div>
              <p className="text-sm text-foreground/60 mb-6">
                Tienes cambios sin guardar. ¿Qué deseas hacer?
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedDialog(false);
                    setPendingAction(null);
                  }}
                  className="px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingAction) {
                      pendingAction();
                    }
                    setShowUnsavedDialog(false);
                    setPendingAction(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Salir sin guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Limpiar el array includes antes de guardar
                    const cleanedItem = {
                      ...item,
                      includes: (item.includes || []).filter((inc: string) => inc.trim() !== '')
                    };
                    onSave(cleanedItem);
                    setInitialItemSnapshot(JSON.stringify(cleanedItem));
                    setHasUnsavedChanges(false);
                    setShowUnsavedDialog(false);
                    setPendingAction(null);
                    if (pendingAction) {
                      // Ejecutar la acción después de guardar
                      setTimeout(() => pendingAction(), 100);
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Guardar y salir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bloqueador de navegación */}
      <NavigationBlocker
        when={hasUnsavedChanges}
        onSave={async () => {
          // Limpiar el array includes antes de guardar
          const cleanedItem = {
            ...item,
            includes: (item.includes || []).filter((inc: string) => inc.trim() !== '')
          };
          onSave(cleanedItem);
          setInitialItemSnapshot(JSON.stringify(cleanedItem));
          setHasUnsavedChanges(false);
        }}
        onDiscard={() => {
          setHasUnsavedChanges(false);
        }}
      />
    </div>
  );
}