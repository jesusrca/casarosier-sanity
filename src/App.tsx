import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner@2.0.3';
import { AnimatePresence } from 'motion/react';
import { lazy, Suspense } from 'react';
// Admin/auth removed (Sanity handles content)
import { ContentProvider, useContent } from './contexts/ContentContext';
import { WhatsAppProvider, useWhatsApp } from './contexts/WhatsAppContext';
import { ScrollHeader } from './components/ScrollHeader';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { WhatsAppButton } from './components/WhatsAppButton';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { RedirectManager } from './components/RedirectManager';
import { PageTransition } from './components/PageTransition';
import { LoadingScreen } from './components/LoadingScreen';
import { NetworkStatus } from './components/NetworkStatus';
import './styles/globals.css';

// Lazy load de páginas no críticas para reducir bundle inicial
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const ClasesListing = lazy(() => import('./pages/ClasesListing').then(module => ({ default: module.ClasesListing })));
const WorkshopsListing = lazy(() => import('./pages/WorkshopsListing').then(module => ({ default: module.WorkshopsListing })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then(module => ({ default: module.BlogPost })));
const ComingSoon = lazy(() => import('./pages/ComingSoon').then(module => ({ default: module.ComingSoon })));
const DynamicContentPage = lazy(() => import('./pages/DynamicContentPage').then(module => ({ default: module.DynamicContentPage })));
const DynamicPage = lazy(() => import('./pages/DynamicPage').then(module => ({ default: module.DynamicPage })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

// Admin pages disabled (managed in Sanity)

function AppContent() {
  const location = useLocation();
  const { settings } = useContent();
  const { phoneNumber } = useWhatsApp();
  const isAdminRoute = false;

  // Usar el número específico de la página actual, o el global, o el fallback
  const whatsappNumber = phoneNumber || settings.whatsappNumber;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollToTop />
      {settings.googleAnalyticsId && <GoogleAnalytics trackingId={settings.googleAnalyticsId} />}
      {settings.redirects && <RedirectManager redirects={settings.redirects} />}
      {!isAdminRoute && <ScrollHeader />}
      {!isAdminRoute && <WhatsAppButton phoneNumber={whatsappNumber} />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingScreen />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              
              {/* Páginas de listado */}
              <Route path="/clases" element={<PageTransition><ClasesListing /></PageTransition>} />
              <Route path="/workshops" element={<PageTransition><WorkshopsListing /></PageTransition>} />
              <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
              <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
              
              {/* Rutas dinámicas de contenido */}
              <Route path="/clases/:slug" element={<PageTransition><DynamicContentPage /></PageTransition>} />
              <Route path="/workshops/:slug" element={<PageTransition><DynamicContentPage /></PageTransition>} />
              <Route path="/privada/:slug" element={<PageTransition><DynamicContentPage /></PageTransition>} />
              
              {/* Página de Tarjeta de Regalo */}
              <Route path="/tarjeta-regalo/:slug" element={<PageTransition><DynamicContentPage /></PageTransition>} />
              
              {/* Dynamic custom pages - antes del 404 */}
              <Route path="/:slug" element={<PageTransition><DynamicPage /></PageTransition>} />
              
              {/* 404 Not Found - al final */}
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ContentProvider>
          <WhatsAppProvider>
            <NetworkStatus />
            <Toaster 
              position="top-right" 
              expand={false}
              richColors
              closeButton
            />
            <AppContent />
          </WhatsAppProvider>
        </ContentProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
