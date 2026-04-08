-- Adicionar campos para gerenciamento administrativo de usuários
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Criar índices para melhor performance nas consultas administrativas
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON profiles(is_blocked);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date ON profiles(subscription_end_date);

-- Comentários para documentação
COMMENT ON COLUMN profiles.subscription_status IS 'Status da assinatura: active, inactive, trial, canceled';
COMMENT ON COLUMN profiles.subscription_plan IS 'Plano contratado: basic, pro, enterprise';
COMMENT ON COLUMN profiles.subscription_end_date IS 'Data de vencimento da assinatura';
COMMENT ON COLUMN profiles.is_blocked IS 'Indica se o usuário está bloqueado pelo administrador';
