import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Settings, 
  LogOut,
  Menu as MenuIcon,
  X,
  List,
  FileImage,
  Users,
  Mail,
  Image,
  RefreshCw,
  Gift,
  ArrowRightLeft
} from 'lucide-react';
import { ContentManager } from './ContentManager';
import { BlogManager } from './BlogManager';
import { SettingsManager } from './SettingsManager';
import { MenuManager } from './MenuManager';
import { CustomPagesManager } from './CustomPagesManager';
import { UserManager } from './UserManager';
import { MessagesManager } from './MessagesManager';
import { ImageLibrary } from './ImageLibrary';
import { Dashboard } from './Dashboard';
import { GiftCardManager } from './GiftCardManager';
import { RedirectsManager } from './RedirectsManager';

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [cacheOption, setCacheOption] = useState<'all' | 'content' | 'images'>('all');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    // Solo redirigir si terminó de cargar y no hay usuario
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleClearCache = () => {
    setClearingCache(true);
    
    // Guardar datos de autenticación
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') || key === 'rememberAdmin'
    );
    const authData: { [key: string]: string } = {};
    authKeys.forEach(key => {
      authData[key] = localStorage.getItem(key) || '';
    });

    switch (cacheOption) {
      case 'all':
        // Limpiar todo
        localStorage.clear();
        sessionStorage.clear();
        
        // Restaurar autenticación
        Object.entries(authData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        
        // Hard refresh
        setTimeout(() => {
          window.location.reload();
        }, 500);
        break;

      case 'content':
        // Limpiar solo contenido (páginas, clases, blog)
        const contentKeys = Object.keys(localStorage).filter(key =>
          key.includes('page_') || 
          key.includes('class_') || 
          key.includes('blog_') ||
          key.includes('content_') ||
          key.includes('menu_')
        );
        contentKeys.forEach(key => localStorage.removeItem(key));
        
        // Limpiar sessionStorage
        sessionStorage.clear();
        
        // Soft refresh
        setTimeout(() => {
          window.location.reload();
        }, 300);
        break;

      case 'images':
        // Limpiar solo imágenes
        const imageKeys = Object.keys(localStorage).filter(key =>
          key.includes('image_') || key.includes('img_')
        );
        imageKeys.forEach(key => localStorage.removeItem(key));
        
        // Forzar recarga de imágenes con cache busting
        setTimeout(() => {
          // Hard reload para forzar descarga de imágenes
          window.location.reload();
        }, 300);
        break;

      default:
        setClearingCache(false);
        setShowCacheModal(false);
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'editor'] },
    { path: '/admin/dashboard/pages', icon: FileImage, label: 'Páginas', roles: ['super_admin'] },
    { path: '/admin/dashboard/content', icon: FileText, label: 'Clases', roles: ['super_admin', 'editor'] },
    { path: '/admin/dashboard/blog', icon: BookOpen, label: 'Blog', roles: ['super_admin', 'editor'] },
    { path: '/admin/dashboard/menu', icon: List, label: 'Menú', roles: ['super_admin'] },
    { path: '/admin/dashboard/messages', icon: Mail, label: 'Mensajes', roles: ['super_admin', 'editor'] },
    { path: '/admin/dashboard/users', icon: Users, label: 'Usuarios', roles: ['super_admin'] },
    { path: '/admin/dashboard/settings', icon: Settings, label: 'Ajustes', roles: ['super_admin'] },
    { path: '/admin/dashboard/images', icon: Image, label: 'Imágenes', roles: ['super_admin'] },
    { path: '/admin/dashboard/giftcards', icon: Gift, label: 'Tarjetas Regalo', roles: ['super_admin'] },
    { path: '/admin/dashboard/redirects', icon: ArrowRightLeft, label: 'Redirecciones', roles: ['super_admin'] },
  ];

  // Filtrar items del menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'editor')
  );

  // Si no hay usuario y terminó de cargar, ya se redirigió
  // No mostrar nada mientras se redirige
  if (!loading && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen
          w-64 bg-white border-r border-border flex flex-col
          z-50 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl text-foreground">Panel Admin</h2>
          <p className="text-sm text-foreground/60 mt-1">Casa Rosier</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      // Close sidebar on mobile when clicking a menu item
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-foreground/10 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-foreground/5 rounded-lg transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCacheModal(true)}
              disabled={clearingCache}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors disabled:opacity-50"
              title="Limpiar caché y refrescar"
            >
              <RefreshCw className={`w-4 h-4 ${clearingCache ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Limpiar caché</span>
            </button>
            <Link
              to="/"
              className="text-sm text-primary hover:underline"
              target="_blank"
            >
              Ver sitio web →
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/content" element={<ContentManager />} />
            <Route path="/blog" element={<BlogManager />} />
            <Route path="/settings" element={<SettingsManager />} />
            <Route path="/menu" element={<MenuManager />} />
            <Route path="/pages" element={<CustomPagesManager />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/messages" element={<MessagesManager />} />
            <Route path="/images" element={<ImageLibrary />} />
            <Route path="/giftcards" element={<GiftCardManager />} />
            <Route path="/redirects" element={<RedirectsManager />} />
          </Routes>
        </main>
      </div>

      {/* Cache Modal */}
      {showCacheModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCacheModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-6 h-6" />
                <h3 className="text-xl">Limpiar Caché</h3>
              </div>
              <p className="text-sm text-white/90">
                Optimiza el rendimiento del panel de administración
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-foreground/70">
                Selecciona qué tipo de datos deseas limpiar:
              </p>

              {/* Options */}
              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    cacheOption === 'all'
                      ? 'border-primary bg-primary/5'
                      : 'border-foreground/10 hover:border-primary/30 hover:bg-foreground/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="cacheOption"
                    value="all"
                    checked={cacheOption === 'all'}
                    onChange={(e) => setCacheOption(e.target.value as any)}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-1">Limpiar Todo</div>
                    <div className="text-sm text-foreground/60">
                      Elimina todos los datos almacenados y recarga la página completamente.
                      Recomendado si experimentas problemas de visualización.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    cacheOption === 'content'
                      ? 'border-primary bg-primary/5'
                      : 'border-foreground/10 hover:border-primary/30 hover:bg-foreground/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="cacheOption"
                    value="content"
                    checked={cacheOption === 'content'}
                    onChange={(e) => setCacheOption(e.target.value as any)}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-1">Limpiar Contenido</div>
                    <div className="text-sm text-foreground/60">
                      Elimina solo la caché de páginas, clases y blog. Útil después de hacer cambios importantes.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    cacheOption === 'images'
                      ? 'border-primary bg-primary/5'
                      : 'border-foreground/10 hover:border-primary/30 hover:bg-foreground/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="cacheOption"
                    value="images"
                    checked={cacheOption === 'images'}
                    onChange={(e) => setCacheOption(e.target.value as any)}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-1">Limpiar Imágenes</div>
                    <div className="text-sm text-foreground/60">
                      Recarga las imágenes del navegador. Usa esto si las imágenes no se actualizan correctamente.
                    </div>
                  </div>
                </label>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 mt-0.5">ℹ️</div>
                  <div className="text-sm text-blue-900">
                    <strong>Nota:</strong> Tu sesión de autenticación se mantendrá activa después de limpiar la caché.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-foreground/5 px-6 py-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowCacheModal(false)}
                disabled={clearingCache}
                className="px-5 py-2.5 text-sm text-foreground/60 hover:text-foreground hover:bg-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="px-6 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {clearingCache ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Limpiando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Limpiar Caché
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DashboardHome() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl mb-6">Bienvenido al Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/content" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <FileText className="w-8 h-8 text-primary mb-3" />
          <h3 className="text-xl mb-2">Contenido</h3>
          <p className="text-sm text-foreground/60">
            Gestiona clases, workshops y páginas
          </p>
        </Link>

        <Link to="/admin/blog" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <BookOpen className="w-8 h-8 text-primary mb-3" />
          <h3 className="text-xl mb-2">Blog</h3>
          <p className="text-sm text-foreground/60">
            Crea y edita artículos del blog
          </p>
        </Link>

        <Link to="/admin/settings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Settings className="w-8 h-8 text-primary mb-3" />
          <h3 className="text-xl mb-2">Ajustes</h3>
          <p className="text-sm text-foreground/60">
            Configura SEO y ajustes del sitio
          </p>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl mb-4">Guía Rápida</h3>
        <ul className="space-y-3 text-sm text-foreground/80">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Páginas:</strong> Edita el contenido de todas las páginas del sitio (Inicio, El Estudio, etc.)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Clases y Workshops:</strong> Crea y edita contenido usando plantillas predefinidas con secciones personalizables
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Blog:</strong> Publica artículos con editor de texto enriquecido y optimización SEO automática
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Menú:</strong> Personaliza la estructura del menú principal con items y submenús
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Mensajes:</strong> Revisa los mensajes de contacto enviados desde el formulario del sitio
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Usuarios:</strong> Gestiona el equipo con roles (Super Admin / Editor) y permisos
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Imágenes:</strong> Sube imágenes directamente desde tu computadora (máx. 10MB, formatos: JPG, PNG, GIF, WebP)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Historial:</strong> Todas las ediciones de contenido se guardan automáticamente durante 30 días
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>SEO:</strong> Meta títulos, descripciones y URLs se generan automáticamente para mejor posicionamiento
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}