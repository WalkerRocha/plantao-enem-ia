
-- Adicionar coluna pdf_url na tabela essay_themes se não existir
ALTER TABLE public.essay_themes 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Tornar campos opcionais na tabela essay_themes
ALTER TABLE public.essay_themes 
ALTER COLUMN instructions DROP NOT NULL,
ALTER COLUMN theme_text DROP NOT NULL;

-- Verificar se existe constraint de área para activities e ajustar se necessário
-- Primeiro, vamos verificar quais constraints existem
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

-- Política para permitir upload de PDFs
CREATE POLICY IF NOT EXISTS "Allow PDF uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'essay-pdfs');

-- Política para permitir acesso público aos PDFs
CREATE POLICY IF NOT EXISTS "Allow public PDF access" ON storage.objects
FOR SELECT USING (bucket_id = 'essay-pdfs');
