import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Redirect {
  from: string;
  to: string;
  type: '301' | '302';
}

interface RedirectManagerProps {
  redirects: Redirect[];
}

export function RedirectManager({ redirects }: RedirectManagerProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!redirects || redirects.length === 0) return;

    // Obtener la ruta actual sin parámetros de búsqueda
    const currentPath = location.pathname;

    // Buscar si existe una redirección para la ruta actual
    const redirect = redirects.find((r) => {
      // Normalizar las rutas (eliminar slash final si existe)
      const normalizedFrom = r.from.endsWith('/') && r.from !== '/' 
        ? r.from.slice(0, -1) 
        : r.from;
      const normalizedPath = currentPath.endsWith('/') && currentPath !== '/' 
        ? currentPath.slice(0, -1) 
        : currentPath;
      
      return normalizedFrom === normalizedPath;
    });

    // Si se encuentra una redirección, navegar a la nueva URL
    if (redirect && redirect.to) {
      console.log(`[RedirectManager] Redirecting from ${redirect.from} to ${redirect.to} (${redirect.type})`);
      
      // Preservar los parámetros de búsqueda si existen
      const searchParams = location.search;
      const targetUrl = redirect.to + searchParams;
      
      // React Router no diferencia entre 301 y 302, pero registramos el tipo
      navigate(targetUrl, { replace: true });
    }
  }, [location.pathname, redirects, navigate]);

  // Este componente no renderiza nada
  return null;
}
