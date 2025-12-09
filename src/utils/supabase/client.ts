import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton instance - solo se crea una vez
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      // Persistir sesión en localStorage
      persistSession: true,
      // Auto refresh token (pero manejar errores correctamente)
      autoRefreshToken: true,
      // Detectar cuando la sesión cambia
      detectSessionInUrl: true,
    },
  }
);

// Listener para manejar errores de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('👋 User signed out');
  } else if (event === 'SIGNED_IN') {
    console.log('👤 User signed in');
  }
});

// Función helper para limpiar sesiones corruptas
export async function clearInvalidSession() {
  try {
    await supabase.auth.signOut();
    console.log('🧹 Cleared invalid session');
  } catch (error) {
    console.warn('Error clearing session:', error);
  }
}