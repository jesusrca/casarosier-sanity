import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { contentAPI, blogAPI, menuAPI, settingsAPI, pagesAPI } from '../utils/api';
import { LoadingScreen } from '../components/LoadingScreen';

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
  images?: string[];
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

  const loadAllContent = async () => {
    try {
      setError(null);
      
      // Cargar todo en paralelo para máxima velocidad
      const [
        contentResponse,
        blogResponse,
        menuResponse,
        settingsResponse,
        pagesResponse
      ] = await Promise.all([
        contentAPI.getAllItems().catch((err) => {
          console.warn('Error loading content items:', err.message);
          return { items: [] };
        }),
        blogAPI.getPosts(true).catch((err) => {
          console.warn('Error loading blog posts:', err.message);
          return { posts: [] };
        }),
        menuAPI.getMenu().catch((err) => {
          console.warn('Error loading menu:', err.message);
          return { menu: { items: [] } };
        }),
        settingsAPI.getSettings().catch((err) => {
          console.warn('Error loading settings:', err.message);
          return { 
            settings: {
              siteName: 'Casa Rosier',
              siteDescription: 'Taller de cerámica en Barcelona',
              seoTitle: 'Casa Rosier - Taller de Cerámica en Barcelona',
              seoDescription: 'Descubre la cerámica en Casa Rosier. Clases, workshops y espacios para eventos en Barcelona.',
              seoKeywords: 'cerámica, Barcelona, taller, clases, workshops, torno',
              ogImage: '',
              contactEmail: 'info@casarosierceramica.com',
              contactPhone: '+34 633788860',
            }
          };
        }),
        pagesAPI.getAllPages().catch((err) => {
          console.warn('Error loading pages:', err.message);
          return { pages: [] };
        })
      ]);

      // Separar clases, workshops y privados
      const allItems = contentResponse.items || [];
      const visibleClasses = allItems.filter((item: ContentItem) => item.type === 'class' && item.visible);
      const visibleWorkshops = allItems.filter((item: ContentItem) => item.type === 'workshop' && item.visible);
      const visiblePrivates = allItems.filter((item: ContentItem) => item.type === 'private' && item.visible);
      const visibleGiftCards = allItems.filter((item: ContentItem) => item.type === 'gift-card' && item.visible);
      
      setClasses(visibleClasses);
      setWorkshops(visibleWorkshops);
      setPrivates(visiblePrivates);
      setGiftCards(visibleGiftCards);
      
      // Guardar el resto del contenido
      setBlogPosts(blogResponse.posts || []);
      setMenuItems(menuResponse.menu?.items || []);
      setPages((pagesResponse.pages || []).filter((page: Page) => page.visible));
      setSettings(settingsResponse.settings || {});
      
      console.log('✅ Contenido cargado en memoria:', {
        clases: visibleClasses.length,
        workshops: visibleWorkshops.length,
        privados: visiblePrivates.length,
        giftCards: visibleGiftCards.length,
        posts: (blogResponse.posts || []).length,
        páginas: (pagesResponse.pages || []).filter((page: Page) => page.visible).length,
        menuItems: (menuResponse.menu?.items || []).length
      });
    } catch (err) {
      console.error('Error cargando contenido:', err);
      // No mostrar error al usuario - el contenido público debería funcionar sin auth
      // setError('Error al cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar TODO el contenido una sola vez al montar
    loadAllContent();
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

  // Mostrar loading mientras se carga el contenido inicial
  if (loading) {
    return <LoadingScreen />;
  }

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