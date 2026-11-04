
-- Criar tabela para atividades postadas pelo professor
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL, -- 'matematica', 'portugues', 'ciencias', 'humanas'
  type TEXT NOT NULL, -- 'activity' ou 'answer_key'
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para perguntas dos alunos
CREATE TABLE public.student_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  question_text TEXT,
  image_url TEXT,
  subject TEXT NOT NULL,
  ai_response TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'answered'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para correções de redação
CREATE TABLE public.essay_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  essay_text TEXT NOT NULL,
  ai_correction JSONB, -- Vai conter nota, feedback detalhado, etc
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'corrected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_corrections ENABLE ROW LEVEL SECURITY;

-- Políticas para atividades (todos podem ver)
CREATE POLICY "Anyone can view activities" 
  ON public.activities 
  FOR SELECT 
  USING (true);

-- Políticas para perguntas dos alunos (só o próprio aluno pode ver suas perguntas)
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

-- Políticas para correções de redação (só o próprio aluno pode ver suas correções)
CREATE POLICY "Users can view their own essay corrections" 
  ON public.essay_corrections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own essay corrections" 
  ON public.essay_corrections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own essay corrections" 
  ON public.essay_corrections 
  FOR UPDATE 
  USING (auth.uid() = user_id);
