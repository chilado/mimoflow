-- Função para criar assinatura trial automática quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar assinatura trial de 7 dias
  INSERT INTO subscriptions (
    user_id,
    plan,
    status,
    started_at,
    expires_at
  ) VALUES (
    NEW.user_id,
    'trial',
    'active',
    NOW(),
    NOW() + INTERVAL '7 days'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo profile é criado
DROP TRIGGER IF EXISTS on_profile_created_trial ON profiles;
CREATE TRIGGER on_profile_created_trial
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_trial_subscription();

-- Função para verificar e expirar assinaturas automaticamente
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Atualizar status para 'expired' quando a data de expiração passar
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON FUNCTION create_trial_subscription() IS 'Cria automaticamente uma assinatura trial de 7 dias para novos usuários';
COMMENT ON FUNCTION expire_subscriptions() IS 'Expira assinaturas que passaram da data de vencimento';

-- Nota: Para executar a função expire_subscriptions() automaticamente,
-- você pode configurar um cron job no Supabase ou usar pg_cron
-- Exemplo de configuração (execute separadamente se tiver pg_cron habilitado):
-- SELECT cron.schedule('expire-subscriptions', '0 * * * *', 'SELECT expire_subscriptions()');
