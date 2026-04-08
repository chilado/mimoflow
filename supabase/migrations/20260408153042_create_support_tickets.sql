-- Criar tabela de chamados de suporte
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_name TEXT,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('subscription', 'technical', 'billing', 'feature', 'bug', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_progress', 'waiting_response', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  admin_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_type ON support_tickets(ticket_type);

-- Políticas de acesso
CREATE POLICY "Users can view own tickets"
ON support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
ON support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin read all tickets"
ON support_tickets FOR SELECT
USING (true);

CREATE POLICY "Allow admin update all tickets"
ON support_tickets FOR UPDATE
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_support_tickets_updated_at();

-- Comentários para documentação
COMMENT ON TABLE support_tickets IS 'Tabela de chamados de suporte dos usuários';
COMMENT ON COLUMN support_tickets.ticket_type IS 'Tipo do chamado: subscription (assinatura), technical (técnico), billing (cobrança), feature (funcionalidade), bug (erro), other (outro)';
COMMENT ON COLUMN support_tickets.status IS 'Status: received (recebido), in_progress (em andamento), waiting_response (aguardando resposta), resolved (resolvido), closed (fechado)';
COMMENT ON COLUMN support_tickets.priority IS 'Prioridade: low (baixa), normal, high (alta), urgent (urgente)';
