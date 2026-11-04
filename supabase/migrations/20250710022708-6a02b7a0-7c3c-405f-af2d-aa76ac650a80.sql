
-- Criar bucket para armazenar PDFs dos temas de redação
INSERT INTO storage.buckets (id, name, public)
VALUES ('essay-pdfs', 'essay-pdfs', true);

-- Criar políticas para o bucket de PDFs
CREATE POLICY "Anyone can view essay PDFs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'essay-pdfs');

CREATE POLICY "Authenticated users can upload essay PDFs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'essay-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update essay PDFs" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'essay-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete essay PDFs" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'essay-pdfs' AND auth.role() = 'authenticated');

-- Adicionar coluna para PDF na tabela essay_themes
ALTER TABLE public.essay_themes 
ADD COLUMN pdf_url TEXT;

-- Criar bucket para imagens de perguntas
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', true);

-- Criar políticas para o bucket de imagens de perguntas
CREATE POLICY "Anyone can view question images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'question-images');

CREATE POLICY "Authenticated users can upload question images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'question-images' AND auth.role() = 'authenticated');

-- Criar tabela para perguntas dos estudantes
CREATE TABLE public.student_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  question_text TEXT,
  image_url TEXT,
  ai_response TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de perguntas
ALTER TABLE public.student_questions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para perguntas dos estudantes
CREATE POLICY "Users can view their own questions" 
  ON public.student_questions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questions" 
  ON public.student_questions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" 
  ON public.student_questions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at na tabela student_questions
CREATE TRIGGER update_student_questions_updated_at
  BEFORE UPDATE ON public.student_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
