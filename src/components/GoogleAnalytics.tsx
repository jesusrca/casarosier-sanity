import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleAnalyticsProps {
  trackingId: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  const location = useLocation();

  useEffect(() => {
    if (!trackingId) return;

    // Inicializar Google Analytics solo si no está ya inicializado
    if (!window.gtag) {
      // Crear script gtag.js
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      script.async = true;
      document.head.appendChild(script);

      // Inicializar dataLayer y gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', trackingId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [trackingId]);

  // Rastrear cambios de página
  useEffect(() => {
    if (!trackingId || !window.gtag) return;

    window.gtag('config', trackingId, {
      page_path: location.pathname + location.search,
    });
  }, [location, trackingId]);

  return null;
}
