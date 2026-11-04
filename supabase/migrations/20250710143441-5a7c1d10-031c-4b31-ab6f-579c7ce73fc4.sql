-- Criar tabela para gerenciar chaves de API
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para segurança
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Política: apenas administradores podem acessar (para simplicidade, apenas usuários específicos)
-- Por agora, vou permitir apenas leitura para funções (SECURITY DEFINER)
CREATE POLICY "API keys são privadas" 
ON public.api_keys 
FOR ALL 
USING (false);

-- A chave da OpenAI NÃO é guardada no banco: configure OPENAI_API_KEY nos secrets das Edge Functions.

-- Criar função para buscar chave API (SECURITY DEFINER para contornar RLS)
CREATE OR REPLACE FUNCTION public.get_api_key(service_name_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  api_key_result TEXT;
BEGIN
  SELECT api_key INTO api_key_result 
  FROM public.api_keys 
  WHERE service_name = service_name_param;
  
  RETURN api_key_result;
END;
$$;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Segurança: a função não pode ser chamada pelo cliente (anon/authenticated).
REVOKE EXECUTE ON FUNCTION public.get_api_key(TEXT) FROM PUBLIC, anon, authenticated;
