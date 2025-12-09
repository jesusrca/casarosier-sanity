import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import { ScrollHeader } from './components/ScrollHeader';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthErrorHandler } from './components/AuthErrorHandler';
import { Home } from './pages/Home';
import { Clases } from './pages/Clases';
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
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthErrorHandler />
      <ScrollToTop />
      {!isAdminRoute && <ScrollHeader />}
      <main className="flex-1">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          
          {/* Páginas de listado */}
          <Route path="/clases" element={<Clases />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Rutas dinámicas de contenido */}
          <Route path="/clases/:slug" element={<DynamicContentPage />} />
          <Route path="/workshops/:slug" element={<DynamicContentPage />} />
          <Route path="/privada/:slug" element={<DynamicContentPage />} />
          
          {/* Página de Tarjeta de Regalo */}
          <Route path="/tarjeta-regalo" element={<DynamicPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
          
          {/* Dynamic custom pages - antes del 404 */}
          <Route path="/:slug" element={<DynamicPage />} />
          
          {/* 404 Not Found - al final */}
          <Route path="*" element={<NotFound />} />
        </Routes>
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
            <AppContent />
          </ContentProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;