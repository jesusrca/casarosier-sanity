import { useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export function AuthErrorHandler() {
  useEffect(() => {
    // Listener para errores de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Si hay un error de refresh token, limpiar la sesión
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, clearing session');
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Error signing out:', error);
        }
      }
    });

    // Verificar sesión actual
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session check error:', error.message);
          // Si hay error y estamos en una ruta no-admin, solo limpiamos silenciosamente
          if (!window.location.pathname.startsWith('/admin')) {
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.warn('Error checking session:', error);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null; // Este componente no renderiza nada
}
