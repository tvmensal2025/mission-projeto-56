-- Criar bucket para imagens do chat
-- Esta migração cria o bucket 'chat-images' para armazenar imagens enviadas no chat

-- Criar o bucket chat-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de imagens por usuários autenticados
CREATE POLICY IF NOT EXISTS "chat_images_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-images' AND
  auth.uid() IS NOT NULL
);

-- Política para permitir visualização pública das imagens
CREATE POLICY IF NOT EXISTS "chat_images_view_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-images'
);

-- Política para permitir atualização de imagens pelo proprietário
CREATE POLICY IF NOT EXISTS "chat_images_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-images' AND
  auth.uid() = owner
);

-- Política para permitir exclusão de imagens pelo proprietário
CREATE POLICY IF NOT EXISTS "chat_images_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-images' AND
  auth.uid() = owner
);

-- Comentário sobre o bucket
COMMENT ON TABLE storage.buckets IS 'Bucket para armazenar imagens enviadas no chat da Sofia'; 