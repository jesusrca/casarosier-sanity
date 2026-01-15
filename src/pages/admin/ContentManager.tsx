import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { contentAPI, initAPI } from '../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Copy, Database, ArrowLeft, SortDesc, SortAsc, RotateCcw, Trash } from 'lucide-react';
import { ContentEditor } from './ContentEditor';
import { menuAPI } from '../../utils/api';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { TrashModal } from '../../components/TrashModal';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import { useSearchParams } from 'react-router-dom';

export function ContentManager() {
  const { user } = useAuth();
  const isEditor = user?.role === 'editor';
  const { refreshContent } = useContent(); // Obtener la función para refrescar el contexto
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'class' | 'workshop' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [deletedItem, setDeletedItem] = useState<any>(null);
  const [showRestoreToast, setShowRestoreToast] = useState(false);
  const [restoreTimeoutId, setRestoreTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [trashedItems, setTrashedItems] = useState<any[]>([]);

  // Leer el filtro de la URL al cargar el componente
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['all', 'class', 'workshop', 'private'].includes(filterParam)) {
      setFilter(filterParam as 'all' | 'class' | 'workshop' | 'private');
    }
  }, [searchParams]);

  useEffect(() => {
    loadItems();
    loadTrash();
  }, [filter, sortOrder]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const type = filter === 'all' ? undefined : filter;
      const response = await contentAPI.getItems(type);
      let sortedItems = response.items || [];
      
      // NO filtrar items por rol - editores pueden ver todo
      // Los permisos de edición se controlan en el ContentEditor
      
      // Log para debugging
      console.log('Items antes de ordenar:', sortedItems.map(item => ({
        title: item.title,
        createdAt: item.createdAt,
        parsedDate: item.createdAt ? new Date(item.createdAt).toISOString() : 'NO DATE'
      })));
      
      if (sortOrder === 'newest') {
        sortedItems.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Más recientes primero
        });
      } else if (sortOrder === 'oldest') {
        sortedItems.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB; // Más antiguos primero
        });
      }
      
      // Log después de ordenar
      console.log('Items después de ordenar:', sortedItems.map(item => ({
        title: item.title,
        createdAt: item.createdAt
      })));
      
      setItems(sortedItems);
    } catch (error) {
      console.error('Error loading items:', error);
      
      // Mostrar mensaje de error más informativo
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
        console.error('⏱️ La petición tardó demasiado. El servidor puede estar sobrecargado. Por favor, intenta de nuevo.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        console.error('🌐 Error de red. Verifica tu conexión a Internet.');
      } else {
        console.error('❌ Error al cargar items:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTrash = () => {
    const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
    setTrashedItems(currentTrash);
  };

  const handleCreate = () => {
    setEditingItem({
      type: 'class',
      title: '',
      subtitle: '',
      slug: '',
      shortDescription: '',
      excerpt: '', // Extracto para mostrar en Home
      description: '',
      price: 0,
      priceOptions: [], // Opciones de precio adicionales
      duration: '',
      includes: [],
      images: [],
      schedule: {
        description: '',
        slots: [],
      },
      content: {
        whatYouWillLearn: '',
        modules: [],
        whoCanParticipate: '',
        paymentMethods: '',
        additionalInfo: '',
      },
      visible: true,
      menuLocations: [], // Inicializar el campo menuLocations
      showInHome: false, // Inicializar campo para mostrar en Home - Cursos
      showInHomeWorkshops: false, // Inicializar campo para mostrar en Home - Workshops
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      },
    });
    setShowEditor(true);
  };

  const handleEdit = (item: any) => {
    // Cargar las ubicaciones del menú actuales del item antes de abrir el editor
    loadCurrentMenuLocations(item).then(itemWithLocations => {
      setEditingItem(itemWithLocations);
      setShowEditor(true);
    });
  };

  const loadCurrentMenuLocations = async (item: any): Promise<any> => {
    try {
      const response = await menuAPI.getMenu();
      const currentMenu = response.menu?.items || [];

      // Determinar el prefijo de la URL según el tipo
      const urlPrefix = 
        item.type === 'class' ? '/clases/' : 
        item.type === 'workshop' ? '/workshops/' : 
        '/privada/';

      const itemPath = `${urlPrefix}${item.slug}`;

      // Encontrar todos los menús principales donde aparece este item
      const menuLocations: string[] = [];
      currentMenu.forEach((menuItem: any) => {
        const hasItem = (menuItem.submenu || []).some(
          (subItem: any) => subItem.path === itemPath
        );
        if (hasItem) {
          menuLocations.push(menuItem.name);
        }
      });

      return { ...item, menuLocations };
    } catch (error) {
      console.error('Error loading menu locations:', error);
      return { ...item, menuLocations: [] };
    }
  };

  const handleDelete = async (id: string) => {
    // Prevenir eliminaciones múltiples
    const actionId = `delete-${id}`;
    if (processingActions.has(actionId)) {
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;

    setProcessingActions(prev => new Set(prev).add(actionId));

    try {
      // Obtener el item antes de eliminarlo
      const itemToDelete = items.find(item => item.id === id);
      if (itemToDelete) {
        // Guardar el item eliminado en el localStorage (papelera)
        const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
        currentTrash.push(itemToDelete);
        localStorage.setItem('content-trash', JSON.stringify(currentTrash));

        // **ELIMINAR DEL MENÚ SI EXISTE**
        const itemPath = `/${itemToDelete.type === 'class' ? 'clases' : itemToDelete.type === 'private' ? 'privada' : 'workshops'}/${itemToDelete.slug}`;
        try {
          const menuResponse = await menuAPI.getMenu();
          const currentMenu = menuResponse.menu?.items || [];
          let menuUpdated = false;
          
          console.log('🔍 Buscando en menú para eliminar:', {
            itemPath,
            menuItems: currentMenu.length
          });
          
          // Buscar y eliminar en todos los items del menú
          const updatedMenu = currentMenu.map((menuItem: any) => {
            if (menuItem.submenu && menuItem.submenu.length > 0) {
              const originalLength = menuItem.submenu.length;
              const updatedSubmenu = menuItem.submenu.filter((subItem: any) => subItem.path !== itemPath);
              
              if (updatedSubmenu.length < originalLength) {
                menuUpdated = true;
                console.log(`✅ Eliminado "${itemToDelete.title}" del menú "${menuItem.name}"`);
              }
              
              return { ...menuItem, submenu: updatedSubmenu };
            }
            return menuItem;
          });

          // Guardar el menú actualizado si hubo cambios
          if (menuUpdated) {
            await menuAPI.saveMenu({ items: updatedMenu });
            console.log('✅ Menú actualizado después de eliminar la clase');
          } else {
            console.log('ℹ️ No se encontró el item en el menú');
          }
        } catch (menuError) {
          console.error('Error al actualizar el menú:', menuError);
          // No bloqueamos la eliminación si falla el menú
        }

        // **IMPORTANTE: Eliminar del backend/base de datos**
        await contentAPI.deleteItem(id);

        // **CRÍTICO: Refrescar el ContentContext para que el Home se actualice**
        await refreshContent();

        // Eliminar el item de la lista local
        setItems(prevItems => prevItems.filter(item => item.id !== id));

        // Mostrar el toast de restauración
        setDeletedItem(itemToDelete);
        const timeoutId = setTimeout(() => {
          setDeletedItem(null);
          setShowRestoreToast(false);
        }, 5000);
        setRestoreTimeoutId(timeoutId);
        setShowRestoreToast(true);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error al eliminar');
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  const handleRestoreVersion = (restoredItem: any) => {
    setEditingItem(restoredItem);
  };

  const handleRestore = async () => {
    if (!deletedItem) return;

    try {
      // Cancelar el timeout si existe
      if (restoreTimeoutId) {
        clearTimeout(restoreTimeoutId);
        setRestoreTimeoutId(null);
      }

      // Ocultar el toast inmediatamente
      setShowRestoreToast(false);

      // Eliminar de la papelera
      const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
      const updatedTrash = currentTrash.filter((trashedItem: any) => 
        !(trashedItem.id === deletedItem.id && trashedItem.title === deletedItem.title)
      );
      localStorage.setItem('content-trash', JSON.stringify(updatedTrash));
      setTrashedItems(updatedTrash);

      // Crear el item de nuevo (sin el ID para que se genere uno nuevo)
      const { id, deletedDate, ...itemWithoutId } = deletedItem;
      const restoredItem = await contentAPI.createItem(itemWithoutId);
      
      // Extraer el item del objeto de respuesta
      const itemData = restoredItem.item || restoredItem;

      // Restaurar en el menú si es necesario
      if (itemData.visible && itemData.slug && deletedItem.menuLocations?.length > 0) {
        await updateMenuLocations({ ...itemData, menuLocations: deletedItem.menuLocations });
      }

      // Recargar la lista
      loadItems();

      // Limpiar el item eliminado
      setDeletedItem(null);

      // Mostrar mensaje de éxito
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Elemento restaurado correctamente</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Error al restaurar el elemento');
    }
  };

  const handleDismissRestore = () => {
    if (restoreTimeoutId) {
      clearTimeout(restoreTimeoutId);
      setRestoreTimeoutId(null);
    }
    setShowRestoreToast(false);
    setDeletedItem(null);
  };

  const handleRestoreFromTrash = async (item: any) => {
    try {
      // Eliminar de la papelera
      const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
      const updatedTrash = currentTrash.filter((trashedItem: any) => 
        !(trashedItem.id === item.id && trashedItem.title === item.title)
      );
      localStorage.setItem('content-trash', JSON.stringify(updatedTrash));
      setTrashedItems(updatedTrash);

      // Crear el item de nuevo (sin el ID para que se genere uno nuevo)
      const { id, deletedDate, ...itemWithoutId } = item;
      const restoredItem = await contentAPI.createItem(itemWithoutId);
      
      // Extraer el item del objeto de respuesta
      const itemData = restoredItem.item || restoredItem;

      // Restaurar en el menú si es necesario
      if (itemData.visible && itemData.slug && item.menuLocations?.length > 0) {
        await updateMenuLocations({ ...itemData, menuLocations: item.menuLocations });
      }

      // Recargar la lista
      loadItems();

      // Mostrar mensaje de éxito
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Elemento restaurado correctamente</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Error al restaurar el elemento');
    }
  };

  const handlePermanentDelete = (item: any) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente "${item.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Eliminar de la papelera
      const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
      const updatedTrash = currentTrash.filter((trashedItem: any) => 
        !(trashedItem.id === item.id && trashedItem.title === item.title)
      );
      localStorage.setItem('content-trash', JSON.stringify(updatedTrash));
      setTrashedItems(updatedTrash);

      // Mostrar mensaje de éxito
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Elemento eliminado permanentemente</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error deleting item permanently:', error);
      alert('Error al eliminar permanentemente');
    }
  };

  const removeFromMenu = async (item: any) => {
    try {
      const response = await menuAPI.getMenu();
      const currentMenu = response.menu?.items || [];

      // Determinar el prefijo de la URL según el tipo
      const urlPrefix = 
        item.type === 'class' ? '/clases/' : 
        item.type === 'workshop' ? '/workshops/' : 
        '/privada/';

      const itemPath = `${urlPrefix}${item.slug}`;

      // Recorrer todos los items del menú principal
      const updatedMenu = currentMenu.map((menuItem: any) => {
        // Verificar si ya existe el item en este menú
        const existingItemIndex = (menuItem.submenu || []).findIndex(
          (subItem: any) => subItem.path === itemPath
        );

        // Si existe, eliminarlo
        if (existingItemIndex !== -1) {
          return {
            ...menuItem,
            submenu: (menuItem.submenu || []).filter(
              (subItem: any) => subItem.path !== itemPath
            )
          };
        } else {
          return menuItem;
        }
      });

      // Guardar el menú actualizado
      await menuAPI.saveMenu({ items: updatedMenu });
      console.log('Item eliminado del menú');
    } catch (error) {
      console.error('Error al eliminar del menú:', error);
    }
  };

  const handleClone = (item: any) => {
    // Prevenir clonaciones múltiples
    const actionId = `clone-${item.id}`;
    if (processingActions.has(actionId)) {
      return;
    }

    setProcessingActions(prev => new Set(prev).add(actionId));

    try {
      const { id, ...itemWithoutId } = item;
      const clonedItem = {
        ...itemWithoutId,
        title: `${item.title} (Copia)`,
        slug: item.slug ? `${item.slug}-copia` : '',
        visible: false, // Como borrador
      };
      setEditingItem(clonedItem);
      setShowEditor(true);
    } finally {
      // Remover el bloqueo después de un breve delay
      setTimeout(() => {
        setProcessingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionId);
          return newSet;
        });
      }, 500);
    }
  };

  const handleSave = async (item: any) => {
    // Prevenir guardados múltiples simultáneos
    const actionId = item.id ? `save-${item.id}` : `create-${item.title}`;
    if (processingActions.has(actionId)) {
      console.log('⚠️ Ya hay un guardado en progreso, ignorando...');
      return;
    }

    setProcessingActions(prev => new Set(prev).add(actionId));

    try {
      console.log('📥 ContentManager - Recibiendo item para guardar:', {
        includes: item.includes,
        includesLength: item.includes?.length,
        menuLocations: item.menuLocations
      });
      
      let savedItem;
      if (item.id) {
        savedItem = await contentAPI.updateItem(item.id, item);
      } else {
        savedItem = await contentAPI.createItem(item);
      }

      console.log('✅ ContentManager - Item guardado:', savedItem);

      // Extraer el item del objeto de respuesta
      const itemData = savedItem.item || savedItem;
      
      console.log('Item data extracted:', itemData);
      console.log('Visible:', itemData.visible, 'Slug:', itemData.slug, 'MenuLocations:', itemData.menuLocations);

      // Actualizar el menú según las ubicaciones seleccionadas
      if (itemData.visible && itemData.slug && itemData.menuLocations?.length > 0) {
        console.log('✅ Updating menu locations for:', itemData);
        await updateMenuLocations(itemData);
      } else {
        console.log('⚠️ Skipping menu update - item not visible or no slug or no menuLocations selected');
        console.log('   visible:', itemData.visible, 'slug:', itemData.slug, 'menuLocations:', itemData.menuLocations);
      }

      // Actualizar el item en edición con los datos guardados (incluyendo ID si es nuevo)
      setEditingItem(itemData);
      
      // Recargar la lista en segundo plano pero mantener el editor abierto
      loadItems();
      
      // Verificar si el slug fue modificado automáticamente
      const slugWasModified = item.slug && itemData.slug !== item.slug;
      
      // Mostrar mensaje de éxito
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Guardado exitosamente${slugWasModified ? ' (slug ajustado a: ' + itemData.slug + ')' : ''}</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 4000);
      
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error al guardar');
    } finally {
      // Remover el bloqueo después de un breve delay
      setTimeout(() => {
        setProcessingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionId);
          return newSet;
        });
      }, 1000); // 1 segundo de delay para evitar doble guardado
    }
  };

  const updateMenuLocations = async (item: any) => {
    try {
      const response = await menuAPI.getMenu();
      const currentMenu = response.menu?.items || [];

      // Determinar el prefijo de la URL según el tipo
      const urlPrefix = 
        item.type === 'class' ? '/clases/' : 
        item.type === 'workshop' ? '/workshops/' : 
        '/privada/';

      const itemPath = `${urlPrefix}${item.slug}`;

      // Obtener las ubicaciones seleccionadas (nombres de menús principales)
      const selectedLocations = item.menuLocations || [];

      // Recorrer todos los items del menú principal
      const updatedMenu = currentMenu.map((menuItem: any) => {
        // Si este menú está en las ubicaciones seleccionadas
        if (selectedLocations.includes(menuItem.name)) {
          // Verificar si ya existe el item en este menú
          const existingItemIndex = (menuItem.submenu || []).findIndex(
            (subItem: any) => subItem.path === itemPath
          );

          // Si no existe, agregarlo
          if (existingItemIndex === -1) {
            return {
              ...menuItem,
              submenu: [
                ...(menuItem.submenu || []),
                {
                  name: item.title,
                  path: itemPath,
                  order: (menuItem.submenu || []).length
                }
              ]
            };
          } else {
            // Si ya existe, actualizar el nombre por si cambió
            const updatedSubmenu = [...(menuItem.submenu || [])];
            updatedSubmenu[existingItemIndex] = {
              ...updatedSubmenu[existingItemIndex],
              name: item.title,
              path: itemPath
            };
            return {
              ...menuItem,
              submenu: updatedSubmenu
            };
          }
        } else {
          // Si este menú NO está en las ubicaciones seleccionadas, quitar el item si existe
          return {
            ...menuItem,
            submenu: (menuItem.submenu || []).filter(
              (subItem: any) => subItem.path !== itemPath
            )
          };
        }
      });

      // Guardar el menú actualizado
      await menuAPI.saveMenu({ items: updatedMenu });
      console.log('Menú actualizado según las ubicaciones seleccionadas:', selectedLocations);
    } catch (error) {
      console.error('Error al actualizar ubicaciones del menú:', error);
    }
  };

  const addToMenuAutomatically = async (item: any) => {
    // Esta función ya no se usa, pero la dejamos por compatibilidad
    console.log('addToMenuAutomatically deprecated - use updateMenuLocations instead');
  };

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInitializeClasses = async () => {
    if (!confirm('¿Crear clases de prueba? Se crearán 3 clases de ejemplo (Iniciación, Regular, Torno).')) return;

    try {
      setLoading(true);
      await initAPI.initializeClasses();
      alert('✅ Se han creado 3 clases de prueba correctamente');
      loadItems();
    } catch (error) {
      console.error('Error initializing classes:', error);
      alert('❌ Error al crear clases de prueba: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeWorkshops = async () => {
    if (!confirm('¿Crear workshops de prueba? Se crearán 4 workshops de ejemplo.')) return;

    try {
      setLoading(true);
      await initAPI.initializeWorkshops();
      alert('✅ Se han creado 4 workshops de prueba correctamente');
      loadItems();
    } catch (error) {
      console.error('Error initializing workshops:', error);
      alert('❌ Error al crear workshops de prueba: ' + error);
    } finally {
      setLoading(false);
    }
  };

  if (showEditor) {
    return (
      <ContentEditor
        item={editingItem}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-2">Clases</h1>
          <p className="text-sm sm:text-base text-foreground/60">Administra clases y workshops</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <motion.button
            onClick={() => setShowTrash(true)}
            className="flex-1 sm:flex-none bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Papelera"
          >
            <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Papelera</span>
            {trashedItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {trashedItems.length}
              </span>
            )}
          </motion.button>
          <motion.button
            onClick={handleCreate}
            className="flex-1 sm:flex-none bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Crear nuevo
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Primera fila: Búsqueda y Filtros de tipo */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 sm:flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('class')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ${
                  filter === 'class'
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                Clases
              </button>
              <button
                onClick={() => setFilter('workshop')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ${
                  filter === 'workshop'
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                <span className="hidden xs:inline">Workshops</span>
                <span className="xs:hidden">Works</span>
              </button>
              <button
                onClick={() => setFilter('private')}
                className={`px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ${
                  filter === 'private'
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                <span className="hidden xs:inline">Privadas</span>
                <span className="xs:hidden">Priv</span>
              </button>
            </div>
          </div>
          
          {/* Segunda fila: Ordenamiento */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 pt-3 sm:pt-4 border-t border-foreground/10">
            <span className="text-xs sm:text-sm text-foreground/60">Ordenar por:</span>
            <div className="flex gap-2 w-full xs:w-auto">
              <button
                onClick={() => setSortOrder('newest')}
                className={`flex-1 xs:flex-none px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm ${
                  sortOrder === 'newest'
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                <SortDesc className="w-4 h-4" />
                <span className="hidden sm:inline">Más recientes</span>
                <span className="sm:hidden">Nuevos</span>
              </button>
              <button
                onClick={() => setSortOrder('oldest')}
                className={`flex-1 xs:flex-none px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm ${
                  sortOrder === 'oldest'
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                }`}
              >
                <SortAsc className="w-4 h-4" />
                <span className="hidden sm:inline">Más antiguos</span>
                <span className="sm:hidden">Antiguos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/60">Cargando...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-foreground/60 mb-4">No hay elementos para mostrar</p>
          <button
            onClick={handleCreate}
            className="text-primary hover:underline"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg sm:text-xl">{item.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.type === 'class'
                          ? 'bg-blue-100 text-blue-700'
                          : item.type === 'workshop'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.type === 'class' ? 'Clase' : item.type === 'workshop' ? 'Workshop' : 'Privada'}
                    </span>
                    {!item.visible && (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Borrador
                      </span>
                    )}
                    {item.showInHome && (
                      <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-700 flex items-center gap-1">
                        🏠 Cursos
                      </span>
                    )}
                    {item.showInHomeWorkshops && (
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 flex items-center gap-1">
                        🎨 Workshops
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/60 mb-2">{item.subtitle}</p>
                  <p className="text-sm">
                    <span className="text-primary">{item.price}€</span>
                    {item.duration && <span className="text-foreground/60"> • {item.duration}</span>}
                  </p>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 sm:flex-none p-2 hover:bg-foreground/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/70" />
                    <span className="sm:hidden text-sm">Editar</span>
                  </button>
                  <button
                    onClick={() => handleClone(item)}
                    disabled={processingActions.has(`clone-${item.id}`)}
                    className={`flex-1 sm:flex-none p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      processingActions.has(`clone-${item.id}`)
                        ? 'bg-blue-100 cursor-not-allowed opacity-50'
                        : 'hover:bg-blue-50'
                    }`}
                    title="Clonar"
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="sm:hidden text-sm">Clonar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={processingActions.has(`delete-${item.id}`)}
                    className={`flex-1 sm:flex-none p-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      processingActions.has(`delete-${item.id}`)
                        ? 'bg-red-100 cursor-not-allowed opacity-50'
                        : 'hover:bg-red-50'
                    }`}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    <span className="sm:hidden text-sm">Eliminar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Toast de Restauración */}
      {showRestoreToast && deletedItem && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 bg-foreground text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-4 max-w-md"
        >
          <div className="flex-1">
            <p className="font-medium mb-1">Elemento eliminado</p>
            <p className="text-sm text-white/80">"{deletedItem.title}" ha sido eliminado</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRestore}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Restaurar
            </button>
            <button
              onClick={handleDismissRestore}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal de Papelera */}
      {showTrash && (
        <TrashModal
          trashedItems={trashedItems}
          onRestore={handleRestoreFromTrash}
          onPermanentDelete={handlePermanentDelete}
          onClose={() => setShowTrash(false)}
        />
      )}
    </div>
  );
}