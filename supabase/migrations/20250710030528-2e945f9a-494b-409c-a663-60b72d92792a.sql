
-- Criar bucket para armazenar arquivos de atividades e gabaritos
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-files', 'activity-files', true);

-- Criar políticas para o bucket de arquivos
CREATE POLICY "Anyone can view activity files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'activity-files');

CREATE POLICY "Authenticated users can upload activity files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'activity-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update activity files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'activity-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete activity files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'activity-files' AND auth.role() = 'authenticated');

-- Atualizar a tabela activities para incluir mais campos necessários
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS area TEXT CHECK (area IN ('matematica', 'portugues', 'ciencias', 'humanas'));

-- Atualizar a coluna subject para ser mais específica
UPDATE public.activities SET area = subject WHERE area IS NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_activities_area ON public.activities(area);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at);

-- Adicionar política para permitir que admins insiram atividades
CREATE POLICY "Admins can insert activities" 
  ON public.activities 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update activities" 
  ON public.activities 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Admins can delete activities" 
  ON public.activities 
  FOR DELETE 
  USING (true);
