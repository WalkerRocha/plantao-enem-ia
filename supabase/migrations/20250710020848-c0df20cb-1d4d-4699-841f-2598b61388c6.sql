
-- Criar tabela para temas de redação
CREATE TABLE public.essay_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  theme_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de temas de redação
ALTER TABLE public.essay_themes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer pessoa autenticada veja os temas
CREATE POLICY "Anyone can view essay themes" 
  ON public.essay_themes 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Atualizar tabela essay_corrections para incluir referência ao tema
ALTER TABLE public.essay_corrections 
ADD COLUMN theme_id UUID REFERENCES public.essay_themes(id);

-- Adicionar índice para melhor performance
CREATE INDEX idx_essay_corrections_theme_id ON public.essay_corrections(theme_id);

-- Trigger para atualizar updated_at na tabela essay_themes
CREATE TRIGGER update_essay_themes_updated_at
  BEFORE UPDATE ON public.essay_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
