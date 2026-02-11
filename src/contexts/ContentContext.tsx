import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchBlogPosts, fetchContentItems, fetchMenu, fetchPages, fetchSettings } from '../utils/sanityQueries';

interface ContentItem {
  id: string;
  type: 'class' | 'workshop' | 'private' | 'gift-card';
  title: string;
  slug: string;
  subtitle?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  duration?: string;
  includes?: string[];
  images?: Array<string | { url: string; alt?: string; caption?: string }>;
  schedule?: any;
  content?: any;
  visible: boolean;
  seo?: any;
  heroImage?: string;
  titleImage?: string;
}

interface BlogPost {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author?: string;
  category?: string;
  publishedAt?: string;
  published: boolean;
  featured?: boolean;
  seo?: any;
}

interface MenuItem {
  name: string;
  path?: string;
  submenu?: {
    name: string;
    path: string;
    order?: number;
  }[];
  order?: number;
}

interface Page {
  slug: string;
  title: string;
  content: any;
  visible: boolean;
  seo?: any;
  heroImage?: string;
}

interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia?: any;
  seo?: any;
}

interface ContentContextType {
  // Data
  classes: ContentItem[];
  workshops: ContentItem[];
  privates: ContentItem[];
  giftCards: ContentItem[];
  blogPosts: BlogPost[];
  menuItems: MenuItem[];
  pages: Page[];
  settings: SiteSettings;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Methods
  getClassBySlug: (slug: string) => ContentItem | undefined;
  getWorkshopBySlug: (slug: string) => ContentItem | undefined;
  getPrivateBySlug: (slug: string) => ContentItem | undefined;
  getGiftCardBySlug: (slug: string) => ContentItem | undefined;
  getBlogPostBySlug: (slug: string) => BlogPost | undefined;
  getPageBySlug: (slug: string) => Page | undefined;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ContentItem[]>([]);
  const [workshops, setWorkshops] = useState<ContentItem[]>([]);
  const [privates, setPrivates] = useState<ContentItem[]>([]);
  const [giftCards, setGiftCards] = useState<ContentItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const legacyClassSlugMap: Record<string, string> = {
    'clases-de-un-dia-iniciacion-en-ceramica': 'iniciacion',
    'cursos-ceramica-barcelona-modelado': 'regular',
    'cursos-ceramica-barcelona-torno': 'torno',
    'laboratorio-ceramico': 'laboratorio',
  };

  const mapClassSlugToLegacy = (slug?: string) => {
    if (!slug) return slug;
    return legacyClassSlugMap[slug] || slug;
  };

  const mapMenuPathToLegacy = (path?: string) => {
    if (!path) return path;
    return path
      .replace('/clases/clases-de-un-dia-iniciacion-en-ceramica', '/clases/iniciacion')
      .replace('/clases/cursos-ceramica-barcelona-modelado', '/clases/regular')
      .replace('/clases/cursos-ceramica-barcelona-torno', '/clases/torno')
      .replace('/clases/laboratorio-ceramico', '/clases/laboratorio');
  };

  const loadAllContent = async () => {
    try {
      setError(null);
      
      console.log('🔄 Iniciando carga de contenido...');
      
      // Timeout de seguridad de 15 segundos (aumentado desde 10)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading content')), 15000);
      });

      // Cargar todo en paralelo para máxima velocidad
      const loadPromise = Promise.all([
        fetchContentItems().catch((err) => {
          console.warn('⚠️ Error loading content items:', err);
          return [];
        }),
        fetchBlogPosts(true).catch((err) => {
          console.warn('⚠️ Error loading blog posts:', err);
          return [];
        }),
        fetchMenu().catch((err) => {
          console.warn('⚠️ Error loading menu:', err);
          return { items: [] };
        }),
        fetchSettings().catch((err) => {
          console.warn('⚠️ Error loading settings:', err);
          return {
            siteName: 'Casa Rosier',
            siteDescription: 'Taller de cerámica en Barcelona',
            seoTitle: 'Casa Rosier - Taller de Cerámica en Barcelona',
            seoDescription: 'Descubre la cerámica en Casa Rosier. Clases, workshops y espacios para eventos en Barcelona.',
            seoKeywords: 'cerámica, Barcelona, taller, clases, workshops, torno',
            ogImage: '',
            contactEmail: 'info@casarosierceramica.com',
            contactPhone: '+34 633788860',
          };
        }),
        fetchPages().catch((err) => {
          console.warn('⚠️ Error loading pages:', err);
          return [];
        })
      ]);

