
import { supabase } from '@/integrations/supabase/client';

// Função para criar usuário administrador
export const createAdminUser = async () => {
  try {
    console.log('Criando usuário administrador...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'prof.teste@plantaoenem.com',
      password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD ?? '',
      options: {
        data: {
          name: 'Professor Teste'
        }
      }
    });
    
    if (error) {
      console.error('Erro ao criar usuário admin:', error);
      return { success: false, error };
    }
    
    if (data.user) {
      console.log('Usuário admin criado com sucesso:', data.user.email);
      return { success: true, user: data.user };
    }
    
    return { success: false, error: 'Usuário não foi criado' };
  } catch (error) {
    console.error('Erro na função createAdminUser:', error);
    return { success: false, error };
  }
};
