-- Criar bucket para imagens de perguntas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('question-images', 'question-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Políticas para bucket question-images
CREATE POLICY "Public can view question images" ON storage.objects
FOR SELECT USING (bucket_id = 'question-images');

CREATE POLICY "Anyone can upload question images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'question-images');

CREATE POLICY "Anyone can update question images" ON storage.objects
FOR UPDATE USING (bucket_id = 'question-images');

CREATE POLICY "Anyone can delete question images" ON storage.objects
FOR DELETE USING (bucket_id = 'question-images');