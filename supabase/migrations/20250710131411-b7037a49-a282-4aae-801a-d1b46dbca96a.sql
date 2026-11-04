
-- Verificar se a coluna pdf_url existe na tabela essay_themes e adicioná-la se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'essay_themes' 
        AND column_name = 'pdf_url'
    ) THEN
        ALTER TABLE public.essay_themes ADD COLUMN pdf_url TEXT;
    END IF;
END $$;

-- Tornar campos opcionais na tabela essay_themes
ALTER TABLE public.essay_themes 
ALTER COLUMN instructions DROP NOT NULL,
ALTER COLUMN theme_text DROP NOT NULL;

-- Verificar e corrigir constraint de área para activities
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
    
    -- Adiciona nova constraint que inclui 'provas-anteriores'
    ALTER TABLE public.activities 
    ADD CONSTRAINT activities_area_check 
    CHECK (area IN ('matematica', 'portugues', 'ciencias', 'humanas', 'provas-anteriores', 'redacao'));
END $$;

-- Criar bucket para PDFs de redação se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('essay-pdfs', 'essay-pdfs', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Verificar se o bucket activity-files existe e criar se necessário
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('activity-files', 'activity-files', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket essay-pdfs
CREATE POLICY IF NOT EXISTS "Allow PDF uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'essay-pdfs');

CREATE POLICY IF NOT EXISTS "Allow public PDF access" ON storage.objects
FOR SELECT USING (bucket_id = 'essay-pdfs');

CREATE POLICY IF NOT EXISTS "Allow PDF updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'essay-pdfs');

CREATE POLICY IF NOT EXISTS "Allow PDF deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'essay-pdfs');

-- Políticas para o bucket activity-files
CREATE POLICY IF NOT EXISTS "Allow activity file uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'activity-files');

CREATE POLICY IF NOT EXISTS "Allow public activity file access" ON storage.objects
FOR SELECT USING (bucket_id = 'activity-files');

CREATE POLICY IF NOT EXISTS "Allow activity file updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'activity-files');

CREATE POLICY IF NOT EXISTS "Allow activity file deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'activity-files');

-- Políticas RLS para permitir admins gerenciarem temas de redação
CREATE POLICY IF NOT EXISTS "Admins can insert essay themes" ON public.essay_themes
FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Admins can update essay themes" ON public.essay_themes
FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Admins can delete essay themes" ON public.essay_themes
FOR DELETE USING (true);
