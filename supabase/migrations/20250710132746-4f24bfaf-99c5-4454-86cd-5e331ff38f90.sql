
-- Atualizar tabela essay_themes para suportar PDF uploads
ALTER TABLE public.essay_themes 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Tornar campos opcionais para flexibilidade
ALTER TABLE public.essay_themes 
ALTER COLUMN instructions DROP NOT NULL,
ALTER COLUMN theme_text DROP NOT NULL;

-- Recriar constraint de área para activities incluindo todas as áreas necessárias
DO $$
BEGIN
    -- Remove constraint existente se houver
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activities_area_check' 
        AND table_name = 'activities'
    ) THEN
        ALTER TABLE public.activities DROP CONSTRAINT activities_area_check;
    END IF;
    
    -- Adiciona nova constraint que inclui todas as áreas
    ALTER TABLE public.activities 
    ADD CONSTRAINT activities_area_check 
    CHECK (area IN ('matematica', 'portugues', 'ciencias', 'humanas', 'provas-anteriores', 'redacao'));
END $$;

-- Criar buckets de armazenamento se não existirem
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('activity-files', 'activity-files', true, 104857600, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('essay-pdfs', 'essay-pdfs', true, 104857600, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Allow activity file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public activity file access" ON storage.objects;
DROP POLICY IF EXISTS "Allow activity file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow activity file deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow PDF uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public PDF access" ON storage.objects;
DROP POLICY IF EXISTS "Allow PDF updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow PDF deletes" ON storage.objects;

-- Políticas para bucket activity-files (acesso público para visualização)
CREATE POLICY "Public can view activity files" ON storage.objects
FOR SELECT USING (bucket_id = 'activity-files');

CREATE POLICY "Anyone can upload activity files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'activity-files');

CREATE POLICY "Anyone can update activity files" ON storage.objects
FOR UPDATE USING (bucket_id = 'activity-files');

CREATE POLICY "Anyone can delete activity files" ON storage.objects
FOR DELETE USING (bucket_id = 'activity-files');

-- Políticas para bucket essay-pdfs (acesso público para visualização)
CREATE POLICY "Public can view essay PDFs" ON storage.objects
FOR SELECT USING (bucket_id = 'essay-pdfs');

CREATE POLICY "Anyone can upload essay PDFs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'essay-pdfs');

CREATE POLICY "Anyone can update essay PDFs" ON storage.objects
FOR UPDATE USING (bucket_id = 'essay-pdfs');

CREATE POLICY "Anyone can delete essay PDFs" ON storage.objects
FOR DELETE USING (bucket_id = 'essay-pdfs');

-- Políticas RLS para tabelas (acesso público para visualização)
DROP POLICY IF EXISTS "Admins can insert essay themes" ON public.essay_themes;
DROP POLICY IF EXISTS "Admins can update essay themes" ON public.essay_themes;
DROP POLICY IF EXISTS "Admins can delete essay themes" ON public.essay_themes;
DROP POLICY IF EXISTS "Anyone can view essay themes" ON public.essay_themes;

CREATE POLICY "Anyone can view essay themes" ON public.essay_themes
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert essay themes" ON public.essay_themes
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update essay themes" ON public.essay_themes
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete essay themes" ON public.essay_themes
FOR DELETE USING (true);

-- Políticas para tabela activities (acesso público para visualização)
DROP POLICY IF EXISTS "Anyone can view activities" ON public.activities;
DROP POLICY IF EXISTS "Admins can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Admins can update activities" ON public.activities;
DROP POLICY IF EXISTS "Admins can delete activities" ON public.activities;

CREATE POLICY "Anyone can view activities" ON public.activities
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert activities" ON public.activities
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update activities" ON public.activities
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete activities" ON public.activities
FOR DELETE USING (true);
