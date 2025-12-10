import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pagesAPI, initAPI } from '../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Layout, RotateCcw, Archive, Database, AlertTriangle } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { RichTextEditor } from '../../components/RichTextEditor';
import { slugify } from '../../utils/slugify';
import { PAGE_TEMPLATES, getTemplateById } from '../../utils/pageTemplates';
import { SectionsContainer } from '../../components/admin/SectionsContainer';
import { NavigationBlocker } from '../../components/NavigationBlocker';
import { usePageLock } from '../../hooks/usePageLock';
import { EditLockBanner } from '../../components/admin/EditLockBanner';

export function CustomPagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [initialPageSnapshot, setInitialPageSnapshot] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [pageType, setPageType] = useState<'simple' | 'sections'>('simple');
  const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active');
  const [isTakingControl, setIsTakingControl] = useState(false);

  // Page lock management
  const resourceId = editingPage?.slug ? `page:${editingPage.slug}` : '';
  const pageLock = usePageLock(resourceId);

  // Try to acquire lock when editing starts
  useEffect(() => {
    if (editingPage && editingPage.slug && !pageLock.hasLock && !pageLock.isLoading) {
      pageLock.acquireLock();
    }
  }, [editingPage?.slug]);

  // Detectar cambios no guardados
  useEffect(() => {
    if (editingPage) {
      const currentSnapshot = JSON.stringify(editingPage);
      setHasUnsavedChanges(currentSnapshot !== initialPageSnapshot);
    }
  }, [editingPage, initialPageSnapshot]);

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
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const response = await pagesAPI.getAllPages();
      setPages(response.pages || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPage({
      title: '',
      slug: '',
      content: '',
      heroImage: '',
      visible: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      },
    });
    setSlugManuallyEdited(false);
    setShowTemplateSelector(true);
  };

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setSlugManuallyEdited(!!page.slug);
    setPageType(page.sections ? 'sections' : 'simple');
    setInitialPageSnapshot(JSON.stringify(page));
  };

  const handleTitleChange = (title: string) => {
    const newPage = { ...editingPage, title };
    
    // Auto-generar slug si no se ha editado manualmente
    if (!slugManuallyEdited) {
      newPage.slug = slugify(title);
    }
    
    setEditingPage(newPage);
  };

  const handleSlugChange = (slug: string) => {
    setEditingPage({ ...editingPage, slug });
    setSlugManuallyEdited(true);
  };

  const handleSave = async () => {
    if (!editingPage) return;

    try {
      if (editingPage.slug) {
        // Si ya tiene un slug, es una actualización
        await pagesAPI.updatePage(editingPage.slug, editingPage);
      } else {
        // Si no tiene slug, es una creación
        await pagesAPI.createPage(editingPage);
      }
      setEditingPage(null);
      setHasUnsavedChanges(false);
      loadPages();
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error al guardar');
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
      setPendingAction(() => () => {
        setEditingPage(null);
        setHasUnsavedChanges(false);
      });
    } else {
      setEditingPage(null);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('¿Mover esta página a la papelera?')) return;

    try {
      const page = pages.find(p => p.slug === slug);
      if (page) {
        await pagesAPI.updatePage(slug, { ...page, deleted: true, deletedAt: new Date().toISOString() });
        loadPages();
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const handleRestore = async (slug: string) => {
    if (!confirm('¿Restaurar esta página?')) return;

    try {
      const page = pages.find(p => p.slug === slug);
      if (page) {
        const { deleted, deletedAt, ...pageWithoutDeleted } = page;
        await pagesAPI.updatePage(slug, pageWithoutDeleted);
        loadPages();
      }
    } catch (error) {
      console.error('Error restoring page:', error);
    }
  };

  const handleDeletePermanently = async (slug: string) => {
    if (!confirm('⚠️ ¿ELIMINAR PERMANENTEMENTE esta página? Esta acción no se puede deshacer.')) return;

    try {
      await pagesAPI.deletePage(slug);
      loadPages();
    } catch (error) {
      console.error('Error deleting page permanently:', error);
    }
  };

  const handleToggleVisible = async (page: any) => {
    try {
      await pagesAPI.updatePage(page.slug, { ...page, visible: !page.visible });
      loadPages();
    } catch (error) {
      console.error('Error updating page:', error);
    }
  };

  const handleTakeControl = async () => {
    setIsTakingControl(true);
    const success = await pageLock.takeoverLock();
    setIsTakingControl(false);
    
    if (!success) {
      alert('No se pudo tomar el control de la edición');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setEditingPage({
        ...editingPage,
        sections: template.sections,
        templateId: templateId, // Guardar el ID de la plantilla
      });
      setPageType('sections');
    }
    setShowTemplateSelector(false);
  };

  const handleAddSection = (type: string) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type,
    };

    setEditingPage({
      ...editingPage,
      sections: [...(editingPage.sections || []), newSection],
    });
  };

  const handleUpdateSection = (index: number, updatedSection: any) => {
    const sections = [...(editingPage.sections || [])];
    sections[index] = updatedSection;
    setEditingPage({ ...editingPage, sections });
  };

  const handleDeleteSection = (index: number) => {
    const sections = [...(editingPage.sections || [])];
    sections.splice(index, 1);
    setEditingPage({ ...editingPage, sections });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const sections = [...(editingPage.sections || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < sections.length) {
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      setEditingPage({ ...editingPage, sections });
    }
  };

  const handleInitialize = async () => {
    if (!confirm('¿Inicializar contenido de prueba? Esto creará todas las páginas de ejemplo (Clases, Workshops, etc.).')) return;

    try {
      setLoading(true);
      await initAPI.initializeContent();
      alert('✅ Contenido inicializado correctamente. Se han creado todas las páginas de ejemplo.');
      loadPages();
    } catch (error) {
      console.error('Error initializing content:', error);
      alert('❌ Error al inicializar el contenido: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Template Selector Modal
  if (showTemplateSelector) {
    return (
      <div className="max-w-6xl">
        <h1 className="text-3xl mb-8">Elige una Plantilla</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PAGE_TEMPLATES.map((template) => (
            <motion.button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Layout className="w-6 h-6 text-primary" />
                <h3 className="text-lg">{template.name}</h3>
              </div>
              <p className="text-sm text-foreground/60 mb-3">{template.description}</p>
              <div className="text-xs text-foreground/50">
                {template.sections.length} sección{template.sections.length !== 1 ? 'es' : ''}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowTemplateSelector(false)}
            className="px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (editingPage) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl mb-8">{editingPage.id ? 'Editar' : 'Crear'} Página</h1>
        
        <div className="space-y-6">
          {/* Botones de acción arriba */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              onClick={handleSave}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Guardar
            </motion.button>
          </div>

          {/* Lock Banner - mostrar si está bloqueada por otro usuario */}
          {editingPage.slug && pageLock.isLocked && !pageLock.hasLock && pageLock.lockOwner && (
            <EditLockBanner
              lock={pageLock.lockOwner}
              onTakeControl={handleTakeControl}
              isTakingControl={isTakingControl}
            />
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Título *</label>
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  disabled={editingPage.slug && pageLock.isLocked && !pageLock.hasLock}
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={editingPage.slug || ''}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  disabled={editingPage.slug && pageLock.isLocked && !pageLock.hasLock}
                  placeholder="ej: sobre-nosotros"
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Se usará en la URL: /{editingPage.slug || 'slug'}
                </p>
              </div>

              <div>
                <ImageUploader
                  currentImage={editingPage.heroImage}
                  onImageSelect={(url) => setEditingPage({ ...editingPage, heroImage: url })}
                  label="Imagen de encabezado (opcional)"
                  disabled={editingPage.slug && pageLock.isLocked && !pageLock.hasLock}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Contenido</label>
                <RichTextEditor
                  value={editingPage.content}
                  onChange={(value) => setEditingPage({ ...editingPage, content: value })}
                  disabled={editingPage.slug && pageLock.isLocked && !pageLock.hasLock}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={editingPage.visible}
                  onChange={(e) => setEditingPage({ ...editingPage, visible: e.target.checked })}
                  disabled={editingPage.slug && pageLock.isLocked && !pageLock.hasLock}
                  className="w-4 h-4 disabled:cursor-not-allowed"
                />
                <label htmlFor="visible" className="text-sm">
                  Visible en el sitio web
                </label>
              </div>
            </div>
          </div>

          {pageType === 'sections' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl mb-4">Secciones</h3>
              <SectionsContainer
                sections={editingPage.sections || []}
                onChange={(sections) => setEditingPage({ ...editingPage, sections })}
              />
            </div>
          )}

          {/* Plantilla Asignada */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl">Plantilla</h3>
              {pageType === 'sections' && (
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <Layout className="w-4 h-4" />
                  Cambiar plantilla
                </button>
              )}
            </div>
            
            {pageType === 'sections' ? (
              <div className="space-y-3">
                {editingPage.templateId && (() => {
                  const currentTemplate = getTemplateById(editingPage.templateId);
                  return currentTemplate ? (
                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <Layout className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{currentTemplate.name}</p>
                        <p className="text-sm text-foreground/60 mt-1">{currentTemplate.description}</p>
                        <p className="text-xs text-foreground/50 mt-2">
                          {currentTemplate.sections.length} sección{currentTemplate.sections.length !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
                
                {!editingPage.templateId && (
                  <div className="p-4 bg-foreground/5 rounded-lg">
                    <p className="text-sm text-foreground/60">
                      Plantilla con secciones personalizadas
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-foreground/5 rounded-lg">
                <p className="text-sm text-foreground/60">
                  Página simple (sin plantilla de secciones)
                </p>
                <button
                  onClick={() => {
                    setPageType('sections');
                    setShowTemplateSelector(true);
                  }}
                  className="mt-3 text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <Layout className="w-4 h-4" />
                  Convertir a página con secciones
                </button>
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl mb-4">Optimización SEO</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Meta Título</label>
                <input
                  type="text"
                  value={editingPage.seo?.metaTitle || ''}
                  onChange={(e) => setEditingPage({ 
                    ...editingPage, 
                    seo: { ...editingPage.seo, metaTitle: e.target.value } 
                  })}
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
                  value={editingPage.seo?.metaDescription || ''}
                  onChange={(e) => setEditingPage({ 
                    ...editingPage, 
                    seo: { ...editingPage.seo, metaDescription: e.target.value } 
                  })}
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
                  value={editingPage.seo?.keywords || ''}
                  onChange={(e) => setEditingPage({ 
                    ...editingPage, 
                    seo: { ...editingPage.seo, keywords: e.target.value } 
                  })}
                  placeholder="ej: cerámica, Barcelona, taller"
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción abajo */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              onClick={handleSave}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Guardar
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

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Páginas</h1>
          <p className="text-foreground/60">Crea y gestiona las páginas de tu sitio</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            onClick={handleInitialize}
            className="bg-foreground/10 text-foreground px-6 py-3 rounded-lg hover:bg-foreground/20 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Inicializar contenido de prueba"
          >
            <Database className="w-5 h-5" />
            Contenido de Prueba
          </motion.button>
          <motion.button
            onClick={handleCreate}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Nueva página
          </motion.button>
        </div>
      </div>

      {/* Tabs para filtrar */}
      <div className="flex gap-4 mb-6 border-b border-foreground/10">
        <button
          onClick={() => setViewMode('active')}
          className={`px-4 py-2 transition-colors border-b-2 ${
            viewMode === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground/60 hover:text-foreground'
          }`}
        >
          Activas ({pages.filter(p => !p.deleted).length})
        </button>
        <button
          onClick={() => setViewMode('deleted')}
          className={`px-4 py-2 transition-colors border-b-2 flex items-center gap-2 ${
            viewMode === 'deleted'
              ? 'border-primary text-primary'
              : 'border-transparent text-foreground/60 hover:text-foreground'
          }`}
        >
          <Archive className="w-4 h-4" />
          Papelera ({pages.filter(p => p.deleted).length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      ) : pages.filter(p => viewMode === 'active' ? !p.deleted : p.deleted).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          {viewMode === 'active' ? (
            <>
              <p className="text-foreground/60 mb-4">No hay páginas personalizadas todavía</p>
              <button onClick={handleCreate} className="text-primary hover:underline">
                Crear la primera
              </button>
            </>
          ) : (
            <p className="text-foreground/60">La papelera está vacía</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {pages
            .filter(p => viewMode === 'active' ? !p.deleted : p.deleted)
            .map((page, index) => (
            <div key={page.id || `page-${index}`} className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6">
              {page.heroImage && (
                <img
                  src={page.heroImage}
                  alt={page.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl">{page.title}</h3>
                  {!page.deleted && (
                    <>
                      {page.visible ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Visible
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          Oculta
                        </span>
                      )}
                      {page.templateId && (() => {
                        const template = getTemplateById(page.templateId);
                        return template ? (
                          <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary flex items-center gap-1">
                            <Layout className="w-3 h-3" />
                            {template.name}
                          </span>
                        ) : null;
                      })()}
                      {page.sections && !page.templateId && (
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Layout className="w-3 h-3" />
                          Con secciones
                        </span>
                      )}
                    </>
                  )}
                  {page.deleted && (
                    <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-700 flex items-center gap-1">
                      <Archive className="w-3 h-3" />
                      En papelera
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60">/{page.slug}</p>
                {page.deleted && page.deletedAt && (
                  <p className="text-xs text-foreground/40 mt-1">
                    Eliminada el {new Date(page.deletedAt).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {viewMode === 'active' ? (
                  <>
                    <button
                      onClick={() => handleToggleVisible(page)}
                      className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                      title={page.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {page.visible ? (
                        <EyeOff className="w-5 h-5 text-foreground/70" />
                      ) : (
                        <Eye className="w-5 h-5 text-foreground/70" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(page)}
                      className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-foreground/70" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.slug)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Mover a papelera"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleRestore(page.slug)}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      title="Restaurar página"
                    >
                      <RotateCcw className="w-5 h-5 text-green-600" />
                    </button>
                    <button
                      onClick={() => handleDeletePermanently(page.slug)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Diálogo de cambios no guardados */}
      <AnimatePresence>
        {showUnsavedDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl">Cambios no guardados</h3>
              </div>
              <p className="text-sm text-foreground/60 mb-6">
                Tienes cambios sin guardar. ¿Qué deseas hacer?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowUnsavedDialog(false);
                    setPendingAction(null);
                  }}
                  className="px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
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
                  onClick={async () => {
                    await handleSave();
                    setShowUnsavedDialog(false);
                    setPendingAction(null);
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
    </div>
  );
}