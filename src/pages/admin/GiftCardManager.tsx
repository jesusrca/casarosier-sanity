import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { contentAPI } from '../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Copy, SortDesc, SortAsc, RotateCcw, Trash } from 'lucide-react';
import { ContentEditor } from './ContentEditor';
import { menuAPI } from '../../utils/api';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { TrashModal } from '../../components/TrashModal';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';

export function GiftCardManager() {
  const { user } = useAuth();
  const isEditor = user?.role === 'editor';
  const { refreshContent } = useContent();
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadItems();
    loadTrash();
  }, [sortOrder]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await contentAPI.getItems('gift-card');
      let sortedItems = response.items || [];
      
      if (sortOrder === 'newest') {
        sortedItems.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sortOrder === 'oldest') {
        sortedItems.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
      }
      
      setItems(sortedItems);
    } catch (error) {
      console.error('Error loading gift cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrash = () => {
    const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
    const giftCardTrash = currentTrash.filter((item: any) => item.type === 'gift-card');
    setTrashedItems(giftCardTrash);
  };

  const handleCreate = () => {
    setEditingItem({
      type: 'gift-card',
      title: '',
      subtitle: '',
      slug: '',
      shortDescription: '',
      description: '',
      price: 0,
      priceOptions: [],
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
      menuLocations: [],
      showInHome: false,
      showInHomeWorkshops: false,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      },
    });
    setShowEditor(true);
  };

  const handleEdit = (item: any) => {
    loadCurrentMenuLocations(item).then(itemWithLocations => {
      setEditingItem(itemWithLocations);
      setShowEditor(true);
    });
  };

  const loadCurrentMenuLocations = async (item: any): Promise<any> => {
    try {
      const response = await menuAPI.getMenu();
      const currentMenu = response.menu?.items || [];
      const itemPath = `/gift-card/${item.slug}`;

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
    const actionId = `delete-${id}`;
    if (processingActions.has(actionId)) {
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta tarjeta de regalo?')) return;

    setProcessingActions(prev => new Set(prev).add(actionId));

    try {
      const itemToDelete = items.find(item => item.id === id);
      if (itemToDelete) {
        const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
        currentTrash.push(itemToDelete);
        localStorage.setItem('content-trash', JSON.stringify(currentTrash));

        const itemPath = `/gift-card/${itemToDelete.slug}`;
        try {
          const menuResponse = await menuAPI.getMenu();
          const currentMenu = menuResponse.menu?.items || [];
          let menuUpdated = false;
          
          const updatedMenu = currentMenu.map((menuItem: any) => {
            if (menuItem.submenu && menuItem.submenu.length > 0) {
              const originalLength = menuItem.submenu.length;
              const updatedSubmenu = menuItem.submenu.filter((subItem: any) => subItem.path !== itemPath);
              
              if (updatedSubmenu.length < originalLength) {
                menuUpdated = true;
              }
              
              return { ...menuItem, submenu: updatedSubmenu };
            }
            return menuItem;
          });

          if (menuUpdated) {
            await menuAPI.saveMenu({ items: updatedMenu });
          }
        } catch (menuError) {
          console.error('Error al actualizar el menú:', menuError);
        }

        await contentAPI.deleteItem(id);
        await refreshContent();
        setItems(prevItems => prevItems.filter(item => item.id !== id));

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

  const handleRestore = async () => {
    if (!deletedItem) return;

    try {
      if (restoreTimeoutId) {
        clearTimeout(restoreTimeoutId);
        setRestoreTimeoutId(null);
      }

      setShowRestoreToast(false);

      const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
      const updatedTrash = currentTrash.filter((trashedItem: any) => 
        !(trashedItem.id === deletedItem.id && trashedItem.title === deletedItem.title)
      );
      localStorage.setItem('content-trash', JSON.stringify(updatedTrash));
      setTrashedItems(updatedTrash.filter((item: any) => item.type === 'gift-card'));

      const { id, deletedDate, ...itemWithoutId } = deletedItem;
      const restoredItem = await contentAPI.createItem(itemWithoutId);
      const itemData = restoredItem.item || restoredItem;

      if (itemData.visible && itemData.slug && deletedItem.menuLocations?.length > 0) {
        await updateMenuLocations({ ...itemData, menuLocations: deletedItem.menuLocations });
      }

      loadItems();
      setDeletedItem(null);

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Tarjeta restaurada correctamente</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Error al restaurar la tarjeta');
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
      const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
      const updatedTrash = currentTrash.filter((trashedItem: any) => 
        !(trashedItem.id === item.id && trashedItem.title === item.title)
      );
      localStorage.setItem('content-trash', JSON.stringify(updatedTrash));
      setTrashedItems(updatedTrash.filter((item: any) => item.type === 'gift-card'));

      const { id, deletedDate, ...itemWithoutId } = item;
      const restoredItem = await contentAPI.createItem(itemWithoutId);
      const itemData = restoredItem.item || restoredItem;

      if (itemData.visible && itemData.slug && item.menuLocations?.length > 0) {
        await updateMenuLocations({ ...itemData, menuLocations: item.menuLocations });
      }

      loadItems();

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Tarjeta restaurada correctamente</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Error al restaurar la tarjeta');
    }
  };

  const handlePermanentDelete = (item: any) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente "${item.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const currentTrash = JSON.parse(localStorage.getItem('content-trash') || '[]');
      const updatedTrash = currentTrash.filter((trashedItem: any) => 
        !(trashedItem.id === item.id && trashedItem.title === item.title)
      );
      localStorage.setItem('content-trash', JSON.stringify(updatedTrash));
      setTrashedItems(updatedTrash.filter((item: any) => item.type === 'gift-card'));

      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Tarjeta eliminada permanentemente</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (error) {
      console.error('Error deleting item permanently:', error);
      alert('Error al eliminar permanentemente');
    }
  };

  const handleClone = (item: any) => {
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
        visible: false,
      };
      setEditingItem(clonedItem);
      setShowEditor(true);
    } finally {
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
    const actionId = item.id ? `save-${item.id}` : `create-${item.title}`;
    if (processingActions.has(actionId)) {
      return;
    }

    setProcessingActions(prev => new Set(prev).add(actionId));

    try {
      let savedItem;
      if (item.id) {
        savedItem = await contentAPI.updateItem(item.id, item);
      } else {
        savedItem = await contentAPI.createItem(item);
      }

      const itemData = savedItem.item || savedItem;

      if (itemData.visible && itemData.slug && itemData.menuLocations?.length > 0) {
        await updateMenuLocations(itemData);
      }

      setEditingItem(itemData);
      loadItems();
      
      const slugWasModified = item.slug && itemData.slug !== item.slug;
      
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
      setTimeout(() => {
        setProcessingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionId);
          return newSet;
        });
      }, 1000);
    }
  };

  const updateMenuLocations = async (item: any) => {
    try {
      const response = await menuAPI.getMenu();
      const currentMenu = response.menu?.items || [];
      const itemPath = `/gift-card/${item.slug}`;
      const selectedLocations = item.menuLocations || [];

      const updatedMenu = currentMenu.map((menuItem: any) => {
        if (selectedLocations.includes(menuItem.name)) {
          const existingItemIndex = (menuItem.submenu || []).findIndex(
            (subItem: any) => subItem.path === itemPath
          );

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
          return {
            ...menuItem,
            submenu: (menuItem.submenu || []).filter(
              (subItem: any) => subItem.path !== itemPath
            )
          };
        }
      });

      await menuAPI.saveMenu({ items: updatedMenu });
    } catch (error) {
      console.error('Error al actualizar ubicaciones del menú:', error);
    }
  };

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl sm:text-3xl mb-2">Tarjetas de Regalo</h1>
          <p className="text-sm sm:text-base text-foreground/60">Gestiona las tarjetas de regalo</p>
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
            Crear nueva
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar tarjetas de regalo..."
                  className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-4 border-t border-foreground/10">
            <span className="text-sm text-foreground/60">Ordenar por:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder('newest')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
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
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
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
          <p className="text-foreground/60 mb-4">No hay tarjetas de regalo para mostrar</p>
          <button
            onClick={handleCreate}
            className="text-primary hover:underline"
          >
            Crear la primera
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
                    <span className="px-2 py-1 rounded text-xs bg-pink-100 text-pink-700">
                      Tarjeta de Regalo
                    </span>
                    {!item.visible && (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Borrador
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
            <p className="font-medium mb-1">Tarjeta eliminada</p>
            <p className="text-sm text-white/80">"{deletedItem.title}" ha sido eliminada</p>
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