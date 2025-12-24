import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner@2.0.3';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider, useContent } from './contexts/ContentContext';
import { ScrollHeader } from './components/ScrollHeader';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthErrorHandler } from './components/AuthErrorHandler';
import { WhatsAppButton } from './components/WhatsAppButton';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { RedirectManager } from './components/RedirectManager';
import { PageTransition } from './components/PageTransition';
import { Home } from './pages/Home';
import { ClasesListing } from './pages/ClasesListing';
import { WorkshopsListing } from './pages/WorkshopsListing';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { ComingSoon } from './pages/ComingSoon';
import { DynamicContentPage } from './pages/DynamicContentPage';
import { DynamicPage } from './pages/DynamicPage';
import { NotFound } from './pages/NotFound';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import './styles/globals.css';

function AppContent() {
  const location = useLocation();
  const { settings } = useContent();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthErrorHandler />
      <ScrollToTop />
      {settings.googleAnalyticsId && <GoogleAnalytics trackingId={settings.googleAnalyticsId} />}
      {settings.redirects && <RedirectManager redirects={settings.redirects} />}
      {!isAdminRoute && <ScrollHeader />}
      {!isAdminRoute && <WhatsAppButton />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
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
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
            
            {/* Dynamic custom pages - antes del 404 */}
            <Route path="/:slug" element={<PageTransition><DynamicPage /></PageTransition>} />
            
            {/* 404 Not Found - al final */}
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
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
        <AuthProvider>
          <ContentProvider>
            <Toaster 
              position="top-right" 
              expand={false}
              richColors
              closeButton
            />
            <AppContent />
          </ContentProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;