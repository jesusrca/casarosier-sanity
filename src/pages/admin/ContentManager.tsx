import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { contentAPI, initAPI } from '../../utils/api';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Copy, Database } from 'lucide-react';
import { ContentEditor } from './ContentEditor';
import { menuAPI } from '../../utils/api';

export function ContentManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'class' | 'workshop' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadItems();
  }, [filter]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const type = filter === 'all' ? undefined : filter;
      const response = await contentAPI.getItems(type);
      setItems(response.items || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem({
      type: 'class',
      title: '',
      subtitle: '',
      slug: '',
      shortDescription: '',
      description: '',
      price: 0,
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
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;

    try {
      // Obtener el item antes de eliminarlo para poder limpiarlo del menú
      const itemToDelete = items.find(item => item.id === id);
      
      await contentAPI.deleteItem(id);
      
      // Limpiar del menú si tiene slug
      if (itemToDelete && itemToDelete.slug) {
        await removeFromMenu(itemToDelete);
      }
      
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error al eliminar');
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
    const { id, ...itemWithoutId } = item;
    const clonedItem = {
      ...itemWithoutId,
      title: `${item.title} (Copia)`,
      slug: item.slug ? `${item.slug}-copia` : '',
      visible: false, // Como borrador
    };
    setEditingItem(clonedItem);
    setShowEditor(true);
  };

  const handleSave = async (item: any) => {
    try {
      console.log('Saving item with menuLocations:', item.menuLocations);
      
      let savedItem;
      if (item.id) {
        savedItem = await contentAPI.updateItem(item.id, item);
      } else {
        savedItem = await contentAPI.createItem(item);
      }

      console.log('Saved item received:', savedItem);

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
      
      // Mostrar mensaje de éxito
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Guardado exitosamente</span>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error al guardar');
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

  const handleRestoreVersion = (restoredItem: any) => {
    setEditingItem(restoredItem);
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
            onClick={filter === 'workshop' ? handleInitializeWorkshops : handleInitializeClasses}
            className="flex-1 sm:flex-none bg-foreground/10 text-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-foreground/20 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={filter === 'workshop' ? 'Crear workshops de prueba' : 'Crear clases de prueba'}
          >
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Contenido de Prueba</span>
            <span className="sm:hidden">Prueba</span>
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('class')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'class'
                  ? 'bg-primary text-white'
                  : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
              }`}
            >
              Clases
            </button>
            <button
              onClick={() => setFilter('workshop')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'workshop'
                  ? 'bg-primary text-white'
                  : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
              }`}
            >
              Workshops
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'private'
                  ? 'bg-primary text-white'
                  : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
              }`}
            >
              Privadas
            </button>
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
                {item.images?.[0] && (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
                  />
                )}
                
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
                    className="flex-1 sm:flex-none p-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                    title="Clonar"
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="sm:hidden text-sm">Clonar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 sm:flex-none p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
}