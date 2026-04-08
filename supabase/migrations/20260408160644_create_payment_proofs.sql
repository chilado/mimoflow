-- Criar tabela de comprovantes de pagamento
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_name TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'semiannual', 'annual')),
  amount DECIMAL(10, 2) NOT NULL,
  proof_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_proofs_user_id ON payment_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_created_at ON payment_proofs(created_at DESC);

-- Políticas de acesso
CREATE POLICY "Users can view own payment proofs"
ON payment_proofs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment proofs"
ON payment_proofs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin read all payment proofs"
ON payment_proofs FOR SELECT
USING (true);

CREATE POLICY "Allow admin update all payment proofs"
ON payment_proofs FOR UPDATE
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_payment_proofs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_proofs_updated_at
BEFORE UPDATE ON payment_proofs
FOR EACH ROW
EXECUTE FUNCTION update_payment_proofs_updated_at();

-- Comentários para documentação
COMMENT ON TABLE payment_proofs IS 'Tabela de comprovantes de pagamento enviados pelos usuários';
COMMENT ON COLUMN payment_proofs.plan IS 'Plano escolhido: monthly, quarterly, semiannual, annual';
COMMENT ON COLUMN payment_proofs.status IS 'Status: pending (pendente), approved (aprovado), rejected (rejeitado)';
COMMENT ON COLUMN payment_proofs.amount IS 'Valor pago em reais';