      const [
        contentResponse,
        blogResponse,
        menuResponse,
        settingsResponse,
        pagesResponse
      ] = await Promise.race([loadPromise, timeoutPromise]) as any;

      // Separar clases, workshops y privados
      const allItems = contentResponse || [];
      const visibleClasses = allItems
        .filter((item: ContentItem) => item.type === 'class' && item.visible)
        .map((item: ContentItem) => ({
          ...item,
          slug: mapClassSlugToLegacy(item.slug),
        }));
      const visibleWorkshops = allItems.filter((item: ContentItem) => item.type === 'workshop' && item.visible);
      const visiblePrivates = allItems.filter((item: ContentItem) => item.type === 'private' && item.visible);
      const visibleGiftCards = allItems.filter((item: ContentItem) => item.type === 'gift-card' && item.visible);
      
      setClasses(visibleClasses);
      setWorkshops(visibleWorkshops);
      setPrivates(visiblePrivates);
      setGiftCards(visibleGiftCards);
      
      // Guardar el resto del contenido
      setBlogPosts(blogResponse || []);

      // Ordenar items del menú
      const rawMenuItems = (menuResponse?.items || []).map((item: MenuItem) => ({
        ...item,
        path: mapMenuPathToLegacy(item.path),
        submenu: item.submenu?.map((sub) => ({
          ...sub,
          path: mapMenuPathToLegacy(sub.path),
        })),
      }));
      const sortedMenuItems = [...rawMenuItems].sort((a: MenuItem, b: MenuItem) => (a.order || 0) - (b.order || 0));
      // Ordenar submenús
      sortedMenuItems.forEach((item: MenuItem) => {
        if (item.submenu) {
          item.submenu.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        }
      });
      setMenuItems(sortedMenuItems);

      setPages((pagesResponse || []).filter((page: Page) => page.visible));
      setSettings(settingsResponse || {});
      
      console.log('✅ Contenido cargado en memoria:', {
        clases: visibleClasses.length,
        workshops: visibleWorkshops.length,
        privados: visiblePrivates.length,
        giftCards: visibleGiftCards.length,
        posts: (blogResponse.posts || []).length,
        páginas: (pagesResponse.pages || []).filter((page: Page) => page.visible).length,
        menuItems: sortedMenuItems.length
      });
    } catch (err) {
      console.error('❌ Error cargando contenido:', err);
      
      // Proporcionar datos por defecto para que la app no falle
      setMenuItems([
        { name: 'Inicio', path: '/', order: 0 },
        { name: 'Clases', path: '/clases', order: 1 },
        { name: 'Workshops', path: '/workshops', order: 2 },
        { name: 'Blog', path: '/blog', order: 3 }
      ]);
      
      setSettings({
        siteName: 'Casa Rosier',
        siteDescription: 'Taller de cerámica en Barcelona',
        contactEmail: 'info@casarosierceramica.com',
        contactPhone: '+34 633788860',
      });
      
      // No mostrar error al usuario - el contenido público debería funcionar sin auth
      // setError('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar TODO el contenido una sola vez al montar
    loadAllContent();
    
    // Log del navegador para debugging de Android
    console.log('🌐 User Agent:', navigator.userAgent);
    console.log('🔌 Connection:', (navigator as any).connection?.effectiveType || 'unknown');
  }, []);

  // Métodos de búsqueda rápida
  const getClassBySlug = (slug: string) => {
    return classes.find(c => c.slug === slug);
  };

  const getWorkshopBySlug = (slug: string) => {
    return workshops.find(w => w.slug === slug);
  };

  const getPrivateBySlug = (slug: string) => {
    return privates.find(p => p.slug === slug);
  };

  const getGiftCardBySlug = (slug: string) => {
    return giftCards.find(p => p.slug === slug);
  };

  const getBlogPostBySlug = (slug: string) => {
    return blogPosts.find(p => p.slug === slug);
  };

  const getPageBySlug = (slug: string) => {
    return pages.find(p => p.slug === slug);
  };

  const refreshContent = async () => {
    setLoading(true);
    await loadAllContent();
  };

  // Renderizar children inmediatamente, el estado loading se maneja internamente en los componentes
  return (
    <ContentContext.Provider
      value={{
        classes,
        workshops,
        privates,
        giftCards,
        blogPosts,
        menuItems,
        pages,
        settings,
        loading,
        error,
        getClassBySlug,
        getWorkshopBySlug,
        getPrivateBySlug,
        getGiftCardBySlug,
        getBlogPostBySlug,
        getPageBySlug,
        refreshContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
