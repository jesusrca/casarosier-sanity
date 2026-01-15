import { useState, useEffect } from 'react';
import { menuAPI, contentAPI, pagesAPI } from '../../utils/api';
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AutocompleteInput } from '../../components/AutocompleteInput';
import { NavigationBlocker } from '../../components/NavigationBlocker';

interface SubMenuItem {
  name: string;
  path: string;
  order: number;
}

interface MenuItem {
  name: string;
  path?: string;
  submenu?: SubMenuItem[];
  order: number;
}

interface ContentPage {
  name: string;
  path: string;
}

export function MenuManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [initialMenuSnapshot, setInitialMenuSnapshot] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [availablePages, setAvailablePages] = useState<ContentPage[]>([]);

  // Detectar cambios no guardados
  useEffect(() => {
    const currentSnapshot = JSON.stringify(menuItems);
    if (initialMenuSnapshot && currentSnapshot !== initialMenuSnapshot) {
      setHasUnsavedChanges(true);
    } else if (initialMenuSnapshot) {
      setHasUnsavedChanges(false);
    }
  }, [menuItems, initialMenuSnapshot]);

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
    loadMenu();
    loadAvailablePages();
  }, []);

  const loadAvailablePages = async () => {
    try {
      const pages: ContentPage[] = [];
      
      // Cargar contenidos (clases y workshops)
      const contentResponse = await contentAPI.getAllItems();
      if (contentResponse.items) {
        contentResponse.items.forEach((item: any) => {
          if (item.visible && item.slug) {
            const basePath = item.type === 'class' ? '/clases' : '/workshops';
            pages.push({
              name: item.title,
              path: `${basePath}/${item.slug}`
            });
          }
        });
      }

      // Cargar páginas personalizadas
      const pageResponse = await pagesAPI.getAllPages();
      if (pageResponse.pages) {
        pageResponse.pages.forEach((page: any) => {
          if (page.visible && page.slug) {
            pages.push({
              name: page.title,
              path: `/${page.slug}`
            });
          }
        });
      }

      // Agregar páginas estáticas comunes
      pages.push(
        { name: 'Inicio', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: 'El Estudio', path: '/el-estudio' },
        { name: 'Tarjeta de regalo', path: '/tarjeta-regalo' },
        { name: 'Tiendita', path: '/tiendita' },
        { name: 'Espacios Privados', path: '/espacios-privados' }
      );

      setAvailablePages(pages);
    } catch (error) {
      console.error('Error loading available pages:', error);
    }
  };

  const loadMenu = async () => {
    try {
      const response = await menuAPI.getMenu();
      if (response.menu?.items) {
        setMenuItems(response.menu.items.sort((a: MenuItem, b: MenuItem) => a.order - b.order));
        setInitialMenuSnapshot(JSON.stringify(response.menu.items));
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      showMessage('error', 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  const saveMenu = async () => {
    setSaving(true);
    try {
      await menuAPI.saveMenu({ items: menuItems });
      showMessage('success', 'Menú guardado correctamente');
      setInitialMenuSnapshot(JSON.stringify(menuItems));
    } catch (error) {
      console.error('Error saving menu:', error);
      showMessage('error', 'Error al guardar el menú');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      name: 'Nuevo Item',
      path: '/',
      order: menuItems.length,
    };
    setMenuItems([...menuItems, newItem]);
  };

  const addSubmenuItem = (parentIndex: number) => {
    const newItems = [...menuItems];
    if (!newItems[parentIndex].submenu) {
      newItems[parentIndex].submenu = [];
      // Ya no eliminamos el path automáticamente
      // El usuario decide si quiere link o no
    }
    newItems[parentIndex].submenu!.push({
      name: 'Nuevo Subitem',
      path: '/',
      order: newItems[parentIndex].submenu!.length,
    });
    setMenuItems(newItems);
    setExpandedItems(new Set(expandedItems).add(parentIndex));
  };

  const updateMenuItem = (index: number, field: 'name' | 'path', value: string) => {
    const newItems = [...menuItems];
    if (field === 'path') {
      newItems[index].path = value;
    } else {
      newItems[index].name = value;
    }
    setMenuItems(newItems);
  };

  const updateSubmenuItem = (parentIndex: number, subIndex: number, field: 'name' | 'path', value: string) => {
    const newItems = [...menuItems];
    if (newItems[parentIndex].submenu) {
      newItems[parentIndex].submenu![subIndex][field] = value;
      setMenuItems(newItems);
    }
  };

  const deleteMenuItem = (index: number) => {
    if (confirm('¿Estás seguro de eliminar este item del menú?')) {
      const newItems = menuItems.filter((_, i) => i !== index);
      // Reorder
      newItems.forEach((item, i) => item.order = i);
      setMenuItems(newItems);
    }
  };

  const deleteSubmenuItem = (parentIndex: number, subIndex: number) => {
    if (confirm('¿Estás seguro de eliminar este subitem?')) {
      const newItems = [...menuItems];
      newItems[parentIndex].submenu = newItems[parentIndex].submenu!.filter((_, i) => i !== subIndex);
      // Reorder
      newItems[parentIndex].submenu!.forEach((item, i) => item.order = i);
      // If no submenu items left, convert back to regular item
      if (newItems[parentIndex].submenu!.length === 0) {
        delete newItems[parentIndex].submenu;
        newItems[parentIndex].path = '/';
      }
      setMenuItems(newItems);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => item.order = i);
    setMenuItems(newItems);
  };

  const moveSubmenuItem = (parentIndex: number, subIndex: number, direction: 'up' | 'down') => {
    const newItems = [...menuItems];
    const submenu = newItems[parentIndex].submenu!;
    const targetIndex = direction === 'up' ? subIndex - 1 : subIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= submenu.length) return;
    
    [submenu[subIndex], submenu[targetIndex]] = [submenu[targetIndex], submenu[subIndex]];
    submenu.forEach((item, i) => item.order = i);
    setMenuItems(newItems);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const convertToSubmenu = (index: number) => {
    const newItems = [...menuItems];
    newItems[index].submenu = [];
    delete newItems[index].path;
    setMenuItems(newItems);
    setExpandedItems(new Set(expandedItems).add(index));
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando menú...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl">Gestión del Menú</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={addMenuItem}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              <Plus size={16} />
              <span className="whitespace-nowrap">Agregar Item</span>
            </button>
            <button
              onClick={saveMenu}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <Save size={16} />
              <span className="whitespace-nowrap">{saving ? 'Guardando...' : 'Guardar Menú'}</span>
            </button>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-lg mb-4 text-sm sm:text-base ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 p-3 sm:p-4 bg-gray-50">
                {/* Botones de orden - Horizontales en mobile, verticales en desktop */}
                <div className="flex sm:flex-col gap-2 sm:gap-1 justify-center">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1"
                    title="Mover arriba"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === menuItems.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1"
                    title="Mover abajo"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                {/* Botón de expandir/contraer */}
                {item.submenu ? (
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="text-gray-500 hover:text-gray-700 sm:self-center p-1"
                    title={expandedItems.has(index) ? 'Contraer' : 'Expandir'}
                  >
                    {expandedItems.has(index) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                ) : <div className="hidden sm:block w-5"></div>}

                {/* Campos de nombre y ruta - Apilados en mobile */}
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <AutocompleteInput
                    value={item.name}
                    onChange={(value) => updateMenuItem(index, 'name', value)}
                    onSelectPath={(path) => updateMenuItem(index, 'path', path)}
                    options={availablePages}
                    placeholder="Nombre del item"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    type="name"
                  />
                  <AutocompleteInput
                    value={item.path || ''}
                    onChange={(value) => updateMenuItem(index, 'path', value)}
                    options={availablePages}
                    placeholder={item.submenu ? "Ruta (opcional)" : "Ruta (ej: /clases)"}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    type="path"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 justify-end sm:justify-start">
                  {!item.submenu && (
                    <button
                      onClick={() => convertToSubmenu(index)}
                      className="px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
                    >
                      + Submenú
                    </button>
                  )}
                  {item.submenu && (
                    <button
                      onClick={() => addSubmenuItem(index)}
                      className="px-3 py-2 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
                    >
                      + Subitem
                    </button>
                  )}
                  <button
                    onClick={() => deleteMenuItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Submenu Items */}
              <AnimatePresence>
                {item.submenu && expandedItems.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 bg-gray-50/50"
                  >
                    <div className="p-3 sm:p-4 space-y-2">
                      {item.submenu.map((subItem, subIndex) => (
                        <div key={subIndex} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2 sm:p-3 rounded-lg">
                          {/* Botones de orden - Horizontales en mobile, verticales en desktop */}
                          <div className="flex sm:flex-col gap-2 sm:gap-1 justify-center">
                            <button
                              onClick={() => moveSubmenuItem(index, subIndex, 'up')}
                              disabled={subIndex === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1"
                              title="Mover arriba"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              onClick={() => moveSubmenuItem(index, subIndex, 'down')}
                              disabled={subIndex === item.submenu!.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1"
                              title="Mover abajo"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>

                          {/* Campos de nombre y ruta - Apilados en mobile */}
                          <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <AutocompleteInput
                              value={subItem.name}
                              onChange={(value) => updateSubmenuItem(index, subIndex, 'name', value)}
                              onSelectPath={(path) => updateSubmenuItem(index, subIndex, 'path', path)}
                              options={availablePages}
                              placeholder="Nombre del subitem"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              type="name"
                            />
                            <AutocompleteInput
                              value={subItem.path}
                              onChange={(value) => updateSubmenuItem(index, subIndex, 'path', value)}
                              options={availablePages}
                              placeholder="Ruta (ej: /clases/torno)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              type="path"
                            />
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => deleteSubmenuItem(index, subIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-center"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm sm:text-base">
            No hay items en el menú. Agrega uno para comenzar.
          </div>
        )}
      </div>

      {/* Bloqueador de navegación */}
      <NavigationBlocker
        when={hasUnsavedChanges}
        onSave={async () => {
          await saveMenu();
        }}
        onDiscard={() => {
          setHasUnsavedChanges(false);
        }}
      />
    </div>
  );
}