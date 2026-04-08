-- ============================================
-- SCRIPT PARA CONFIGURAR STORAGE DE COMPROVANTES
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar bucket de storage (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can upload their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view all payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view payment proofs" ON storage.objects;

-- 3. Criar políticas de acesso

-- Permitir usuários autenticados fazer upload em suas próprias pastas
CREATE POLICY "Users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir usuários visualizar seus próprios comprovantes
CREATE POLICY "Users can view own payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir admin visualizar todos os comprovantes
CREATE POLICY "Admin can view all payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  auth.jwt() ->> 'email' = 'jarbas.alexa@gmail.com'
);

-- Permitir acesso público para visualização (necessário para URLs públicas)
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');

-- 4. Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'payment-proofs';

-- 5. Verificar políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%payment%';
