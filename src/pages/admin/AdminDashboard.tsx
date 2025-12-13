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
  RefreshCw
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

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
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
    
    // Limpiar localStorage excepto la sesión de autenticación
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') || key === 'rememberAdmin'
    );
    const authData: { [key: string]: string } = {};
    authKeys.forEach(key => {
      authData[key] = localStorage.getItem(key) || '';
    });
    
    localStorage.clear();
    
    // Restaurar datos de autenticación
    Object.entries(authData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Hacer un hard refresh después de 500ms
    setTimeout(() => {
      window.location.reload();
    }, 500);
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
              onClick={handleClearCache}
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
          </Routes>
        </main>
      </div>
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