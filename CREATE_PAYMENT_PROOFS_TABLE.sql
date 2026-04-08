-- ============================================
-- CRIAR TABELA DE COMPROVANTES DE PAGAMENTO
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar tabela payment_proofs
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text,
  plan text NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'semiannual', 'annual')),
  amount numeric NOT NULL,
  proof_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  approved_at timestamp with time zone,
  approved_by text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_proofs_user_id ON public.payment_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON public.payment_proofs(status);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_created_at ON public.payment_proofs(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem inserir seus próprios comprovantes
CREATE POLICY "Users can insert own payment proofs"
ON public.payment_proofs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem visualizar seus próprios comprovantes
CREATE POLICY "Users can view own payment proofs"
ON public.payment_proofs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Admin pode visualizar todos os comprovantes
CREATE POLICY "Admin can view all payment proofs"
ON public.payment_proofs
FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'jarbas.alexa@gmail.com');

-- Política: Admin pode atualizar todos os comprovantes
CREATE POLICY "Admin can update all payment proofs"
ON public.payment_proofs
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'jarbas.alexa@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'jarbas.alexa@gmail.com');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_payment_proofs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_payment_proofs_updated_at_trigger ON public.payment_proofs;
CREATE TRIGGER update_payment_proofs_updated_at_trigger
  BEFORE UPDATE ON public.payment_proofs
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_proofs_updated_at();

-- Verificar se a tabela foi criada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payment_proofs'
ORDER BY ordinal_position;
