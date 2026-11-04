
import { supabase } from '@/integrations/supabase/client';

export const createTestUser = async () => {
  try {
    console.log('Criando usuário de teste...');
    
    // Tentar fazer login primeiro para ver se o usuário já existe
    const { data: existingSession, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'estudante@plantaoenem.com',
      password: import.meta.env.VITE_DEMO_STUDENT_PASSWORD ?? ''
    });

    if (existingSession?.user) {
      console.log('Usuário de teste já existe:', existingSession.user.email);
      
      // Verificar se o perfil existe, se não, criar
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingSession.user.id)
        .single();

      if (!profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: existingSession.user.id,
            name: 'Estudante Teste',
            email: existingSession.user.email || 'estudante@plantaoenem.com'
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
        } else {
          console.log('Perfil criado para usuário existente');
        }
      }
      
      return existingSession.user;
    }

    // Se não conseguir fazer login, criar o usuário
    const { data, error } = await supabase.auth.signUp({
      email: 'estudante@plantaoenem.com',
      password: import.meta.env.VITE_DEMO_STUDENT_PASSWORD ?? '',
      options: {
        data: {
          name: 'Estudante Teste'
        }
      }
    });

    if (error) {
      console.error('Erro ao criar usuário de teste:', error);
      return null;
    }

    console.log('Usuário de teste criado com sucesso:', data.user?.email);
    return data.user;
  } catch (error) {
    console.error('Erro geral ao criar usuário de teste:', error);
    return null;
  }
};
