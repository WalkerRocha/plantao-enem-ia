
-- Primeiro, vamos limpar qualquer registro existente
DELETE FROM auth.identities WHERE email = 'admin.professor@plantaoenem.com';
DELETE FROM auth.users WHERE email = 'admin.professor@plantaoenem.com';

-- Criar o usuário usando a função oficial do Supabase
SELECT auth.signup(
  'admin.professor@plantaoenem.com',
  '400422sabuco*',
  '{"name": "Admin Professor"}'::jsonb,
  '{"provider": "email"}'::jsonb
);

-- Confirmar o email automaticamente para evitar problemas de verificação
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin.professor@plantaoenem.com';
