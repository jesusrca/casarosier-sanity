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
          // Limpiar storage local manualmente por si acaso
          localStorage.removeItem('supabase.auth.token');
        } catch (error) {
          console.error('Error signing out:', error);
        }
      }
      
      // Manejar errores de sesión
      if (event === 'SIGNED_OUT') {
        // Limpiar storage local
        localStorage.removeItem('supabase.auth.token');
      }
    });

    // Verificar sesión actual y limpiar si es inválida
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session check error:', error.message);
          
          // Si el error es de refresh token, limpiar todo
          if (error.message?.includes('refresh') || error.message?.includes('token')) {
            console.log('Invalid token detected, cleaning up session');
            await supabase.auth.signOut();
            localStorage.removeItem('supabase.auth.token');
            
            // Si estamos en una ruta de admin, redirigir al login
            if (window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login';
            }
          }
        }
      } catch (error) {
        console.warn('Error checking session:', error);
        // En caso de error crítico, limpiar sesión
        try {
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
        }
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null; // Este componente no renderiza nada
}