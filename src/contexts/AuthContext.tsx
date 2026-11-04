
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  subscription: {
    isSubscribed: boolean;
    plan: string | null;
    tier: string | null;
  };
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    isSubscribed: false,
    plan: null,
    tier: null,
  });

  useEffect(() => {
    console.log('Inicializando AuthContext...');
    
    // Verificar sessão inicial
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
        } else {
          console.log('Sessão inicial do usuário:', session?.user?.email || 'null');
          setUser(session?.user ?? null);
          if (session?.user) {
            await checkSubscription();
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Mudança de estado auth:', event, session?.user?.email || 'null');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkSubscription();
        } else {
          setSubscription({ isSubscribed: false, plan: null, tier: null });
        }
      }
    );

    return () => {
      console.log('Desconectando listener de autenticação');
      authSubscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Tentando cadastro com:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      
      if (error) {
        console.error('Erro no cadastro:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('Cadastro bem-sucedido:', data.user.email);
        toast.success('Cadastro realizado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error.message || 'Erro ao realizar cadastro';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando login com:', email);
      
      // Se estiver tentando logar com as credenciais de teste, criar o usuário se não existir
      if (email === 'estudante@plantaoenem.com' && password === (import.meta.env.VITE_DEMO_STUDENT_PASSWORD ?? '')) {
        // Primeiro tentar fazer login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (loginData.user) {
          console.log('Login bem-sucedido:', loginData.user.email);
          toast.success('Login realizado com sucesso!');
          return;
        }
        
        // Se não conseguir fazer login, criar o usuário
        console.log('Usuário de teste não existe, criando...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: 'Estudante Teste'
            },
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (signUpError) {
          console.error('Erro ao criar usuário de teste:', signUpError);
          throw signUpError;
        }
        
        if (signUpData.user) {
          console.log('Usuário de teste criado e logado:', signUpData.user.email);
          toast.success('Conta criada e login realizado com sucesso!');
          return;
        }
      } else {
        // Login normal para outros usuários
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Erro no login:', error);
          throw error;
        }
        
        if (data.user) {
          console.log('Login bem-sucedido:', data.user.email);
          toast.success('Login realizado com sucesso!');
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro ao fazer login';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirme seu email antes de fazer login';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }
      console.log('Logout realizado com sucesso');
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast.error(error.message || 'Erro ao fazer logout');
      throw error;
    }
  };

  const checkSubscription = async () => {
    try {
      console.log('Verificando status de assinatura...');
      
      // Para simplicidade, definir valores padrão
      setSubscription({
        isSubscribed: false,
        plan: null,
        tier: null,
      });
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      setSubscription({
        isSubscribed: false,
        plan: null,
        tier: null,
      });
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    subscription,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
