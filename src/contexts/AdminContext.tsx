
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminContextType {
  admin: User | null;
  loading: boolean;
  adminSignIn: (email: string, password: string) => Promise<void>;
  adminSignOut: () => Promise<void>;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Credenciais padrão do professor
const ADMIN_EMAIL = 'professor@plantaoenem.com';
const ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD ?? '';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        const userIsAdmin = user?.email === ADMIN_EMAIL;
        
        setAdmin(user);
        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error('Erro na inicialização da autenticação admin:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const user = session?.user ?? null;
        const userIsAdmin = user?.email === ADMIN_EMAIL;
        
        setAdmin(user);
        setIsAdmin(userIsAdmin);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const adminSignIn = async (email: string, password: string) => {
    try {
      // Verificar se são as credenciais corretas
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error('Credenciais de professor incorretas');
      }

      // Fazer login via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Se o usuário não existe, criar automaticamente
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/admin/dashboard`
            }
          });
          
          if (signUpError) throw signUpError;
          
          // Tentar login novamente após criar
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
      
      toast.success('Login de professor realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no login do admin:', error);
      toast.error(error.message || 'Erro ao fazer login como professor');
      throw error;
    }
  };

  const adminSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no logout do admin:', error);
      toast.error(error.message || 'Erro ao fazer logout');
      throw error;
    }
  };

  const value = {
    admin,
    loading,
    adminSignIn,
    adminSignOut,
    isAdmin,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
