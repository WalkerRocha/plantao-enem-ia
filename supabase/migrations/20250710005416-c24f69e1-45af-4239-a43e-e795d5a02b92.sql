
-- Limpar completamente o usuário professor existente
DELETE FROM auth.identities WHERE email = 'admin.professor@plantaoenem.com';
DELETE FROM auth.users WHERE email = 'admin.professor@plantaoenem.com';

-- Recriar o usuário professor com as credenciais corretas
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin.professor@plantaoenem.com',
  crypt('CHANGE_ME_STRONG_PASSWORD', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin Professor", "email": "admin.professor@plantaoenem.com"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
);

-- Recriar a entrada na tabela identities
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  email
) VALUES (
  'admin.professor@plantaoenem.com',
  (SELECT id FROM auth.users WHERE email = 'admin.professor@plantaoenem.com'),
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}', 
    (SELECT id FROM auth.users WHERE email = 'admin.professor@plantaoenem.com')::text, 
    'admin.professor@plantaoenem.com'
  )::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW(),
  'admin.professor@plantaoenem.com'
);
