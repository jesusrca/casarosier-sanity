import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string, accessToken: string) => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0ba58e95/users/${userId}/role`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data.role || 'editor';
      }
    } catch (error) {
      // Silently fail - this is expected when server is unavailable
      // or during development/testing
    }
    // Default to editor role without logging
    return 'editor';
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Si hay error de refresh token, limpiar todo
      if (error) {
        console.warn('Session error detected:', error.message);
        
        if (error.message?.includes('refresh') || error.message?.includes('token')) {
          console.log('Invalid refresh token, cleaning up');
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
          setUser(null);
          setLoading(false);
          return;
        }
      }
      
      if (session?.user) {
        const role = await fetchUserRole(session.user.id, session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Limpiar sesión en caso de error
      try {
        await supabase.auth.signOut();
        localStorage.removeItem('supabase.auth.token');
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Comprobar sesión solo una vez al montar
    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await fetchUserRole(session.user.id, session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user && data.session) {
        const role = await fetchUserRole(data.user.id, data.session.access_token);
        const newUser = {
          id: data.user.id,
          email: data.user.email || '',
          role,
        };
        setUser(newUser);
        return { user: newUser, error: null };
      }

      return { user: null, error: 'No user data returned' };
    } catch (error) {
      return { user: null, error: 'Error during sign in' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}